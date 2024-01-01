# Project overview | Nodejs v20

## App chạy trên localhost, port 3000

## Xem file .env để custom các biến khi run app 

## Kiến trúc:
Middleware - Controller - Service - Repository
Middleware chiều đi sẽ gọi thư viện cors, chiều về sẽ trả về các lỗi đến client.
Controller thực hiện nhận các tham số request, truyền vào cho Service xử lý, nhận lỗi và xử lý, trả về kết quả về client, check permission.
Service validate và format các tham số từ layer Controller, sau đó gọi Repository.
Repository giao tiếp với layer Service, tương tác database để thao tác dữ liệu.

## Thiết kế Restful api:
+ Áp dụng versioning, resource name, plurals
GET /v1/accounts/1
POST /v1/accounts

{
&nbsp;&nbsp;&nbsp;&nbsp;"name": "Created Admin",
&nbsp;&nbsp;&nbsp;&nbsp;"phone": "1231123123",
&nbsp;&nbsp;&nbsp;&nbsp;"role": "EMPLOYEE",
&nbsp;&nbsp;&nbsp;&nbsp;"username": "Administrator1",
&nbsp;&nbsp;&nbsp;&nbsp;"password": "Abc123@dawd"
}

+ Áp dụng filtering, sorting, pagination
GET /v1/accounts?role=EMPLOYEE&sort_by=_id&order_by=asc&limit=10&offset=1
+ Áp dụng CORS policy: 
Chấp nhận mọi origin, giới hạn trong 4 method: GET, POST, PATCH, DELETE
+ Authentication:
Tạo Access token theo chuẩn JWT. Generate, verify, refresh. 
+ Authorization:
Dùng field role để phân quyền.
+ Các quyền của role Employee:
Đăng ký tài khoản Employee, Xem và sửa thông tin chính mình.
+ Các quyền của role Admin:
Xem danh sách Employee, Tạo tài khoản Admin khác, Xem danh sách admin khác (ko hiện password), Sửa Admin chính mình và Empployee (không sửa được Admin khác), Xóa Admin chính mình và Employee (Không xóa được Admin khác).
Sau khi đăng ký tài khoản, người dùng phải gọi api login để request các resource khác.

## Design Pattern: 
+ Singleton: Đứng tại file nào trong source, nếu muốn dùng Postgres instance thì bắt buộc phải gọi phương thức getInstance chứ không được khởi tạo lại class.
+ Repository Pattern: layer Repository giao tiếp với database và layer Service.

## Logging:
+ Sử dụng thư viện winston
+ Nếu môi trường khác 'production' thì chỉ in ra console, ngược lại in ra cả console và file tại logs/events.log, setup nếu file vượt quá 5MB thì auto in ra một file khác, tối đa 50 file.

## Error handling, xem file common/errors.handler.ts và common/errors.app.ts
a. Middleware validate:
+ Xử lý lỗi từ database Postgres
+ Xử lý các route không tồn tại
+ Xử lý các lỗi HTTP
+ Xử lý Xác thực người dùng
+ Xử lý phân quyền. 

b. Lỗi hệ thống:
+ Lắng nghe lỗi từ các promise chưa được handle lỗi
+ Lắng nghe lỗi đối với case có hoặc không có đoạn mã: throw new Error(...)

## Kết nối đến database bằng pool thay vì một kết nối client duy nhất.
+ max: 20 (Pool size)
+ idleTimeoutMillis: 30000 (Thời gian tối đa cho một kết nối idle)
+ connectionTimeoutMillis: 2000 (Thời gian timeout cho một kết nối mới nếu thất bại)

## Một số method trong các class em có dùng arrow function chủ yếu để fix issue từ khóa this bị undefined

## Test cases:
a. Role EMPLOYEE
+ Đăng ký thành công tài khoản EMPLOYEE
+ Đăng ký thất bại tài khoản EMPLOYEE do nhập sai format
+ Get thành công detail EMPLOYEE chính mình
+ Get thất bại detail của EMPLOYEE khác
+ Update thành công tài khoản EMPLOYEE chính mình
+ Update thất bại tài khoản EMPLOYEE người khác
+ Delete thành công tài khoản EMPLOYEE chính mình
+ Delete thất bại tài khoản EMPLOYEE người khác

b. Role ADMIN
(Admin đầu tiên là người tự tạo account cho mình trong database)
+ Admin tạo thành công tài khoản cho một Admin khác
+ Admin tạo thất bại tài khoản cho một Admin khác do nhập sai format
+ Tạo thành công tài khoản EMPLOYEE bằng tài khoản ADMIN
+ Get thành công list detail
+ Update thành công tài khoản ADMIN
+ Update thành công tài khoản EMPLOYEE
+ Delete thành công tài khoản ADMIN
+ Delete thành công tài khoản EMPLOYEE

## Script tạo bảng:
CREATE TABLE IF NOT EXISTS table_test2 (
  _id serial PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL default CURRENT_TIMESTAMP
);
        