## @Component, @Autowired, @Scope
- Một trong những nhiệm vụ chính của Spring là tạo ra một cái Container chứa các Dependency (bean). VD:
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        // ApplicationContext chứa toàn bộ dependency trong project.
        ApplicationContext context = SpringApplication.run(App.class, args); // câu lệnh để tạo ra container
    }
}
```
- @Component là một Annotation đánh dấu trên các Class để giúp Spring biết nó là một Bean (dependency).
- @Autowired: spring boot sẽ tự inject bean đó vào thuộc tính của 1 class. VD:
```java@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookRepository bookRepository;
}
```
- Mặc định các Bean được quản lý bên trong ApplicationContext đều là singleton. Nếu muốn mỗi lần sử dụng là một instance hoàn toàn mới, hãy dùng: @Scope("prototype"):
```java
@Service
@Scope("prototype")
public class BookServiceImpl implements BookService {}
```

## @Qualifier, @Primary
Khi Spring Boot có chứa >= 2 Bean cùng loại trong Context, Spring sẽ không biết sử dụng Bean nào để inject vào đối tượng
- @Primary xác định bean mặc định muốn inject
- @Qualifier xác định tên của một Bean muốn chỉ định inject. VD:
```java
public interface List {};

@Component("arrayList")
@Primary  // Mặc định IoC container sẽ inject bean này
public class ArrayList implements List {}

@Component("linkedList")
public class LinkedList implements List {}

@Component("treeList")
public class TreeList implements List {}

public class Test {
    @Autowired
    @Qualifier("linkedList")  // chỉ định rõ bean nào của đối tượng List sẽ được inject
    private List list;
    
    @Autowired
    private List list2;  // Ko chỉ rõ bean muốn inject, Spring sẽ inject bean mặc định là arrayList
}
```java

## So sánh @Component, @Service...
- Kiến trúc Spring boot:
  + Consumer Layer (Controller): tầng giao tiếp với bên ngoài và handler các request từ bên ngoài tới hệ thống.
  + Service Layer: Thực hiện các nghiệp vụ và xử lý logic
  + Repository Layer: Chịu trách nhiệm giao tiếp với các DB, thiết bị lưu trữ, xử lý query và trả về các kiểu dữ liệu mà tầng Service yêu cầu.
- Để phục vụ cho kiến trúc ở trên, Spring Boot tạo ra 3 Annotation là @Controller vs @Service vs @Repository
- Spring boot định nghĩa 3 annotation đó như sau:
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Controller {
	@AliasFor(annotation = Component.class)
	String value() default "";
}

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Service {
	@AliasFor(annotation = Component.class)
	String value() default "";
}

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Repository {
	@AliasFor(annotation = Component.class)
	String value() default "";
}

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Indexed
public @interface Component {
	String value() default "";
}
```
- Có thể thấy 3 annotation trên chẳng khác gì nhau về bản chất và có thể thay thế cho nhau, và cả 3 đều tương đương @Component

## Lỗi tomcat khi run project trên IntelliJ IDEA
Khi run project spring boot trên IntelliJ mà bị lỗi sau:
ClassNotFoundException: javax.servlet.Filter...
là do thư viện tomcat starter đó, chỉ cần bỏ thư viện sau khỏi file pom.xml là được:
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-tomcat</artifactId>
	<scope>provided</scope>
</dependency>
```

## So sánh enum
Ko dùng equal() mà dùng ==

## @NotNull, @NotEmpty
```java
// Với số phải dùng kiểu wrapper, ko dùng kiểu nguyên thủy
// Với số ko dùng được @NotEmpty
@NotNull(message = "id cannot be null or empty")
private Integer id;

// Với string thì dùng @NotEmpty vẫn có thể bắt được lỗi = null,
// do đó ko cần @NotNull ở đây
@NotEmpty(message = "userName cannot be null or empty")
private String userName;

// Chú ý PHẢI import như sau:
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
```

## JPA
- Trong 1 entity, có thể dùng các annotation sau trước 1 method:
  + @PrePersist: chạy method trước khi tạo mới và lưu 1 entity vào database. (???)
  + @PreUpdate: chạy method trước khi update 1 entity (???)
- tên cột ko được trùng với từ khóa, nếu ko JPA sẽ bị lỗi. VD: table: setting(id, option, value); 2 cột option và value trùng từ khóa, lúc dùng JPA sẽ lỗi!
- Có 3 bảng user, role, user_role (tức là user và role quan hệ nhiều-nhiều). Tạo entity như sau:
```java
@Entity
@Table(name = "user")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty
    @Size(max = 45)
    private String name;

    @ManyToMany
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> roles;
}
@Entity
@Table(name = "role")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty
    @Size(max = 45)
    @Column(name = "role_name")
    private String roleName;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "roles")
    private List<User> users;
}
// Khi update Role cho User thì có thể làm như sau:
List<Role> roles = new ArrayList<>();
roles.add(...);
// ...
user.setRoles(roles);
userRepository.save(user);
// Làm như vậy thì bảng user_role sẽ tự động được update đúng role!
```

## tomcat error
Khi deploy 2 app.war lên 1 con tomcat thì có thể bị lỗi sau:
```
Unable to register MBean [HikariDataSource (HikariPool-2)] with key 'dataSource';
javax.management.InstanceAlreadyExistsException: com.zaxxer.hikari:name=dataSource,type=HikariDataSource
```
Lý do là vì 2 app đều có config database nên bị trùng nhau cái gì đó ko rõ lắm. Cách xử lý:
https://stackoverflow.com/questions/34284984/tomcat-hikaricp-issue-when-deploying-two-applications-with-db-connection
Thêm vào file config dòng sau: ```spring.jmx.default-domain=app_name```
hoặc:
```
spring
  jmx:
    default-domain: app_name
```

## Json pretty-print rendered Springboot REST API
Thêm vào file application.yaml:
```yaml
# Pretty-print JSON responses
spring:
  jackson:
    serialization:
      indent-output: true
```
	  
## config show SQL:
```yaml
# application.properties:
spring.jpa.properties.hibernate.show_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true
spring.jpa.properties.hibernate.format_sql=trues
spring.jpa.properties.hibernate.type=trace

# application.yaml:
spring:
  jpa:
    properties:
      hibernate:
        show_sql: true
        format_sql: true
```

## profile:
Trong file yaml config như sau:
```yaml
spring:
  profiles:
    active: dev

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# Local Profile
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
spring:
  profiles: local
  
  ...
---
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# Staging Profile
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
spring:
  profiles: stg
  
  ...
---
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# Dev Profile
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
spring:
  profiles: dev
  
  ...
```

- Lúc run thì: click chuột phải -> Run As -> Run configurations... -> Spring boot App (chứ ko phải Maven Build nhé)
- Sau đó nhập profile muốn run. Chú ý rằng config profile trong file yaml ko có tác dụng chọn profile lúc run: active: dev	// KHÔNG có tác dụng
- Lúc build: chỉ cần chỉnh profile muốn build ở trong file yaml, ko cần nhập rõ profile trong lúc build configurations: active: dev	// PHẢI dùng để build thành công

## build file war with different profile
- Có thể build như ở trên, tức là trước lúc build ta active profile ở file config
- Có cách khác: build và lúc run thì chọn profile để run:
  + Dùng STS: Click chuột phải > Run As > Maven clean
  + Click chuột phải > Run As > Maven install
  + Xong xuôi sẽ có file war trong thư mục target, mở terminal cd vào đó
  + run lệnh (chọn 3 profile stg,log,swagger): ```java -jar -Dspring.profiles.active=stg,log,swagger app-name.war```

## Ép kiểu sang String
String str = map.get("abc").toString();
Nếu map.get("abc") == null thì sẽ bị lỗi ở chỗ này (null sao .toString() được)

=> Cách an toàn hơn:
String str = (String) map.get("abc");
Nếu map.get("abc") == null thì str = null => OK
Nhưng nếu map.get("abc") là 1 số Integer, thì ko thể ép sang kiểu String được => Lỗi

Dùng cách sau có thể giải quyết được việc ép số Integer sang String:
String str = map.get("abc") + "";
Nhưng nếu map.get("abc") == null thì str = "null"

=> nên check null trước như sau:
String str1 = (String) map.get("key1");	// nếu map.get("key1") có kiểu String
String str2 = map.get("key2") + "";		// nếu map.get("key2") có kiểu số
if(str1 != null && !str2.equal("null")) {
	// do something
}

## JPA config
Trong file application.yaml, nên disable hbm2ddl auto update để run project sẽ nhanh hơn (rất nhiều)
```yaml
spring:
  jpa:
    database: mysql
    show-sql: false
    hibernate:
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
    properties:
      hibernate:
        format_sql: false
#        hbm2ddl:
#          #auto: create
#          auto: update
#          #auto: validate
#          import_files: 
```

## Hashmap hashCode và equals
Hàm hashCode dùng để tính toán giá trị index trong mảng table[]

Hàm equals dùng để so sánh 2 key, nếu 2 key = nhau (khi hashCode = nhau) thì value của key2 sẽ thay thế value của key1

Giả sử có class Key như sau:
```java
public class Key {
  private String key;

  public Key(String key) {
    super();
    this.key = key;
  }

  @Override
  public int hashCode() {
    ...
  }

  @Override
  public boolean equals(Object obj) {
    ...
  }
}
```

Nếu hashCode luôn return 1 hằng số, chẳng hạn:
```java
@Override
public int hashCode() {
  return 2021;
}
```
Thì với mọi key (dù giá trị khác nhau), hashFunction đều cho ra 1 giá trị index, tức là mọi key đều lưu vào 1 node của bảng table[]

Nếu equals luôn return true:
```java
@Override
public boolean equals(Object obj) {
  return true;
}
```
Thì mọi key đều = nhau (dù hash ra index khác nhau), tức là nếu tồn tại 2 key mà hash ra cùng 1 giá trị index, thì việc put theo key2 sẽ update giá trị của key1

Nếu cả hashCode return 1 hằng số, và equals luôn return true: lúc này hashmap luôn chỉ có 1 phần tử, và việc put những key sau sẽ update value cho key đầu tiên

Demo: Nếu hashCode return 1 hằng số, thì giả sử insert 2 triệu phần tử vào HashMap, có thể tốn hơn 45 phút!

## How Hashmap work
- Node và data table:
Bảng băm dùng để lưu data: Node<K,V>[] table; Trong đó Node:
```java
static class Node<K,V> implements Map.Entry<K,V> {
  final int hash;
  final K key;
  V value;
  Node<K,V> next;
}
```
Dễ thấy mỗi phần tử của bảng data table[] chính là HEAD của 1 danh sách liên kết, tức là HashMap trong Java xử lý collision dùng *Separate chaining*. Có thể gọi table[] này là *array of linked lists* (hay là **buckets**)

- Index calculating:
  + Kích thước của mảng table: luôn là lũy **thừa của 2** (the array size is a power of two). Nếu init HashMap size = 37 thì nó tự động chọn 1 số nhỏ nhất là lũy thừa của 2 và >= 37, chính là số 64.
  + Lí do table.size luôn là power of two: để tính index từ hashCode: index = hashCode & (size - 1).
```Giả sử size = 16 = 1000(2) (kí hiệu vậy ám chỉ cơ số 2).
Giả sử key1 có hashCode1 = 952 => index1 = 952 & 15 = 8. Hoặc dễ hình dung, viết dưới dạng cơ số 2: 0..01110111000 & 0..01111 = 1000.
```
  + Nếu tự viết 1 HashMap, mà table.size ko phải là lũy thừa của 2, có thể tính index = cách chia module: nhưng việc chia ko nhanh bằng phép toán trên bit. Giả sử size = 20 => index1 = 952 % 20 = 12.

- Auto resizing:
HashMap tự động resize (tăng gấp đôi table.size, và nó tự động làm, ko cung cấp method để increase thủ công) khi số lượng phần tử trong map >= threshold, trong đó threshold = mapCapacity * loadFactor.
Hàm sau sẽ khởi tại giá trị 2 field đó: public HashMap(int initialCapacity, float loadFactor). Default thì initialCapacity = 16, loadFactor = 0.75.
Việc resize sẽ khiến hàm tính index bị thay đổi, vì hàm đó tính theo table.size: index = hash(key) AND (table.size - 1), dẫn tới sẽ phải tính toán lại toàn bộ các phần tử có trong Map

- Java8 cải tiến hơn: buckets là mảng của DSLK và Tree (dùng cây cân bằng Red-black tree). Tức là nếu 1 bucket chứa nhiều hơn 8 node lưu dạng DSLK, thì nó sẽ được convert sang dạng Tree. Tất nhiên điều này sẽ gây tốn bộ nhớ hơn

- Note: HashMap chấp nhận 1 key=null, và có thể nhiều value = null. Key = null thì phần tử đó lưu ở Bucket đầu tiên (table[0]):
```java
// [Java8]
static final int hash(Object key) {
  int h;
  return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

- Ref: http://coding-geek.com/how-does-a-hashmap-work-in-java/

## Hashtable
Giống với HashMap (cũng dùng Buckets, Separate chaining, threshold, loadFactor... như HashMap)

Nguyên lý resize cũng giống, nhưng tên method resize là ```rehash()``` (trong HashMap là ```resize()```)

Khác HashMap ở chỗ:
- Thread-safe
- KHÔNG chấp nhận key=null hay value=null (HashMap có thể có 1 key=null và nhiều value=null):
```java
// [Java8]
// Hàm hash tính hashCode như sau thì nếu key=null sẽ bị exception:
int hash = key.hashCode();

// Hàm put check nếu value=null thì throw exception:
public synchronized V put(K key, V value) {
  // Make sure the value is not null
  if (value == null) {
    throw new NullPointerException();
  }
  ...
}
```

## LinkedHashMap
Extend từ class HashMap, LinkedHashMap dùng thêm 1 DSLK đôi để duy trì thứ tự các phần tử được put vào map:
```java
// [Java8] Override lại Node của HashMap để thêm 2 con trỏ before, after cho việc tạo DSLK đôi
static class Entry<K,V> extends HashMap.Node<K,V> {
  Entry<K,V> before, after;
  Entry(int hash, K key, V value, Node<K,V> next) {
    super(hash, key, value, next);
  }
}
/**
 * The head (eldest) of the doubly linked list.
 * Đây chính là phần đầu của DSLK đôi
 */
transient LinkedHashMap.Entry<K,V> head;

/**
 * The tail (youngest) of the doubly linked list.
 * Đây chính là phần đuôi của DSLK đôi
 */
transient LinkedHashMap.Entry<K,V> tail;
```
Do cần thêm 1 DSLK đôi nên việc thêm, xóa trên LinkedHashMap sẽ chậm hơn 1 chút xíu so với HashMap

How does it work: trong method putVal của HashMap:
```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict)  // [Java8]
```
Method này sẽ gọi tới hàm newNode khi để tạo 1 phần tử mới nhét vào bucket:
```java
tab[i] = newNode(hash, key, value, null);  // [Java8]
```
LinkedHashMap đã override lại hàm này để insert phần tử mới trên vào DSLK đôi như sau:
```java
// [Java8]
Node<K,V> newNode(int hash, K key, V value, Node<K,V> e) {
  LinkedHashMap.Entry<K,V> p = new LinkedHashMap.Entry<K,V>(hash, key, value, e);
  linkNodeLast(p);
  return p;
}
private void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
  LinkedHashMap.Entry<K,V> last = tail;
  tail = p;
  if (last == null)
    head = p;
  else {
    p.before = last;
    last.after = p;
  }
}
```

## TreeMap
HashMap và LinkedHashMap khá giống nhau, đều dùng mảng Buckets và hàm hash để lưu data, nhưng TreeMap thì khác hoàn toàn: nó KHÔNG dùng mảng Buckets và hash function, thay vào đó nó dùng Red-Black tree (1 loại cây nhị phân cân bằng - *self-balancing binary search tree*) để lưu data:
```java
// [Java8]
private transient Entry<K,V> root;  // Đây chính là root của cây BST

// Mỗi node của cây BST được định nghĩa như sau:
static final class Entry<K,V> implements Map.Entry<K,V> {
  K key;
  V value;
  Entry<K,V> left;
  Entry<K,V> right;
  Entry<K,V> parent;
  boolean color = BLACK;
}
```
Do đó, TreeMap chả có Buckets size, loadFactor hay threshold, và cũng chả có chức năng resize luôn!

Note: class Key phải implements interface Comparable, chẳng hạn:
```java
public class Key implements Comparable<Key> {
  private String key;

  @Override
  public int compareTo(Key anotherKey) {
    return this.key.compareTo(anotherKey.key);
  }
}
```
Nếu Key là kiểu Integer hay String thì đã implements sẵn Comparable rồi!

Khá ghét Intellij IDEA ở chỗ sau:
- giả sử có class Key như sau: ```public class Key {}```. Giờ muốn implements Comparable, thì khi gõ, Intellij nó gợi ý thành code sau (ko gợi ý kiểu Generic):
```java
public class Key implements Comparable {
  @Override
  public int compareTo(Object o) {
    // TODO Auto-generated method stub
    return 0;
  }
}
```
Trong khi dùng Eclipse thì nó gợi ý như sau chuẩn hơn:
```java
public class Key implements Comparable<Key> {
  @Override
  public int compareTo(Key o) {
    // TODO Auto-generated method stub
    return 0;
  }
}
```
- Intellij gợi ý KHÔNG hiển thị hết các method với các loại params. Giả sử class TreeMap có nhiều hơn 1 constructor là:
```java
public TreeMap() {
  comparator = null;
}
public TreeMap(Comparator<? super K> comparator) {
  this.comparator = comparator;
}
public TreeMap(Map<? extends K, ? extends V> m) {
  comparator = null;
  putAll(m);
}
...
```
Thì khi dùng Intellij, Ctr+space chỉ gợi ý duy nhất 1 constructor!

## So sánh HashMap, LinkedHashMap, TreeMap
| Thuộc tính                    | HashMap                                                                                                                  | LinkedHashMap                        | TreeMap                     |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------------------------------------|-----------------------------|
| Implementation                | Buckets (mỗi bucket là 1 linkedlist, từ Java8, nếu bucket có >=8 phần tử thì linkedlist được chuyển thành balanced tree) | Buckets, double linked list          | Red-Black Tree              |
| Get, put, remove, containsKey | O(1) (Nhanh nhất)                                                                                                        | O(1) (Chậm hơn HashMap xíu)          | O(logn) (Chậm  nhất)        |
| Null key                      | Cho phép, và chỉ 1 null key                                                                                              | Cho phép, và chỉ 1 null key          | Không                       |
| Ràng buộc đối với class Key   | Phải override equals() và hashcode()                                                                                     | Phải override equals() và hashcode() | Phải implements Comparable  |
| Iteration order               | Random order                                                                                                             | Theo thứ tự insert                   | Sắp xếp theo thứ tự của key |
| Thread-safe                   | Không                                                                                                                    | Không                                | Không                       |

## HashSet
Sử dụng 1 HashMap để lưu data, với mọi value của map đều như nhau, ko đổi, có giá trị = PRESENT, và ko dùng luôn :)
```java
// [Java8]
public class HashSet<E> extends AbstractSet<E> implements Set<E>, Cloneable, java.io.Serializable {
  // Đây, biến HashMap này lưu data cho Set đó!
  private transient HashMap<E,Object> map;

  // Dummy value to associate with an Object in the backing Map
  private static final Object PRESENT = new Object();

  /**
   * Constructs a new, empty set; the backing <tt>HashMap</tt> instance has
   * default initial capacity (16) and load factor (0.75).
   */
  public HashSet() {
    map = new HashMap<>();
  }
}
```
Thế thôi, còn lại cách hoạt động giống như HashMap

## LinkedHashSet
Extend từ HashSet, chỉ khác ở chỗ LinkedHashSet dùng LinkedHashMap để lưu data. Mọi constructor của LinkedHashSet sẽ gọi hàm super constructor với 3 tham số như này:
```java
// [Java8]
public LinkedHashSet(int initialCapacity, float loadFactor) {
  super(initialCapacity, loadFactor, true);
}

// Hàm super constructor của class HashSet như này:
HashSet(int initialCapacity, float loadFactor, boolean dummy) {
  map = new LinkedHashMap<>(initialCapacity, loadFactor);
}
```
Thế thôi, còn lại class LinkedHashSet chả có method đặc biệt nào khác. Hoạt động giống HashSet

## TreeSet
Dùng TreeMap để lưu data, vậy thôi!

Tóm lại là cả 3 class Set trên đều dùng 3 map tương ứng để lưu data, với value là PRESENT!
