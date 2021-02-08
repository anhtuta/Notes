## Gitflow
### Gitflow là gì
Gitflow là 1 quy trình làm việc với Git

### Các branch dùng trong gitflow
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
- Khởi tạo dự án: tạo nhánh ```develop``` từ ```master```
- Có task (feature mới, bug mới), team member pull latest code từ ```develop``` về, sau đó tạo 1 nhánh feature từ ```develop```. Giả sử team dùng Jira quản lý dự án, và tên jira ticket là IAGENT-123 chẳng hạn (IAGENT là tên project), thì có thể tạo 1 nhánh tên là ```feature-123``` hoặc ```IAGENT-123``` ở *local*: ```git checkout -b feature-123```
- Member làm xong task thì sẽ push lên để tạo Pull request (PR). Nhưng trước khi push cần lấy latest code của nhánh develop về trước đã (vì nhánh develop lúc này có thể có thêm các commit của các member khác đã push trước đó). Có 3 cách để lấy latest code từ develop:
  + Cách 1: merge branch develop vào nhánh hiện tại: ```git pull origin develop```. Cách này sẽ tạo ra 1 commit có tên là "Merge branch 'develop' into feature-123"
  + Cách 2: do việc merge như cách 1 sẽ tạo thêm 1 commit merge gây thừa, nên có cách khác là rebase từ nhánh develop. Đầu tiên checkout sang develop, sau đó pull code develop về: ```git pull```. Sau đó checkout lại sang branch feature-123, rồi rebase. Trước khi rebase, cần stash trước: ```git stash```. Sau đó rebase: ```git rebase develop```. Rồi lấy bản code từ stash ra: ```git stash pop```. Lúc này nếu có conflict thì sửa, sau đó push code lên
  + Cách 3: giống cách 1, nhưng bỏ commit merge đi bằng cách reset HEAD về commit trước commit merge (có thể dùng cli hoặc gitk để reset), rồi push -f nhánh feature-123 lên remote :v
- Tạo Pull request (PR) từ ```feature-123``` -> ```dev```
- Chờ teamlead và các member khác review PR, nếu lỗi thì sửa rồi push -f lại (để đảm bảo mỗi PR chỉ có 1 commit). Xong xuôi merge PR vào dev
- Sau khi làm xong hết các feature, build 1 bản lên môi trường staging và request team QA test sản phẩm
- Trong quá trình test nếu phát hiện lỗi, đội dev lại tạo nhánh mới từ develop và fix các issue này như quá trình phát triển các feature mới
- Test xong xuôi hết, tạo 1 nhánh release từ develop, giả sử tên là ```release-20210208``` (ứng với ngày release). Tất nhiên mọi thứ phải làm xong trước ngày release. Từ lúc này tới ngày release, nếu trên staging có bug thì sẽ fix bug trên nhánh release đó
- Tới ngày release: deploy nhánh ```release-20210208``` lên môi trường production
- Merge lại nhánh ```release-20210208``` vào ```develop``` và ```master```. Gắn tag cho nhánh ```master```, sau đó có thể xóa bỏ nhánh ```release-20210208```
- Nếu phát hiện lỗi trên production: tạo 1 nhánh hotfix để fix sớm, sau đó tạo PR và merge nhánh đó vào ```develop``` và ```master```

### Ref
- https://danielkummer.github.io/git-flow-cheatsheet/index.vi_VN.html
- https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- https://nvie.com/posts/a-successful-git-branching-model/

## git reset
Đầu tiên cần biết git có 3 khu vực (area) như hình vẽ, gọi tắt là working area, staging area, repository area

![git-index.png](./photos/git-index.png)

- Working area: lưu trữ những thay đổi trên các file
- Staging area: lưu trữ các file được thay đổi để chuẩn bị cho commit
- Repository area: lưu trữ các file đã được commit ở staging area

Giả sử trong working area hiện tại, ta sửa file abc.txt và sau đó add nó vào staging area: ```git add abc.txt```

```git reset --hard```:
- Reset HEAD về commit commit_sha1
- Xóa bỏ mọi thay đổi trên working directory (khu vực này đang có file abc.txt được thay đổi, và các file đã thay đổi ở commit_sha1)
- Xóa bỏ mọi thứ trên staging area
- Nếu ko chỉ rõ commit_sha1 thì HEAD vẫn giữ nguyên

```git reset --mixed commit_sha1``` (đây là chế độ mặc định, nếu ko thêm option cho lệnh reset thì git sẽ hiểu đó là --mixed):
- Reset HEAD về commit commit_sha1
- Giữ lại mọi thay đổi working directory (lúc này khu vực này sẽ gồm file abc.txt được thay đổi, và các file đã thay đổi ở commit_sha1)
- Xóa bỏ mọi thứ trên staging area, tức là lúc này staging area ko có file nào
- Nếu ko chỉ rõ commit_sha1 thì HEAD vẫn giữ nguyên

```git reset --soft commit_sha1```:
- Reset HEAD về commit commit_sha1
- Giữ lại mọi thay đổi working directory
- Giữ lại mọi thứ trên staging area (lúc này khu vực này gồm file abc.txt và các file ở commit_sha1)
- Nếu ko chỉ rõ commit_sha1 thì lệnh này chả có tách dụng gì!

Ref:
- https://www.javatpoint.com/git-index
- https://www.javatpoint.com/git-reset
