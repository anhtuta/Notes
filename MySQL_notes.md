## DISTINCT with NULL value
If a column has NULL values and you use the DISTINCT clause for that column, MySQL keeps one NULL value and eliminates the other because the DISTINCT clause treats all NULL values as the same value

## Bảng tạm phải có tên alias
Thêm 1 cột số thứ tự record vào kết quả query (dummy chỉ là tên bảng tạm,
ko có chức năng gì, nhưng bắt buộc phải có):
```sql
SELECT (@cnt := @cnt + 1) AS rowNumber, field_you_want
FROM your_table
CROSS JOIN (SELECT @cnt := 0) AS dummy;
```

## Quy ước đặt tên fk (my convention):
```fk_[referencing table name]_[referenced table name]_[referencing field name]```
thường thì 1 table sẽ có 1 PK, do đó referencing field name chính là field ID (PK) của table đó nên có thể bỏ đi
=> Tên ngắn gọn hơn: ```fk_[referencing table name]_[referenced table name]```

## sql_mode=only_full_group_by error
When MySQL's only_full_group_by mode is turned on, it means that strict ANSI SQL rules will apply when using GROUP BY. With regard to your query, this means that if you GROUP BY of the abc column, then you can only select two things:
- the abc column
- aggregates of any other columns (which means using an aggregate function such as MIN(), MAX(), or AVG() with another columns)
=> Ko thể SELECT các cột khác mà ko có bất kỳ phép toán aggregate trên nó

Cách bật trên MySQL Workbench:
```sql
SET sql_mode=(SELECT CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY'));
```

VD1:
```sql
SELECT id, name, COUNT(*)
FROM person p
GROUP BY p.name;

-- Lỗi ngay, vì cột id ko có trong mệnh đề GROUP BY, do đó ko thể select nó được, nếu muốn thì hãy select max(id):
SELECT MAX(id), name, COUNT(*)
FROM person p
GROUP BY p.name;

-- Tương tự với các cột trong ORDER BY:
SELECT name, COUNT(*)
FROM person p
GROUP BY p.name
ORDER BY id;

-- Lỗi, cần sửa lại như sau
SELECT name, COUNT(*)
FROM person p
GROUP BY p.name
ORDER BY MAX(id);

-- Ví dụ nữa, khá loằng ngoằng nhưng mà dễ nhận ra nó sai ở đâu:
SELECT 
    teamlab.team_code AS team_code,
    teamlab.team_abbreviation AS team_abbreviation,
    COUNT(*) AS cnt
FROM
    sr_project project,
    sr_teamlab teamlab
WHERE
    project.teamlab_code = teamlab.teamlab_code
    AND (project.project_year LIKE '2020')
    AND (project.project_status LIKE '%')
GROUP BY teamlab.team_abbreviation
ORDER BY teamlab.team_order

-- Lỗi ở chỗ SELECT team_code và ORDER BY team_order. Sửa lại:
SELECT 
    teamlab.team_code AS team_code,
    teamlab.team_abbreviation AS team_abbreviation,
    COUNT(*) AS cnt
FROM
    sr_project project,
    sr_teamlab teamlab
WHERE
    project.teamlab_code = teamlab.teamlab_code
    AND (project.project_year LIKE '2020')
    AND (project.project_status LIKE '%')
GROUP BY teamlab.team_code, teamlab.team_abbreviation
ORDER BY MAX(teamlab.team_order)
```

VD2:
```sql
SELECT DISTINCT
    teamlab.team_abbreviation AS teamAbbr
FROM
    sr_teamlab teamlab
WHERE
    teamlab.project_status_yn = 'Y'
ORDER BY teamlab.team_order
-- Error Code: 3065. Expression #1 of ORDER BY clause is not in SELECT list, references column 'swc.teamlab.team_order'
-- which is not in SELECT list; this is incompatible with DISTINCT
-- Nếu sửa như sau:
SELECT DISTINCT
    teamlab.team_abbreviation AS teamAbbr,
    teamlab.team_order AS teamOrder
FROM
    sr_teamlab teamlab
WHERE
    teamlab.project_status_yn = 'Y'
ORDER BY teamlab.team_order
-- Thì nó sẽ return kq là các cặp teamAbbr và teamOrder khác biệt, chứ ko phải teamAbbr khác biệt, mà
-- lúc đầu ta chỉ muốn lấy các teamAbbr thôi -> sai yêu cầu
-- Thử thêm MAX:
SELECT DISTINCT
    teamlab.team_abbreviation AS teamAbbr
FROM
    sr_teamlab teamlab
WHERE
    teamlab.project_status_yn = 'Y'
ORDER BY MAX(teamlab.team_order)
-- Lỗi: Error Code: 3029. Expression #1 of ORDER BY contains aggregate function and applies to the result of a non-aggregated query
-- Tức là ko thể dùng aggregate function ở ORDER BY vì đây là non-aggregated query
-- KL: đã SELECT DISTINCT thì ko thể ORDER BY theo cột khác được nữa, chỉ có thể order by những
-- cột mà có trong lệnh SELECT
-- Sửa lại như sau:
SELECT teamlab.team_abbreviation AS teamAbbr
FROM
    sr_teamlab teamlab
WHERE
    teamlab.project_status_yn = 'Y'
GROUP BY teamlab.team_abbreviation
ORDER BY MAX(teamlab.team_order)
```

## JPQL with list param
Giả sử ta có query với param là 1 list status như sau:
```java
@Query("SELECT user.name, user.status " + 
    "FROM User user " + 
    "WHERE user.status IN :sttList")
Page<Map<String, Object>> getUser(@Param("sttList") List<String> sttList);
```

Bây giờ ta muốn nếu như truyền vào list null thì sẽ ko filter theo status nữa (tức là lấy hết các user ra), thì có cách làm đơn giản như sau: check xem list nó null ko, nếu ko null mới filter theo status:
```java
@Query("SELECT user.name, user.status " + 
    "FROM User user " + 
    "WHERE (:sttList IS NULL OR user.status IN :sttList")
Page<Map<String, Object>> getUser(@Param("sttList") List<String> sttList);
```

Trông có vẻ ổn đó nhưng nếu sttList là 1 array có nhiều hơn 1 phần tử thì sẽ bị lỗi sau (1 phần tử thì ko sao):<br/>
```JPA QuerySyntaxException: unexpected AST node: {vector} For In condition```.<br/>
Bởi vì query sinh ra sẽ có dạng: "WHERE ((? , ?) IS NULL or status in (?, ?))".<br/>
Giải pháp là dùng hàm COALESCE, hàm này sẽ return 1 phần tử để check ở điều kiện: "((? , ?) IS NULL" => "(?) IS NULL":
```java
@Query("SELECT user.name, user.status " + 
    "FROM User user " + 
    "WHERE (COALESCE(:sttList, NULL) IS NULL OR user.status IN :sttList")
Page<Map<String, Object>> getUser(@Param("sttList") List<String> sttList);
```

## Hibernate N+1 problem
Xem ở đây nhé: https://github.com/anhtuta/Spring/tree/master/BootNPlusOne

## Gộp các câu query COUNT vào 1 câu query
Xét 2 table `store` và `staff` với quan hệ 1-n (1 store có nhiều staff, nhưng mỗi 1 staff chỉ làm việc ở 1 store. Lúc này thì table staff sẽ có 1 fk là store_id tham chiếu tới table store). Giờ ta muốn lấy tên store, sau đó đếm số lượng nhân viên nam, nữ ở từng store thì làm như nào?

Solution:
1. Dùng 3 câu
```sql
-- Câu đầu tiên get store name:
SELECT store.id AS storeId, store.name AS storeName FROM store store;

-- 2 câu tiếp, mỗi câu đếm số lượng nhân viên với giới tính tương ứng:
SELECT store.id AS storeId, COUNT(staff.id) AS maleCount
FROM store store, staff staff
WHERE store.id = staff.store_id AND staff.gender = 'male'
GROUP BY store.id;

SELECT store.id AS storeId, COUNT(staff.id) AS femaleCount
FROM store store, staff staff
WHERE store.id = staff.store_id AND staff.gender = 'female'
GROUP BY store.id;
```

2. Dùng 1 câu query duy nhất, ref: https://stackoverflow.com/a/12789493/7688028
```sql
-- Using SUM:
SELECT store.name AS storeName,
  SUM(CASE WHEN staff.gender = 'male' THEN 1 ELSE 0 END) AS maleCount,
  SUM(CASE WHEN staff.gender = 'female' THEN 1 ELSE 0 END) AS femaleCount
FROM store store, staff staff
WHERE store.id = staff.store_id
GROUP BY staff.store_id;

-- Using COUNT (COUNT only counts non null values and the DECODE will return non null value 1 only if your condition is satisfied):
SELECT store.name AS storeName,
  COUNT(IF(staff.gender = 'male', 1, NULL)) AS maleCount,
  COUNT(IF(staff.gender = 'female', 1, NULL)) AS femaleCount
FROM staff staff, store store
WHERE store.id = staff.store_id
GROUP BY staff.store_id;
```

Chú ý: 2 câu trên rõ ràng ```GROUP BY staff.store_id```, nhưng lại ```SELECT store.name```, tức là việc select đó ko có hàm aggregate, mà ko bị lỗi ```only_full_group_by error```, lí do là vì 2 lệnh đó là INNER JOIN, nên 1 staff.store_id luôn có 1 store.name tương ứng. À đấy, chính vì điều này nên những store ko có staff nào chẳng hạn, thì sẽ ko được lấy ra từ các câu query trên. Muốn làm được điều đó phải dùng LEFT JOIN như dưới đây:
```sql
-- Using SUM, and also get store with no staff:
SELECT store.name AS storeName,
  SUM(CASE WHEN staff.gender = 'male' THEN 1 ELSE 0 END) AS maleCount,
  SUM(CASE WHEN staff.gender = 'female' THEN 1 ELSE 0 END) AS femaleCount
FROM store store
LEFT JOIN staff staff
ON store.id = staff.store_id
GROUP BY store.id;
```
Chắc chắn rẳng, với câu trên, nếu như ```GROUP BY staff.store_id``` sẽ bị lỗi ```only_full_group_by```

## JPQL with Pageable param
Vẫn bài toán ở trên (đếm số staff là nam và nữ của từng store).
```java
@Query("SELECT store.name AS storeName, " + 
	"  SUM(CASE WHEN staff.gender = 'male' THEN 1 ELSE 0 END) AS maleCount, " + 
	"  SUM(CASE WHEN staff.gender = 'female' THEN 1 ELSE 0 END) AS femaleCount " + 
	"FROM store store " + 
	"LEFT JOIN staff staff " + 
	"ON store.id = staff.storeId " + 
	"GROUP BY store.id")
Page<Map<String, Object>> countCustomers(Pageable pageable);
```

Bên class Service sẽ gọi method trên như sau:
```java
Direction direction; int pageNum, pageSize; String sortBy;	// các biến này được tạo trước đó
PageRequest pageRequest = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortBy));
Page<Map<String, Object>> dataPage = repository.getData(caller, status, pageRequest);
```

Vấn đề ở đây là gì: nếu như sortBy = "maleCount" thì Hibernate sẽ tự động thêm alias table vào trước, thành ra câu query được sinh sẽ giống kiểu:
```sql
SELECT...
FROM store store
ORDER BY store.maleCount ASC...
```
Nhưng class Store ko tồn tại field maleCount, do đó sẽ xảy ra lỗi ở đây.

=> Solution: ta dùng JpaSort.unsafe cùng với *cặp dấu ngoặc ()* khi tạo object Sort:
```java
PageRequest pageRequest = PageRequest.of(pageNum, pageSize, JpaSort.unsafe(direction, "(" + sortBy + ")"));
```

Ref: https://stackoverflow.com/a/54478268/7688028

## Index
Ưu điểm:
- Tăng tốc độ tìm kiếm records theo câu lệnh WHERE (Không chỉ giới hạn trong câu lệnh SELECT mà với cả xử lý UPDATE hay DELETE có điều kiện WHERE)

Nhược điểm:
- Tốc độ write (insert,update,delete) sẽ chậm hơn, do cần insert,update,delete cả index nữa
- Tốn thêm bộ nhớ

Có 2 loại index: clustered và non-clustered

Clustered index:
- Chính là table, hay nói cách khác nó định nghĩa cách order cho data của table
- Mỗi table chỉ có 1 clustered index, và nó chính là primary key hoặc unique key
- Clustered index lưu trữ dùng cấu trúc BTREE, và mỗi node lá chính là data của table

Non-clustered index:
- Là các index mà ko phải clustered index, được lưu trữ khác nơi với table
- Mỗi table có thể có nhiều Non-clustered index
- Non-clustered index lưu trữ cũng dùng cấu trúc BTREE, nhưng node lá lưu trữ con trỏ trỏ tới data thật của table (hay chính là trỏ tới clustered index)

MySQL cung cấp 3 kiểu index khác nhau cho data đó là B+Tree, Hash và RTree index (Btree trong MySQL là B+Tree nhé, vì keyword BTREE ko thể dùng dấu +)
- B+Tree index được sử dụng trong các biểu thức so sánh dạng: =, >, >=, <, <=, BETWEEN và LIKE (tìm kiếm 1 **khoảng giá trị**). Nhưng nếu LIKE '%abc' thì sẽ ko tận dụng được index, lúc này MySQL sẽ scan cả table
- Hash index chỉ nên sử dụng trong các biểu thức toán tử là = và <> (Không sử dụng cho toán từ tìm kiếm 1 khoảng giá trị như >, <)
- Hash có tốc độ nhanh hơn kiểu Btree
- Không thể tối ưu hóa toán tử ORDER BY bằng việc sử dụng Hash index bởi vì nó không thể tìm kiếm được phần từ tiếp theo trong Order
- RTREE: ???

B-Tree
- Ko phải là BST: 1 node có thể có nhiều hơn 2 node con
- Mọi node đều lưu data, do đó có trường hợp time tìm kiếm là O(1) (tìm thấy ngay ở root), nhưng ko thể tìm kiếm theo khoảng
- Các node lá ko link với nhau

B+Tree
- Ko phải là BST
- Chỉ node lá lưu key và data, node none-leaf chỉ lưu key. Do đó thời gian tìm kiếm luôn là O(logn) (fixed)
- Các node lá có link với nhau (mỗi dùng 2 pointer link với node trước và sau)
- Phù hợp với external storage (storing disk data)
- MySQL dùng B+Tree, Mongodb dùng B-Tree: https://medium.com/@mena.meseha/what-is-the-difference-between-mysql-innodb-b-tree-index-and-hash-index-ed8f2ce66d69

Prefix index tức là lưu dưới dạng TRIE? => **Sai nhé**
- Prefix index là index áp dụng trên cột có kiểu data là string, dùng ctdl B-Tree
- Áp dụng cho phần đầu của column đó, tức là áp dụng cho substring(column, length)

Index trên nhiều cột:
```sql
CREATE INDEX index_name ON table_name(c1,c2,c3);
```

- Nếu tạo index cho n cột thì những câu truy vấn có số cột ít hơn đều được tối ưu hóa, và phải tuân theo thứ tự từ trái sang phải. VD ở trên ta tạo index trên 3 cột, thì query như sau sẽ được tối ưu và tìm kiếm theo index:
  + WHERE c1 = "abc" AND c2 = 123 AND c3 = "xyz";
  + WHERE c1 = "abc" AND c2 = 123;
  + WHERE c1 = "abc";
- Query như sau thì ko tận dụng được index:
  + WHERE c1 = "abc" AND c3 = "xyz";  // ko đúng thứ tự c1,c2,c3
  + WHERE c3 = "xyz" AND c1 = "abc";  // ko đúng thứ tự c1,c2,c3
  + WHERE c2 = 123; // ko đúng thứ tự

## View
- Khi dữ liệu ở bảng chính thay đổi thì trong View cũng sẽ được thay đổi
- Ưu điểm
  + Giới hạn dữ liệu cho người sử dụng: chỉ cho phép user xem được 1 vài field thôi
  + Tăng bảo mật vì nó chỉ Read Only, cannot write
  + Che giấu đi sự phức tạp của mô hình dữ liệu, bởi những gì mà họ thấy chỉ là môt View rất đơn giản, chứ họ ko thể thấy được JOIN từ những bảng nào với nhau, phức tạp ra sao...
- Nhược điểm
  + Khi truy vấn trong View có thể sẽ chậm hơn trong table
  + Bị phụ thuộc vào Table gốc, nếu Table gốc thay đổi cấu trúc thì đòi hỏi View cũng phải thiết kế lại cho phù hợp

## Mysql Stored Proccedure
- Mỗi thủ tục sẽ có các mức độ truy cập, nghĩa là ta cũng có thể cấp quyền sử dụng cho một Uesr nào đó trong hệ quản trị (Lưu ý là user trong hệ quản trị chứ không phải là admin của ứng dụng website).
- Ưu điểm:
  + Nếu câu query rất dài và phức tạp, phải join nhiều hay là cần gọi nhiều query 1 lúc, thì dùng Proccedure sẽ giúp giảm thời gian truy vấn giữa ứng dụng và database.
  + Giúp các team làm việc tốt hơn: phân ra team Coder riêng và team DBA (Database Administrator) viết thủ tục riêng.
- Nhược điểm:
  + ...

  