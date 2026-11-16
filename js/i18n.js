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
  '(chưa có)': '(none)', 'Chưa kết nối': 'Not connected', 'Chưa kết nối được máy chủ': 'Could not connect to the server yet',
  'ICE thất bại': 'ICE failed', 'Không có trả lời: mã sai, đã hết hạn, hoặc máy chủ chưa chạy': 'No reply: wrong or expired code, or the server is not running',
  'Lỗi': 'Error', 'Máy chưa được ghép': 'Device not paired', 'Máy chủ không trả lời, thử lại': 'Server did not reply, please retry',
  'Mã ghép máy gồm 12 ký tự, dạng XXXXXX-XXXXXX': 'The pairing code has 12 characters: XXXXXX-XXXXXX',
  'Mất kết nối, thử lại': 'Disconnected, please retry', 'Nội bộ: máy chủ không trả lời': 'Local: server did not reply',
  'P2P rớt': 'P2P dropped', 'P2P trực tiếp': 'Direct P2P', 'PC đã trả lời, đang đục lỗ…': 'PC replied, punching through…',
  'bỏ qua (thử)': 'skipped (test)', 'chưa biết địa chỉ nội bộ': 'local address unknown', 'chưa cần': 'not needed',
  'chưa thấy nội bộ sau 1,5 s': 'no local server after 1.5 s', 'có mạng trở lại': 'network is back', 'cắt thử nội bộ': 'local path cut (test)',
  'dự phòng': 'standby', 'ghép máy': 'pairing', 'hết 20 giây, đục lỗ không được': '20 s passed, hole punching failed',
  'không có kênh để gửi lời mời': 'no channel to send the invitation', 'không nối được, đang thử lại…': 'could not connect, retrying…',
  'không thấy (chưa ở spa, hoặc chưa cài chứng chỉ)': 'not found (not at the spa, or certificate not installed)',
  'không thấy máy chủ nội bộ': 'no local server found', 'không trả lời': 'no reply', 'kênh P2P đóng': 'P2P channel closed',
  'kênh không trả lời': 'channel not replying', 'kênh đang dùng rớt': 'active channel dropped', 'máy chủ không trả lời': 'server did not reply',
  'mất kết nối, đang thử lại…': 'disconnected, retrying…', 'mất kết nối, đang tìm lại…': 'disconnected, searching again…',
  'mất mạng': 'offline', 'mất mạng nội bộ': 'local network lost', 'qua máy chuyển tiếp công cộng, đã mã hóa': 'via public relays, encrypted',
  'thử cắt': 'cut (test)', 'trả lời đầu tiên': 'first reply', 'tốt hơn': 'better', 'Đang tạo khóa ghép máy…': 'Creating pairing key…',
  'Đã ngắt kết nối': 'Disconnected', 'đang nối…': 'connecting…', 'đang tìm…': 'searching…', 'đã có mạng nội bộ': 'local network available',
  'đã cắt thử': 'cut (test)', 'đã mở': 'open', 'đã tắt thử': 'off (test)', ' (hôm nay)': ' (today)', '(hôm nay)': '(today)',
  'chưa đăng nhập': 'not logged in', 'Khách lẻ': 'Walk-in', ' (máy này)': ' (this device)',
  'Mỗi người một tài khoản riêng. Khách hàng cũng có thể có tài khoản để tự đặt lịch.': 'One account per person. Customers can also have accounts to book by themselves.',
  'Nhân viên nhập từ dữ liệu cũ chưa có mật khẩu: bấm vào để đặt mật khẩu khi người đó cần dùng app.': 'Staff imported from old data have no password yet: tap to set one when they need the app.',
  'Trên máy mới: mở app Spa → nhập mã này. Mã chỉ dùng được một lần.': 'On the new device: open the Spa app → enter this code. It works only once.',
  'Nhân sự': 'Staff', 'Mỗi người một tài khoản riêng.': 'One account per person.',
  'Tài khoản khách hàng: khách tự đặt lịch, xem lịch và điểm của mình trên app.': 'Customer accounts: customers book, see their appointments and points in the app.',
  'Chưa có tài khoản khách hàng': 'No customer accounts yet', 'Chưa có tài khoản nhân sự': 'No staff accounts yet',
  'Khóa': 'Locked', 'Máy chủ & sao lưu': 'Servers & backup', 'Tất cả nhân viên': 'All staff', 'Chưa có hóa đơn': 'No invoices yet',
  'Chưa có': 'None yet', 'Chưa có dịch vụ': 'No services yet', 'Chưa có dịch vụ. Thêm dịch vụ đầu tiên.': 'No services yet. Add the first one.',
  'Khung báo cáo cơ bản — sẽ bổ sung dần (theo tháng, công nợ, hoa hồng nhân viên…).': 'Basic report view — more coming (monthly, debts, staff commissions…).',
  'Chưa có khách': 'No customers yet', 'Chưa có gói': 'No packages yet', 'Chưa có ghi chú': 'No notes yet', 'Chưa có thưởng': 'No bonuses yet',
  'Chưa có khoản nào': 'No entries yet', 'Chưa có thiết bị': 'No devices yet', 'Chưa có lịch hẹn': 'No appointments yet',
  'iPhone/iPad: bấm "tải qua Safari" → Cho phép → Cài đặt → "Đã tải về hồ sơ" → Cài đặt → rồi Cài đặt chung → Giới thiệu → Cài đặt tin cậy chứng nhận → bật "Spa - chung chi goc…".':
    'iPhone/iPad: tap "download in Safari" → Allow → Settings → "Profile Downloaded" → Install → then General → About → Certificate Trust Settings → turn on "Spa - chung chi goc…".',
  'Android: bấm "Tải chứng chỉ của spa" → Cài đặt → Bảo mật → Mã hóa & thông tin xác thực → Cài đặt chứng chỉ → Chứng chỉ CA → chọn file spa-noi-bo.crt (trong Tải xuống) → Vẫn cài đặt.':
    'Android: tap "Download the spa certificate" → Settings → Security → Encryption & credentials → Install a certificate → CA certificate → choose spa-noi-bo.crt (in Downloads) → Install anyway.',
  'Windows: bấm "Tải chứng chỉ của spa" (file spa-noi-bo.crt vào thư mục Tải xuống, hoặc trên chính máy chủ mở data\\certs\\ca.crt) → mở file → "Install Certificate" (Cài đặt chứng chỉ) → Current User → KHÔNG để "Automatically select…", chọn "Place all certificates in the following store" (Đặt tất cả chứng chỉ vào kho sau) → Browse → chọn đúng "Trusted Root Certification Authorities" (Tổ chức cấp chứng chỉ GỐC đáng tin cậy — không phải "trung gian") → OK → Next → Finish → Windows hỏi "Do you want to install this certificate?" → Yes. Rồi đóng hẳn app / trình duyệt và mở lại.':
    'Windows: click "Download the spa certificate" (spa-noi-bo.crt goes to Downloads; on the server itself open data\\certs\\ca.crt) → open the file → "Install Certificate" → Current User → do NOT keep "Automatically select…", choose "Place all certificates in the following store" → Browse → pick "Trusted Root Certification Authorities" (not "Intermediate") → OK → Next → Finish → Windows asks "Do you want to install this certificate?" → Yes. Then fully close and reopen the app / browser.',
  'Mac: bấm "Tải chứng chỉ của spa" → mở file (Keychain Access, chọn "login") → bấm đúp "Spa - chung chi goc" → Trust → "When using this certificate": Always Trust → đóng, nhập mật khẩu máy. Rồi mở lại trình duyệt.':
    'Mac: click "Download the spa certificate" → open the file (Keychain Access, "login") → double-click "Spa - chung chi goc" → Trust → "When using this certificate": Always Trust → close, enter your Mac password. Then reopen the browser.',
  'Tải file chứng chỉ rồi cài vào mục "chứng chỉ gốc tin cậy" của máy.': 'Download the certificate file and install it as a "trusted root certificate" on this device.',
  'Không mở được camera: ': 'Could not open the camera: ', '. Kiểm tra quyền camera trong Cài đặt.': '. Check camera permission in Settings.',
  'Quét bằng camera cần bản app https (app cài từ GitHub, hoặc https://IP:8443)': 'Camera scanning needs the https app (installed from GitHub, or https://IP:8443)',
  'Kênh Internet chưa dùng (đang ưu tiên nội bộ)': 'Internet channels not in use (local network preferred)',
  'tải qua Safari': 'download in Safari', 'Đang tạo khóa ghép máy…': 'Creating pairing key…',
  // thông báo của máy chủ
  'Máy này không được ghép bằng mã khởi tạo': 'This device was not paired with the setup code', 'Spa đã có tài khoản chủ': 'The spa already has an owner account',
  'Tên đăng nhập cần ít nhất 3 ký tự': 'Username needs at least 3 characters', 'Mật khẩu cần ít nhất 6 ký tự': 'Password needs at least 6 characters',
  'Máy này được ghép cho khách hàng, không đăng nhập tài khoản nhân viên được': 'This device is paired for a customer; staff accounts cannot log in here',
  'Sai tên đăng nhập hoặc mật khẩu': 'Wrong username or password', 'Mật khẩu cũ không đúng': 'Current password is wrong',
  'Mật khẩu mới phải khác mật khẩu cũ': 'The new password must differ from the old one', 'Không dùng mật khẩu mặc định': 'The default password is not allowed',
  'Không tìm thấy khách': 'Customer not found', 'Cần nhập tên khách': 'Customer name is required', 'Cần nhập tên dịch vụ': 'Service name is required',
  'Không tìm thấy dịch vụ': 'Service not found', 'Vai trò này chỉ cấp được trên máy chủ': 'This role can only be granted on the server',
  'Vai trò không hợp lệ': 'Invalid role', 'Không đủ quyền cấp vai trò này': 'Not allowed to grant this role',
  'Cần tên đăng nhập (ít nhất 3 ký tự) và vai trò': 'Username (at least 3 characters) and role are required', 'Tên đăng nhập đã có người dùng': 'Username already taken',
  'Không đủ quyền sửa tài khoản cấp cao hơn': 'Not allowed to edit a higher-ranked account', 'Không thể bỏ quyền quản trị cuối cùng': 'Cannot remove the last admin',
  'Không thể tự xóa tài khoản của mình': 'You cannot delete your own account', 'Không đủ quyền xóa tài khoản cấp cao hơn': 'Not allowed to delete a higher-ranked account',
  'Không thể xóa tài khoản quản trị cuối cùng': 'Cannot delete the last admin account', 'Không tìm thấy tài khoản': 'Account not found',
  'Chỉ quản trị hệ thống mới xem được thùng rác': 'Only the system admin can view the trash', 'Bảng không hợp lệ': 'Invalid table',
  'Chỉ quản trị hệ thống mới khôi phục được': 'Only the system admin can restore', 'Không khôi phục được (trùng tên đăng nhập / mã với dữ liệu đang dùng?)': 'Could not restore (username / code already in use?)',
  'Không tìm thấy trong thùng rác': 'Not found in the trash', 'Cần chọn khách': 'Please choose a customer', 'Cần chọn giờ hẹn': 'Please choose a time',
  'Trạng thái không hợp lệ': 'Invalid status', 'Không tìm thấy lịch hẹn': 'Appointment not found', 'Chỉ cập nhật được lịch của mình': 'You can only update your own appointments',
  'Hóa đơn cần ít nhất 1 dòng': 'An invoice needs at least 1 line', 'Dòng hóa đơn thiếu tên, số lượng hoặc giá': 'Invoice line is missing name, quantity or price',
  'Giảm giá không hợp lệ': 'Invalid discount', 'Không tìm thấy hóa đơn': 'Invoice not found', 'Cần ghi lý do hủy': 'Please give a reason for voiding',
  'Cần chọn khách và nhập nội dung': 'Please choose a customer and enter the text', 'Không thể thu hồi chính máy đang dùng': 'You cannot revoke the device you are using',
  'Không tìm thấy thiết bị': 'Device not found', 'Cần nhập tên': 'Name is required', 'Không đọc được chứng chỉ của máy chủ': 'Could not read the server certificate',
  'Tài khoản chưa gắn với hồ sơ khách': 'This account is not linked to a customer profile', 'Hãy chọn thời gian trong tương lai': 'Please choose a time in the future',
  'Không hủy được lịch này': 'This appointment cannot be cancelled', 'Cần chọn khách và nhập tên gói': 'Please choose a customer and enter a package name',
  'Không tìm thấy gói': 'Package not found', 'Gói không còn đủ buổi': 'Not enough sessions left in the package', 'Cần ghi lý do': 'A reason is required',
  'Cần nhập tên sản phẩm': 'Product name is required', 'Không tìm thấy sản phẩm': 'Product not found', 'Cần nhập số lượng': 'Quantity is required',
  'Loại phiếu không hợp lệ': 'Invalid movement type', 'Cần nhập tên mức thưởng': 'Bonus rate name is required', 'Cần chọn nhân viên': 'Please choose a staff member',
  'Cần nhập số tiền thưởng hoặc chọn mức thưởng': 'Enter a bonus amount or choose a bonus rate', 'Chọn thu hay chi': 'Choose income or expense',
  'Cần nhập số tiền': 'Amount is required', 'Cần đăng nhập': 'Please log in', 'Không có quyền': 'Not allowed',
  'Cần đổi mật khẩu trước khi dùng app': 'Please change your password before using the app', 'Chưa đặt mật khẩu sao lưu': 'Backup password not set',
  'Chưa cài đặt Google Drive (spa_server --google-cai-dat)': 'Google Drive not set up (spa_server --google-cai-dat)',
};

// Câu có chèn số liệu / tên: [mẫu, bản dịch] (bản dịch là chuỗi có $1.. hoặc hàm)
const RX = [
  [/^(\d+) hóa đơn đã thu( · danh sách hiện 500 hóa đơn gần nhất)?$/, (m, n, x) => `${n} invoices paid${x ? ' · list shows the latest 500' : ''}`],
  [/^(\d+) phút trước$/, '$1 min ago'], [/^(\d+) giờ trước$/, '$1 h ago'], [/^(\d+) ngày trước$/, '$1 days ago'],
  [/^(\d+) giờ (\d+) phút$/, '$1 h $2 min'], [/^([+-]?\d+) buổi$/, '$1 sessions'], [/^(-?\d+) điểm$/, '$1 points'],
  [/^(.*) \((\d+) hóa đơn\)$/, '$1 ($2 invoices)'], [/^(\d+) lượt · (.+) đơn vị$/, '$1 times · $2 units'],
  [/^(\d+) phút · (.+)$/, '$1 min · $2'], [/^(.+) · (\d+) phút · (.+)$/, '$1 · $2 min · $3'],
  [/^(\d+) khách · (\d+) lịch · (\d+) hóa đơn · (\d+) tài khoản · (\d+) máy$/, '$1 customers · $2 appointments · $3 invoices · $4 accounts · $5 devices'],
  [/^\+ Khách mới(: .*)?$/, (m, x) => '+ New customer' + (x || '')], [/^Chào (.+)$/, 'Hello $1'],
  [/^Giá trị gói (.+ đ)$/, 'Package value $1'], [/^Hóa đơn ([A-Za-z0-9-]+)$/, 'Invoice $1'], [/^Hết hạn sau (\d+:\d\d)$/, 'Expires in $1'],
  [/^Khách: (.+)$/, 'Customer: $1'], [/^Làm dịch vụ (\d\d\/\d\d\/\d{4})$/, 'Treatment $1'], [/^Làm (.+) (\d\d\/\d\d\/\d{4})$/, 'Treatment: $1 $2'],
  [/^Máy chủ (.+):$/, 'Server $1:'], [/^Máy: (.*)$/, 'Device: $1'], [/^Mở gói cho (.+)$/, 'New package for $1'],
  [/^SĐT: (.*)$/, 'Phone: $1'], [/^MST: (.*)$/, 'Tax code: $1'], [/^Thưởng: (.+)$/, 'Bonus: $1'], [/^Thẻ (\d.*)$/, 'Card $1'],
  [/^Tiền mặt (\d.*)$/, 'Cash $1'], [/^Đã ghi\. Tồn: (.*)$/, 'Recorded. Stock: $1'], [/^Đã lưu (.+)$/, 'Saved $1'],
  [/^Địa chỉ đã biết: (.*)$/, 'Known addresses: $1'], [/^Đổi đường (\d+) lần · mã hóa (.+)$/, 'Path changes: $1 · crypto $2'],
  [/^Thu hồi "(.+)"\? Máy này sẽ không kết nối được nữa\.$/, 'Revoke "$1"? This device will no longer be able to connect.'],
  [/^(.+?) · xóa (.+)$/, (m, a, b) => `${tr(a)} · deleted ${b}`],
  [/^Đã ghép máy: (.+)$/, 'Paired: $1'],
  [/^Kênh: (.+) → (.+) \((.+)\)$/, (m, a, b, w) => `Channel: ${a} → ${b} (${tr(w)})`], [/^Kênh: (.+) \((.+)\)$/, (m, a, w) => `Channel: ${a} (${tr(w)})`],
  [/^Kênh (.+)$/, 'Channel $1'], [/^Kênh: (.+)$/, 'Channel: $1'],
  [/^Internet: nối (\d+) kênh \((.+)\)$/, (m, n, w) => `Internet: ${n} channels (${tr(w)})`],
  [/^Nội bộ: thấy máy chủ ở (.+)$/, 'Local: server found at $1'], [/^Nội bộ: quét thấy (.+)$/, 'Local: scan found $1'],
  [/^Nội bộ: mất kết nối (.+)$/, 'Local: disconnected $1'], [/^Nội bộ (.+): không có lời chào, bỏ$/, 'Local $1: no hello, dropped'],
  [/^Nội bộ: (.+)$/, (m, a) => 'Local: ' + tr(a)], [/^Mạng thay đổi \((.+)\) → dò nội bộ ngay$/, (m, w) => `Network changed (${tr(w)}) → probing local network`],
  [/^\[(.+)\] mất kết nối$/, '[$1] disconnected'], [/^(\S+) rớt$/, '$1 dropped'], [/^(\S+) thông lại$/, '$1 back up'],
  [/^Đường dùng: nội bộ (.+)$/, 'Path: local $1'], [/^Đường dùng: kênh (.+)$/, 'Path: channel $1'], [/^Đường dùng: (.+)$/, (m, a) => 'Path: ' + tr(a)],
  [/^(.+) · Internet: (\d+)\/(\d+) kênh$/, (m, a, x, y) => `${tr(a)} · Internet: ${x}/${y} channels`],
  [/^thẳng tới PC (.+), không qua Internet$/, 'direct to PC $1, not via the Internet'], [/^(.+) · chào sau (\d+) ms$/, '$1 · hello after $2 ms'],
  [/^nối (\d+) ms · chờ chào$/, 'connected $1 ms · waiting for hello'], [/^nối (\d+) ms · chào (\d+) ms$/, 'connected $1 ms · hello $2 ms'],
  [/^đang thử (.+)…$/, 'trying $1…'], [/^đang thử \(lần (\d+)\)…$/, 'trying (attempt $1)…'], [/^đã gửi lời mời qua (.+)…$/, 'invitation sent via $1…'],
  [/^đã nối (.+), chờ chào$/, 'connected to $1, waiting for hello'], [/^P2P mở sau (\d+) ms$/, 'P2P open after $1 ms'],
  [/^(\d+) giây không trả lời$/, 'no reply for $1 s'], [/^đang quét (.+)…$/, 'scanning $1…'],
  [/^(.+) · thử lại sau (\d+) s$/, (m, a, b) => `${tr(a)} · retry in ${b} s`], [/^Internet: nối (\d+) kênh \((.+)\)$/, 'Internet: $1 channels ($2)'],
  // thông báo máy chủ có số liệu
  [/^Sai mật khẩu quá nhiều lần\. Thử lại sau (\d+) phút$/, 'Too many wrong passwords. Try again in $1 min'],
  [/^Kỹ thuật viên đã có lịch với (.+) trùng giờ này$/, 'The technician already has an appointment with $1 at this time'],
  [/^Số dư gói không đủ \(còn (.+) đ\)$/, 'Not enough package balance ($1 VND left)'], [/^Không có mức thưởng (.+)$/, 'No bonus rate $1'],
  [/^Không nhận ra mã: (.+)$/, 'Unknown code: $1'], [/^Thao tác không tồn tại: (.+)$/, 'Unknown operation: $1'],
  [/^Cột (.+) phải là chữ$/, 'Field $1 must be text'], [/^Cột (.+) phải là số$/, 'Field $1 must be a number'],
  [/^Lỗi lưu dữ liệu: (.+)$/, 'Save error: $1'], [/^Mạng: (.+)$/, 'Network: $1'], [/^Không chụp được CSDL: (.+)$/, 'Could not snapshot the database: $1'],
  [/^Không ghi được (.+)$/, 'Could not write $1'], [/^Drive từ chối tải lên \(HTTP (\d+)\)$/, 'Drive refused the upload (HTTP $1)'],
  [/^Tải lên lỗi \(HTTP (\d+)\)$/, 'Upload error (HTTP $1)'], [/^Tải về lỗi \(HTTP (\d+)\)$/, 'Download error (HTTP $1)'],
  [/^Không đọc được danh sách trên Drive \(HTTP (\d+)\)$/, 'Could not list Drive files (HTTP $1)'],
  [/^(\d+) file nhật ký không mở được \(khác mật khẩu sao lưu\?\)$/, '$1 log files could not be opened (different backup password?)'],
  [/^Không tải được: (.+)$/, (m, a) => 'Could not load: ' + tr(a)],
];

// Cụm từ trong câu ghép nhiều phần (chỉ dùng khi câu còn chữ tiếng Việt sau 2 bước trên). Dài trước, ngắn sau.
const FRAG = [
  ['Ảnh chụp toàn bộ: mỗi ', 'Full snapshot: every '], [' giờ · lần cuối ', ' h · last '], ['Nhật ký: ', 'Log: '], ['chưa đưa lên', 'not uploaded yet'],
  ['đưa lên ', 'uploaded '], [' thay đổi chờ', ' changes pending'], [' · còn ', ' · '], [' · đã đủ', ' · up to date'],
  [' · đang trực', ' · on duty'], ['đồng bộ qua mạng nội bộ', 'syncing via local network'], ['đồng bộ qua ', 'syncing via '],
  ['mất liên lạc ', 'no contact for '], [' giây', ' s'], ['phút trước', 'min ago'], ['giờ trước', 'h ago'], ['ngày trước', 'days ago'],
  ['chưa đăng nhập', 'not logged in'], ['chưa có', 'none'], [' · Internet: ', ' · Internet: '], [' kênh', ' channels'],
  ['Nội bộ: ', 'Local: '], ['đồng bộ qua mạng nội bộ', 'syncing via local network'], ['): nội bộ', '): local'],
  ['Đường dùng: nội bộ ', 'Path: local '], ['Đường dùng: kênh ', 'Path: channel '], ['Đường dùng: ', 'Path: '],
  ['Mạng thay đổi', 'Network changed'], [' → dò nội bộ ngay', ' → probing local network'], ['không có lời chào, bỏ', 'no hello, dropped'],
  ['Nội bộ: quét thấy ', 'Local: scan found '], ['Nội bộ: thấy máy chủ ở ', 'Local: server found at '], ['Nội bộ: mất kết nối ', 'Local: disconnected '],
  [' · máy ', ' · device '],
];
const VI = /[À-ỹđĐ]/;
function tr(s) {
  if (EN[s] != null) return EN[s];
  const k = s.trim();
  if (!k) return s;
  const lead = s.slice(0, s.indexOf(k)), tail = s.slice(s.indexOf(k) + k.length);
  if (EN[k] != null) return lead + EN[k] + tail;
  for (const [re, rep] of RX) if (re.test(k)) return lead + k.replace(re, rep) + tail;
  if (!VI.test(k)) return s;
  let out = k;
  let hit = false;
  for (const [a, b] of FRAG) if (out.includes(a)) { out = out.split(a).join(b); hit = true; }
  return hit ? lead + out + tail : s;
}
const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    if (EN[s] != null) return EN[s];                 // kể cả chữ không dấu: "Kho", "Thu chi"
    if (!VI.test(s)) return s;
    const p = s.match(/^(\[[\d:]+\] )([\s\S]*)$/);    // dòng nhật ký có giờ ở đầu
    return p ? p[1] + tr(p[2]) : tr(s);
  },
  wd: i => (lang === 'en' ? WD_EN[i] : null),
};
})();
