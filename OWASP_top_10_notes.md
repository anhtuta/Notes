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
```html
<form method='post' action='account/save-pw'>
  <input type='password' name='password' />
  <input type='password' name='password_confirm' />
  <input type='submit' value='Save' />
</form>
```
- Hacker tạo 1 trang giả mạo domain là https://hacker-blog.com/download-pts:
```html
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
```html
<form method='post' action='account/save-pw'>
  <input type='password' name='password' />
  <input type='password' name='password_confirm' />
  <input type='text' hidden name='csrf_token' value='random-string-generated-by-server' />
  <input type='submit' value='Save' />
</form>
```

### Note: No cookies = No CSRF
Trong 2 ví dụ trên, trang phimmoi và trang vietcombank bắt buộc user phải login mới có thể đổi pass hay là chuyển tiền. Và sau khi user login xong, rồi vào trang của hacker mới click vào URL nhiễm mã độc đó. Bởi vì nếu user chưa login thì có click vào cũng chả sao, vì phía server sẽ từ chối request đó do chưa được xác thực.

Giả sử server phía backend xác thực bằng cookie (chứ ko dùng JWT), tức là server dùng session để lưu trạng thái user. Flow của việc authen bằng session như sau:
- User login thành công, server tạo 1 sessionID lưu thông tin user, sau đó set cookie cho browser của user có dạng: sessionID=abc. Cookie này có flag httpOnly = true nên ko thể đọc được từ ```document.cookie```
- Mỗi request tới server, browser tự động gửi kèm sessionID lên server (do cơ chế của browser là tự động gửi mọi cookie theo), server dùng sessionID để xác thực đó là user nào

Sau khi user vào trang của hacker và click vào đường link độc, 1 request sẽ gửi về phimmoi/vietcombank kèm theo sessionID mà user đã login trước đó, thế nên hacker mới có thể hại được user! (Mặc dù hacker **KHÔNG trộm được sessionID**, do cookie này thường có flag ```httpOnly=true```)

Nếu như server ko authenticate user dùng cookie (thay vào đó có thể dùng JWT chẳng hạn) thì sẽ chẳng có tấn công CSRF!

### Config CSRF with Spring Boot and ReactJS app
- Config Spring security dùng ```CookieCsrfTokenRepository```, nó sẽ gửi tới browser 1 cookie tên là ```XSRF-TOKEN```
- Phía ReactJS (Frontend) dùng cookie đó và **gửi ngược lại** phía Backend ở header, với tên header là ```X-XSRF-TOKEN```. Note: việc gửi kèm header này chỉ cần với các API thay đổi data (Method = PUT/POST/PATCH/DELETE), còn việc get data thì ko cần thiết

Phía Backend config như sau:
```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  http
    .csrf()
      .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
      .and()
    .authorizeRequests()
      .antMatchers("/", "/api/user").permitAll()
      .anyRequest().authenticated();
}
```
```withHttpOnlyFalse()``` để set flag ```httpOnly=false```, thì phía browser mới đọc được cookie XSRF-TOKEN này thông qua ```document.cookie```

Phía Frontend config như sau: Nếu dùng Axios thì chả cần config gì đâu, bở vì Axios **tự động check** xem có tồn tại cookie ```XSRF-TOKEN``` hay ko, nếu có thì nó **tự động gửi** kèm 1 header tên là ```X-XSRF-TOKEN``` với mỗi request tới server. Hình như framework Laravel cũng có tự động gửi header như vậy đó: https://inertiajs.com/csrf-protection
# Ref
- https://owasp.org/www-project-top-ten/
- https://www.hacksplaining.com/owasp
