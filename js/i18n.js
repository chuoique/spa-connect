/*
 * i18n.js - ngôn ngữ hiển thị. Tiếng Việt là gốc (viết thẳng trong app.js); tiếng Anh tra từ điển dưới đây.
 * Chữ nào chưa có trong từ điển thì giữ tiếng Việt. Thêm bản dịch: thêm 1 dòng 'tiếng Việt': 'English'.
 * Dữ liệu (tên khách, dịch vụ...) không bao giờ bị dịch: chỉ chữ trùng đúng nguyên câu trong từ điển mới đổi.
 */
(() => {
'use strict';
const EN = {
  // vai trò, trạng thái, thanh toán
  'Quản trị hệ thống': 'System admin', 'Chủ tịch HĐQT': 'Chairman', 'Tổng giám đốc': 'CEO', 'Trợ lý TGĐ': 'CEO assistant',
  'Lễ tân': 'Reception', 'Kỹ thuật viên': 'Technician', 'Khách hàng': 'Customers',
  'Chờ xác nhận': 'Pending', 'Đã đặt': 'Booked', 'Đã đến': 'Arrived', 'Đang làm': 'In service', 'Xong': 'Done',
  'Đã hủy': 'Cancelled', 'Không đến': 'No-show', 'Tiền mặt': 'Cash', 'Chuyển khoản': 'Bank transfer', 'Thẻ': 'Card',
  // thanh dưới
  'Lịch hẹn': 'Appointments', 'Lịch của tôi': 'My schedule', 'Hóa đơn': 'Invoices', 'Dịch vụ': 'Services',
  'Nhân viên': 'Staff', 'Thiết bị': 'Devices', 'Báo cáo': 'Reports', 'Kho': 'Stock', 'Thu chi': 'Cash book',
  'Thưởng': 'Bonuses', 'Thưởng của tôi': 'My bonuses', 'Hệ thống': 'System', 'Đặt lịch': 'Book', 'Thông tin': 'Profile',
  // ghép máy / đăng nhập
  'Điện thoại Android': 'Android phone', 'Máy tính Windows': 'Windows PC', 'Máy Mac': 'Mac',
  'Ghép máy': 'Pair device', 'Đang tìm máy chủ và ghép máy…': 'Finding the server and pairing…', 'Ghép máy với spa': 'Pair with the spa',
  'Mã ghép máy': 'Pairing code', 'Tên máy này': 'Device name', 'Tạo tài khoản quản trị': 'Create admin account',
  'Hai lần nhập mật khẩu không khớp': 'Passwords do not match', 'Đã tạo tài khoản quản trị': 'Admin account created',
  'Chào mừng!': 'Welcome!', 'Tên đăng nhập': 'Username', 'Tên hiển thị': 'Display name',
  'Mật khẩu (ít nhất 6 ký tự)': 'Password (at least 6 characters)', 'Nhập lại mật khẩu': 'Repeat password',
  'Đăng nhập': 'Log in', 'Mật khẩu': 'Password', 'Kết nối': 'Connection', 'Chẩn đoán': 'Diagnostics',
  'Đang kết nối tới máy chủ spa…': 'Connecting to the spa server…', 'Gỡ ghép máy': 'Unpair device',
  'Đổi mật khẩu': 'Change password', 'Mật khẩu mới cần ít nhất 6 ký tự': 'New password needs at least 6 characters',
  'Hai lần nhập mật khẩu mới không khớp': 'New passwords do not match', 'Đã đổi mật khẩu': 'Password changed',
  'Mật khẩu hiện tại (mật khẩu tạm)': 'Current (temporary) password', 'Mật khẩu mới': 'New password',
  'Nhập lại mật khẩu mới': 'Repeat new password', 'Đăng xuất': 'Log out', 'Mật khẩu hiện tại': 'Current password',
  'Bạn đang dùng mật khẩu tạm. Hãy đặt mật khẩu riêng của mình trước khi dùng app (ít nhất 6 ký tự, không ai khác biết).':
    'You are using a temporary password. Please set your own password before using the app (at least 6 characters, known only to you).',
  'Nhập mã ghép máy do quản trị tạo (mục Thiết bị), hoặc mã khởi tạo in trên cửa sổ máy chủ khi chạy lần đầu. Mỗi máy chỉ cần ghép một lần.':
    'Enter the pairing code created by an admin (Devices), or the setup code printed in the server window on first run. Each device pairs only once.',
  // chung
  'Tìm nhanh': 'Quick search', 'Quét mã': 'Scan code', 'Đang tải…': 'Loading…', 'Hôm nay': 'Today',
  'Đã cập nhật': 'Updated', 'Bác sĩ': 'Doctor', 'Loại': 'Type', 'Thời gian': 'Time', 'Khách': 'Customer',
  'Trạng thái': 'Status', 'Ghi chú': 'Note', 'Thanh toán': 'Payment', 'Sửa': 'Edit', 'Xóa': 'Delete', 'Lưu': 'Save',
  'Ngày': 'Date', 'Giờ': 'Time', 'Điện thoại': 'Phone', 'Tên': 'Name', 'Mã': 'Code', 'Hủy': 'Cancel', 'Thêm': 'Add',
  'Tất cả': 'All', '7 ngày': '7 days', 'Tháng này': 'This month', 'Tháng trước': 'Last month', 'Năm nay': 'This year',
  'Đã lưu': 'Saved', 'Lịch sử': 'History', 'Nội dung': 'Content', 'Số lượng': 'Quantity', 'Không tìm thấy': 'Not found',
  'Đóng': 'Close', 'Đã có bản mới của app': 'A new version of the app is ready', 'Tải lại': 'Reload',
  'Mất kết nối tới máy chủ, đang tự nối lại…': 'Lost connection to the server, reconnecting…',
  // lịch hẹn
  '+ Thêm lịch hẹn': '+ New appointment', 'Không có lịch hẹn': 'No appointments', 'Trừ gói': 'Deduct package',
  'Khách chưa có gói đang dùng': 'Customer has no active package', 'Chọn gói để trừ': 'Choose a package to deduct',
  'Hồ sơ khách': 'Customer profile', 'Ghi chú lịch trình': 'Treatment note', 'Xóa lịch hẹn này?': 'Delete this appointment?',
  'Gõ tên dịch vụ…': 'Type a service name…', 'Gõ tên kỹ thuật viên (để trống: chưa phân công)': 'Type a technician name (empty: unassigned)',
  'Thêm lịch hẹn': 'Add appointment', 'Hãy chọn khách': 'Please choose a customer', 'Đã lưu lịch hẹn': 'Appointment saved',
  'Lịch hẹn mới': 'New appointment', 'Sửa lịch hẹn': 'Edit appointment', 'Lịch hẹn của tôi': 'My appointments',
  'Hủy lịch này?': 'Cancel this appointment?', 'Yêu cầu thêm (nếu có)': 'Extra requests (optional)',
  'Gửi yêu cầu đặt lịch': 'Send booking request', 'Đã gửi. Spa sẽ xác nhận sớm.': 'Sent. The spa will confirm soon.',
  // khách
  'Tìm tên hoặc số điện thoại…': 'Search name or phone…', 'Lưu khách': 'Save customer', 'Khách mới': 'New customer',
  'Tên khách': 'Customer name', 'Số điện thoại': 'Phone number', '+ Thêm khách': '+ Add customer',
  'In thẻ thành viên': 'Print member card', 'Phân loại': 'Category', 'Đến lần đầu': 'First visit',
  'Điểm tích lũy': 'Loyalty points', 'Đã chi': 'Spent', 'Tổng mua (hệ thống cũ)': 'Total purchases (old system)',
  'Gói & số dư': 'Packages & balance', '+ Mở gói': '+ New package', 'Ghi chú liệu trình': 'Treatment notes',
  'Xóa khách này?': 'Delete this customer?', 'Sửa khách': 'Edit customer', 'Ngày sinh': 'Birthday', 'Giới tính': 'Gender',
  'Địa chỉ': 'Address', 'Tình trạng da, sản phẩm đã dùng, lưu ý cho lần sau…': 'Skin condition, products used, notes for next time…',
  'Lưu ghi chú': 'Save note', 'Đã lưu ghi chú': 'Note saved', 'Thẻ thành viên': 'Member card',
  // gói
  'VD: Gói 8 buổi Glass Skin': 'e.g. 8-session Glass Skin package', 'Để trống nếu gói tính theo tiền': 'Leave empty for a money-based package',
  'Mở gói': 'Open package', 'Tên gói': 'Package name', 'Giá trị gói (đ)': 'Package value (VND)', 'Số buổi': 'Sessions',
  'Cộng gói': 'Top up package', 'Đã trừ gói': 'Package deducted', 'Đã cộng gói': 'Package topped up', 'Còn lại': 'Remaining',
  'Buổi còn': 'Sessions left', 'Số tiền (đ)': 'Amount (VND)', 'Lý do': 'Reason', '− Trừ gói': '− Deduct', '+ Cộng thêm': '+ Top up',
  // hóa đơn
  '+ Hóa đơn mới': '+ New invoice', 'Khách lẻ': 'Walk-in', 'Nợ lại': 'Debt', 'Nguồn khách': 'Customer source',
  'NV tư vấn': 'Consultant', 'Tạm tính': 'Subtotal', 'Giảm giá': 'Discount', 'Lý do hủy hóa đơn?': 'Reason for voiding?',
  'Đã hủy hóa đơn': 'Invoice voided', 'Hủy hóa đơn': 'Void invoice', 'Dịch vụ / sản phẩm…': 'Service / product…',
  'Thu tiền & lưu hóa đơn': 'Collect & save invoice', 'Hóa đơn mới': 'New invoice', 'Khách (để trống nếu khách lẻ)': 'Customer (empty for walk-in)',
  'Dịch vụ · SL · Đơn giá': 'Service · Qty · Price', '+ Thêm dòng': '+ Add line', 'Giảm giá (đ)': 'Discount (VND)',
  'Hình thức': 'Method', 'Tổng thu': 'Total',
  // dịch vụ
  '+ Thêm dịch vụ': '+ Add service', 'Sửa dịch vụ': 'Edit service', 'Dịch vụ mới': 'New service', 'Tên dịch vụ': 'Service name',
  'Mã dịch vụ': 'Service code', 'Nhóm': 'Group', 'Thời lượng (phút)': 'Duration (min)', 'Giá bán lẻ (đ)': 'Retail price (VND)',
  'Giá trải nghiệm': 'Trial price', 'Giá thẻ tiền': 'Prepaid-card price', 'Giá gói 4 buổi': '4-session price',
  'Giá gói 8 buổi': '8-session price', 'Mô tả': 'Description', 'Xóa dịch vụ này?': 'Delete this service?', 'dịch vụ': 'services',
  // nhân viên / thiết bị
  '+ Thêm tài khoản': '+ Add account', 'Chưa có mật khẩu': 'No password yet', 'Đang hoạt động': 'Active',
  'Khóa tài khoản': 'Locked', 'Gắn với hồ sơ khách': 'Linked customer', 'Tài khoản mới': 'New account',
  'Sửa tài khoản': 'Edit account', 'Vai trò': 'Role', 'Mã NV': 'Staff code', 'Chức vụ': 'Title', 'Xóa tài khoản này?': 'Delete this account?',
  'Đã hết hạn': 'Expired', 'Mã ghép máy cho khách': 'Customer pairing code', 'Mã ghép máy nhân viên': 'Staff pairing code',
  '+ Ghép máy nhân viên': '+ Pair staff device', '+ Ghép máy khách': '+ Pair customer device', 'Đã thu hồi': 'Revoked',
  'Nội bộ': 'Local', 'Mã máy': 'Device ID', 'Ghép lúc': 'Paired at', 'Người dùng': 'User', 'Tên máy': 'Device name',
  'Đổi tên': 'Rename', 'Thu hồi': 'Revoke',
  // báo cáo
  'Lịch xong': 'Completed', 'Hủy / không đến': 'Cancelled / no-show', 'Dịch vụ bán chạy': 'Top services',
  'Theo nhân viên (lịch đã xong)': 'By staff (completed)',
  // kho
  'Nhập kho': 'Stock in', 'Xuất bán': 'Sold', 'Xuất trị liệu': 'Used in treatment', 'Xuất tặng': 'Gift', 'Xuất nội bộ': 'Internal use',
  'Kiểm kê (±)': 'Stock count (±)', 'Tìm sản phẩm theo tên hoặc mã…': 'Search product by name or code…',
  'Chưa có sản phẩm': 'No products yet', '+ Thêm sản phẩm': '+ Add product', 'Lịch sử nhập xuất': 'Stock history',
  'Ghi chú (nhà cung cấp, khách…)': 'Note (supplier, customer…)', 'Ghi phiếu': 'Record', 'Tồn hiện tại': 'In stock',
  'Giá bán': 'Price', 'Loại phiếu': 'Movement type', 'Sửa sản phẩm': 'Edit product', 'Đang dùng': 'Active', 'Ngừng': 'Discontinued',
  'Sản phẩm mới': 'New product', 'Đơn vị': 'Unit', 'Giá nhập': 'Cost', 'Báo khi tồn dưới': 'Alert below',
  'Tồn ban đầu': 'Opening stock', 'Xóa sản phẩm này?': 'Delete this product?',
  // thu chi / thưởng
  'Chênh lệch': 'Balance', '− Phiếu chi': '− Expense', '+ Phiếu thu': '+ Income', 'Quỹ tiền mặt': 'Cash fund',
  'Phiếu thu': 'Income', 'Phiếu chi': 'Expense', 'Sửa khoản thu chi': 'Edit entry', 'Người thực hiện': 'Done by', 'Quỹ': 'Fund',
  'Xóa khoản này?': 'Delete this entry?', 'Tổng thưởng': 'Total bonus', 'Số lượt': 'Count', '+ Ghi thưởng': '+ Add bonus',
  'Bảng mức thưởng': 'Bonus rates', '+ Thêm mức': '+ Add rate', 'Nhân viên / KTV': 'Staff / technician',
  'Sửa mức thưởng': 'Edit bonus rate', 'Mức thưởng mới': 'New bonus rate', 'Tiền thưởng / lượt': 'Bonus per session',
  'Áp dụng cho': 'Applies to', 'Gõ tên dịch vụ thưởng…': 'Type a bonus service…', 'Để trống: tính theo bảng': 'Empty: use the rate table',
  'Ghi thưởng': 'Record bonus', 'Đã ghi thưởng': 'Bonus recorded', 'Ghi thưởng trị liệu': 'Record treatment bonus',
  'Mức thưởng': 'Bonus rate', 'Hoặc số tiền (đ)': 'Or amount (VND)', 'Khách (không bắt buộc)': 'Customer (optional)',
  // quét / tìm
  'Hoặc gõ mã: KH-… / HD-…': 'Or type a code: KH-… / HD-…', 'Đưa mã QR vào khung hình…': 'Point the camera at a QR code…',
  'Tên khách, SĐT, mã KH-…, dịch vụ, nhân viên, số hóa đơn…': 'Customer, phone, KH-… code, service, staff, invoice number…',
  'Lịch hẹn ': 'Appointment ', 'Sản phẩm': 'Products', 'Tài khoản': 'Account', 'Gói': 'Package', 'Phiếu kho': 'Stock movement',
  'Cộng/trừ gói': 'Package changes',
  // thùng rác
  'Đã khôi phục': 'Restored', 'Khôi phục': 'Restore', 'Thùng rác trống': 'Trash is empty', 'Thùng rác': 'Trash',
  '🗑 Thùng rác (dữ liệu đã xóa)': '🗑 Trash (deleted data)',
  'Dữ liệu bị xóa không mất: chỉ đánh dấu xóa trên mọi máy chủ và Google Drive. Khôi phục sẽ đồng bộ tới mọi máy.':
    'Deleted data is never lost: it is only marked as deleted on every server and on Google Drive. Restoring syncs to all servers.',
  // hệ thống
  ' ✅ máy này đã tin chứng chỉ': ' ✅ this device trusts the certificate', ' ⚠ chưa tin (hoặc không cùng mạng)': ' ⚠ not trusted (or not on the same network)',
  ' ⚠ không kiểm tra được': ' ⚠ could not check', '⬇ Tải chứng chỉ của spa': '⬇ Download the spa certificate',
  'Đã tải spa-noi-bo.crt (thư mục Tải xuống) - mở file để cài': 'Downloaded spa-noi-bo.crt (Downloads folder) - open it to install',
  'Thử cắt / bật nội bộ': 'Toggle local path', 'Thử cắt P2P': 'Drop P2P', 'Thử hỏng kênh': 'Break channel', 'Bật lại kênh': 'Restore channel',
  'Mạng nội bộ của spa': 'Spa local network', 'Đã thêm': 'Added', 'Địa chỉ nội bộ dạng 192.168.x.x': 'Local address like 192.168.x.x',
  'Đang tìm…': 'Searching…', 'Tìm ngay': 'Search now', 'Chưa biết địa chỉ máy chủ nội bộ.': 'Local server address unknown.',
  'Máy này': 'This device', 'Gỡ ghép máy này': 'Unpair this device', 'Doanh nghiệp': 'Business', 'Tên doanh nghiệp': 'Business name',
  'Mã số thuế': 'Tax code', 'Đã lưu thông tin doanh nghiệp': 'Business details saved', 'Lưu thông tin doanh nghiệp': 'Save business details',
  'Máy chủ': 'Server', 'Mã spa': 'Spa code', 'Chạy được': 'Uptime', 'Địa chỉ nội bộ': 'Local addresses', 'Kênh Internet': 'Internet channels',
  'Dữ liệu': 'Data', 'Máy đang kết nối': 'Connected devices', 'Tên spa': 'Spa name', 'Lưu tên spa': 'Save spa name',
  'Máy chủ & sao lưu': 'Servers & backup', 'Máy chủ khác': 'Other servers', 'Chưa có (1 máy chủ)': 'None (1 server)',
  'Chưa cài (chạy google-drive.bat trên máy chủ)': 'Not set up (run google-drive.bat on the server)', 'Đang tắt': 'Off',
  'Nhật ký kỹ thuật': 'Technical log', 'Đã gỡ ghép máy.': 'Device unpaired.', 'Giao diện': 'Theme', 'Ngôn ngữ': 'Language',
  'Lần đầu dùng mạng nội bộ, mỗi máy cần cài chứng chỉ của spa một lần (ở spa, cùng mạng với máy chủ). Chưa cài thì app vẫn chạy qua Internet.':
    'To use the local network, each device installs the spa certificate once (at the spa, on the same network as the server). Without it the app still works over the Internet.',
  'Thêm máy chủ: cài bản đóng gói trên máy mới bằng dữ liệu sao lưu của spa — các máy tự tìm nhau (cùng mạng nội bộ hoặc qua Internet) và đồng bộ liên tục. Một máy hỏng, máy còn lại vẫn phục vụ đầy đủ.':
    'Add a server: install the package on a new machine using the spa backup — servers find each other (local network or Internet) and sync continuously. If one fails, the others keep serving.',
  // đường kết nối (conn.js)
  'Mạng nội bộ': 'Local network', 'Đang kết nối': 'Connecting', 'Mất kết nối': 'Disconnected',
};

let lang = 'vi';
try { lang = localStorage.getItem('lang') === 'en' ? 'en' : 'vi'; } catch (e) {}
document.documentElement.lang = lang;

// Cờ vẽ bằng SVG (Windows không hiện được emoji cờ)
const svg = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
const FLAG = {
  vi: svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#da251d"/>' +
          '<polygon fill="#ff0" points="15,4 16.18,7.63 20,7.64 16.91,9.88 18.09,13.51 15,11.27 11.91,13.51 13.09,9.88 10,7.64 13.82,7.63"/></svg>'),
  en: svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="t"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath>' +
          '<path d="M0,0v30h60v-30z" fill="#012169"/><path d="M0,0 60,30M60,0 0,30" stroke="#fff" stroke-width="6"/>' +
          '<path d="M0,0 60,30M60,0 0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/>' +
          '<path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></svg>'),
};

window.I18N = {
  flag: l => FLAG[l],
  get lang() { return lang; },
  set(l) { lang = l === 'en' ? 'en' : 'vi'; try { localStorage.setItem('lang', lang); } catch (e) {} document.documentElement.lang = lang; },
  t(s) {
    if (lang !== 'en' || typeof s !== 'string') return s;
    if (EN[s] != null) return EN[s];
    const k = s.trim();                     // chữ có khoảng trắng / dấu "…" ở đầu cuối
    if (k !== s && EN[k] != null) return s.replace(k, EN[k]);
    return s;
  },
};
})();
