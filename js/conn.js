/*
 * conn.js - lớp kết nối tới máy chủ spa.
 *
 * Thứ tự đường đi: nội bộ (wss://IP:8443) > P2P IPv6 > kênh báo tin (MQTT > Nostr > ntfy).
 * Mọi gói tin là "phong bì": "<loại>.<mã>.<base64(iv|mã hóa|tag)>", AES-256-GCM, phần đầu là AAD.
 *   d.<mã máy>  máy -> máy chủ (khóa riêng của máy)     s.<mã máy>  máy chủ -> máy
 *   p.<phiên>   xin ghép máy (khóa từ mã ghép)          q.<phiên>   máy chủ trả lời ghép máy
 *
 * Dùng:
 *   Conn.pair("K7PM2Q-X9RT4H", "iPhone Lan")  -> ghép máy (1 lần)
 *   Conn.start()                              -> kết nối
 *   await Conn.request("customers.list", {q}) -> gọi API
 *   Conn.on("welcome" | "event" | "state" | "log", fn)
 */
const Conn = (() => {
'use strict';
const SUBTLE = !!(window.crypto && crypto.subtle);
const enc = new TextEncoder(), dec = new TextDecoder();
const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
const NTFY = 'https://ntfy.sh/';
const NOSTR_KIND = 25051;
// Phải khớp g_br[] trong server/src/channels.c
const ALL_CHANNELS = [
  { name: 'emqx',      url: 'wss://broker.emqx.io:8084/mqtt' },
  { name: 'hivemq',    url: 'wss://broker.hivemq.com:8884/mqtt' },
  { name: 'mosquitto', url: 'wss://test.mosquitto.org:8081/mqtt' },
  { name: 'eclipse',   url: 'wss://mqtt.eclipseprojects.io:443/mqtt' },
  { name: 'nostr.mom', nostr: 'wss://nostr.mom' },
  { name: 'nos.lol',   nostr: 'wss://nos.lol' },
  { name: 'primal',    nostr: 'wss://relay.primal.net' },
  { name: 'ntfy',      ntfy: true },
];
const qs = new URLSearchParams(location.search);
const ONLY = (qs.get('kenh') || '').split(',').filter(Boolean);           // thử: ?kenh=ntfy
const NO_LAN = qs.get('noibo') === '0';                                     // thử: ?noibo=0
const V4ONLY = qs.has('v4');                                                // thử: P2P chỉ IPv4
const LIST = ONLY.length ? ALL_CHANNELS.filter(c => ONLY.includes(c.name)) : ALL_CHANNELS;
const LAN_HTTP = 8080, LAN_HTTPS = 8443, LAN_WAIT = 1500, DEAD_MS = 7000, PROBE_MS = 10000;
const NTFY_PROBE_MS = 300000, NTFY_PING_MS = 20000, NTFY_DEAD_MS = 50000, P2P_TIMEOUT = 20000;
const isPrivate = h => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(h) || h === 'localhost';
const PAGE_ON_PC = isPrivate(location.hostname);
const HTTP_PAGE = location.protocol === 'http:';

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const listeners = {};
function on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); }
function emit(ev, x) { (listeners[ev] || []).forEach(f => { try { f(x); } catch (e) { console.error(e); } }); }
function log(s) { emit('log', `[${new Date().toTimeString().slice(0, 8)}] ${s}`); }
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const rhex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');

// ---------- mã hóa ----------
const u8bin = u8 => { let s = ''; for (const b of u8) s += String.fromCharCode(b); return s; };
const binu8 = s => Uint8Array.from(s, c => c.charCodeAt(0));
async function importKey(raw) {          // raw: Uint8Array(32)
  if (!SUBTLE) return { forge: u8bin(raw) };
  return { sub: await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']) };
}
async function pbkdf2(pass, salt, iters) {
  if (!SUBTLE) return binu8(forge.pkcs5.pbkdf2(pass, salt, iters, 32, forge.md.sha256.create()));
  const b = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: iters, hash: 'SHA-256' }, b, 256));
}
async function sha256hex(s) {
  if (!SUBTLE) return forge.md.sha256.create().update(s, 'utf8').digest().toHex();
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function seal(kind, id, key, obj) {
  const hdr = `${kind}.${id}`, iv = crypto.getRandomValues(new Uint8Array(12)), txt = JSON.stringify(obj);
  if (key.forge) {
    const c = forge.cipher.createCipher('AES-GCM', key.forge);
    c.start({ iv: u8bin(iv), additionalData: hdr });
    c.update(forge.util.createBuffer(forge.util.encodeUtf8(txt)));
    c.finish();
    return `${hdr}.${btoa(u8bin(iv) + c.output.getBytes() + c.mode.tag.getBytes())}`;
  }
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(hdr) }, key.sub, enc.encode(txt)));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
  return `${hdr}.${btoa(u8bin(out))}`;
}
function parseEnv(s) {
  if (typeof s !== 'string' || s[1] !== '.') return null;
  const p = s.indexOf('.', 2);
  if (p < 0) return null;
  return { kind: s[0], id: s.slice(2, p), hdr: s.slice(0, p), b64: s.slice(p + 1) };
}
async function openEnv(e, key) {
  try {
    const raw = atob(e.b64);
    if (key.forge) {
      const d = forge.cipher.createDecipher('AES-GCM', key.forge);
      d.start({ iv: raw.slice(0, 12), additionalData: e.hdr, tag: forge.util.createBuffer(raw.slice(-16)) });
      d.update(forge.util.createBuffer(raw.slice(12, -16)));
      if (!d.finish()) return null;
      return JSON.parse(forge.util.decodeUtf8(d.output.getBytes()));
    }
    const u = binu8(raw);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12), additionalData: enc.encode(e.hdr) }, key.sub, u.slice(12));
    return JSON.parse(dec.decode(pt));
  } catch { return null; }
}

// ---------- danh tính máy (sau khi ghép) ----------
let ident = store.get('spa-id', null);      // {spa, dev, key, server_id, spa_name, lan:[]}
let devKey = null, hex = null;
let pairing = null;                          // {pid, key, resolve, reject, timer}
async function prepare(spa) { hex = (await sha256hex('spa-topic:' + spa)).slice(0, 20); }

// ---------- trạng thái ----------
let brokers = [], active = null, seq = 0, sent = {}, seen = new Set(), seenQ = [];
let running = false, tick = null, internetStarted = false, internetTimer = null, killed = null, lastPath = null;
let tStart = 0, firstWelcome = 0, switches = 0, reqId = 0;
const pending = new Map();
const p2p = { pc: null, dc: null, state: 'off', sid: '', lastPong: 0, lastPing: 0, rtts: [], retryAt: 0, delay: 5000, timer: null, pair: '', note: 'chưa cần', tries: 0, opened: 0 };
const lan = { ws: null, host: '', up: false, welcomed: false, rtts: [], lastPong: 0, lastPing: 0, helloAt: 0, state: 'chưa tìm', probing: false, scanning: false, lastProbe: 0, lastScan: 0, cut: false };

const lanOk = () => lan.up && lan.welcomed && lan.ws && lan.ws.readyState === 1;
const p2pOpen = () => p2p.state === 'open' && p2p.dc && p2p.dc.readyState === 'open';
function path() { return lanOk() ? 'lan' : p2pOpen() ? 'p2p' : (active && active.welcomed) ? 'channel' : null; }
function changed() {
  const p = path();
  if (p !== lastPath) { if (lastPath && p) switches++; lastPath = p; log(`Đường dùng: ${p === 'lan' ? 'nội bộ ' + lan.host : p === 'p2p' ? 'P2P' : p ? 'kênh ' + active.name : '(chưa có)'}`); }
  emit('state', diag());
}

// ---------- gửi ----------
async function envFor(obj) { obj.t = Date.now(); return seal('d', ident.dev, devKey, obj); }
async function sendLAN(obj) { if (!lan.ws || lan.ws.readyState !== 1) return false; lan.ws.send(await envFor(obj)); return true; }
function sendP2P(obj) { if (!p2pOpen()) return false; obj.t = Date.now(); try { p2p.dc.send(JSON.stringify(obj)); return true; } catch { return false; } }
async function sendVia(b, obj, qos = 1) { if (!b || !b.client || !b.up) return false; b.client.publish(await envFor(obj), qos); return true; }
async function send(obj) { return (lanOk() && await sendLAN(obj)) || sendP2P(obj) || sendVia(active, obj); }

// ---------- nhận ----------
async function onEnv(raw, via) {
  const e = parseEnv(raw);
  if (!e) return;
  if (e.kind === 'q' && pairing && e.id === pairing.pid) {
    const m = await openEnv(e, pairing.key);
    if (m && m.type === 'paired') finishPair(m);
    return;
  }
  if (e.kind !== 's' || !ident || e.id !== ident.dev) return;    // tin của máy khác: bỏ ngay, khỏi giải mã
  const m = await openEnv(e, devKey);
  if (m) onMsg(m, via);
}
function onMsg(m, via) {
  if (via !== 'p2p' && m.t && Math.abs(Date.now() - m.t) > 60000) return;
  if (m.type === 'pong') {
    const p = sent[m.seq]; if (!p || p.via !== via) return;
    delete sent[m.seq];
    const o = via === 'p2p' ? p2p : via === 'lan' ? lan : via;
    o.rtts.push(Math.round(performance.now() - p.t)); if (o.rtts.length > 20) o.rtts.shift();
    o.lastPong = performance.now();
    emit('state', diag());
    return;
  }
  if (m.mid) { if (seen.has(m.mid)) return; seen.add(m.mid); seenQ.push(m.mid); if (seenQ.length > 500) seen.delete(seenQ.shift()); }
  if (m.type === 'welcome') {
    if (Array.isArray(m.lan) && m.lan.length) { ident.lan = m.lan; }
    ident.spa_name = m.spa_name; ident.server_id = m.server_id; store.set('spa-id', ident);
    if (!firstWelcome) firstWelcome = Math.round(performance.now() - tStart);
    if (via === 'lan') {
      lan.welcomed = true; lan.lastPong = performance.now();
      lan.state = `${lan.host} · chào sau ${Math.round(performance.now() - lan.helloAt)} ms`;
      if (p2p.state === 'open' || p2p.state === 'trying') failP2P('đã có mạng nội bộ', false);
      if (!internetStarted) { clearTimeout(internetTimer); internetTimer = setTimeout(() => ensureInternet('dự phòng'), 5000); }
    } else if (via !== 'p2p') {
      via.welcomed = true; via.lastPong = performance.now();
      via.state = `nối ${via.tConn} ms · chào ${Math.round(performance.now() - via.helloAt)} ms`;
      if (!active || !active.up || !active.welcomed || score(via) < score(active) - 20000) setActive(via, active ? 'tốt hơn' : 'trả lời đầu tiên');
    }
    emit('welcome', m);
    changed();
  } else if (m.type === 'answer') onAnswer(m);
  else if (m.type === 'p2p_welcome') {
    const ip = s => (s || '').replace(/^\w+ /, '').replace(/ \(\w+\)$/, '');
    p2p.pair = `${(m.pcSide || '').includes('[') ? 'IPv6' : 'IPv4'} · máy ${ip(m.phoneSide)} ⇄ PC ${ip(m.pcSide)}`;
    p2p.note = p2p.pair; changed();
  } else if (m.type === 'api_res') {
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id); clearTimeout(p.timer);
    if (m.ok) p.resolve(m.data); else p.reject(new Error(m.error || 'Lỗi'));
  } else if (m.type === 'event') emit('event', m.topic);
}

// ---------- API ----------
function request(op, args = {}, timeoutMs = 15000) {
  return new Promise(async (resolve, reject) => {
    if (!path()) return reject(new Error('Chưa kết nối được máy chủ'));
    const id = ++reqId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('Máy chủ không trả lời, thử lại')); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    if (!(await send({ type: 'api', id, op, args }))) { pending.delete(id); clearTimeout(timer); reject(new Error('Mất kết nối, thử lại')); }
  });
}

// ---------- mạng nội bộ ----------
function lanAddrs() {
  if (NO_LAN) return [];
  if (HTTP_PAGE) return [location.hostname];
  const list = ((ident && ident.lan) || []).map(a => String(a).replace(/:\d+$/, ''));
  for (const a of store.get('spa-lan-manual', [])) if (!list.includes(a)) list.unshift(a);
  if (PAGE_ON_PC && !list.includes(location.hostname)) list.unshift(location.hostname);
  return list.filter(isPrivate);
}
const lanUrl = ip => HTTP_PAGE ? `ws://${location.host}/ws` : `wss://${ip}:${LAN_HTTPS}/ws`;
function tryWS(url, ms) {
  return new Promise(res => {
    let done = false, ws;
    try { ws = new WebSocket(url); } catch { return res(null); }
    const fin = v => { if (done) return; done = true; clearTimeout(t); if (!v) { try { ws.close(); } catch {} } res(v); };
    const t = setTimeout(() => fin(null), ms);
    ws.onopen = () => fin(ws); ws.onerror = () => fin(null); ws.onclose = () => fin(null);
  });
}
function adoptLAN(ws, host) {
  if (lanOk() || lan.cut) { try { ws.close(); } catch {} return; }
  if (lan.ws && lan.ws !== ws) { try { lan.ws.close(); } catch {} }
  lan.ws = ws; lan.host = host; lan.up = true; lan.welcomed = false; lan.state = `đã nối ${host}, chờ chào`;
  ws.onmessage = e => onEnv(e.data, 'lan');
  ws.onclose = () => {
    if (lan.ws !== ws) return;
    if (lan.welcomed) log(`Nội bộ: mất kết nối ${host}`);
    lan.ws = null; lan.up = false; lan.welcomed = false; lan.state = 'mất kết nối, đang tìm lại…'; lan.lastProbe = 0;
    ensureInternet('mất mạng nội bộ'); changed();
  };
  if (pairing) { ws.send(pairing.env); return; }
  lan.helloAt = performance.now();
  sendLAN({ type: 'hello' });
  setTimeout(() => { if (lan.ws === ws && !lan.welcomed) { log(`Nội bộ ${host}: không có lời chào, bỏ`); try { ws.close(); } catch {} } }, 3000);
  changed();
}
async function probeKnown() {
  if (lan.probing || lanOk() || lan.cut) return false;
  const addrs = lanAddrs();
  if (!addrs.length) return false;
  lan.probing = true; lan.lastProbe = performance.now();
  if (!lan.up) lan.state = `đang thử ${addrs.join(', ')}…`;
  const found = await new Promise(res => {
    let left = addrs.length, won = false;
    for (const ip of addrs) tryWS(lanUrl(ip), 2500).then(ws => {
      if (ws && !won) { won = true; res({ ws, ip }); } else if (ws) ws.close();
      if (--left === 0 && !won) res(null);
    });
  });
  lan.probing = false;
  if (found) { log(`Nội bộ: thấy máy chủ ở ${found.ip}`); adoptLAN(found.ws, found.ip); return true; }
  if (!lan.up) lan.state = HTTP_PAGE ? 'máy chủ không trả lời' : 'không thấy (chưa ở spa, hoặc chưa cài chứng chỉ)';
  return false;
}
async function scanSubnets() {
  if (HTTP_PAGE || NO_LAN || lan.scanning || lanOk() || lan.cut) return;
  const known = lanAddrs();
  const nets = [...new Set([...known.map(a => a.split('.').slice(0, 3).join('.')), '192.168.1', '192.168.0'])];
  lan.scanning = true; lan.lastScan = performance.now();
  for (const net of nets) {
    for (let i = 1; i <= 254 && running && !lanOk() && !lan.cut; i += 32) {
      const batch = [];
      for (let k = i; k < i + 32 && k <= 254; k++) { const ip = `${net}.${k}`; if (!known.includes(ip)) batch.push(ip); }
      lan.state = `đang quét ${net}.${i}–${Math.min(i + 31, 254)}…`;
      const hits = (await Promise.all(batch.map(ip => tryWS(lanUrl(ip), 2000).then(ws => ws && { ws, ip })))).filter(Boolean);
      if (hits.length) { hits.slice(1).forEach(h => h.ws.close()); log(`Nội bộ: quét thấy ${hits[0].ip}`); adoptLAN(hits[0].ws, hits[0].ip); lan.scanning = false; return; }
    }
  }
  lan.scanning = false;
  if (!lan.up) lan.state = 'không thấy máy chủ nội bộ';
}
function netChanged(why) {
  if (!running || lanOk() || lan.cut || lan.probing) return;
  if (performance.now() - lan.lastProbe > 1500) { log(`Mạng thay đổi (${why}) → dò nội bộ ngay`); lan.lastProbe = 0; }
}

// ---------- kênh báo tin ----------
const score = b => (median(b.rtts) ?? 5000) + (b.ntfy ? 100000 : b.nostr ? 50000 : 0);
function cfg(b) {
  if (b.ntfy) return { probe: NTFY_PROBE_MS, mainPing: NTFY_PING_MS, mainDead: NTFY_DEAD_MS, bakPing: NTFY_PING_MS, bakDead: NTFY_DEAD_MS };
  if (b.nostr) return { probe: 30000, mainPing: 3000, mainDead: 10000, bakPing: 30000, bakDead: 70000 };
  return { probe: PROBE_MS, mainPing: 2000, mainDead: DEAD_MS, bakPing: PROBE_MS, bakDead: PROBE_MS * 2 + 2000 };
}
function setActive(b, why) { if (b === active) return; const old = active; active = b; log(old ? `Kênh: ${old.name} → ${b.name} (${why})` : `Kênh: ${b.name} (${why})`); changed(); }
function pickBest(except) {
  const now = performance.now(), fresh = b => now - b.lastPong < cfg(b).probe * 2 + 5000;
  const ok = brokers.filter(b => b !== except && b.up && b.welcomed && fresh(b)).sort((x, y) => score(x) - score(y));
  return ok[0] || brokers.filter(b => b !== except && b.up && b.welcomed).sort((x, y) => score(x) - score(y))[0] || null;
}
function failover(why) { const n = pickBest(active); if (n) setActive(n, why); else { active = null; changed(); } }
function newChannel(def) { return { ...def, client: null, up: false, welcomed: false, failed: false, rtts: [], lastPong: 0, lastProbe: 0, lastPing: 0, tConn: 0, helloAt: 0, state: 'đang nối…' }; }
function onUp(b, tc) {
  if (b.up) return;
  b.up = true; b.failed = false;
  if (!b.tConn) b.tConn = Math.round(performance.now() - tc);
  b.state = `nối ${b.tConn} ms · chờ chào`;
  b.helloAt = b.lastProbe = performance.now();
  if (pairing) b.client.publish(pairing.env, 1);
  else sendVia(b, { type: 'hello' });
  changed();
}
function onDown(b) {
  if (b.up) { log(`[${b.name}] mất kết nối`); netChanged(`${b.name} rớt`); }
  b.up = false; b.welcomed = false; b.state = b === killed ? 'đã tắt thử' : 'mất kết nối, đang thử lại…';
  if (b === active) failover('kênh đang dùng rớt'); else changed();
}
function makeMqtt(def) {
  const b = newChannel(def), tc = performance.now();
  const c = mqtt.connect(def.url, { clientId: 'spa-' + rhex(6), clean: true, keepalive: 20, reconnectPeriod: 3000, connectTimeout: 10000 });
  b.client = { publish: (env, qos) => c.publish(`spa/${hex}/dev`, env, { qos }), end: () => c.end(true) };
  c.on('connect', () => { c.subscribe(`spa/${hex}/pc`, { qos: 1 }); onUp(b, tc); });
  c.on('close', () => onDown(b));
  c.on('error', e => { b.failed = true; b.state = 'lỗi: ' + ((e && e.message) || '?'); });
  c.on('offline', () => { b.failed = true; if (!b.up) b.state = 'không nối được, đang thử lại…'; });
  c.on('message', (t, payload) => onEnv(payload.toString(), b));
  return b;
}
function makeNtfy(def) {
  const b = newChannel(def), tc = performance.now();
  const es = new EventSource(`${NTFY}spa-${hex}-p/sse`);
  b.client = {
    publish: env => fetch(`${NTFY}spa-${hex}-d?cache=no`, { method: 'POST', body: env }).catch(e => log('[ntfy] gửi lỗi: ' + e.message)),
    end: () => es.close(),
  };
  es.onopen = () => onUp(b, tc);
  es.onerror = () => { if (es.readyState === 2) b.failed = true; if (b.up) onDown(b); else b.state = 'không nối được, đang thử lại…'; };
  es.onmessage = e => { try { const ev = JSON.parse(e.data); if (ev.event === 'message' && ev.message) onEnv(ev.message, b); } catch {} };
  return b;
}
function makeNostr(def) {
  const b = newChannel(def), tc = performance.now(), sk = NostrTools.generateSecretKey();
  let ws = null, stopped = false, retry = 2000;
  function openWS() {
    try { ws = new WebSocket(def.nostr); } catch { return; }
    ws.onopen = () => { retry = 2000; ws.send(JSON.stringify(['REQ', 'spa', { kinds: [NOSTR_KIND], '#t': [`spa-${hex}-p`], since: Math.floor(Date.now() / 1000) - 10 }])); onUp(b, tc); };
    ws.onmessage = e => { let a; try { a = JSON.parse(e.data); } catch { return; } if (a[0] === 'EVENT' && a[2] && a[2].content) onEnv(a[2].content, b); };
    ws.onclose = () => { if (stopped) return; if (b.up) onDown(b); else b.failed = true; setTimeout(openWS, retry); retry = Math.min(retry * 2, 60000); };
  }
  b.client = {
    publish: env => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(['EVENT', NostrTools.finalizeEvent({ kind: NOSTR_KIND, created_at: Math.floor(Date.now() / 1000), tags: [['t', `spa-${hex}-d`]], content: env }, sk)])); },
    end: () => { stopped = true; try { ws.close(); } catch {} },
  };
  openWS();
  return b;
}
const makeChannel = d => d.ntfy ? makeNtfy(d) : d.nostr ? makeNostr(d) : makeMqtt(d);
function ensureInternet(why) {
  if (internetStarted || !running) return;
  internetStarted = true; clearTimeout(internetTimer);
  log(`Internet: nối ${LIST.length} kênh (${why})`);
  brokers = LIST.filter(d => (!d.nostr || window.NostrTools) && (d.ntfy || d.nostr || window.mqtt)).map(makeChannel);
  changed();
}

// ---------- P2P ----------
function onlyV4(sdp) {
  if (!V4ONLY) return sdp;
  return sdp.split(/\r?\n/).filter(l => { if (!l.startsWith('a=candidate:')) return true; const a = l.split(' ')[4] || ''; return !a.includes(':') && !a.endsWith('.local') && !/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(a); }).join('\r\n');
}
function waitGathering(pc, ms) {
  return new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, ms); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); });
}
async function startP2P() {
  if (!active || p2p.state === 'trying' || p2p.state === 'open' || !window.RTCPeerConnection) return;
  p2p.state = 'trying'; p2p.note = `đang thử (lần ${++p2p.tries})…`;
  const t0 = performance.now();
  p2p.sid = rhex(5);
  const pc = new RTCPeerConnection({ iceServers: ICE }), dc = pc.createDataChannel('spa');
  p2p.pc = pc; p2p.dc = dc;
  clearTimeout(p2p.timer);
  p2p.timer = setTimeout(() => { if (p2p.pc === pc && p2p.state === 'trying') failP2P('hết 20 giây, đục lỗ không được'); }, P2P_TIMEOUT);
  dc.onopen = () => {
    if (p2p.pc !== pc) return;
    clearTimeout(p2p.timer);
    p2p.state = 'open'; p2p.lastPong = performance.now(); p2p.delay = 5000; p2p.opened = Math.round(performance.now() - t0);
    p2p.note = p2p.pair || 'đã mở';
    log(`P2P mở sau ${p2p.opened} ms`); changed();
  };
  dc.onmessage = e => { try { onMsg(JSON.parse(e.data), 'p2p'); } catch {} };
  dc.onclose = () => { if (p2p.pc === pc) failP2P('kênh P2P đóng'); };
  pc.oniceconnectionstatechange = () => { if (p2p.pc === pc && pc.iceConnectionState === 'failed') failP2P('ICE thất bại'); };
  try {
    await pc.setLocalDescription(await pc.createOffer());
    await waitGathering(pc, 2500);
    if (p2p.pc !== pc) return;
    p2p.note = `đã gửi lời mời qua ${active ? active.name : '?'}…`;
    if (!(await sendVia(active, { type: 'offer', sid: p2p.sid, sdp: onlyV4(pc.localDescription.sdp) }))) failP2P('không có kênh để gửi lời mời');
  } catch (e) { failP2P('lỗi: ' + e.message); }
}
async function onAnswer(m) {
  if (m.sid !== p2p.sid || !p2p.pc || p2p.state !== 'trying') return;
  p2p.note = 'PC đã trả lời, đang đục lỗ…';
  try { await p2p.pc.setRemoteDescription({ type: 'answer', sdp: onlyV4(m.sdp) }); } catch (e) { failP2P('answer lỗi: ' + e.message); }
}
function closePC() { clearTimeout(p2p.timer); const pc = p2p.pc; p2p.pc = null; p2p.dc = null; if (pc) { try { pc.close(); } catch {} } }
function failP2P(why, retry = true) {
  const wasOpen = p2p.state === 'open';
  closePC();
  p2p.state = retry ? 'failed' : 'off';
  if (!wasOpen) p2p.delay = Math.min(p2p.delay * 2, 120000);
  p2p.retryAt = performance.now() + (wasOpen ? 3000 : p2p.delay);
  p2p.note = retry ? `${why} · thử lại sau ${Math.round((p2p.retryAt - performance.now()) / 1000)} s` : why;
  if (wasOpen && retry) netChanged('P2P rớt');
  sendVia(active, { type: 'p2p_off', why });
  changed();
}

// ---------- vòng lặp ----------
function ping(via) {
  const n = ++seq; sent[n] = { t: performance.now(), via };
  if (via === 'p2p') sendP2P({ type: 'ping', seq: n });
  else if (via === 'lan') sendLAN({ type: 'ping', seq: n });
  else sendVia(via, { type: 'ping', seq: n, active: via === active }, 0);
}
function loop() {
  if (!running || document.hidden || pairing) return;
  const now = performance.now();
  for (const k in sent) if (now - sent[k].t > 15000) delete sent[k];
  if (lanOk()) {
    if (now - lan.lastPing >= 2000) { lan.lastPing = now; ping('lan'); }
    if (now - lan.lastPong > DEAD_MS) { log('Nội bộ: máy chủ không trả lời'); try { lan.ws.close(); } catch {} }
  } else if (!lan.cut && !lan.up) {
    if (now - lan.lastProbe > 6000) probeKnown();
    if (!HTTP_PAGE && !lan.probing && now - lan.lastScan > 180000 && now - tStart > 4000) scanSubnets();
  }
  if (p2pOpen()) {
    if (now - p2p.lastPing >= 2000) { p2p.lastPing = now; ping('p2p'); }
    if (now - p2p.lastPong > DEAD_MS) failP2P(`${Math.round((now - p2p.lastPong) / 1000)} giây không trả lời`);
  }
  if (active && active.up) {
    const main = !lanOk() && !p2pOpen(), c = cfg(active);
    if (now - active.lastPing >= (main ? c.mainPing : c.bakPing)) { active.lastPing = now; ping(active); }
    if (active.lastPong && now - active.lastPong > (main ? c.mainDead : c.bakDead)) { active.welcomed = false; active.state = 'không trả lời'; failover('kênh không trả lời'); }
    const better = active && pickBest(active);
    if (better && score(better) < score(active) - 20000) setActive(better, `${better.name} thông lại`);
  }
  for (const b of brokers) {
    if (b === active || !b.up || now - b.lastProbe < cfg(b).probe) continue;
    b.lastProbe = now;
    if (!b.welcomed || b.ntfy) { b.helloAt = now; sendVia(b, { type: 'hello' }); } else ping(b);
  }
  if (!lanOk() && active && active.welcomed && (p2p.state === 'off' || p2p.state === 'failed') && now >= p2p.retryAt) startP2P();
  emit('state', diag());
}

// ---------- ghép máy ----------
async function pair(code, name) {
  const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (c.length !== 12) throw new Error('Mã ghép máy gồm 12 ký tự, dạng XXXXXX-XXXXXX');
  const spa = c.slice(0, 6), secret = c.slice(6);
  stop();
  await prepare(spa);
  log('Đang tạo khóa ghép máy…');
  const key = await importKey(await pbkdf2(secret, 'spa-pair:' + spa, 100000));
  const pid = rhex(6);
  const env = await seal('p', pid, key, { type: 'pair', name: name || 'Thiết bị', t: Date.now() });
  return new Promise((resolve, reject) => {
    pairing = { pid, key, env, resolve, reject, spa };
    pairing.timer = setTimeout(() => { pairing = null; stop(); reject(new Error('Không có trả lời: mã sai, đã hết hạn, hoặc máy chủ chưa chạy')); }, 45000);
    running = true; tStart = performance.now();
    if (PAGE_ON_PC && !NO_LAN) probeKnown();     // trang mở từ chính PC: ghép qua nội bộ, không cần Internet
    ensureInternet('ghép máy');
  });
}
async function finishPair(m) {
  const p = pairing; if (!p) return;
  clearTimeout(p.timer); pairing = null;
  ident = { spa: p.spa, dev: m.dev_id, key: m.dev_key, server_id: m.server_id, spa_name: m.spa_name, lan: m.lan || [], purpose: m.purpose };
  store.set('spa-id', ident);
  log(`Đã ghép máy: ${m.dev_id}`);
  stop();
  p.resolve(ident);
}

// ---------- bắt đầu / dừng ----------
async function start() {
  if (!ident) throw new Error('Máy chưa được ghép');
  stop();
  await prepare(ident.spa);
  devKey = await importKey(binu8(atob(ident.key)));
  running = true; tStart = performance.now(); firstWelcome = 0;
  Object.assign(p2p, { state: 'off', note: 'chưa cần', rtts: [], delay: 5000, retryAt: 0, tries: 0, pair: '' });
  Object.assign(lan, { rtts: [], up: false, welcomed: false, lastProbe: 0, lastScan: performance.now(), cut: false, state: NO_LAN ? 'bỏ qua (thử)' : 'đang tìm…' });
  tick = setInterval(loop, 500);
  const addrs = lanAddrs();
  if (addrs.length) { probeKnown(); internetTimer = setTimeout(() => { if (!lanOk()) ensureInternet('chưa thấy nội bộ sau 1,5 s'); }, LAN_WAIT); }
  else ensureInternet('chưa biết địa chỉ nội bộ');
  changed();
}
function stop() {
  running = false; clearInterval(tick); clearTimeout(internetTimer); closePC();
  if (lan.ws) { const w = lan.ws; lan.ws = null; try { w.close(); } catch {} }
  lan.up = lan.welcomed = false;
  for (const b of brokers) { try { b.client.end(); } catch {} }
  brokers = []; active = null; killed = null; sent = {}; lastPath = null; internetStarted = false;
  p2p.state = 'off';
  for (const [, p] of pending) { clearTimeout(p.timer); p.reject(new Error('Đã ngắt kết nối')); }
  pending.clear();
}
function forget() { stop(); ident = null; devKey = null; store.del('spa-id'); }

// ---------- chẩn đoán ----------
function diag() {
  const p = path();
  return {
    path: p, switches, firstWelcome,
    pathName: p === 'lan' ? 'Mạng nội bộ' : p === 'p2p' ? 'P2P trực tiếp' : p ? `Kênh ${active.name}` : 'Chưa kết nối',
    rtt: p === 'lan' ? median(lan.rtts) : p === 'p2p' ? median(p2p.rtts) : p ? median(active.rtts) : null,
    detail: p === 'lan' ? `thẳng tới PC ${lan.host}, không qua Internet` : p === 'p2p' ? p2p.pair : p ? 'qua máy chuyển tiếp công cộng, đã mã hóa' : '',
    lan: { state: lan.cut ? 'đã cắt thử' : lan.state, ok: lanOk(), busy: lan.up || lan.probing || lan.scanning, rtt: median(lan.rtts) },
    p2p: { state: p2p.state, note: p2p.note, rtt: median(p2p.rtts) },
    channels: brokers.map(b => ({ name: b.name, kind: b.ntfy ? 'ntfy' : b.nostr ? 'Nostr' : 'MQTT', up: b.up, welcomed: b.welcomed, failed: b.failed, active: b === active, state: b.state, rtt: median(b.rtts) })),
    internetStarted, lanAddrs: lanAddrs(), httpPage: HTTP_PAGE, crypto: SUBTLE ? 'WebCrypto' : 'forge',
  };
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden || !running || pairing) return;
  const now = performance.now();
  for (const b of brokers) if (b.up && !b.ntfy) { b.helloAt = now; sendVia(b, { type: 'hello' }); }
  if (active) active.lastPong = now;
  if (lanOk()) { lan.lastPong = now; ping('lan'); } else lan.lastProbe = 0;
  if (p2pOpen()) { p2p.lastPong = now; ping('p2p'); } else if (p2p.state === 'failed') p2p.retryAt = now + 1000;
});
window.addEventListener('online', () => netChanged('có mạng trở lại'));
window.addEventListener('offline', () => netChanged('mất mạng'));

return {
  on, pair, start, stop, forget, request, diag,
  identity: () => ident, hasIdentity: () => !!ident,
  addLan(ip) { if (!isPrivate(ip)) return false; const m = store.get('spa-lan-manual', []); if (!m.includes(ip)) m.unshift(ip); store.set('spa-lan-manual', m.slice(0, 4)); lan.lastProbe = 0; return true; },
  findLan() { lan.lastProbe = 0; probeKnown().then(f => { if (!f) scanSubnets(); }); },
  cutLan() { lan.cut = !lan.cut; if (lan.cut) { if (lan.ws) try { lan.ws.close(); } catch {} ensureInternet('cắt thử nội bộ'); } else lan.lastProbe = 0; changed(); },
  cutP2P() { if (p2pOpen()) failP2P('thử cắt'); },
  killChannel() { if (!active) return; killed = active; killed.client.end(); onDown(killed); },
  reviveChannel() { if (!killed) return; const i = brokers.indexOf(killed); if (i >= 0) brokers[i] = makeChannel(LIST.find(d => d.name === killed.name)); killed = null; changed(); },
  LAN_HTTP, LAN_HTTPS, isPrivate,
};
})();
