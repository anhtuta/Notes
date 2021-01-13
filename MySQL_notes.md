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

## Hibernate N+1 problem on OneToOne relationship
Ref: https://vladmihalcea.com/the-best-way-to-map-a-onetoone-relationship-with-jpa-and-hibernate/

Giả sử có 2 bảng Post và PostDetail quan hệ 1-1, bảng con PostDetail có 1 field post_id tham chiếu tới bảng cha. Khai báo entiy như sau:
```java
@Entity(name = "Post")
@Table(name = "post")
public class Post {

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "title")
    private String title;

    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private PostDetails details;

    // Getters and setters...
}

@Entity(name = "PostDetails")
@Table(name = "post_details")
public class PostDetails {

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "created_on")
    private Date createdOn;

    @Column(name = "created_by")
    private String createdBy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    // Getters and setters...
}
```

Fetch Post (parent entity), Hibernate tự động fetch children entity:
```java
Post post = entityManager.find(Post.class, 1L);
```

2 câu query sinh ra:
```sql
SELECT p.id AS id1_0_0_, p.title AS title2_0_0_
FROM   post p
WHERE  p.id = 1
 
SELECT pd.post_id AS post_id3_1_0_, pd.created_by AS created_1_1_0_,
       pd.created_on AS created_2_1_0_
FROM   post_details pd
WHERE  pd.post_id = 1
```

Solution:
1. Dùng @LazyToOne(LazyToOneOption.NO_PROXY) ở entity cha, nhưng đã test thử và KHÔNG thành công:
```java
@OneToOne(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
@LazyToOne(LazyToOneOption.NO_PROXY)
private PostDetails details;
```

2. Dùng @MapsId: Thay vì bảng PostDetail có field post_id là fk tham chiếu tới bảng Post, ta dùng luôn cột id (PK) của bảng này làm FK tham chiếu tới bảng Post:
```java
@Entity(name = "PostDetails")
@Table(name = "post_details")
public class PostDetails {
    @Id
    private Long id;

    @Column(name = "created_on")
    private Date createdOn;

    @Column(name = "created_by")
    private String createdBy;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    private Post post;
}
```

3. Dùng @Query cho nhanh, viết JPQL hoặc native query 😄

4. Dùng @NamedEntityGraph, @EntityGraph??? (Chưa test thử)

## Gộp các câu query COUNT vào 1 câu query
Xét database sakila (database sau khi update sau khi download từ trang chủ của MySQL), xét 2 table `store` và `customer` với quan hệ 1-n. Giờ ta muốn lấy tên store, sau đó đếm số lượng khách hàng nam, nữ ở từng store thì làm như nào?

Solution:
1. Dùng 3 câu
```sql
-- Câu đầu tiên get store name:
SELECT s.name AS storeName FROM store s;

-- 2 câu tiếp, mỗi câu đếm số lượng khách hàng với giới tính tương ứng:
SELECT COUNT(c.customer_id) AS maleCount
FROM customer c, store s
WHERE c.store_id = s.store_id AND c.gender = 'male'
GROUP BY c.store_id;

SELECT COUNT(c.customer_id) AS femaleCount
FROM customer c, store s
WHERE c.store_id = s.store_id AND c.gender = 'female'
GROUP BY c.store_id;
```

2. Dùng 1 câu query duy nhất, ref: https://stackoverflow.com/a/12789493/7688028
```sql
-- Using SUM:
SELECT s.name AS storeName,
  SUM(CASE WHEN c.gender = 'male' THEN 1 ELSE 0 END) AS maleCount,
  SUM(CASE WHEN c.gender = 'female' THEN 1 ELSE 0 END) AS femaleCount
FROM customer c, store s
WHERE c.store_id = s.store_id
GROUP BY c.store_id

-- Using COUNT (COUNT only counts non null values and the DECODE will return non null value 1 only if your condition is satisfied):
SELECT 
  s.name AS storeName,
  COUNT(IF(c.gender = 'male', 1, NULL)) AS maleCount,
  COUNT(IF(c.gender = 'female', 1, NULL)) AS femaleCount
FROM customer c, store s
WHERE c.store_id = s.store_id
GROUP BY c.store_id;
```

## JPQL with Pageable param
Vẫn bài toán ở trên (đếm số customer là nam và nữ của từng store). À quên chưa nói, câu query ở trên vẫn thiếu 1 chút, đó là ko SELECT được những store nào mà chưa có customer. Muốn làm như vậy ta phải dùng LEFT JOIN như dưới đây:
```java
@Query("SELECT s.name AS storeName, " + 
	"  SUM(CASE WHEN c.gender = 'male' THEN 1 ELSE 0 END) AS maleCount, " + 
	"  SUM(CASE WHEN c.gender = 'female' THEN 1 ELSE 0 END) AS femaleCount " + 
	"FROM store s " + 
	"LEFT JOIN customer c " + 
	"ON c.storeId = s.storeId " + 
	"GROUP BY c.storeId")
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
FROM store s
ORDER BY s.maleCount ASC...
```
Nhưng class Store ko tồn tại field maleCount, do đó sẽ xảy ra lỗi ở đây.

=> Solution: ta dùng JpaSort.unsafe cùng với cặp dấu ngoặc () khi tạo object Sort:
```java
PageRequest pageRequest = PageRequest.of(pageNum, pageSize, JpaSort.unsafe(direction, "(" + sortBy + ")"));
```

Ref: https://stackoverflow.com/a/54478268/7688028