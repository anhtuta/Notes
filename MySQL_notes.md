## MySQL notes

### DISTINCT with NULL value
If a column has NULL values and you use the DISTINCT clause for that column, MySQL keeps one NULL value and eliminates the other because the DISTINCT clause treats all NULL values as the same value

### Bảng tạm phải có tên alias
Thêm 1 cột số thứ tự record vào kết quả query (dummy chỉ là tên bảng tạm,
ko có chức năng gì, nhưng bắt buộc phải có):
SELECT (@cnt := @cnt + 1) AS rowNumber, field_you_want
FROM your_table
CROSS JOIN (SELECT @cnt := 0) AS dummy;

### Quy ước đặt tên fk (my convention):
```fk_[referencing table name]_[referenced table name]_[referencing field name]```
thường thì 1 table sẽ có 1 PK, do đó referencing field name chính là field ID (PK) của table đó nên có thể bỏ đi
=> Tên ngắn gọn hơn: ```fk_[referencing table name]_[referenced table name]```

### sql_mode=only_full_group_by error
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

### JPQL with list param
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

### JPQL with Pageable param
Updating...
