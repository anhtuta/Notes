Giả sử hệ thống OpenID provider có tên là ADFS. Đầu tiên cần đăng ký với OpenID provider (tức là hệ thống ADFS đó), cần cung cấp cho ADFS endpoint_success=https://backend-app.com/api/sso/action, là URL sau khi login với ADFS thành công thì ADFS sẽ redirect về đó (kèm theo 1 jwt)

Sau khi đăng ký, ADFS sẽ cấp cho các info sau:
- client_id=aaa-bbb-111
- secret_key=abcdef12345
- cert_key=abcxyz123456@hahaha
- ...

Flow login SSO = ADFS:
1. Đầu tiên user sẽ vào trang login bên FE
2. FE gọi API: /api/sso/login, API này return 1 URL, là URL của ADFS. URL có dạng:
https://openid-url.com/oauth2/authorize?client_id=aaa-bbb-111&redirect_uri=https://backend-app.com/api/sso/action&response_mode=form_post&response_type=code+id_token&scope=openid+profile&nonce=randomString
3. FE (Trình duyệt) sẽ redirect tới URL ở trên và user sẽ login = account ADFS (login trên giao diện của ADFS)
4. Login xong thì ADFS sẽ redirect tới endpoint_success, việc redirect này tương đương với việc gọi tới API /api/sso/action (method=GET) phía BE, kèm theo id_token (format JWT)
5. Bên BE sẽ verify signature của JWT trên (dùng cert_key ở trên để verify), rồi check xem jwt còn hạn nữa ko... Nếu jwt hợp lệ thì sẽ đọc được epid từ JWT đó (epid tương đương với username của người dùng)
6. Bên BE sinh ra 1 chuỗi random, gọi là otp, và lưu vào otpMap với key=otp, value=epid ở bước 4 (value có thể là 1 object userInfo với data lấy từ jwt, nói chung tùy bài toán cần lưu gì)
7. Sau đó BE redirect về trang của FE, kèm theo param epid và otp ở trên. VD như sau:
   http://localhost:4202/user/login?epid=D150624094540C100408&otp=aea9ef8d-83fc-4243-af30-2dcd9ad3653a
8. Bên FE dùng 2 tham số này, gọi API login cũ (API getAccessToken) (API login hiện tại đang dùng đó, theo chuẩn oauth2), nhưng với 1 vài tham số khác, cụ thể như sau:
- POST: https://localhost:8088/oauth/token
- Header: Basic=R1JDRGFzaGJvYXJkOkdSQ1NlY3JldDIwMThASG5mZHc=
- Body:
  + grand_type = sso_adfs
  + client_id = ...
  + client_secret = ...
  + token = aea9ef8d-83fc-4243-af30-2dcd9ad3653a (chính là cái otp ở trên đó)
  + epid = D150624094540C100408 (chính là cái epid lấy ở trên, từ JWT đó)

Flow getAccessToken như sau:
- Check epid từ body của request: nếu !otpMap.containsKey(otp) thì throw exception. Ngược lại: get userInfo từ otpMap đó, lấy được epid: otpMap.get(otp).getEpid()
- Từ epid query trong database lấy được roles của user
- Remove otp khỏi otpMap (do đó API getAccessToken này chỉ dùng được 1 lần)
- Set authentication object với username=epid, roles=roles ở trên cho SecurityContextHolder của Spring Security là xong:
```java
protected OAuth2Authentication getOAuth2Authentication(ClientDetails client, TokenRequest tokenRequest) {
  ...
  Authentication user = new UsernamePasswordAuthenticationToken(userInfo.getEpid(), "N/A", roles);
  OAuth2Authentication authentication = new OAuth2Authentication(tokenRequest.createOAuth2Request(client), user);
  authentication.setDetails(userInfo);
  return authentication;
}
```
9. Sau đó BE sẽ trả về access_token, chẳng hạn như:
```
{
  "access_token": "230e6e76-76c0-4485-b034-68402c1762c0",
  "token_type": "bearer",
  "refresh_token": "5ae471dc-48b5-411f-bb17-1037feae87bb",
  "expires_in": 86399,
  "scope": "read",
  "username": "tuzaku"
}
```
10. Xong rồi, còn lại FE lưu access_token và làm như bình thường