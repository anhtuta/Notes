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
```

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
@NotEmpty(message = "username cannot be null or empty")
private String username;

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

## Run Spring Boot project in terminal
- Giả sử project Spring Boot build thành file tên là HelloSpringBoot.war. Spring boot đã có tomcat nhúng nên ko cần phải deploy trên tomcat nữa, mà có thể run trực tiếp trên terminal như sau:<br/>
```
java -server -Xms2g -Xmx2g -jar -Dspring.profiles.active=staging,log -Dspring.datasource.url=jdbc:mysql://localhost:3306/database_name?autoReconnect=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false HelloSpringBoot.war
```
- Trong đó ```Dspring...``` là các tham số config cho project (giống như trong file application.properties). Các tham số này sẽ ghi đè giá trị đã được config trong file application.properties

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
- Thread-safe, do đó chậm hơn HashMap
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

Giờ ít dùng Hashtable, nếu muốn thread-safe thì có thể dùng ```ConcurrentHashMap```

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

## Spring security
- Spring security thực ra chỉ gồm các servlet filter dùng để authentication và authorization
- Có thể tích hợp với Spring MVC hay Spring boot, và cũng có các chuẩn OAuth2 hay SAML
- Nó tự động tạo các page login/logout và tránh được những vulnerability (lỗ hổng web) như CSRF
- Các filter của Spring security làm 4 việc chính sau:
  + Extract (bóc tách) token, username/password từ request
  + Check token đó đã authenticate chưa
  + Check token đó đã authorize chưa
  + Cho phép request đi tới servlet, controller
- Nếu cả 4 bước trên được gói gọn trong 1 filter, thì nó khá phức tạp với 1 đống code. Có thể split nhỏ thành nhiều filter như sau:
  + First, go through a LoginMethodFilter
  + Then, go through an AuthenticationFilter
  + Then, go through an AuthorizationFilter
  + Finally, hit your servlet
- Khái niệm trên gọi là filter chain. Method cuối cùng cho request đi qua filter đó là ```chain.doFilter(request, response);```
- Filter chain của Spring security gồm khoảng 15 filter, sau đây là những filter quan trọng:
  + **BasicAuthenticationFilter**: Tries to find a Basic Auth HTTP Header on the request and if found, tries to authenticate the user with the header's username and password.
  + **UsernamePasswordAuthenticationFilter**: Tries to find a username/password request parameter/POST body and if found, tries to authenticate the user with those values.
  + **DefaultLoginPageGeneratingFilter**: Generates a login page for you, if you don’t explicitly disable that feature. THIS filter is why you get a default login page when enabling Spring Security.
  + **DefaultLogoutPageGeneratingFilter**: Generates a logout page for you, if you don't explicitly disable that feature.
  + **FilterSecurityInterceptor**: Does your authorization
- Các filter sẽ làm mọi thứ, việc của developer là chỉ cần config bằng cách ```extends WebSecurityConfigurerAdapter```
- Authentication with Spring Security: có 3 trường hợp phổ biến sau:
  + Default: backend lưu username, hashed password trong database
  + Less common: backend ko lưu password, thay vào đó sẽ dựa vào 1 bên thứ 3 (third party) lưu trữ, và backend sẽ gọi rest service gửi username/password tới bên thứ 3 này để bên đó authenticate
  + Also popular: Dùng OAuth2 hoặc login with social network account (Google, fb, github...) (OpenID), có thể là dùng JWT

### UserDetailsService: Having access to the user's password
Với trường hợp đầu tiên, ta cần cung cấp cho Spring security 3 bean sau:
- ```UserDetailsService```: bean này sẽ load UserDetails với param username từ request gửi tới, ta cần Override lại hàm sau:
```java
@Override
public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
  userRepository.findByUsername(name);
  List<GrantedAuthority> grantList;
  ...

  return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), grantList);
}

```
- ```PasswordEncoder```: chỉ rõ thuật toán hash password được lưu trong database là gì, VD:
```java
@Bean
public PasswordEncoder passwordEncoder() {
  return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}
```

Nếu ko muốn implement UserDetailsService thì có thể dùng những implement có sẵn của Spring security:
- JdbcUserDetailsManager: config column lưu trữ user
- InMemoryUserDetailsManager: keeps all userdetails in-memory and is great for testing.

Trường hợp secure app dùng Basic Auth, flow sẽ như sau:
- Extract username/password từ HTTP Basic Auth header trong filter, cụ thể là filter ```BasicAuthenticationFilter``` có sẵn của Spring
- Dùng UserDetailsService để load User từ database và return UserDetails, object này bao gồm hashed password
- Compare password trong database với password từ header lấy được ở trên. Nếu match thì authenticate thành công (Thuật toán hash lấy từ bean PasswordEncoder)

### AuthenticationProvider: Not having access to the user's password
Trường hợp thứ 2, backend ko lưu password trong database mà dùng chẳng hạn Atlassian Crowd, để quản lý credentials. Tất nhiên ta ko thể request tới Atlassian Crowd để hỏi password của user là gì, nhưng Atlassian Crowd sẽ cung cấp 1 REST endpoint giúp ta authenticate user

Trong trường hợp này thay vì implement UserDetailsService, ta sẽ phải implement AuthenticationProvider để override lại method authenticate(). VD:
```java
public class AtlassianCrowdAuthenticationProvider implements AuthenticationProvider {

  // Có thể làm bất cứ điều gì để authenticate user, chẳng hạn như gọi REST service.
  // Nếu authenticate fail thì cần throw an exception
  // Nếu authenticate success thì cần return 1 object ```UsernamePasswordAuthenticationToken```,
  // và cần có field ```authenticated``` = true. Vậy là xong
  @Override
  Authentication authenticate(Authentication authentication)  throws AuthenticationException {
      String username = authentication.getPrincipal().toString();
      String password = authentication.getCredentials().toString();

      User user = callAtlassianCrowdRestService(username, password);
      if (user == null) {
          throw new AuthenticationException("could not login");
      }
      return new UserNamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), user.getAuthorities());
  }
  // other methods ignored
}
```

### Using OAuth2 to authenticate
Sẽ note sau...

### Authorization
Authority chính là role với prefix "ROLE_", chẳng hạn: role = "ADMIN" thì authority tương ứng là "ROLE_ADMIN"

Trong UserDetailsService hay AuthenticationProvider, ta cần chỉ rõ authority của user (get from database)

### Protect your URLs
Sau khi config security thì có thể protect các API endpoint trong WebSecurityConfig như sau:
```java
http.authorizeRequests()
  .antMatchers("/admin").hasRole("ADMIN")
  .antMatchers("/callcenter").hasAnyRole("ADMIN", "CALLCENTER")
```

Ngoài ra còn có thể dùng method security, trước hết phải có annotation ```@EnableGlobalMethodSecurity```. Sau đó có thể dùng ```@PreAuthorize, @Secured, @RolesAllowed``` cho từng method muốn bảo vệ

### Access the currently authenticated user
Spring Security lưu user đã được xác thực trong SecurityContextHolder. Có thể truy cập như sau:
```java
SecurityContext context = SecurityContextHolder.getContext();
Authentication authentication = context.getAuthentication();
String username = authentication.getName();
Object principal = authentication.getPrincipal();
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

### Ref
https://www.marcobehler.com/guides/spring-security

## JWT, sessionID, stateless, stateful
Thường thì các hệ thống authen dùng JWT là stateless, còn dùng sessionID là stateful
- Stateful: server có lưu dữ liệu của client, VD: authen = session
- Stateless: server ko lưu dữ liệu của client, VD: authen = JWT, access_token

Nếu dùng session để authen (Session-based Authentication), thì từ sessionID của server có thể thêm, sửa, đọc data của session hiện tại:
```java
session.setAttribute("abc", "123");
session.getAttribute("abc");
```
Tức Java servlet đã có sẵn method để lưu và đọc data từ session của request rồi. Nghĩa là nó được **thiết kế theo chuẩn stateful**

Nếu dùng JWT để authen (Token-based Authentication), thì spring security sẽ KHÔNG có các method để thêm hay đọc data từ access_token hay JWT, đó là stateless. Spring oauth2 được xây dựng theo chuẩn stateless. Tất nhiên có thể tự custom token và thêm data vào từng token đó rồi lưu lại, như thế sẽ thành stateful

## Authentication cơ bản
Về cơ bản thì một quá trình authentication sẽ gồm 2 bước:
- Xác thực một user (thường là request đầu tiên): single sign on, social sign in, oauth..., hoặc đơn giản chỉ là compare username/password từ request gửi lên với username/password trong database
- Lưu giữ đăng nhập (cho các request phía sau): Basic Authentication, Session-based Authentication, Token-based Authentication

### Lưu giữ đăng nhập
Xét 3 cơ chế lưu trữ đăng nhập cơ bản như sau:

#### 1. Basic Authentication
Cách hoạt động: mỗi request tới server sẽ gửi kèm header ```Authorization = Basic base64(username:password)```

Ưu điểm:
- **Đơn giản**
- Dễ dàng kết hợp phương pháp này với các phương pháp sử dụng cookie, session, token...

Nhược điểm:
- **Username/password dễ bị lộ**
- **KHÔNG thể logout** (do việc lưu username, password dưới trình duyệt). Muốn logout phải xóa lịch sử web

Dùng khi nào: các ứng dụng nội bộ, các thư mục cấm như hệ thống CMS, môi trường development, database admin...

#### 2. Session-based Authentication (cookie-based authentication)
Cách hoạt động:
- Sau quá trình xác thực người dùng thành công (username/password,...) thì phía server sẽ **tạo ra và lưu một session chứa thông tin của người dùng đang đăng nhập** và **trả lại cho client session ID** để truy cập session cho những request sau
- SessionID ở phía server có thể lưu tại database, file, ram 
- SessionID ở phía client lưu trong **cookie** với flag **httpOnly=true** (để tránh bị đọc trộm). Việt lưu trong cookie giúp browser **tự động** gửi kèm sessionID lên server

Ưu điểm:
- **Thông tin được giấu kín**: sessionID là 1 string random KHÔNG mang info gì. Mọi thông tin của user đều được lưu ở server
- **Dung lượng truyền tải nhỏ**: kích thước của session nhỏ hơn nhiều so với JWT
- **Không cần tác động client**: Việc tạo cookie sessionID là do server thực hiện, việc gửi cũng là do browser tự động gửi kèm cookie
- **Fully-controlled session**: cho phép hệ thống quản trị TẤT CẢ các hoạt động liên quan tới phiên đăng nhập của người dùng như thời gian login, force logout...

Nhược điểm của authen dùng session:
- **Chiếm nhiều bộ nhớ**: mỗi phiên làm việc của user, server sẽ lại phải tạo ra một session và lưu vào bộ nhớ trên server. Số data này có thể còn lớn hơn cả user database do mỗi user có thể có vài session khác nhau
- **Khó scale**: do sessionID lưu phía server nên việc scale ngang từ 1 server lên nhiều server sẽ khó khăn => các server đó có thể dùng chung 1 chỗ lưu sessionID, chẳng hạn 1 server Redis khác
- Dễ bị **tấn công CSRF** (thêm _csrf token là được)
- Không dùng được với các thiết bị mobile (vì nó ko có cookie), cross domain (vì cookie chỉ hoạt động trên domain hoặc subdomain đó. Khác domain là browser sẽ ko gửi kèm được cookie sessionID)

Dùng khi nào: các website và những ứng dụng web làm việc chủ yếu với browser, những hệ thống *monolithic*

#### 3. Token-based Authentication (JWT)
Cách hoạt động:
- Một chuỗi ký tự (thường được mã hóa) mang thông tin xác định người dùng được server tạo ra và lưu ở client. Server sau đó có thể không lưu lại token này
- Mỗi request tới server sẽ gửi kèm header ```Authorization = Bearer jwt```

Ưu điểm:
- **Stateless**: do server ko cần lưu jwt => dễ dàng scale ngang. Nhiều server chạy trên nhiều instance khác nhau vẫn có thể check token, do token ko lưu trong database (việc check token chỉ cần verify signature dựa vào secretKey)
- **Phù hợp với nhiều loại client**: mobile, IoT device, cross domain (third party app có thể dùng được)
- **Chống CSRF**: nguyên lý đơn giản: *No cookie, no CSRF*

Nhược điểm:
- **Không thể revoke token**, tức là **KHÔNG thể logout**: Nếu user bị đổi role hoặc logout, thì cái token jwt nó vẫn giữ cái phiên làm việc trước khi mà có sự kiện nào đó liên quan đến user xảy ra. Cái này **ko khắc phục được**. Nên sau khi update role của user, thì phía client (FE) cần logout và xóa cái token đó đi, rồi login lại để bên BE gen lại token mới  
  + Mặc dù token cũ bị xóa nhưng nếu ai đó lấy được thì vẫn xài được nó với role cũ, bởi vì server ko lưu JWT trong database, mà chỉ verify JWT thông qua signature, nên token cũ thì signature vẫn đúng
  + Có thể lưu những JWT đã bị invoke trong database, nhưng như vậy ko hay lắm, vì bản chất của JWT là stateless, ko lưu trong database. Do đó nên đặt timeout của JWT ngắn thôi
- **Thông tin dễ lộ**: do thông tin về phiên đăng nhập của người dùng lưu trong jwt (gồm username, role, expire time...)
- **Dung lượng truyền tải lớn**: jwt có kích thước lớn hơn nhiều so với sessionID

### Ref
https://kipalog.com/posts/Authentication-story-part-2--Authentication-co-ban

## Lỗi Spring boot ko tìm được bean được annotate bởi @Repository
Lỗi này xảy ra khi dùng nhiều datasource, chẳng hạn dùng cả Mongodb và MySQL. Trong file config đã khai báo như sau:
```properties
# ============= DataSource ==================
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/test?createDatabaseIfNotExist=true&verifyServerCertificate=false&useSSL=true&useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=5555

spring.data.mongodb.port=27017
spring.data.mongodb.database=test
```
Trong file pom.xml cũng đủ các thư viện như spring-boot-starter-data-jpa, spring-boot-starter-data-mongodb, mysql-connector-java. Tuy vậy khi tạo 1 repository như sau:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

}

// Bên service gọi tới bean này:
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

}
```
Khi run project thì bị lỗi:
```
Field userRepository in UserServiceImpl required a bean of type 'UserRepository' that could not be found.
The injection point has the following annotations:
	- @org.springframework.beans.factory.annotation.Autowired(required=true)
Action:
Consider defining a bean of type 'UserRepository' in your configuration.
```
Bật log level = DEBUG lên: ``` logging.level.root=DEBUG ```, thì thấy dòng này:
```
 HibernateJpaConfiguration:
      Did not match:
         - @ConditionalOnBean (types: javax.sql.DataSource; SearchStrategy: all) did not find any beans (OnBeanCondition)
```
Khả năng cao là do Spring chưa nhận được datasource của MySQL, thử thêm datasource như sau:
```java
@Primary
@Bean
public DataSource userDataSource() {
    DriverManagerDataSource dataSource = new DriverManagerDataSource();
    dataSource.setDriverClassName(env.getProperty("spring.datasource.driver-class-name"));
    dataSource.setUrl(env.getProperty("spring.datasource.url"));
    dataSource.setUsername(env.getProperty("spring.datasource.username"));
    dataSource.setPassword(env.getProperty("spring.datasource.password"));

    return dataSource;
}
```
Run lại thì thành công!

