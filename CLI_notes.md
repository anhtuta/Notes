## Cách tạo alias trên cmd windows 10
- Đầu tiên tạo 1 file cmd để chứa các alias đó, giả sử tạo tại thư mục ```D:\Documents\alias.cmd```
- Windows + R, gõ regedit.exe, sau đó đi đến ```HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor```
- Tạo 1 String value: Edit -> New -> String Value, đặt tên là ```AutoRun```
- Double click vào AutoRun, sửa giá trị cho nó trỏ tới file alias ở trên: ```D:\Documents\alias.cmd```
- Bây giờ chỉ việc sửa file alias.cmd là xong. Ví dụ đơn giản nội dung file đó như sau:
```cmd
@echo off

:: Commands
DOSKEY ls=dir /B
DOSKEY zoo=E:\Java\kafka_2.13-2.7.0\bin\windows\zookeeper-server-start.bat E:\Java\kafka_2.13-2.7.0\config\zookeeper.properties
DOSKEY kafka=E:\Java\kafka_2.13-2.7.0\bin\windows\kafka-server-start.bat E:\Java\kafka_2.13-2.7.0\config\server.properties

:: Common directories
DOSKEY awesome=cd /d "D:\Documents\Javascript\awesome-react"
```
- Ref: https://stackoverflow.com/a/21040825/7688028

## SSH: Authentication with key pair
### Có 2 cách để truy cập vào server linux (hiện tại biết 2 cách này):
- Dùng username, password
- Dùng key pair

### Cách dùng key pair
- Nếu dùng username, password thì đơn giản rồi, có thể dùng các phần mềm như putty, mobaxterm rồi tạo 1 SSH session mới, nhập username và password là login được. Tuy nhiên cách này để lộ password
- Do đó nếu ko muốn lộ password thì có thể dùng key pair. Đơn giản như sau:
  + User (client) generate 1 cặp key public/private (thuật toán RSA...)
  + Sau đó đưa public key cho server
  + Server lưu lại public key ở file ~/.ssh/authorized_keys (paste public key vào file này là xong). Thường thì 1 server có thể cho phép nhiều client ssh từ xa, do đó file này sẽ chứa nhiều public key của các client đó (lưu mỗi key trên 1 dòng)
  + Client giữ private key và ko để tiết lộ. Giờ client muốn access vào server thì có thể ssh với lệnh sau (giả sử server có public IP là 115.123.45.67, và username để truy cập server là tuzaku. Chạy lệnh sau trên terminal trong thư mục chứa file private key):
  ```
  ssh -i rsa_prv tuzaku@115.123.45.67 -p 1010
  ```
  + Trong đó rsa_prv là tên file private key. 1010 là port ssh. Nếu mặc định port ssh là 22, thì có thể bỏ option -p
  + Nếu private key có passphrase thì sau đó phải nhập passphrase, vậy là đã ssh thành công tới server
- Note: khi gen key dùng putty có thể sai format, tham khảo tại:
https://stackoverflow.com/questions/42863913/key-load-public-invalid-format

### Bind port
- Giả sử trên server có cài mysql chạy trên cổng 3306. Ta muốn access vào mysql từ localhost (tất nhiên có thể lên server access được vào mysql qua cổng 3306 sau khi ssh, nhưng muốn access vào database từ máy client, tức là localhost, thì làm như sau)
- Sử dụng chức năng ssh tunnel, bind port 3306 trên server với port 23306 trên máy client:
```
ssh -i rsa_prv tuzaku@115.123.45.67 -p 1010 -L 23306:127.0.0.1:3306
```
- Như vậy trên máy client có thể tạo 1 connection trên mysql workbench qua cổng 23306

## Cách tạo alias trên git bash windows 10
- Mỗi lần muốn ssh tới server ta đều phải vào thư mục chứa file private key rồi chạy lệnh ssh như trên, khá phiền và dài dòng. Có thể tạo 1 allias trên window như sau: vào thư mục C:\Users\tuzaku (giả sử user của máy hiện tại tên là tuzaku), tạo 1 file tên là ```.bashrc```, sau đó edit với nội dung sau:
```
alias huhu='ssh -i ~/.ssh/rsa_prv tuzaku@115.123.45.67 -p 1010 -L 23306:127.0.0.1:3306'
```
- Trong đó:
  + ```huhu``` là tên allias (thích đặt tên gì cũng được)
  + ```~/.ssh``` là thư mục chứa file private key
  + ```rsa_prv``` là tên private key
- Giờ muốn ssh tới server chỉ cần mở git bash lên và gõ lệnh ```huhu``` là được (chú ý: ko chạy được lệnh này trên window cmd, mà phải dùng git bash)
