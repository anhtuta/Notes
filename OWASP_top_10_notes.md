# TOP 10 WEB APPLICATION SECURITY RISKS
Hàng năm, OWASP (the Open Web Application Security Project) công bố 10 lỗ hổng bảo mật hàng đầu

## 1. Injection

## 2. Broken Authentication

## 3. Sensitive Data Exposure

## 4. XML External Entities (XXE)

## 5. Broken Access Control

## 6. Security Misconfiguration

## 7. Cross-site Scripting (XSS)

## 8. Insecure Deserialization

## 9. Using Components with Known Vulnerabilities

## 10. Insufficient Logging & Monitoring

## CSRF (Cross Site Request Forgery - Giả mạo request liên trang, còn có tên khác là XSRF)
### Example 1
- Trang https://phimmoi.net/account/change-password là trang dùng để đổi password, có nội dung form như sau
```
<form method='post' action='account/save-pw'>
  <input type='password' name='password' />
  <input type='password' name='password_confirm' />
  <input type='submit' value='Save' />
</form>
```
- Hacker tạo 1 trang giả mạo domain là https://hacker-blog.com/download-pts:
```
<img src='download-pts-free' />
<form method='post' action='https://phimmoi.net/account/save-pw'>
  <input type='password' name='password' value='123456' hidden />
  <input type='password' name='password_confirm' value='123456' hidden />
  <input type='submit' value='Click here to download Photoshop for free' />
</form>
```
- User vào trang hacker-blog trên, click vào link "Click here to download Photoshop for free", thì trang này lập tức tạo 1 request tới trang phimmoi.net yêu cầu đổi password của chính user đó! Done, giờ password của user này đã bị đổi thành 123456

### Example 2
- Tiếp diễn ví dụ trên, user vừa mở 1 tab vào Vietcombank, vừa mở 1 tab vào trang https://hacker-blog.com/download-pts. Giả sử user đã login vào hệ thống ngân hàng của Vietcombank, username của người đó trên Vietcombank là tuzaku, và username của hacker trên Vietcombank là liliana.
- Cũng trên trang hacker-blog đó, hacker tạo 1 thẻ img với nội dung như sau:
```<img src='https://vietcombank.net/transfer-money?from=tuzaku&to=liliana&amount=1000' />```
- Và cũng giả sử rằng trang vietcombank.net trên do bảo mật yếu, đội dev khá nghiệp dư nên họ thiết kế để có thể chuyển tiền bằng method=GET. Ngay khi user truy cập trang hacker-blog đó, 1 request chuyển tiền 1000$ từ tài khoản của user sang tài khoản của hacker đã thực hiện

### Phòng chống
- Sử dụng CSRF Token: Trong mỗi form hay request, ta đính kèm một CSRF token. Token này được tạo ra dựa theo session của user. Khi gửi về server, ta kiểm tra độ xác thực của session này. Do token này được tạo ngẫu nhiên dựa theo session nên hacker không thể làm giả được (Các framework như RoR, CodeIgniter, ASP.NET MVC đều hỗ trợ CSRF token):
```
<form method='post' action='account/save-pw'>
  <input type='password' name='password' />
  <input type='password' name='password_confirm' />
  <input type='text' hidden name='csrf_token' value='random-string-generated-by-server' />
  <input type='submit' value='Save' />
</form>
```

# Ref
- https://owasp.org/www-project-top-ten/
- https://www.hacksplaining.com/owasp
