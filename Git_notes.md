## Gitflow
### Gitflow là gì
Gitflow là 1 quy trình làm việc với Git

### CÁc branch dùng trong gitflow
- Gồm 5 nhánh sau: ```master, develop, feature, release, hotfix```
- 2 nhánh ```develop``` và ```master``` (và chỉ 2 nhánh này) tồn tại mãi mãi, nên có thể gọi chúng là ```main branch```. Các nhánh còn lại: ```feature```, ```release```, ```hotfix``` gọi là ```support branch```, sẽ có vòng đời ngắn hơn và cuối cùng sẽ bị xóa bỏ sau khi hoàn thành nhiệm vụ
- Nhánh ```master``` là nhánh mà source code của HEAD lưu trữ trạng thái mới nhất của production
- Nhánh ```develop``` là nhánh mà source code của HEAD lưu trữ các thay đổi, tính năng (feature) mới nhất cho lần phát hành tiếp theo
- Nhánh ```feature```:
  + Rẽ nhánh (branch off) từ: ```develop```
  + Sẽ được merge vào: ```develop```
  + Convention: ```feature-*```
  + Dùng để phát triển tính năng mới cho lần release tiếp theo
  + Các nhánh ```feature``` **KHÔNG** bao giờ **tương tác trực tiếp** với nhánh **master**
  + Sau khi tạo nhánh ```release``` từ nhánh ```develop``` thì **KHÔNG** có thêm nhánh ```feature``` nào được tạo thêm nữa (tức là sau giai đoạn này, sản phẩm ko còn tính năng mới hay issue, bug mới nào nữa)
- Nhánh ```release```:
  + Rẽ nhánh từ: ```develop```
  + Sẽ được merge vào: ```develop``` và ```master``` (cùng 1 lúc)
  + Convention: ```release-*```
  + Dùng để release 1 phiên bản mới trên production
- Nhánh ```hotfix```:
  + Rẽ nhánh từ: ```master```
  + Sẽ được merge vào: ```develop``` và ```master``` (cùng 1 lúc)
  + Convention: ```hotfix-*```
  + Dùng để fix critical bug (bug mà cần fix ngay lập tức) trên production
- Nhánh ```release``` và ```hotfix``` có 1 điểm chung là đều merge vào 2 nhánh ```develop``` và ```master```

### Quy trình của gitflow
Updating...

### Ref
- https://danielkummer.github.io/git-flow-cheatsheet/index.vi_VN.html
- https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- https://nvie.com/posts/a-successful-git-branching-model/