=== @Component, @Autowired, @Scope
- Một trong những nhiệm vụ chính của Spring là tạo ra một cái Container chứa các Dependency (bean). VD:
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        // ApplicationContext chứa toàn bộ dependency trong project.
        ApplicationContext context = SpringApplication.run(App.class, args); // câu lệnh để tạo ra container
    }
}
- @Component là một Annotation đánh dấu trên các Class để giúp Spring biết nó là một Bean (dependency).
- @Autowired: spring boot sẽ tự inject bean đó vào thuộc tính của 1 class. VD:
@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookRepository bookRepository;
}

- Mặc định các Bean được quản lý bên trong ApplicationContext đều là singleton. Nếu muốn mỗi lần sử dụng là một instance hoàn toàn mới, hãy dùng: @Scope("prototype"):
@Service
@Scope("prototype")
public class BookServiceImpl implements BookService {}

=== @Qualifier, @Primary
- Khi Spring Boot có chứa >= 2 Bean cùng loại trong Context, Spring sẽ không biết sử dụng Bean nào để inject vào đối tượng
- @Primary xác định bean mặc định muốn inject
- @Qualifier xác định tên của một Bean muốn chỉ định inject. VD:

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

=== So sánh @Component, @Service...
- Kiến trúc Spring boot:
  + Consumer Layer (Controller): tầng giao tiếp với bên ngoài và handler các request từ bên ngoài tới hệ thống.
  + Service Layer: Thực hiện các nghiệp vụ và xử lý logic
  + Repository Layer: Chịu trách nhiệm giao tiếp với các DB, thiết bị lưu trữ, xử lý query và trả về các kiểu dữ liệu mà tầng Service yêu cầu.
- Để phục vụ cho kiến trúc ở trên, Spring Boot tạo ra 3 Annotation là @Controller vs @Service vs @Repository
- Spring boot định nghĩa 3 annotation đó như sau:
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

- Có thể thấy 3 annotation trên chẳng khác gì nhau về bản chất và có thể thay thế cho nhau, và cả 3 đều tương đương @Component
