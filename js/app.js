/*
 * app.js - giao diện app spa.
 * Màn hình: ghép máy -> (tạo quản trị) -> đăng nhập -> giao diện theo vai trò.
 * Quyền thật sự được máy chủ kiểm tra; ở đây chỉ ẩn bớt những gì vai trò không dùng.
 *
 * Thêm màn hình mới: viết hàm vXxx(el), thêm vào VIEWS và TABS.
 */
(() => {
'use strict';
const APP_VERSION = 'Spa 0.6';
const $ = s => document.querySelector(s);

// ---------- tiện ích giao diện ----------
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}
const money = n => (Math.round(n || 0)).toLocaleString('vi-VN') + ' đ';
const pad = n => String(n).padStart(2, '0');
const hm = ms => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dmy = ms => { const d = new Date(ms); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const dayLabel = ms => { const d = new Date(ms); return `${WD[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const dayStart = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dateVal = ms => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fromInputs = (date, time) => new Date(`${date}T${time || '00:00'}`).getTime();
const ROLE = { sysadmin: 'Quản trị hệ thống', chairman: 'Chủ tịch HĐQT', ceo: 'Tổng giám đốc', owner: 'Trợ lý TGĐ', reception: 'Lễ tân', technician: 'Kỹ thuật viên', customer: 'Khách hàng' };
// 3 cấp quản trị đều toàn quyền (máy chủ kiểm tra); cấp thấp không cấp/sửa được tài khoản cấp cao hơn
const RANK = { sysadmin: 4, chairman: 3, ceo: 2, owner: 1 };   // sysadmin: chỉ cấp trên máy chủ, ẩn khỏi danh sách
const myRole = () => (S.me && RANK[S.me.role]) ? 'owner' : (S.me && S.me.role);
const STATUS = { requested: 'Chờ xác nhận', booked: 'Đã đặt', arrived: 'Đã đến', in_service: 'Đang làm', done: 'Xong', cancelled: 'Đã hủy', no_show: 'Không đến' };
const METHOD = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ' };
const chip = st => h('span', { class: 'chip ' + st }, STATUS[st] || st);

let toastTimer;
function toast(msg, bad) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = h('div', { class: 'toast' + (bad ? ' bad' : '') }, msg);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), bad ? 4500 : 2200);
}
async function api(op, args, quiet) {
  try { return await Conn.request(op, args); }
  catch (e) { if (!quiet) toast(e.message, true); throw e; }
}
function sheet(title, body, actions) {
  const close = () => scrim.remove();
  const scrim = h('div', { class: 'scrim', onclick: e => { if (e.target === scrim) close(); } },
    h('div', { class: 'sheet' },
      h('div', { class: 'bar' }, h('h2', {}, title), h('button', { class: 'x', onclick: close, 'aria-label': 'Đóng' }, '✕')),
      body,
      actions && h('div', { class: 'row' }, actions)));
  document.body.append(scrim);
  const f = scrim.querySelector('input,select,textarea'); if (f && !('ontouchstart' in window)) f.focus();
  return close;
}
function field(label, input) { return h('label', { class: 'f' }, label, input); }

// Bỏ dấu tiếng Việt để tìm: "Nguyễn Lân" -> "nguyen lan"
const vn = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

// Ô chọn gõ để lọc (thay cho danh sách thả xuống dài). el.value = id đã chọn, el.text = chữ đang gõ.
function combo(items, label, selectedId, placeholder, onChange) {
  let value = selectedId || '';
  const cur = items.find(i => i.id === selectedId);
  const inp = h('input', { placeholder, value: cur ? label(cur) : '', autocomplete: 'off' });
  const box = h('div', { class: 'pick', hidden: true });
  const pick = i => { value = i ? i.id : ''; inp.value = i ? label(i) : ''; box.hidden = true; if (onChange) onChange(i); };
  const show = () => {
    const q = vn(inp.value), list = items.filter(i => !q || vn(label(i)).includes(q)).slice(0, 40);
    box.replaceChildren(...list.map(i => h('button', { type: 'button', onmousedown: e => e.preventDefault(), onclick: () => pick(i) }, label(i))));
    box.hidden = !list.length;
  };
  inp.addEventListener('focus', show);
  inp.addEventListener('input', () => { value = ''; if (onChange) onChange(null); show(); });
  inp.addEventListener('blur', () => setTimeout(() => { box.hidden = true; }, 150));
  const el = h('div', { class: 'combo' }, inp, box);
  Object.defineProperty(el, 'value', { get: () => value });
  Object.defineProperty(el, 'text', { get: () => inp.value.trim() });
  return el;
}

// Ảnh QR (thư viện qrcode-generator, chép sẵn trong lib/)
function qrImg(text) {
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  return h('img', { src: q.createDataURL(8, 2), alt: text });
}
function busy(btn, p) { btn.disabled = true; return p.finally(() => { btn.disabled = false; }); }

// ---------- trạng thái app ----------
const S = { welcome: null, me: null, tab: null, services: [], staff: [], view: null, viewTopic: null, log: [] };
Conn.on('log', l => { S.log.push(l); if (S.log.length > 200) S.log.shift(); });

const LOGO = () => h('img', { class: 'brandlogo', src: 'logo.png', alt: 'MND Citta Laser Clinic' });

// ---------- màn hình: ghép máy ----------
function guessName() {
  const ua = navigator.userAgent;
  return /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Điện thoại Android' : /Windows/.test(ua) ? 'Máy tính Windows' : /Mac/.test(ua) ? 'Máy Mac' : 'Thiết bị';
}
function screenPair(msg) {
  const code = h('input', { placeholder: 'XXXXXX-XXXXXX', autocapitalize: 'characters', autocomplete: 'off', spellcheck: 'false', class: 'big', maxlength: 16 });
  const name = h('input', { value: guessName(), maxlength: 40 });
  const st = h('p', { class: 'small muted' }, msg || '');
  const btn = h('button', { class: 'btn' }, 'Ghép máy');
  btn.onclick = () => {
    st.textContent = 'Đang tìm máy chủ và ghép máy…';
    busy(btn, Conn.pair(code.value, name.value.trim()).then(() => boot()).catch(e => { st.textContent = e.message; }));
  };
  $('#app').replaceChildren(h('div', { class: 'wrap center' }, h('div', { class: 'card' },
    LOGO(), h('h1', {}, 'Ghép máy với spa'),
    h('p', { class: 'muted small' }, 'Nhập mã ghép máy do quản trị tạo (mục Thiết bị), hoặc mã khởi tạo in trên cửa sổ máy chủ khi chạy lần đầu. Mỗi máy chỉ cần ghép một lần.'),
    field('Mã ghép máy', code), field('Tên máy này', name), btn, st,
    h('p', { class: 'small muted' }, APP_VERSION))));
}

// ---------- màn hình: tạo quản trị / đăng nhập ----------
function screenSetup() {
  const un = h('input', { autocomplete: 'username', autocapitalize: 'none' }), dn = h('input', {}), pw = h('input', { type: 'password', autocomplete: 'new-password' }), pw2 = h('input', { type: 'password', autocomplete: 'new-password' });
  const btn = h('button', { class: 'btn' }, 'Tạo tài khoản quản trị');
  btn.onclick = () => {
    if (pw.value !== pw2.value) return toast('Hai lần nhập mật khẩu không khớp', true);
    busy(btn, api('auth.setup_owner', { username: un.value.trim(), display_name: dn.value.trim(), password: pw.value }).then(u => { S.me = u; toast('Đã tạo tài khoản quản trị'); screenMain(); }).catch(() => {}));
  };
  $('#app').replaceChildren(h('div', { class: 'wrap center' }, h('div', { class: 'card' },
    LOGO(), h('h1', {}, 'Chào mừng!'), h('p', { class: 'muted small' }, 'Máy này được ghép bằng mã khởi tạo. Hãy tạo tài khoản quản trị: tài khoản có toàn quyền, dùng để thêm nhân viên, dịch vụ và ghép các máy khác.'),
    field('Tên đăng nhập', un), field('Tên hiển thị', dn), field('Mật khẩu (ít nhất 6 ký tự)', pw), field('Nhập lại mật khẩu', pw2), btn)));
}
function screenLogin() {
  const un = h('input', { autocomplete: 'username', autocapitalize: 'none' }), pw = h('input', { type: 'password', autocomplete: 'current-password' });
  const btn = h('button', { class: 'btn' }, 'Đăng nhập');
  btn.onclick = () => busy(btn, api('auth.login', { username: un.value.trim(), password: pw.value }).then(u => { S.me = u; screenMain(); }).catch(() => {}));
  pw.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
  $('#app').replaceChildren(h('div', { class: 'wrap center' }, h('div', { class: 'card' },
    LOGO(), h('h1', {}, S.welcome ? S.welcome.spa_name : 'Spa'), h('p', { class: 'muted small' }, `Máy: ${S.welcome ? S.welcome.dev_name : ''}`),
    field('Tên đăng nhập', un), field('Mật khẩu', pw), btn,
    h('div', { class: 'row between' }, connBadge(), h('button', { class: 'btn ghost small', onclick: () => sheet('Kết nối', diagPanel()) }, 'Chẩn đoán')))));
}
function screenConnecting() {
  const d = Conn.diag();
  $('#app').replaceChildren(h('div', { class: 'wrap center' }, h('div', { class: 'card' },
    LOGO(), h('h2', {}, 'Đang kết nối tới máy chủ spa…'),
    h('p', { class: 'muted small', id: 'cstate' }, `Nội bộ: ${d.lan.state}`),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => sheet('Kết nối', diagPanel()) }, 'Chẩn đoán'),
      h('button', { class: 'btn bad small', onclick: unpair }, 'Gỡ ghép máy')))));
}

// ---------- khung chính theo vai trò ----------
const TABS = {
  owner:      ['appts', 'customers', 'invoices', 'services', 'stock', 'cash', 'bonus', 'staff', 'devices', 'reports', 'system'],
  reception:  ['appts', 'customers', 'invoices', 'services', 'stock', 'system'],
  technician: ['mine', 'customers', 'mybonus', 'system'],
  customer:   ['my', 'book', 'profile', 'system'],
};
const TAB = {
  appts: ['📅', 'Lịch hẹn'], mine: ['📅', 'Lịch của tôi'], customers: ['👤', 'Khách hàng'], invoices: ['🧾', 'Hóa đơn'],
  services: ['💆', 'Dịch vụ'], staff: ['👥', 'Nhân viên'], devices: ['📱', 'Thiết bị'], reports: ['📊', 'Báo cáo'],
  stock: ['📦', 'Kho'], cash: ['💵', 'Thu chi'], bonus: ['🎁', 'Thưởng'], mybonus: ['🎁', 'Thưởng của tôi'],
  system: ['⚙️', 'Hệ thống'], my: ['📅', 'Lịch của tôi'], book: ['➕', 'Đặt lịch'], profile: ['⭐', 'Thông tin'],
};
function connBadge() {
  const d = Conn.diag();
  const b = h('span', { class: 'badge', id: 'cbadge', onclick: () => go('system') },
    h('span', { class: 'dot ' + (d.path || 'none') }), d.pathName + (d.rtt != null ? ` · ${d.rtt} ms` : ''));
  return b;
}
// Mật khẩu tạm / mặc định: bắt đổi trước khi dùng app (máy chủ cũng chặn mọi thao tác khác)
function screenForceChange() {
  const o = h('input', { type: 'password', autocomplete: 'current-password' });
  const n = h('input', { type: 'password', autocomplete: 'new-password' }), n2 = h('input', { type: 'password', autocomplete: 'new-password' });
  const btn = h('button', { class: 'btn' }, 'Đổi mật khẩu');
  btn.onclick = () => {
    if (n.value.length < 6) return toast('Mật khẩu mới cần ít nhất 6 ký tự');
    if (n.value !== n2.value) return toast('Hai lần nhập mật khẩu mới không khớp');
    busy(btn, api('auth.change_password', { old: o.value, new: n.value })
      .then(() => { S.me.must_change = false; toast('Đã đổi mật khẩu'); screenMain(); }).catch(() => {}));
  };
  n2.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
  $('#app').replaceChildren(h('div', { class: 'wrap center' }, h('div', { class: 'card' },
    LOGO(), h('h2', {}, `Chào ${S.me.display_name || S.me.username}`),
    h('p', { class: 'muted small' }, 'Bạn đang dùng mật khẩu tạm. Hãy đặt mật khẩu riêng của mình trước khi dùng app (ít nhất 6 ký tự, không ai khác biết).'),
    field('Mật khẩu hiện tại (mật khẩu tạm)', o), field('Mật khẩu mới', n), field('Nhập lại mật khẩu mới', n2), btn,
    h('button', { class: 'btn ghost', onclick: () => api('auth.logout').then(() => { S.me = null; screenLogin(); }).catch(() => {}) }, 'Đăng xuất'))));
}
function screenMain() {
  if (S.me && S.me.must_change) return screenForceChange();
  const tabs = TABS[myRole()] || ['system'];
  if (!tabs.includes(S.tab)) S.tab = tabs[0];
  $('#app').replaceChildren(
    h('header', { class: 'top' }, h('div', { class: 'in' },
      h('img', { class: 'hlogo', src: 'icon-192.png', alt: '' }),
      h('div', { class: 'grow' }, h('div', { class: 'spa' }, S.welcome ? S.welcome.spa_name : 'Spa'),
        h('div', { class: 'who' }, `${S.me.display_name || S.me.username} · ${ROLE[S.me.role] || S.me.role}`)),
      myRole() !== 'customer' && h('button', { class: 'hbtn', title: 'Tìm nhanh', 'aria-label': 'Tìm nhanh', onclick: quickSearch }, '🔍'),
      myRole() !== 'customer' && h('button', { class: 'hbtn', title: 'Quét mã', 'aria-label': 'Quét mã', onclick: scanSheet }, '📷'),
      connBadge())),
    h('div', { id: 'banner' }),
    h('main', { class: 'wrap', id: 'view' }),
    h('nav', { class: 'tabs' }, tabs.map(t => h('button', { class: t === S.tab ? 'on' : '', onclick: () => go(t) },
      h('span', { class: 'ic' }, TAB[t][0]), TAB[t][1]))));
  loadCaches();
  go(S.tab);
}
function go(tab) {
  S.tab = tab;
  document.querySelectorAll('nav.tabs button').forEach((b, i) => b.classList.toggle('on', (TABS[myRole()] || [])[i] === tab));
  const el = $('#view');
  if (!el) return;
  el.replaceChildren(h('div', { class: 'empty' }, 'Đang tải…'));
  S.view = tab;
  (VIEWS[tab] || vSystem)(el).catch(e => { el.replaceChildren(h('div', { class: 'card' }, h('p', {}, 'Không tải được: ' + e.message), h('button', { class: 'btn ghost small', onclick: () => go(tab) }, 'Thử lại'))); });
}
async function loadCaches() {
  if (myRole() === 'customer') { S.services = await api('services.list', {}, true).catch(() => []); return; }
  [S.services, S.staff] = await Promise.all([api('services.list', {}, true).catch(() => []), api('staff.list', {}, true).catch(() => [])]);
}
const TOPIC_VIEWS = { appointments: ['appts', 'mine', 'my', 'reports'], customers: ['customers'], invoices: ['invoices', 'reports'], services: ['services'], staff: ['staff'],
  stock: ['stock'], cash: ['cash'], bonuses: ['bonus', 'mybonus'] };
let refreshTimer;
Conn.on('event', topic => {
  if (topic === 'services' || topic === 'staff') loadCaches();
  if ((TOPIC_VIEWS[topic] || []).includes(S.view) && !document.querySelector('.scrim')) {
    clearTimeout(refreshTimer); refreshTimer = setTimeout(() => go(S.view), 300);
  }
});

// ---------- lịch hẹn ----------
let apptDay = dayStart(Date.now()), apptStaff = '';
async function vAppts(el, mineOnly) {
  const list = await api('appointments.list', { from: apptDay, to: apptDay + 86400000, staff_id: mineOnly ? '' : apptStaff });
  const staffSel = !mineOnly && h('select', { onchange: e => { apptStaff = e.target.value; go(S.view); } },
    h('option', { value: '' }, 'Tất cả nhân viên'), S.staff.filter(u => u.role !== 'customer').map(u => h('option', { value: u.id, selected: u.id === apptStaff }, u.display_name || u.username)));
  const nav = h('div', { class: 'row between' },
    h('button', { class: 'btn ghost small', onclick: () => { apptDay -= 86400000; go(S.view); } }, '‹'),
    h('div', { class: 'grow', style: 'text-align:center' }, h('b', {}, dayLabel(apptDay)), apptDay === dayStart(Date.now()) ? ' (hôm nay)' : ''),
    h('button', { class: 'btn ghost small', onclick: () => { apptDay = dayStart(Date.now()); go(S.view); } }, 'Hôm nay'),
    h('button', { class: 'btn ghost small', onclick: () => { apptDay += 86400000; go(S.view); } }, '›'));
  const items = list.map(a => h('div', { class: 'item', onclick: () => apptDetail(a, mineOnly) },
    h('div', { class: 'l' }, hm(a.start_at)),
    h('div', { class: 't' }, a.customer_name || '(chưa có khách)'),
    h('div', { class: 'r' }, chip(a.status)),
    h('div', { class: 's' }, [a.service_name, a.staff_name].filter(Boolean).join(' · ') || '—')));
  el.replaceChildren(h('div', { class: 'card' }, nav, staffSel,
    !mineOnly && h('button', { class: 'btn', onclick: () => apptSheet({ start_at: apptDay + 9 * 3600000 }) }, '+ Thêm lịch hẹn'),
    h('div', { class: 'list' }, items.length ? items : h('div', { class: 'empty' }, 'Không có lịch hẹn'))));
}
function apptDetail(a, mineOnly) {
  const can = ['owner', 'reception'].includes(myRole());
  const statusBtns = (mineOnly || myRole() === 'technician') ? ['arrived', 'in_service', 'done'] : ['booked', 'arrived', 'in_service', 'done', 'no_show', 'cancelled'];
  let close;
  const setStatus = st => api('appointments.status', { id: a.id, status: st }).then(() => { toast('Đã cập nhật'); close(); go(S.view); }).catch(() => {});
  close = sheet(`${hm(a.start_at)} · ${a.customer_name || ''}`, h('div', { style: 'display:grid;gap:10px' },
    h('dl', { class: 'kv' },
      h('dt', {}, 'Dịch vụ'), h('dd', {}, a.service_name || '—'),
      h('dt', {}, 'Nhân viên'), h('dd', {}, a.staff_name || '—'),
      a.doctor_name && h('dt', {}, 'Bác sĩ'), a.doctor_name && h('dd', {}, a.doctor_name),
      a.info && h('dt', {}, 'Loại'), a.info && h('dd', {}, a.info),
      a.amount && h('dt', {}, 'Trừ gói'), a.amount && h('dd', {}, money(a.amount)),
      h('dt', {}, 'Thời gian'), h('dd', {}, `${dayLabel(a.start_at)} ${hm(a.start_at)}–${a.end_at ? hm(a.end_at) : '?'}`),
      h('dt', {}, 'Khách'), h('dd', {}, [a.customer_name, a.customer_phone].filter(Boolean).join(' · ') || '—'),
      h('dt', {}, 'Trạng thái'), h('dd', {}, chip(a.status)),
      a.note && h('dt', {}, 'Ghi chú'), a.note && h('dd', {}, a.note)),
    h('div', { class: 'row' }, statusBtns.map(st => h('button', { class: 'btn ghost small', disabled: st === a.status, onclick: () => setStatus(st) }, STATUS[st]))),
    h('div', { class: 'row' },
      can && h('button', { class: 'btn', onclick: () => { close(); invoiceSheet({ appointment: a }); } }, 'Thanh toán'),
      a.customer_id && !a.amount && h('button', { class: 'btn ghost', onclick: async () => {
        const pk = (await api('packages.list', { customer_id: a.customer_id })).filter(p => p.status === 'active');
        if (!pk.length) return toast('Khách chưa có gói đang dùng', true);
        close();
        if (pk.length === 1) return packageSheet(pk[0], { id: a.customer_id }, a);
        sheet('Chọn gói để trừ', h('div', { class: 'list' }, pk.map(p => h('div', { class: 'item', onclick: () => { document.querySelectorAll('.scrim').forEach(s => s.remove()); packageSheet(p, { id: a.customer_id }, a); } },
          h('div', { class: 'l' }, '💳'), h('div', { class: 't' }, p.name), h('div', { class: 'r' }, money(p.remaining)), h('div', { class: 's' }, p.sessions_left != null ? `${p.sessions_left} buổi` : '')))));
      } }, 'Trừ gói'),
      can && h('button', { class: 'btn ghost', onclick: () => { close(); apptSheet(a); } }, 'Sửa'),
      a.customer_id && h('button', { class: 'btn ghost', onclick: () => { close(); customerDetail(a.customer_id); } }, 'Hồ sơ khách'),
      ['owner', 'technician'].includes(myRole()) && a.customer_id && h('button', { class: 'btn ghost', onclick: () => { close(); noteSheet(a.customer_id, a.id); } }, 'Ghi chú lịch trình'),
      can && h('button', { class: 'btn bad', onclick: () => { if (window.confirm('Xóa lịch hẹn này?')) api('appointments.delete', { id: a.id }).then(() => { close(); go(S.view); }).catch(() => {}); } }, 'Xóa'))));
}
function customerPicker(initial, onPick) {
  let chosen = initial;
  const q = h('input', { placeholder: 'Tìm tên hoặc số điện thoại…', value: initial ? initial.name : '' });
  const box = h('div', { class: 'pick' });
  let t;
  const search = () => api('customers.list', { q: q.value.trim(), limit: 8 }, true).then(rows => {
    box.replaceChildren(...rows.map(c => h('button', { type: 'button', onclick: () => { chosen = c; q.value = c.name; box.replaceChildren(); onPick(c); } }, `${c.name}${c.phone ? ' · ' + c.phone : ''}`)),
      h('button', { type: 'button', onclick: () => quickCustomer(q.value.trim(), c => { chosen = c; q.value = c.name; box.replaceChildren(); onPick(c); }) }, `+ Khách mới${q.value.trim() ? ': ' + q.value.trim() : ''}`));
  }).catch(() => {});
  q.addEventListener('input', () => { clearTimeout(t); chosen = null; onPick(null); t = setTimeout(search, 250); });
  q.addEventListener('focus', () => { if (!chosen) search(); });
  return h('div', { style: 'display:grid;gap:6px' }, q, box);
}
function quickCustomer(name, done) {
  const n = h('input', { value: name }), p = h('input', { type: 'tel' });
  let close;
  const btn = h('button', { class: 'btn' }, 'Lưu khách');
  btn.onclick = () => busy(btn, api('customers.save', { name: n.value.trim(), phone: p.value.trim() }).then(c => { close(); done(c); }).catch(() => {}));
  close = sheet('Khách mới', h('div', { style: 'display:grid;gap:10px' }, field('Tên khách', n), field('Số điện thoại', p)), btn);
}
function apptSheet(a) {
  const isNew = !a.id;
  let cust = a.customer_id ? { id: a.customer_id, name: a.customer_name } : null;
  const d = h('input', { type: 'date', value: dateVal(a.start_at || Date.now()) });
  const t = h('input', { type: 'time', value: hm(a.start_at || Date.now()), step: 300 });
  const sv = combo(S.services, s => `${s.name} · ${s.duration_min} phút · ${money(s.price)}`, a.service_id, 'Gõ tên dịch vụ…');
  const st = combo(S.staff.filter(u => (u.role === 'technician' || RANK[u.role]) && u.active), u => u.display_name || u.username, a.staff_id, 'Gõ tên kỹ thuật viên (để trống: chưa phân công)');
  const note = h('textarea', { value: a.note || '' });
  const btn = h('button', { class: 'btn' }, isNew ? 'Thêm lịch hẹn' : 'Lưu');
  let close;
  const save = force => {
    if (!cust) return toast('Hãy chọn khách', true);
    const args = { customer_id: cust.id, service_id: sv.value || null, staff_id: st.value || null, start_at: fromInputs(d.value, t.value), note: note.value };
    if (!isNew) { args.id = a.id; args.end_at = 0; }
    if (force) args.force = true;
    busy(btn, Conn.request('appointments.save', args).then(() => { toast('Đã lưu lịch hẹn'); close(); apptDay = dayStart(args.start_at); go(S.view === 'customers' ? 'customers' : 'appts'); })
      .catch(e => { if (/trùng giờ/.test(e.message) && window.confirm(e.message + '. Vẫn lưu?')) save(true); else toast(e.message, true); }));
  };
  btn.onclick = () => save(false);
  close = sheet(isNew ? 'Lịch hẹn mới' : 'Sửa lịch hẹn', h('div', { style: 'display:grid;gap:10px' },
    field('Khách', customerPicker(cust, c => { cust = c; })),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Ngày', d)), h('div', { class: 'grow' }, field('Giờ', t))),
    field('Dịch vụ', sv), field('Kỹ thuật viên', st), field('Ghi chú', note)), btn);
}

// ---------- khách hàng ----------
let custQ = '';
async function vCustomers(el) {
  const q = h('input', { placeholder: 'Tìm tên hoặc số điện thoại…', value: custQ, type: 'search' });
  const box = h('div', { class: 'list' });
  const load = () => api('customers.list', { q: custQ, limit: 200 }).then(rows => box.replaceChildren(...(rows.length ? rows.map(c =>
    h('div', { class: 'item', onclick: () => customerDetail(c.id) },
      h('div', { class: 'l' }, '👤'), h('div', { class: 't' }, c.name), h('div', { class: 'r muted' }, c.points ? `${c.points} điểm` : ''),
      h('div', { class: 's' }, [c.phone, c.code].filter(Boolean).join(' · ') || '—'))) : [h('div', { class: 'empty' }, custQ ? 'Không tìm thấy' : 'Chưa có khách')])));
  let t;
  q.addEventListener('input', () => { custQ = q.value.trim(); clearTimeout(t); t = setTimeout(load, 250); });
  el.replaceChildren(h('div', { class: 'card' }, q,
    ['owner', 'reception'].includes(myRole()) && h('button', { class: 'btn', onclick: () => customerEdit({}) }, '+ Thêm khách'), box));
  await load();
}
async function customerDetail(id) {
  const c = await api('customers.get', { id });
  const can = ['owner', 'reception'].includes(myRole());
  let close;
  close = sheet(c.name, h('div', { style: 'display:grid;gap:12px' },
    c.code && h('div', { class: 'row' }, h('div', { class: 'qr', style: 'flex:none' }, qrImg(c.code)),
      h('div', { class: 'grow', style: 'display:grid;gap:6px' }, h('div', { class: 'big' }, c.code),
        h('p', { class: 'small muted' }, 'Mã khách: quét bằng nút 📷 hoặc máy quét để mở nhanh hồ sơ này.'),
        h('button', { class: 'btn ghost small', onclick: () => memberCard(c) }, 'In thẻ thành viên'))),
    h('dl', { class: 'kv' },
      h('dt', {}, 'Điện thoại'), h('dd', {}, c.phone || '—'), h('dt', {}, 'Ngày sinh'), h('dd', {}, c.birthday || '—'),
      c.category && h('dt', {}, 'Phân loại'), c.category && h('dd', {}, c.category),
      c.first_visit && h('dt', {}, 'Đến lần đầu'), c.first_visit && h('dd', {}, c.first_visit.split('-').reverse().join('/')),
      h('dt', {}, 'Điểm tích lũy'), h('dd', {}, String(c.points || 0)),
      c.spent && h('dt', {}, 'Đã chi'), c.spent && h('dd', {}, `${money(c.spent.total)} (${c.spent.n} hóa đơn)`),
      c.legacy_total && h('dt', {}, 'Tổng mua (hệ thống cũ)'), c.legacy_total && h('dd', {}, money(c.legacy_total)),
      c.note && h('dt', {}, 'Ghi chú'), c.note && h('dd', {}, c.note)),
    h('div', { class: 'row between' }, h('h3', {}, 'Gói & số dư'),
      can && h('button', { class: 'btn ghost small', onclick: () => { close(); packageNew(c); } }, '+ Mở gói')),
    h('div', { class: 'list' }, (c.packages || []).length ? c.packages.map(p => h('div', { class: 'item', onclick: () => { close(); packageSheet(p, c); } },
      h('div', { class: 'l' }, p.status === 'active' ? '💳' : '✔️'), h('div', { class: 't' }, p.name),
      h('div', { class: 'r' }, h('b', {}, money(p.remaining)), p.sessions_left != null ? [h('br'), `${p.sessions_left} buổi`] : ''),
      h('div', { class: 's' }, p.status === 'active' ? `Giá trị gói ${money(p.total)}` : 'Đã dùng hết'))) : h('div', { class: 'empty' }, 'Chưa có gói')),
    h('div', { class: 'row' },
      can && h('button', { class: 'btn', onclick: () => { close(); apptSheet({ customer_id: c.id, customer_name: c.name, start_at: Date.now() + 3600000 }); } }, 'Đặt lịch'),
      can && h('button', { class: 'btn ghost', onclick: () => { close(); customerEdit(c); } }, 'Sửa'),
      ['owner', 'technician'].includes(myRole()) && h('button', { class: 'btn ghost', onclick: () => { close(); noteSheet(c.id); } }, 'Ghi chú liệu trình'),
      myRole() === 'owner' && h('button', { class: 'btn bad', onclick: () => { if (window.confirm('Xóa khách này?')) api('customers.delete', { id: c.id }).then(() => { close(); go('customers'); }).catch(() => {}); } }, 'Xóa')),
    h('h3', {}, 'Lịch sử'),
    h('div', { class: 'list' }, (c.appointments || []).length ? c.appointments.map(a => h('div', { class: 'item' },
      h('div', { class: 'l' }, dmy(a.start_at).slice(0, 5)), h('div', { class: 't' }, a.service_name || '—'), h('div', { class: 'r' }, chip(a.status)),
      h('div', { class: 's' }, a.staff_name || ''))) : h('div', { class: 'empty' }, 'Chưa có')),
    h('h3', {}, 'Ghi chú liệu trình'),
    h('div', { class: 'list' }, (c.notes || []).length ? c.notes.map(n => h('div', { class: 'item' },
      h('div', { class: 'l' }, dmy(n.created_at).slice(0, 5)), h('div', { class: 't', style: 'white-space:normal' }, n.body), h('div', { class: 'r' }),
      h('div', { class: 's' }, n.staff_name || ''))) : h('div', { class: 'empty' }, 'Chưa có'))));
}
// ---------- gói & số dư ----------
function packageNew(c) {
  const name = h('input', { placeholder: 'VD: Gói 8 buổi Glass Skin' }), total = h('input', { type: 'number', min: 0, step: 1000, inputmode: 'numeric' });
  const ses = h('input', { type: 'number', min: 0, inputmode: 'numeric', placeholder: 'Để trống nếu gói tính theo tiền' }), note = h('input', {});
  const btn = h('button', { class: 'btn' }, 'Mở gói');
  let close;
  btn.onclick = () => busy(btn, api('packages.save', { customer_id: c.id, name: name.value.trim(), total: +total.value || 0,
    sessions_left: ses.value === '' ? null : +ses.value, note: note.value.trim() }).then(() => { toast('Đã mở gói'); close(); customerDetail(c.id); }).catch(() => {}));
  close = sheet(`Mở gói cho ${c.name}`, h('div', { style: 'display:grid;gap:10px' }, field('Tên gói', name), field('Giá trị gói (đ)', total),
    field('Số buổi', ses), field('Ghi chú', note), h('p', { class: 'small muted' }, 'Thu tiền gói bằng một hóa đơn riêng ở mục Hóa đơn.')), btn);
}
// Trừ / cộng gói (mọi thay đổi đều ghi lại, không sửa số dư trực tiếp)
function packageSheet(p, c, appointment) {
  const amt = h('input', { type: 'number', step: 1000, inputmode: 'numeric', value: appointment && appointment.service_price ? appointment.service_price : '' });
  const ses = h('input', { type: 'number', inputmode: 'numeric', value: p.sessions_left != null ? 1 : '' });
  const reason = h('input', { value: appointment ? `Làm ${appointment.service_name || 'dịch vụ'} ${dmy(appointment.start_at)}` : '' });
  const hist = h('div', { class: 'list' }, h('div', { class: 'empty' }, 'Đang tải…'));
  let close;
  const go2 = sign => (api('packages.adjust', { id: p.id, delta_amount: sign * (+amt.value || 0), delta_sessions: sign * (+ses.value || 0),
    reason: reason.value.trim() || (sign < 0 ? 'Trừ gói' : 'Cộng gói'), appointment_id: appointment && appointment.id })
    .then(() => { toast(sign < 0 ? 'Đã trừ gói' : 'Đã cộng gói'); close(); customerDetail(c.id || p.customer_id); }).catch(() => {}));
  close = sheet(p.name, h('div', { style: 'display:grid;gap:10px' },
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, 'Còn lại', h('b', {}, money(p.remaining))),
      p.sessions_left != null && h('div', { class: 'stat' }, 'Buổi còn', h('b', {}, p.sessions_left))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Số tiền (đ)', amt)), h('div', { class: 'grow' }, field('Số buổi', ses))),
    field('Lý do', reason),
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => go2(-1) }, '− Trừ gói'),
      ['owner', 'reception'].includes(myRole()) && h('button', { class: 'btn ghost', onclick: () => go2(1) }, '+ Cộng thêm')),
    h('h3', {}, 'Lịch sử'), hist));
  api('packages.moves', { id: p.id }, true).then(rows => hist.replaceChildren(...(rows.length ? rows.map(m => h('div', { class: 'item' },
    h('div', { class: 'l' }, dmy(m.at).slice(0, 5)), h('div', { class: 't', style: 'white-space:normal' }, m.reason || ''),
    h('div', { class: 'r' }, h('b', { style: `color:var(--${m.delta_amount < 0 || m.delta_sessions < 0 ? 'bad' : 'ok'})` },
      [m.delta_amount ? (m.delta_amount > 0 ? '+' : '') + money(m.delta_amount) : '', m.delta_sessions ? ` ${m.delta_sessions > 0 ? '+' : ''}${m.delta_sessions} buổi` : ''].join(''))),
    h('div', { class: 's' }, m.by_name || ''))) : [h('div', { class: 'empty' }, 'Chưa có')]))).catch(() => {});
}

// Thẻ thành viên cỡ thẻ ngân hàng (85,6 × 54 mm) có QR mã khách
function memberCard(c) {
  const card = h('div', { class: 'print-area' }, h('div', { class: 'membercard' },
    h('div', { style: 'display:grid;gap:1.6mm' }, h('img', { class: 'logo', src: 'logo.png', alt: 'MND Citta' }),
      h('div', { class: 'n' }, c.name), h('div', { class: 'c' }, c.code), h('div', { style: 'font-size:2.6mm;opacity:.85;letter-spacing:.08em' }, 'THẺ THÀNH VIÊN')),
    qrImg(c.code)));
  sheet('Thẻ thành viên', h('div', { style: 'display:grid;gap:12px' }, card,
    h('p', { class: 'small muted' }, 'Bấm In (hoặc Chia sẻ → In trên iPhone). Chọn khổ giấy nhỏ hoặc in trên giấy cứng rồi cắt theo viền.')),
    h('button', { class: 'btn', onclick: () => window.print() }, 'In'));
}
function customerEdit(c) {
  const f = { name: h('input', { value: c.name || '' }), phone: h('input', { type: 'tel', value: c.phone || '' }), email: h('input', { type: 'email', value: c.email || '' }),
    birthday: h('input', { type: 'date', value: c.birthday || '' }), gender: h('select', {}, ['', 'Nữ', 'Nam', 'Khác'].map(g => h('option', { value: g, selected: g === (c.gender || '') }, g || '—'))),
    address: h('input', { value: c.address || '' }), note: h('textarea', { value: c.note || '' }) };
  const btn = h('button', { class: 'btn' }, 'Lưu');
  let close;
  btn.onclick = () => {
    const args = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.value.trim()]));
    if (c.id) args.id = c.id;
    busy(btn, api('customers.save', args).then(() => { toast('Đã lưu'); close(); go('customers'); }).catch(() => {}));
  };
  close = sheet(c.id ? 'Sửa khách' : 'Khách mới', h('div', { style: 'display:grid;gap:10px' },
    field('Tên', f.name), field('Điện thoại', f.phone), field('Email', f.email),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Ngày sinh', f.birthday)), h('div', { class: 'grow' }, field('Giới tính', f.gender))),
    field('Địa chỉ', f.address), field('Ghi chú', f.note)), btn);
}
function noteSheet(customer_id, appointment_id) {
  const body = h('textarea', { placeholder: 'Tình trạng da, sản phẩm đã dùng, lưu ý cho lần sau…' });
  const btn = h('button', { class: 'btn' }, 'Lưu ghi chú');
  let close;
  btn.onclick = () => busy(btn, api('notes.add', { customer_id, appointment_id, body: body.value.trim() }).then(() => { toast('Đã lưu ghi chú'); close(); }).catch(() => {}));
  close = sheet('Ghi chú liệu trình', body, btn);
}

// ---------- hóa đơn ----------
let invRange = 'today';
function rangeOf(r) {
  const now = Date.now(), t0 = dayStart(now);
  if (r === 'today') return [t0, t0 + 86400000];
  if (r === '7d') return [t0 - 6 * 86400000, t0 + 86400000];
  const d = new Date(now); d.setDate(1); d.setHours(0, 0, 0, 0);
  if (r === 'lastmonth') { const e = d.getTime(); d.setMonth(d.getMonth() - 1); return [d.getTime(), e]; }
  if (r === 'year') { d.setMonth(0); return [d.getTime(), t0 + 86400000]; }
  if (r === 'all') return [0, t0 + 86400000];
  return [d.getTime(), t0 + 86400000];
}
const rangeSel = (val, onchange) => h('select', { onchange: e => onchange(e.target.value) },
  [['today', 'Hôm nay'], ['7d', '7 ngày'], ['month', 'Tháng này'], ['lastmonth', 'Tháng trước'], ['year', 'Năm nay'], ['all', 'Tất cả']].map(([v, l]) => h('option', { value: v, selected: v === val }, l)));
async function vInvoices(el) {
  const [from, to] = rangeOf(invRange);
  const [rows, sum] = await Promise.all([api('invoices.list', { from, to }), api('invoices.summary', { from, to })]);
  el.replaceChildren(h('div', { class: 'card' },
    h('div', { class: 'row between' }, rangeSel(invRange, v => { invRange = v; go('invoices'); }), h('div', { class: 'total' }, money(sum.total))),
    h('p', { class: 'small muted' }, `${sum.count} hóa đơn đã thu` + (rows.length >= 500 ? ' · danh sách hiện 500 hóa đơn gần nhất' : '')),
    h('button', { class: 'btn', onclick: () => invoiceSheet({}) }, '+ Hóa đơn mới'),
    h('div', { class: 'list' }, rows.length ? rows.map(i => h('div', { class: 'item', onclick: () => invoiceDetail(i.id) },
      h('div', { class: 'l' }, hm(i.created_at)), h('div', { class: 't' }, i.customer_name || 'Khách lẻ'),
      h('div', { class: 'r' }, h('b', {}, money(i.total)), h('br'), i.status === 'void' ? chip('void') : h('span', { class: 'muted' }, METHOD[i.method] || i.method)),
      h('div', { class: 's' }, `${i.number} · ${dmy(i.created_at)}`))) : h('div', { class: 'empty' }, 'Chưa có hóa đơn'))));
}
async function invoiceDetail(id) {
  const i = await api('invoices.get', { id });
  let close;
  close = sheet(`Hóa đơn ${i.number}`, h('div', { style: 'display:grid;gap:10px' },
    h('dl', { class: 'kv' }, h('dt', {}, 'Khách'), h('dd', {}, i.customer_name || 'Khách lẻ'), h('dt', {}, 'Thời gian'), h('dd', {}, `${dmy(i.created_at)} ${hm(i.created_at)}`),
      i.kind && h('dt', {}, 'Loại'), i.kind && h('dd', {}, i.kind),
      h('dt', {}, 'Thanh toán'), h('dd', {}, (i.paid_cash || i.paid_transfer || i.paid_card)
        ? [i.paid_cash && `Tiền mặt ${money(i.paid_cash)}`, i.paid_transfer && `CK ${money(i.paid_transfer)}`, i.paid_card && `Thẻ ${money(i.paid_card)}`].filter(Boolean).join(' · ')
        : (METHOD[i.method] || i.method)),
      i.debt && h('dt', {}, 'Nợ lại'), i.debt && h('dd', { style: 'color:var(--bad)' }, money(i.debt)),
      i.source && h('dt', {}, 'Nguồn khách'), i.source && h('dd', {}, i.source),
      i.consultant && h('dt', {}, 'NV tư vấn'), i.consultant && h('dd', {}, i.consultant),
      i.note && h('dt', {}, 'Ghi chú'), i.note && h('dd', {}, i.note),
      h('dt', {}, 'Trạng thái'), h('dd', {}, i.status === 'void' ? [chip('void'), ' ', i.void_reason || ''] : 'Đã thu')),
    h('div', { class: 'list' }, (i.items || []).map(it => h('div', { class: 'item' }, h('div', { class: 'l' }, `${it.qty}×`), h('div', { class: 't' }, it.name), h('div', { class: 'r' }, money(it.amount)), h('div', { class: 's' }, money(it.price))))),
    h('dl', { class: 'kv' }, h('dt', {}, 'Tạm tính'), h('dd', {}, money(i.subtotal)), h('dt', {}, 'Giảm giá'), h('dd', {}, money(i.discount)),
      i.vat && h('dt', {}, 'VAT'), i.vat && h('dd', {}, money(i.vat)), h('dt', {}, h('b', {}, 'Tổng')), h('dd', {}, h('b', {}, money(i.total))))),
    myRole() === 'owner' && i.status !== 'void' && h('button', { class: 'btn bad', onclick: () => {
      const reason = window.prompt('Lý do hủy hóa đơn?');
      if (reason) api('invoices.void', { id: i.id, reason }).then(() => { toast('Đã hủy hóa đơn'); close(); go('invoices'); }).catch(() => {});
    } }, 'Hủy hóa đơn'));
}
function invoiceSheet({ appointment }) {
  let cust = appointment && appointment.customer_id ? { id: appointment.customer_id, name: appointment.customer_name } : null;
  const lines = [];
  const linesBox = h('div', { class: 'lines' });
  const disc = h('input', { type: 'number', min: 0, step: 1000, value: 0, inputmode: 'numeric' });
  const method = h('select', {}, Object.entries(METHOD).map(([v, l]) => h('option', { value: v }, l)));
  const totalEl = h('div', { class: 'total' });
  const recalc = () => { const sub = lines.reduce((s, l) => s + (+l.qty.value || 0) * (+l.price.value || 0), 0); totalEl.textContent = money(sub - (+disc.value || 0)); };
  const addLine = (svc) => {
    const L = { name: svc ? svc.name : '', qty: h('input', { type: 'number', min: 1, value: 1, inputmode: 'numeric' }), price: h('input', { type: 'number', min: 0, step: 1000, value: svc ? svc.price : '', inputmode: 'numeric' }) };
    // gõ để lọc dịch vụ; gõ tên khác (sản phẩm bán lẻ…) cũng được, nhập giá tay
    const sel = combo(S.services, s => s.name, svc && svc.id, 'Dịch vụ / sản phẩm…', s => { if (s) { L.name = s.name; L.price.value = s.price; } else L.name = ''; recalc(); });
    L.sel = sel;
    L.qty.oninput = L.price.oninput = recalc;
    const rm = h('button', { class: 'x', type: 'button', onclick: () => { lines.splice(lines.indexOf(L), 1); row.remove(); recalc(); } }, '✕');
    const row = h('div', { class: 'line' }, sel, L.qty, L.price, rm);
    lines.push(L); linesBox.append(row); recalc();
  };
  addLine(appointment && S.services.find(s => s.id === appointment.service_id));
  disc.oninput = recalc;
  const btn = h('button', { class: 'btn' }, 'Thu tiền & lưu hóa đơn');
  let close;
  btn.onclick = () => {
    const items = lines.map(l => ({ service_id: l.sel.value || null, name: l.name || l.sel.text, qty: +l.qty.value, price: +l.price.value, staff_id: appointment && appointment.staff_id }))
      .filter(l => l.name && (l.service_id || l.price));
    busy(btn, api('invoices.create', { customer_id: cust && cust.id, appointment_id: appointment && appointment.id, items, discount: +disc.value || 0, method: method.value })
      .then(inv => { toast(`Đã lưu ${inv.number}`); close(); go(S.view); }).catch(() => {}));
  };
  close = sheet('Hóa đơn mới', h('div', { style: 'display:grid;gap:10px' },
    field('Khách (để trống nếu khách lẻ)', customerPicker(cust, c => { cust = c; })),
    h('div', { class: 'small muted' }, 'Dịch vụ · SL · Đơn giá'), linesBox,
    h('button', { class: 'btn ghost small', type: 'button', onclick: () => addLine() }, '+ Thêm dòng'),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Giảm giá (đ)', disc)), h('div', { class: 'grow' }, field('Hình thức', method))),
    h('div', { class: 'row between' }, h('span', { class: 'muted' }, 'Tổng thu'), totalEl)), btn);
}

// ---------- dịch vụ ----------
async function vServices(el) {
  const owner = myRole() === 'owner';
  const rows = await api('services.list', { all: owner });
  el.replaceChildren(h('div', { class: 'card' },
    owner && h('button', { class: 'btn', onclick: () => serviceEdit({}) }, '+ Thêm dịch vụ'),
    h('div', { class: 'list' }, rows.length ? rows.map(s => h('div', { class: 'item', onclick: () => owner && serviceEdit(s) },
      h('div', { class: 'l' }, `${s.duration_min}'`), h('div', { class: 't' }, s.name), h('div', { class: 'r' }, money(s.price), s.active === 0 ? [h('br'), h('span', { class: 'chip' }, 'Ngừng')] : ''),
      h('div', { class: 's' }, [s.code, s.category].filter(Boolean).join(' · ') || s.description || ''))) : h('div', { class: 'empty' }, owner ? 'Chưa có dịch vụ. Thêm dịch vụ đầu tiên.' : 'Chưa có dịch vụ'))));
}
function serviceEdit(s) {
  const f = { name: h('input', { value: s.name || '' }), category: h('input', { value: s.category || '', placeholder: 'Chăm sóc da, Massage, Gội đầu…' }),
    duration_min: h('input', { type: 'number', min: 5, step: 5, value: s.duration_min || 60 }), price: h('input', { type: 'number', min: 0, step: 1000, value: s.price || 0 }),
    description: h('textarea', { value: s.description || '' }), active: h('select', {}, h('option', { value: 1, selected: s.active !== 0 }, 'Đang bán'), h('option', { value: 0, selected: s.active === 0 }, 'Ngừng bán')),
    code: h('input', { value: s.code || '', placeholder: 'VD: 02.MNDlaser' }) };
  const P = k => h('input', { type: 'number', min: 0, step: 1000, inputmode: 'numeric', value: s[k] || '' });
  const pr = { price_trial: P('price_trial'), price_card: P('price_card'), price_pkg4: P('price_pkg4'), price_pkg8: P('price_pkg8') };
  const btn = h('button', { class: 'btn' }, 'Lưu');
  let close;
  btn.onclick = () => {
    const a = { name: f.name.value.trim(), category: f.category.value.trim(), duration_min: +f.duration_min.value, price: +f.price.value, description: f.description.value, active: +f.active.value,
      code: f.code.value.trim() || null, ...Object.fromEntries(Object.entries(pr).map(([k, v]) => [k, v.value === '' ? null : +v.value])) };
    if (s.id) a.id = s.id;
    busy(btn, api('services.save', a).then(() => { toast('Đã lưu'); close(); loadCaches(); go('services'); }).catch(() => {}));
  };
  close = sheet(s.id ? 'Sửa dịch vụ' : 'Dịch vụ mới', h('div', { style: 'display:grid;gap:10px' },
    field('Tên dịch vụ', f.name), h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Mã dịch vụ', f.code)), h('div', { class: 'grow' }, field('Nhóm', f.category))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Thời lượng (phút)', f.duration_min)), h('div', { class: 'grow' }, field('Giá bán lẻ (đ)', f.price))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Giá trải nghiệm', pr.price_trial)), h('div', { class: 'grow' }, field('Giá thẻ tiền', pr.price_card))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Giá gói 4 buổi', pr.price_pkg4)), h('div', { class: 'grow' }, field('Giá gói 8 buổi', pr.price_pkg8))),
    field('Mô tả', f.description), field('Trạng thái', f.active)),
    [btn, s.id && h('button', { class: 'btn bad', onclick: () => { if (window.confirm('Xóa dịch vụ này?')) api('services.delete', { id: s.id }).then(() => { close(); loadCaches(); go('services'); }).catch(() => {}); } }, 'Xóa')]);
}

// ---------- nhân viên / tài khoản ----------
async function vStaff(el) {
  const rows = await api('staff.list', { customers: true });
  el.replaceChildren(h('div', { class: 'card' },
    h('button', { class: 'btn', onclick: () => staffEdit({}) }, '+ Thêm tài khoản'),
    h('p', { class: 'small muted' }, 'Mỗi người một tài khoản riêng. Khách hàng cũng có thể có tài khoản để tự đặt lịch.'),
    h('div', { class: 'list' }, rows.map(u => h('div', { class: 'item', onclick: () => staffEdit(u) },
      h('div', { class: 'l' }, RANK[u.role] ? '👑' : u.role === 'customer' ? '⭐' : '👤'), h('div', { class: 't' }, u.display_name || u.username),
      h('div', { class: 'r' }, h('span', { class: 'chip' }, ROLE[u.role] || u.role), u.active ? '' : [h('br'), h('span', { class: 'chip cancelled' }, 'Khóa')],
        u.has_pass === 0 ? [h('br'), h('span', { class: 'chip requested' }, 'Chưa có mật khẩu')] : ''),
      h('div', { class: 's' }, [u.staff_code, u.title, u.username, u.phone].filter(Boolean).join(' · '))))),
    h('p', { class: 'small muted' }, 'Nhân viên nhập từ dữ liệu cũ chưa có mật khẩu: bấm vào để đặt mật khẩu khi người đó cần dùng app.')));
}
function staffEdit(u) {
  const isNew = !u.id;
  let cust = u.customer_id ? { id: u.customer_id } : null;
  const f = { username: h('input', { value: u.username || '', autocapitalize: 'none' }), display_name: h('input', { value: u.display_name || '' }),
    role: h('select', {}, Object.entries(ROLE).filter(([v]) => v !== 'sysadmin' && ((RANK[v] || 0) <= (RANK[S.me.role] || 0) || v === u.role))
      .map(([v, l]) => h('option', { value: v, selected: v === (u.role || 'technician') }, l))),
    phone: h('input', { type: 'tel', value: u.phone || '' }), password: h('input', { type: 'password', autocomplete: 'new-password', placeholder: isNew ? '' : 'Để trống nếu không đổi' }),
    staff_code: h('input', { value: u.staff_code || '', placeholder: 'VD: NB015' }), title: h('input', { value: u.title || '', placeholder: 'Bác sĩ, KTV, Lễ tân…' }),
    active: h('select', {}, h('option', { value: 1, selected: u.active !== 0 }, 'Đang hoạt động'), h('option', { value: 0, selected: u.active === 0 }, 'Khóa tài khoản')) };
  const custBox = h('div', {}, field('Gắn với hồ sơ khách', customerPicker(null, c => { cust = c; })));
  const sync = () => { custBox.style.display = f.role.value === 'customer' ? '' : 'none'; };
  f.role.onchange = sync; sync();
  const btn = h('button', { class: 'btn' }, 'Lưu');
  let close;
  btn.onclick = () => {
    const a = { username: f.username.value.trim(), display_name: f.display_name.value.trim(), role: f.role.value, phone: f.phone.value.trim(), active: +f.active.value,
      staff_code: f.staff_code.value.trim() || null, title: f.title.value.trim() || null };
    if (f.password.value) a.password = f.password.value;
    if (a.role === 'customer' && cust) a.customer_id = cust.id;
    if (!isNew) a.id = u.id;
    busy(btn, api('staff.save', a).then(() => { toast('Đã lưu'); close(); loadCaches(); go('staff'); }).catch(() => {}));
  };
  close = sheet(isNew ? 'Tài khoản mới' : 'Sửa tài khoản', h('div', { style: 'display:grid;gap:10px' },
    field('Tên đăng nhập', f.username), field('Tên hiển thị', f.display_name), field('Vai trò', f.role), custBox,
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Mã NV', f.staff_code)), h('div', { class: 'grow' }, field('Chức vụ', f.title))),
    field('Điện thoại', f.phone), field(isNew ? 'Mật khẩu (ít nhất 6 ký tự)' : 'Mật khẩu mới', f.password), field('Trạng thái', f.active)),
    [btn, !isNew && u.id !== S.me.id && h('button', { class: 'btn bad', onclick: () => { if (window.confirm('Xóa tài khoản này?')) api('staff.delete', { id: u.id }).then(() => { close(); go('staff'); }).catch(() => {}); } }, 'Xóa')]);
}

// ---------- thiết bị ----------
async function vDevices(el) {
  const rows = await api('devices.list');
  const code = purpose => api('devices.pair_code', { purpose }).then(r => {
    const end = Date.now() + r.expires_min * 60000;
    const left = h('p', { class: 'small muted' });
    const tm = setInterval(() => { const s = Math.max(0, Math.round((end - Date.now()) / 1000)); left.textContent = s ? `Hết hạn sau ${Math.floor(s / 60)}:${pad(s % 60)}` : 'Đã hết hạn'; if (!s) clearInterval(tm); }, 1000);
    sheet(purpose === 'customer' ? 'Mã ghép máy cho khách' : 'Mã ghép máy nhân viên', h('div', { style: 'display:grid;gap:10px;text-align:center' },
      h('div', { class: 'big', style: 'font-size:30px' }, r.code), left,
      h('p', { class: 'small muted' }, 'Trên máy mới: mở app Spa → nhập mã này. Mã chỉ dùng được một lần.')));
  }).catch(() => {});
  el.replaceChildren(h('div', { class: 'card' },
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => code('staff') }, '+ Ghép máy nhân viên'), h('button', { class: 'btn ghost', onclick: () => code('customer') }, '+ Ghép máy khách')),
    h('div', { class: 'list' }, rows.map(d => h('div', { class: 'item', onclick: () => deviceSheet(d) },
      h('div', { class: 'l' }, h('span', { class: 'dot ' + (d.revoked ? 'none' : d.online ? (d.online.lan ? 'lan' : d.online.p2p ? 'p2p' : 'channel') : '') })),
      h('div', { class: 't' }, d.name, d.this ? ' (máy này)' : ''),
      h('div', { class: 'r small' }, d.revoked ? h('span', { class: 'chip cancelled' }, 'Đã thu hồi') : d.online ? (d.online.lan ? 'Nội bộ' : d.online.p2p ? 'P2P' : d.online.via) : d.last_seen ? dmy(d.last_seen) : '—'),
      h('div', { class: 's' }, `${d.user || 'chưa đăng nhập'} · ${d.id}`))))));
}
function deviceSheet(d) {
  const name = h('input', { value: d.name });
  let close;
  close = sheet(d.name, h('div', { style: 'display:grid;gap:10px' },
    h('dl', { class: 'kv' }, h('dt', {}, 'Mã máy'), h('dd', { class: 'mono' }, d.id), h('dt', {}, 'Ghép lúc'), h('dd', {}, d.created_at ? `${dmy(d.created_at)} ${hm(d.created_at)}` : '—'),
      h('dt', {}, 'Người dùng'), h('dd', {}, d.user || '—'), h('dt', {}, 'Lần cuối'), h('dd', {}, d.last_seen ? `${dmy(d.last_seen)} ${hm(d.last_seen)}` : '—')),
    field('Tên máy', name)),
    [h('button', { class: 'btn', onclick: () => api('devices.rename', { id: d.id, name: name.value.trim() }).then(() => { close(); go('devices'); }).catch(() => {}) }, 'Đổi tên'),
     !d.this && !d.revoked && h('button', { class: 'btn bad', onclick: () => { if (window.confirm(`Thu hồi "${d.name}"? Máy này sẽ không kết nối được nữa.`)) api('devices.revoke', { id: d.id }).then(() => { toast('Đã thu hồi'); close(); go('devices'); }).catch(() => {}); } }, 'Thu hồi')]);
}

// ---------- báo cáo ----------
let repRange = 'today';
async function vReports(el) {
  const [from, to] = rangeOf(repRange);
  const r = await api('reports.summary', { from, to });
  const ap = Object.fromEntries((r.appointments || []).map(x => [x.status, x.n]));
  el.replaceChildren(h('div', { class: 'card' }, rangeSel(repRange, v => { repRange = v; go('reports'); }),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, 'Doanh thu', h('b', {}, money(r.revenue.revenue))),
      h('div', { class: 'stat' }, 'Hóa đơn', h('b', {}, r.revenue.invoices || 0)),
      h('div', { class: 'stat' }, 'Lịch xong', h('b', {}, ap.done || 0)),
      h('div', { class: 'stat' }, 'Hủy / không đến', h('b', {}, (ap.cancelled || 0) + (ap.no_show || 0)))),
    h('h3', {}, 'Dịch vụ bán chạy'),
    h('div', { class: 'list' }, (r.top_services || []).length ? r.top_services.map(s => h('div', { class: 'item' }, h('div', { class: 'l' }, `${s.qty}×`), h('div', { class: 't' }, s.name), h('div', { class: 'r' }, money(s.amount)), h('div', { class: 's' }))) : h('div', { class: 'empty' }, 'Chưa có')),
    h('h3', {}, 'Theo nhân viên (lịch đã xong)'),
    h('div', { class: 'list' }, (r.by_staff || []).length ? r.by_staff.map(s => h('div', { class: 'item' }, h('div', { class: 'l' }, s.n), h('div', { class: 't' }, s.staff), h('div', { class: 'r' }), h('div', { class: 's' }))) : h('div', { class: 'empty' }, 'Chưa có')),
    h('p', { class: 'small muted' }, 'Khung báo cáo cơ bản — sẽ bổ sung dần (theo tháng, công nợ, hoa hồng nhân viên…).')));
}

// ---------- phần khách hàng ----------
async function vMy(el) {
  const rows = await api('my.appointments');
  el.replaceChildren(h('div', { class: 'card' }, h('h2', {}, 'Lịch hẹn của tôi'),
    h('div', { class: 'list' }, rows.length ? rows.map(a => h('div', { class: 'item' },
      h('div', { class: 'l' }, hm(a.start_at)), h('div', { class: 't' }, a.service_name || 'Dịch vụ'), h('div', { class: 'r' }, chip(a.status),
        a.start_at > Date.now() && ['requested', 'booked'].includes(a.status) ? [h('br'), h('button', { class: 'btn bad small', onclick: e => { e.stopPropagation(); if (window.confirm('Hủy lịch này?')) api('my.cancel', { id: a.id }).then(() => go('my')).catch(() => {}); } }, 'Hủy')] : ''),
      h('div', { class: 's' }, dayLabel(a.start_at)))) : h('div', { class: 'empty' }, 'Chưa có lịch hẹn'))));
}
async function vBook(el) {
  const sv = h('select', {}, S.services.map(s => h('option', { value: s.id }, `${s.name} · ${money(s.price)}`)));
  const d = h('input', { type: 'date', value: dateVal(Date.now() + 86400000) }), t = h('input', { type: 'time', value: '10:00', step: 900 });
  const note = h('textarea', { placeholder: 'Yêu cầu thêm (nếu có)' });
  const btn = h('button', { class: 'btn' }, 'Gửi yêu cầu đặt lịch');
  btn.onclick = () => busy(btn, api('my.book', { service_id: sv.value, start_at: fromInputs(d.value, t.value), note: note.value }).then(() => { toast('Đã gửi. Spa sẽ xác nhận sớm.'); go('my'); }).catch(() => {}));
  el.replaceChildren(h('div', { class: 'card' }, h('h2', {}, 'Đặt lịch'), field('Dịch vụ', sv),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Ngày', d)), h('div', { class: 'grow' }, field('Giờ', t))), field('Ghi chú', note), btn));
}
async function vProfile(el) {
  const p = await api('my.profile');
  el.replaceChildren(h('div', { class: 'card' }, h('h2', {}, p.name),
    p.code && h('div', { class: 'qr' }, qrImg(p.code), h('div', { class: 'big' }, p.code), h('p', { class: 'small muted' }, 'Đưa mã này cho lễ tân quét khi đến spa')),
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, 'Điểm tích lũy', h('b', {}, p.points || 0))),
    h('dl', { class: 'kv' }, h('dt', {}, 'Điện thoại'), h('dd', {}, p.phone || '—'), h('dt', {}, 'Email'), h('dd', {}, p.email || '—'))));
}

// ---------- kho ----------
const MOVE = { in: 'Nhập kho', sale: 'Xuất bán', treatment: 'Xuất trị liệu', gift: 'Xuất tặng', internal: 'Xuất nội bộ', adjust: 'Kiểm kê (±)' };
let stockQ = '';
async function vStock(el) {
  const owner = myRole() === 'owner';
  const q = h('input', { type: 'search', placeholder: 'Tìm sản phẩm theo tên hoặc mã…', value: stockQ });
  const box = h('div', { class: 'list' });
  const load = () => api('products.list', { q: stockQ, all: owner }).then(rows => box.replaceChildren(...(rows.length ? rows.map(p => {
    const low = p.min_stock != null && p.stock <= p.min_stock;
    return h('div', { class: 'item', onclick: () => productSheet(p) }, h('div', { class: 'l' }, '📦'), h('div', { class: 't' }, p.name),
      h('div', { class: 'r' }, h('b', { style: low || p.stock <= 0 ? 'color:var(--bad)' : '' }, `${+(+p.stock).toFixed(2)} ${p.unit || ''}`), p.active === 0 ? [h('br'), h('span', { class: 'chip' }, 'Ngừng')] : ''),
      h('div', { class: 's' }, [p.code, p.price ? money(p.price) : ''].filter(Boolean).join(' · ')));
  }) : [h('div', { class: 'empty' }, 'Chưa có sản phẩm')])));
  let t;
  q.addEventListener('input', () => { stockQ = q.value.trim(); clearTimeout(t); t = setTimeout(load, 250); });
  el.replaceChildren(h('div', { class: 'card' }, q,
    h('div', { class: 'row' }, owner && h('button', { class: 'btn', onclick: () => productEdit({}) }, '+ Thêm sản phẩm'),
      h('button', { class: 'btn ghost', onclick: stockHistory }, 'Lịch sử nhập xuất')), box));
  await load();
}
function productSheet(p) {
  const kind = h('select', {}, Object.entries(MOVE).map(([v, l]) => h('option', { value: v }, l)));
  const qty = h('input', { type: 'number', step: 'any', inputmode: 'decimal', placeholder: 'Số lượng' });
  const note = h('input', { placeholder: 'Ghi chú (nhà cung cấp, khách…)' });
  const btn = h('button', { class: 'btn' }, 'Ghi phiếu');
  let close;
  btn.onclick = () => busy(btn, api('stock.move', { product_id: p.id, kind: kind.value, qty: +qty.value, note: note.value.trim() || null })
    .then(r => { toast(`Đã ghi. Tồn: ${+(+r.stock_after).toFixed(2)} ${p.unit || ''}`); close(); go('stock'); }).catch(() => {}));
  close = sheet(p.name, h('div', { style: 'display:grid;gap:10px' },
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, 'Tồn hiện tại', h('b', {}, `${+(+p.stock).toFixed(2)} ${p.unit || ''}`)),
      p.price != null && h('div', { class: 'stat' }, 'Giá bán', h('b', {}, money(p.price)))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Loại phiếu', kind)), h('div', { class: 'grow' }, field('Số lượng', qty))),
    field('Ghi chú', note), h('p', { class: 'small muted' }, 'Kiểm kê: nhập số âm hoặc dương để chỉnh lệch tồn.')),
    [btn, myRole() === 'owner' && h('button', { class: 'btn ghost', onclick: () => { close(); productEdit(p); } }, 'Sửa sản phẩm')]);
}
function productEdit(p) {
  const f = { code: h('input', { value: p.code || '' }), name: h('input', { value: p.name || '' }), unit: h('input', { value: p.unit || '', placeholder: 'Ống, Lọ, Miếng…' }),
    price: h('input', { type: 'number', min: 0, step: 1000, value: p.price || 0 }), cost: h('input', { type: 'number', min: 0, step: 1000, value: p.cost || 0 }),
    min_stock: h('input', { type: 'number', step: 'any', value: p.min_stock ?? '' }), stock: h('input', { type: 'number', step: 'any', value: p.stock || 0 }),
    active: h('select', {}, h('option', { value: 1, selected: p.active !== 0 }, 'Đang dùng'), h('option', { value: 0, selected: p.active === 0 }, 'Ngừng')) };
  const btn = h('button', { class: 'btn' }, 'Lưu');
  let close;
  btn.onclick = () => {
    const a = { code: f.code.value.trim() || null, name: f.name.value.trim(), unit: f.unit.value.trim() || null, price: +f.price.value || 0, cost: +f.cost.value || 0,
      min_stock: f.min_stock.value === '' ? null : +f.min_stock.value, active: +f.active.value };
    if (p.id) a.id = p.id; else a.stock = +f.stock.value || 0;
    busy(btn, api('products.save', a).then(() => { toast('Đã lưu'); close(); go('stock'); }).catch(() => {}));
  };
  close = sheet(p.id ? 'Sửa sản phẩm' : 'Sản phẩm mới', h('div', { style: 'display:grid;gap:10px' },
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Mã', f.code)), h('div', { class: 'grow' }, field('Đơn vị', f.unit))), field('Tên', f.name),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Giá bán', f.price)), h('div', { class: 'grow' }, field('Giá nhập', f.cost))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Báo khi tồn dưới', f.min_stock)), !p.id && h('div', { class: 'grow' }, field('Tồn ban đầu', f.stock))),
    field('Trạng thái', f.active)),
    [btn, p.id && h('button', { class: 'btn bad', onclick: () => { if (window.confirm('Xóa sản phẩm này?')) api('products.delete', { id: p.id }).then(() => { close(); go('stock'); }).catch(() => {}); } }, 'Xóa')]);
}
let stockRange = 'month';
async function stockHistory() {
  const box = h('div', { class: 'list' }, h('div', { class: 'empty' }, 'Đang tải…'));
  const load = () => { const [from, to] = rangeOf(stockRange); api('stock.list', { from, to }).then(rows => box.replaceChildren(...(rows.length ? rows.map(m =>
    h('div', { class: 'item' }, h('div', { class: 'l' }, dmy(m.at).slice(0, 5)), h('div', { class: 't' }, m.product_name || '?'),
      h('div', { class: 'r' }, h('b', { style: `color:var(--${m.qty < 0 ? 'bad' : 'ok'})` }, `${m.qty > 0 ? '+' : ''}${+(+m.qty).toFixed(2)}`)),
      h('div', { class: 's' }, [MOVE[m.kind] || m.kind, m.customer_name, m.note].filter(Boolean).join(' · ')))) : [h('div', { class: 'empty' }, 'Không có phiếu')]))).catch(() => {}); };
  sheet('Lịch sử nhập xuất', h('div', { style: 'display:grid;gap:10px' }, rangeSel(stockRange, v => { stockRange = v; load(); }), box));
  load();
}

// ---------- thu chi ----------
let cashRange = 'month';
async function vCash(el) {
  const [from, to] = rangeOf(cashRange);
  const [rows, sum] = await Promise.all([api('cash.list', { from, to }), api('cash.summary', { from, to })]);
  const tot = Object.fromEntries((sum.totals || []).map(t => [t.kind, t.amount]));
  el.replaceChildren(h('div', { class: 'card' },
    rangeSel(cashRange, v => { cashRange = v; go('cash'); }),
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, 'Thu', h('b', { style: 'color:var(--ok)' }, money(tot.in || 0))),
      h('div', { class: 'stat' }, 'Chi', h('b', { style: 'color:var(--bad)' }, money(tot.out || 0))),
      h('div', { class: 'stat' }, 'Chênh lệch', h('b', {}, money((tot.in || 0) - (tot.out || 0))))),
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => cashEdit({ kind: 'out' }) }, '− Phiếu chi'), h('button', { class: 'btn ghost', onclick: () => cashEdit({ kind: 'in' }) }, '+ Phiếu thu')),
    h('div', { class: 'list' }, rows.length ? rows.map(c => h('div', { class: 'item', onclick: () => cashEdit(c) },
      h('div', { class: 'l' }, dmy(c.at).slice(0, 5)), h('div', { class: 't' }, c.content || ''),
      h('div', { class: 'r' }, h('b', { style: `color:var(--${c.kind === 'in' ? 'ok' : 'bad'})` }, `${c.kind === 'in' ? '+' : '−'}${money(c.amount)}`)),
      h('div', { class: 's' }, [c.fund, c.category, c.person].filter(Boolean).join(' · ')))) : h('div', { class: 'empty' }, 'Không có khoản nào'))));
}
function cashEdit(c) {
  const isNew = !c.id;
  const f = { kind: h('select', {}, h('option', { value: 'out', selected: c.kind === 'out' }, 'Chi'), h('option', { value: 'in', selected: c.kind === 'in' }, 'Thu')),
    amount: h('input', { type: 'number', min: 0, step: 1000, inputmode: 'numeric', value: c.amount || '' }), content: h('input', { value: c.content || '' }),
    category: h('input', { value: c.category || '', placeholder: 'Điện, nước, vật tư, lương, thắp hương…' }), person: h('input', { value: c.person || '' }),
    fund: h('input', { value: c.fund || 'Quỹ tiền mặt' }), date: h('input', { type: 'date', value: dateVal(c.at || Date.now()) }), note: h('input', { value: c.note || '' }) };
  const btn = h('button', { class: 'btn' }, 'Lưu');
  let close;
  btn.onclick = () => {
    const a = { kind: f.kind.value, amount: +f.amount.value, content: f.content.value.trim(), category: f.category.value.trim() || null, person: f.person.value.trim() || null,
      fund: f.fund.value.trim() || null, at: fromInputs(f.date.value, '12:00'), note: f.note.value.trim() || null };
    if (!isNew) a.id = c.id;
    busy(btn, api('cash.save', a).then(() => { toast('Đã lưu'); close(); go('cash'); }).catch(() => {}));
  };
  close = sheet(isNew ? (c.kind === 'in' ? 'Phiếu thu' : 'Phiếu chi') : 'Sửa khoản thu chi', h('div', { style: 'display:grid;gap:10px' },
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Loại', f.kind)), h('div', { class: 'grow' }, field('Số tiền (đ)', f.amount))),
    field('Nội dung', f.content), h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Nhóm', f.category)), h('div', { class: 'grow' }, field('Ngày', f.date))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Người thực hiện', f.person)), h('div', { class: 'grow' }, field('Quỹ', f.fund))), field('Ghi chú', f.note)),
    [btn, !isNew && h('button', { class: 'btn bad', onclick: () => { if (window.confirm('Xóa khoản này?')) api('cash.delete', { id: c.id }).then(() => { close(); go('cash'); }).catch(() => {}); } }, 'Xóa')]);
}

// ---------- thưởng trị liệu ----------
let bonusRange = 'month';
async function vBonus(el, mine) {
  const [from, to] = rangeOf(bonusRange);
  const sum = await api('bonuses.summary', { from, to });
  const total = sum.reduce((s, r) => s + (r.amount || 0), 0);
  el.replaceChildren(h('div', { class: 'card' },
    rangeSel(bonusRange, v => { bonusRange = v; go(S.view); }),
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, mine ? 'Thưởng của tôi' : 'Tổng thưởng', h('b', {}, money(total))),
      h('div', { class: 'stat' }, 'Số lượt', h('b', {}, sum.reduce((s, r) => s + (r.n || 0), 0)))),
    !mine && h('div', { class: 'row' }, h('button', { class: 'btn', onclick: bonusAdd }, '+ Ghi thưởng'), h('button', { class: 'btn ghost', onclick: bonusRates }, 'Bảng mức thưởng')),
    h('div', { class: 'list' }, sum.length ? sum.map(r => h('div', { class: 'item', onclick: () => bonusDetail(r, from, to) },
      h('div', { class: 'l' }, r.staff_code || '👤'), h('div', { class: 't' }, r.staff_name || '?'), h('div', { class: 'r' }, h('b', {}, money(r.amount))),
      h('div', { class: 's' }, `${r.n} lượt · ${+(+r.qty).toFixed(1)} đơn vị`))) : h('div', { class: 'empty' }, 'Chưa có thưởng trong kỳ'))));
}
async function bonusDetail(r, from, to) {
  const rows = await api('bonuses.list', { from, to, staff_id: r.staff_id });
  sheet(`Thưởng: ${r.staff_name}`, h('div', { class: 'list' }, rows.map(b => h('div', { class: 'item' },
    h('div', { class: 'l' }, dmy(b.at).slice(0, 5)), h('div', { class: 't', style: 'white-space:normal' }, b.detail || b.rate_code || ''),
    h('div', { class: 'r' }, money(b.amount)), h('div', { class: 's' }, [b.customer_name, b.qty !== 1 ? `SL ${b.qty}` : ''].filter(Boolean).join(' · '))))));
}
async function bonusRates() {
  const rows = await api('bonus_rates.list');
  let close;
  close = sheet('Bảng mức thưởng', h('div', { style: 'display:grid;gap:10px' },
    h('button', { class: 'btn ghost small', onclick: () => { close(); rateEdit({}); } }, '+ Thêm mức'),
    h('div', { class: 'list' }, rows.map(x => h('div', { class: 'item', onclick: () => { close(); rateEdit(x); } },
      h('div', { class: 'l' }, x.role === 'doctor' ? 'BS' : 'NV'), h('div', { class: 't', style: 'white-space:normal' }, x.name), h('div', { class: 'r' }, money(x.amount)), h('div', { class: 's' }, x.code || ''))))));
}
function rateEdit(x) {
  const f = { code: h('input', { value: x.code || '' }), name: h('input', { value: x.name || '' }), amount: h('input', { type: 'number', min: 0, step: 1000, value: x.amount || 0 }),
    role: h('select', {}, h('option', { value: 'staff', selected: x.role !== 'doctor' }, 'Nhân viên / KTV'), h('option', { value: 'doctor', selected: x.role === 'doctor' }, 'Bác sĩ')) };
  const btn = h('button', { class: 'btn' }, 'Lưu');
  let close;
  btn.onclick = () => busy(btn, api('bonus_rates.save', { ...(x.id ? { id: x.id } : {}), code: f.code.value.trim(), name: f.name.value.trim(), amount: +f.amount.value, role: f.role.value })
    .then(() => { close(); bonusRates(); }).catch(() => {}));
  close = sheet(x.id ? 'Sửa mức thưởng' : 'Mức thưởng mới', h('div', { style: 'display:grid;gap:10px' }, field('Mã', f.code), field('Dịch vụ', f.name),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Tiền thưởng / lượt', f.amount)), h('div', { class: 'grow' }, field('Áp dụng cho', f.role)))),
    [btn, x.id && h('button', { class: 'btn bad', onclick: () => api('bonus_rates.delete', { id: x.id }).then(() => { close(); bonusRates(); }).catch(() => {}) }, 'Xóa')]);
}
async function bonusAdd() {
  const rates = await api('bonus_rates.list');
  const st = combo(S.staff.filter(u => u.role !== 'customer'), u => `${u.display_name || u.username}${u.staff_code ? ' · ' + u.staff_code : ''}`, null, 'Gõ tên nhân viên…');
  const rt = combo(rates, x => `${x.name} (${money(x.amount)})`, null, 'Gõ tên dịch vụ thưởng…');
  const qty = h('input', { type: 'number', min: 0, step: 'any', value: 1 }), amount = h('input', { type: 'number', min: 0, step: 1000, placeholder: 'Để trống: tính theo bảng' });
  let cust = null;
  const btn = h('button', { class: 'btn' }, 'Ghi thưởng');
  let close;
  btn.onclick = () => {
    const r = rates.find(x => x.id === rt.value);
    busy(btn, api('bonuses.add', { staff_id: st.value, rate_code: r ? r.code : null, qty: +qty.value || 1, amount: amount.value === '' ? undefined : +amount.value,
      customer_id: cust && cust.id }).then(() => { toast('Đã ghi thưởng'); close(); go('bonus'); }).catch(() => {}));
  };
  close = sheet('Ghi thưởng trị liệu', h('div', { style: 'display:grid;gap:10px' }, field('Nhân viên', st), field('Mức thưởng', rt),
    h('div', { class: 'row' }, h('div', { class: 'grow' }, field('Số lượng', qty)), h('div', { class: 'grow' }, field('Hoặc số tiền (đ)', amount))),
    field('Khách (không bắt buộc)', customerPicker(null, c => { cust = c; }))), btn);
}

// ---------- quét mã (camera / máy quét) ----------
async function handleScan(raw) {
  const code = String(raw || '').trim();
  if (!code) return;
  document.querySelectorAll('.scrim').forEach(s => s.remove());
  try {
    const r = await api('scan.lookup', { code });
    if (r.kind === 'customer') { toast(`Khách: ${r.name}`); customerDetail(r.id); }
    else if (r.kind === 'invoice') invoiceDetail(r.id);
  } catch {}
}
// Camera: đọc QR bằng jsQR (chạy trong trình duyệt, cần trang https)
async function scanSheet() {
  if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
    return toast('Quét bằng camera cần bản app https (app cài từ GitHub, hoặc https://IP:8443)', true);
  const video = h('video', { playsinline: true, muted: true, autoplay: true, style: 'width:100%;max-height:60vh;border-radius:10px;background:#000;object-fit:cover' });
  const st = h('p', { class: 'small muted' }, 'Đang mở camera…');
  const manual = h('input', { placeholder: 'Hoặc gõ mã: KH-… / HD-…', autocapitalize: 'characters' });
  manual.addEventListener('keydown', e => { if (e.key === 'Enter') handleScan(manual.value); });
  sheet('Quét mã', h('div', { style: 'display:grid;gap:8px' }, video, st, manual));
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); }
  catch (e) { st.textContent = 'Không mở được camera: ' + e.message + '. Kiểm tra quyền camera trong Cài đặt.'; return; }
  video.srcObject = stream;
  try { await video.play(); } catch {}
  st.textContent = 'Đưa mã QR vào khung hình…';
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
  const stopAll = () => stream.getTracks().forEach(t => t.stop());
  const tick = () => {
    if (!video.isConnected) return stopAll();          // đóng bảng -> tắt camera
    if (video.readyState >= 2 && video.videoWidth) {
      const sc = Math.min(1, 640 / video.videoWidth);
      cv.width = Math.round(video.videoWidth * sc); cv.height = Math.round(video.videoHeight * sc);
      ctx.drawImage(video, 0, 0, cv.width, cv.height);
      const img = ctx.getImageData(0, 0, cv.width, cv.height);
      const res = jsQR(img.data, cv.width, cv.height, { inversionAttempts: 'dontInvert' });
      if (res && res.data) { stopAll(); if (navigator.vibrate) navigator.vibrate(60); handleScan(res.data); return; }
    }
    requestAnimationFrame(tick);
  };
  tick();
}
// Máy quét USB/Bluetooth: "gõ" mã rất nhanh rồi Enter -> nhận ra dù con trỏ đang ở đâu
let kbBuf = '', kbLast = 0, kbStart = 0;
document.addEventListener('keydown', e => {
  if (!S.me || myRole() === 'customer') return;
  const now = performance.now();
  if (e.key === 'Enter') {
    const buf = kbBuf; kbBuf = '';
    // mã khách KH-…, mã số cũ (30366, NB015), số hóa đơn HD-… / T0001488
    if (buf.length >= 5 && now - kbStart < buf.length * 35 + 120 && /^(KH-|HD-|NB\d|T\d{5,}|\d{5,}$)/i.test(buf)) {
      const ae = document.activeElement;
      if (ae && typeof ae.value === 'string' && ae.value.endsWith(buf)) ae.value = ae.value.slice(0, -buf.length);
      e.preventDefault(); e.stopPropagation();
      handleScan(buf);
    }
    return;
  }
  if (e.key.length !== 1) return;
  if (now - kbLast > 60) { kbBuf = ''; kbStart = now; }    // người gõ tay chậm hơn nhiều -> bắt đầu lại
  kbBuf += e.key; kbLast = now;
}, true);

// ---------- tìm nhanh trên mọi mục ----------
function quickSearch() {
  const q = h('input', { type: 'search', placeholder: 'Tên khách, SĐT, mã KH-…, dịch vụ, nhân viên, số hóa đơn…', autocomplete: 'off' });
  const box = h('div', { style: 'display:grid;gap:6px' });
  let t, close;
  const item = (icon, title, sub, onclick) => h('div', { class: 'item', onclick: () => { close(); onclick(); } }, h('div', { class: 'l' }, icon), h('div', { class: 't' }, title), h('div', { class: 'r' }), h('div', { class: 's' }, sub || ''));
  const run = () => {
    const v = q.value.trim();
    if (!v) return box.replaceChildren();
    api('search.all', { q: v }, true).then(r => {
      const g = [];
      if ((r.customers || []).length) g.push(h('div', { class: 'grp' }, 'Khách hàng'), h('div', { class: 'list' }, r.customers.map(c => item('👤', c.name, [c.phone, c.code].filter(Boolean).join(' · '), () => customerDetail(c.id)))));
      if ((r.services || []).length) g.push(h('div', { class: 'grp' }, 'Dịch vụ'), h('div', { class: 'list' }, r.services.map(s => item('💆', s.name, `${s.duration_min} phút · ${money(s.price)}`, () => myRole() === 'owner' ? serviceEdit(s) : toast(`${s.name}: ${money(s.price)}`)))));
      if ((r.staff || []).length) g.push(h('div', { class: 'grp' }, 'Nhân viên'), h('div', { class: 'list' }, r.staff.map(u => item('👥', u.display_name || u.username, ROLE[u.role], () => myRole() === 'owner' ? staffEdit(u) : toast(u.display_name)))));
      if ((r.invoices || []).length) g.push(h('div', { class: 'grp' }, 'Hóa đơn'), h('div', { class: 'list' }, r.invoices.map(i => item('🧾', `${i.number} · ${money(i.total)}`, `${i.customer_name || 'Khách lẻ'} · ${dmy(i.created_at)}`, () => invoiceDetail(i.id)))));
      box.replaceChildren(...(g.length ? g : [h('div', { class: 'empty' }, 'Không tìm thấy')]));
    }).catch(() => {});
  };
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 200); });
  close = sheet('Tìm nhanh', h('div', { style: 'display:grid;gap:10px' }, q, box));
}

// ---------- hệ thống / chẩn đoán ----------
function diagPanel() {
  const box = h('div', { style: 'display:grid;gap:10px' });
  const draw = () => {
    const d = Conn.diag();
    const row = (name, dotc, state, rtt) => h('div', { class: 'item', style: 'cursor:default' }, h('div', { class: 'l' }, h('span', { class: 'dot ' + dotc })), h('div', { class: 't' }, name), h('div', { class: 'r mono' }, rtt != null ? rtt + ' ms' : '–'), h('div', { class: 's' }, state));
    box.replaceChildren(
      h('div', { class: 'row between' }, h('b', {}, d.pathName), h('span', { class: 'mono' }, d.rtt != null ? d.rtt + ' ms' : '')),
      d.detail && h('p', { class: 'small muted mono' }, d.detail),
      h('div', { class: 'list' },
        row('Nội bộ', d.lan.ok ? 'lan' : d.lan.busy ? 'channel' : 'none', d.lan.state, d.lan.rtt),
        row('P2P', d.p2p.state === 'open' ? 'p2p' : d.p2p.state === 'trying' ? 'channel' : '', d.p2p.note, d.p2p.rtt),
        d.channels.map(c => row(`${c.name} (${c.kind})${c.active ? ' ★' : ''}`, c.welcomed ? 'lan' : c.up ? 'channel' : c.failed ? 'none' : '', c.state, c.rtt)),
        !d.internetStarted && h('div', { class: 'empty small' }, 'Kênh Internet chưa dùng (đang ưu tiên nội bộ)')),
      h('p', { class: 'small muted' }, `Đổi đường ${d.switches} lần · mã hóa ${d.crypto} · ${APP_VERSION}`));
  };
  draw();
  const t = setInterval(() => { if (!box.isConnected) clearInterval(t); else draw(); }, 1000);
  return box;
}
async function vSystem(el) {
  const owner = myRole() === 'owner';
  const id = Conn.identity() || {};
  const lanIn = h('input', { placeholder: '192.168.1.125', inputmode: 'decimal' });
  const knownLan = (Conn.diag().lanAddrs || []);
  const caLinks = knownLan.map(ip => h('a', { href: `http://${ip}:${Conn.LAN_HTTP}/ca.crt` }, `http://${ip}:${Conn.LAN_HTTP}/ca.crt`));
  const cards = [
    h('div', { class: 'card' }, h('h2', {}, 'Kết nối'), diagPanel(),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => Conn.cutLan() }, 'Thử cắt / bật nội bộ'),
        h('button', { class: 'btn ghost small', onclick: () => Conn.cutP2P() }, 'Thử cắt P2P'),
        h('button', { class: 'btn ghost small', onclick: () => Conn.killChannel() }, 'Thử hỏng kênh'),
        h('button', { class: 'btn ghost small', onclick: () => Conn.reviveChannel() }, 'Bật lại kênh'))),
    h('div', { class: 'card' }, h('h2', {}, 'Mạng nội bộ của spa'),
      h('p', { class: 'small muted' }, knownLan.length ? `Địa chỉ đã biết: ${knownLan.join(', ')}` : 'Chưa biết địa chỉ máy chủ nội bộ.'),
      h('div', { class: 'row' }, h('div', { class: 'grow' }, lanIn), h('button', { class: 'btn ghost small', onclick: () => { if (Conn.addLan(lanIn.value.trim())) { toast('Đã thêm'); go('system'); } else toast('Địa chỉ nội bộ dạng 192.168.x.x', true); } }, 'Thêm'),
        h('button', { class: 'btn ghost small', onclick: () => { Conn.findLan(); toast('Đang tìm…'); } }, 'Tìm ngay')),
      h('p', { class: 'small muted' }, 'Lần đầu dùng mạng nội bộ, mỗi máy cần cài chứng chỉ của spa (ở spa, cùng Wi-Fi với máy chủ): mở ', caLinks.length ? caLinks : 'http://IP-máy-chủ:8080/ca.crt',
        ' → Cài đặt → Đã tải về hồ sơ → Cài đặt → Cài đặt chung → Giới thiệu → Cài đặt tin cậy chứng nhận → bật "Spa - chung chi goc…".')),
    h('div', { class: 'card' }, h('h2', {}, 'Tài khoản'),
      h('dl', { class: 'kv' }, h('dt', {}, 'Người dùng'), h('dd', {}, `${S.me.display_name} (${S.me.username})`), h('dt', {}, 'Vai trò'), h('dd', {}, ROLE[S.me.role]),
        h('dt', {}, 'Máy này'), h('dd', {}, `${(S.welcome || {}).dev_name || ''} · ${id.dev || ''}`)),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: changePassword }, 'Đổi mật khẩu'),
        h('button', { class: 'btn ghost', onclick: () => api('auth.logout').then(() => { S.me = null; screenLogin(); }).catch(() => {}) }, 'Đăng xuất'),
        h('button', { class: 'btn bad', onclick: unpair }, 'Gỡ ghép máy này'))),
  ];
  if (owner) {
    const st = await api('system.status').catch(() => null);
    if (st) {
      const name = h('input', { value: st.spa_name });
      cards.push(h('div', { class: 'card' }, h('h2', {}, 'Máy chủ'),
        h('dl', { class: 'kv' }, h('dt', {}, 'Mã spa'), h('dd', { class: 'mono' }, st.spa_code), h('dt', {}, 'Máy chủ'), h('dd', {}, st.server_name),
          h('dt', {}, 'Chạy được'), h('dd', {}, `${Math.floor(st.uptime_s / 3600)} giờ ${Math.floor(st.uptime_s % 3600 / 60)} phút`),
          h('dt', {}, 'Địa chỉ nội bộ'), h('dd', {}, (st.lan || []).join(', ') || '—'),
          h('dt', {}, 'Kênh Internet'), h('dd', {}, st.channels.map(c => `${c.name}${c.up ? '' : '✕'}`).join(', ')),
          h('dt', {}, 'Dữ liệu'), h('dd', {}, `${st.counts.customers} khách · ${st.counts.appointments} lịch · ${st.counts.invoices} hóa đơn · ${st.counts.users} tài khoản · ${st.counts.devices} máy`),
          h('dt', {}, 'Máy đang kết nối'), h('dd', {}, st.sessions.map(s => `${s.dev_name}${s.user ? ' (' + s.user + ')' : ''}: ${s.lan ? 'nội bộ' : s.p2p ? 'P2P' : s.via}`).join('; ') || '—')),
        field('Tên spa', name),
        h('button', { class: 'btn ghost', onclick: () => api('settings.save', { spa_name: name.value.trim() }).then(() => { toast('Đã lưu'); if (S.welcome) S.welcome.spa_name = name.value.trim(); }).catch(() => {}) }, 'Lưu tên spa')));
    }
  }
  cards.push(h('div', { class: 'card' }, h('details', {}, h('summary', {}, 'Nhật ký kỹ thuật'), h('pre', { class: 'log' }, S.log.slice(-120).join('\n')))));
  el.replaceChildren(...cards);
}
function changePassword() {
  const o = h('input', { type: 'password', autocomplete: 'current-password' }), n = h('input', { type: 'password', autocomplete: 'new-password' });
  const btn = h('button', { class: 'btn' }, 'Đổi mật khẩu');
  let close;
  btn.onclick = () => busy(btn, api('auth.change_password', { old: o.value, new: n.value }).then(() => { toast('Đã đổi mật khẩu'); close(); }).catch(() => {}));
  close = sheet('Đổi mật khẩu', h('div', { style: 'display:grid;gap:10px' }, field('Mật khẩu hiện tại', o), field('Mật khẩu mới', n)), btn);
}
function unpair() {
  if (!window.confirm('Gỡ ghép máy này? Muốn dùng lại phải xin mã ghép máy mới từ quản trị.')) return;
  Conn.forget(); S.me = null; S.welcome = null; screenPair('Đã gỡ ghép máy.');
}

const VIEWS = { stock: vStock, cash: vCash, bonus: el => vBonus(el, false), mybonus: el => vBonus(el, true),
  appts: el => vAppts(el, false), mine: el => vAppts(el, true), customers: vCustomers, invoices: vInvoices, services: vServices,
  staff: vStaff, devices: vDevices, reports: vReports, system: vSystem, my: vMy, book: vBook, profile: vProfile };

// ---------- khởi động ----------
Conn.on('welcome', m => {
  const prevUser = S.me && S.me.id;
  S.welcome = m;
  if (m.need_owner) { if (!document.querySelector('.center h1') || !/Chào mừng/.test($('.center h1').textContent)) screenSetup(); return; }
  if (!m.user) { if (S.me || !$('#app input[autocomplete="current-password"]')) { S.me = null; screenLogin(); } return; }
  S.me = m.user;
  if (!$('nav.tabs') || prevUser !== m.user.id) screenMain();
});
Conn.on('state', d => {
  const b = $('#cbadge');
  if (b) b.replaceWith(connBadge());
  const cs = $('#cstate'); if (cs) cs.textContent = `Nội bộ: ${d.lan.state}` + (d.internetStarted ? ` · Internet: ${d.channels.filter(c => c.up).length}/${d.channels.length} kênh` : '');
  const ban = $('#banner');
  if (ban) ban.replaceChildren(...(d.path ? [] : [h('div', { class: 'wrap', style: 'padding-bottom:0' }, h('div', { class: 'banner' }, 'Mất kết nối tới máy chủ, đang tự nối lại…'))]));
});
function boot() {
  if (!Conn.hasIdentity()) return screenPair();
  screenConnecting();
  Conn.start().catch(e => screenPair(e.message));
}
boot();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
