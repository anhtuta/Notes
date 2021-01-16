## Cách tạo alias trên windows 10
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
