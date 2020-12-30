## Technical stack là gì?
- Technical Stack, còn gọi là solution stack, là một tập hợp những phần mềm/công nghệ phối hợp chung với nhau, tạo thành một nền tảng để ứng dụng có thể hoạt động được.
- Một stack thông thường sẽ được cấu tạo bởi các thành phần:
  + Hệ điều hành.
  + Webserver.
  + Database.
  + Back-end Programming Language

## ELK stack là gì?
- Một công cụ mạnh mẽ dùng để quản lý và phân tích log tập chung.
- ELK là tập hợp 3 phần mềm đi chung với nhau, phục vụ cho công việc logging:
  + Elasticsearch: Cơ sở dữ liệu để lưu trữ, tìm kiếm và query log.
  + Logstash: Tiếp nhận log từ nhiều nguồn (chẳng hạn đọc từ file, hoặc server gửi UDP request chứa log tới URL của Logstash, hoặc Beat đọc file log và gửi lên Logstash), sau đó xử lý log và ghi dữ liệu vào Elasticsearch.
  + Kibana: Giao diện để quản lý, thống kê log. Đọc thông tin từ Elasticsearch.
- Cơ chế hoạt động:
  + Log sẽ được đưa đến Logstash
  + Logstash sẽ đọc những log này, thêm thông tin (thời gian, IP...), parse dữ liệu từ log (server nào, độ nghiêm trọng, nội dung log) ra, sau đó ghi xuống database là Elasticsearch.
  + Kibana sẽ đọc thông tin log trong Elasticsearch, hiển thị lên giao diện cho người dùng query và xử lý.

## Ưu điểm
- Logstash có thể đọc được log từ rất nhiều nguồn: từ log file, log database cho đến UDP hay REST request
- Dễ tích hợp: cho dù hệ thống dùng Nginx hay Apache, dùng MSSQL, MongoDB hay Redis, Logstash đều có thể đọc hiểu và xử lý log
- Scale cực tốt do Logstash và Elasticsearch chạy trên nhiều node. Khi có thêm service, thêm người dùng, muốn log nhiều hơn: chỉ việc thêm node cho Logstash và Elasticsearch là xong
- Thu thập, hiển thị, truy vấn theo thời gian thực
- Có thể đáp ứng truy vấn một lượng dữ liệu cực lớn
- Search và filter mạnh mẽ: Elasticsearch cho phép lưu trữ thông tin kiểu NoSQL, hỗ trợ luôn Full-Text Search nên việc query rất dễ dàng và mạnh mẽ

### Elasticsearch
- Là một RESTful distributed search engine (nó cung cấp khả năng tìm kiếm phân tán qua API)
- Lưu trữ dữ liệu theo dạng NoSQL database
- Elasticsearch rất nhanh, thực sự rất nhanh.
- Có thể chạy nó trên hàng trăm server với hàng petabyte dữ liệu

### Logstash.
- Có chức năng phân tích cú pháp của các dòng dữ liệu: dữ liệu đầu vào khó đọc, chưa có nhãn => dữ liệu có cấu trúc, được gán nhãn
- Luôn có 3 phần: Input, Filter, Output
- Bình thường khi làm việc với Logstash, sẽ phải làm việc với Filter nhiều nhất. Filter hiện tại sử dụng Grok để phân tích dữ liệu

### Kibana.
- Kibana được phát triển riêng cho ứng dụng ELK
- Thực hiển chuyển đổi các truy vấn của người dùng thành câu truy vấn mà Elasticsearch có thể thực hiện được
- Kết quả hiển thị bằng nhiều cách: theo các dạng biểu đồ

## Khi nào thì sử dụng ELK stack
- Với các hệ thống nhỏ: ko cần sử dụng ELK stack làm gì, chỉ cần dùng thư viện ghi log đi kèm với ngôn ngữ, sau đó ghi log ra file rồi đọc bình thường.
- Với những hệ thống lớn nhiều người dùng, có nhiều service phân tán (microservice), có nhiều server chạy cùng lúc...:
  + Việc ghi log xuống file không còn hiệu quả nữa
  + Số lượng server trên hệ thống là nhiều nên không thể dùng cách thủ công là remote vào từng máy rồi đọc log của từng server được
  + ELK stack sẽ giải quyết vấn đề trên: ELK stack sẽ ghi log tập chung vào một chỗ giúp dễ dàng quản lý log trên toàn hệ thống

## Cài đặt trên Windows
- Download zip file từ trang chủ, bao gồm: filebeat, logstash, elasticsearch, kibana. Sau đó giải nén.
- Giả sử ta muốn lưu thu thập và phân tích, lưu trữ log trong thư mục D:/logs/. Flow sẽ như sau:
  + Filebeat sẽ theo dõi sự thay đổi trong thư mục chứa các file log, khi có bất kỳ thay đổi nảo, nó sẽ thu thập và đẩy sang logstash
  + Logstash cũng luôn lắng nghe input từ filebeat, và sau khi nhận được input, nó sẽ filter rồi chuyển data sang cho elasticsearch với 1 index nào đó
  + Elasticsearch lưu data đó lại
  + Kibana hiển thị data, có thể tìm kiếm, query log trên trang UI này
- Config filebeat: sửa filebeat.yml với nội dung sau để đọc tất cả các file .log trong thư mục D:/logs/:
```
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - D:/logs/*.log
```
- Run filebeat: vào thư mục filebeat vừa giải nén mở cmd và run:
```
.\filebeat -e -c filebeat.yml -d "publish"
``` 
- Có thể tạo alias để run trên gitbash như sau: thêm vào file .bashrc (Trong thư mục C:/User/yourusername) dòng sau:
```
alias filebeat='D:/Downloads/ELK/filebeat-7.10.1/filebeat -e -c D:/Downloads/ELK/filebeat-7.10.1/filebeat.yml -d "publish"';
```
- Trong đó "D:/Downloads/ELK/filebeat-7.10.1" là thư mục giải nén filebeat. Run alias ```filebeat``` trên git bash
- Tiếp theo, config logstash để nhận dữ liệu từ filebeat và gửi sang elasticsearch, tạo file logstash.conf ở thư mục vừa giải nén logstash với nội dung sau:
```
input {
    beats {
        port => 5044
        type => "log"
    }
}
output {
    elasticsearch {
        hosts => ["localhost:9200"]
        index => "logstash-api-%{+yyyy.MM.dd}"
    }
}
```
- Trong đó:
  + beats: logstash sẽ lắng nghe trên port 5044 để nhận log input được gửi từ beat
  + index: tên index sẽ được tạo bên elasticsearch với input vừa nhận từ beat
- Run logstash: vào thư mục logstash vừa giải nén mở cmd và run:
```
bin\logstash -f logstash.conf --config.reload.automatic
```
- Trong đó: ```--config.reload.automatic``` giúp logstash tự động reload mỗi khi file logstash.conf thay đổi
- Install elasticsearch: https://www.elastic.co/guide/en/elasticsearch/reference/current/zip-windows.html
- Nên install elasticsearch như 1 service trên Windows, elasticsearch sẽ start 1 cách tự động. Sau khi start có thể xem các index tại: http://localhost:9200/_cat/indices?v
- Start kibana: Chỉ cần run file kibana.bat trong thư mục /bin là được. Trang UI của Kibana: http://localhost:5601/

## Ref
- https://blog.cloud365.vn/logging/ELK-part1-tong-quan-ve-elk-stack/
