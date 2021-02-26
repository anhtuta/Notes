## Java
### Override vs Overload
- Override: là hiện tượng 1 method thuộc lớp cha được định nghĩa lại ở lớp con (class con phải kế thừa từ class cha, có thể là implement 1 interface hoặc extend từ 1 class)
- Overload: là nhiều method có cùng tên, nhưng khác nhau về tham số truyền vào (bao gồm luôn constructor nhé)

### Generics
- Là tham số hóa kiểu dữ liệu, chỉ định rõ kiểu dữ liệu muốn làm việc với một class, một interface hay một phương thức nào đó. Sau khi khai báo, trình biên dịch sẽ không chấp nhận việc phương thức hay class có các kiểu dữ liệu khác:
  + Giúp tạo code có tính reusable (sử dụng lại cao)
  + Giúp phát hiện lỗi khi dùng kiểu dữ liệu khác với khai báo

### Abstract class và Interface
- Is-a và Can-do
- Abstract class:
  + Là một class cha cho tất cả các class có cùng bản chất
  + Class khi extend (thừa kế) một abstract class được gọi là ```is-a```
  + Gồm các field, method và abstract method
  + Đơn thừa kế: tức là 1 class chỉ có cùng bản chất ```is-a``` với 1 class cha thôi
- Interface:
  + Là một chức năng có thể thêm và bất kì class nào
  + Class khi implement (thực hiện) một interface được gọi là ```can-do```
  + Chỉ gồm abstract method (tức là method ko có thân hàm) (tuy nhiên Java8 có thêm ```default method``` giống normal method trong abstract class, tức là có thân hàm)
  + Đa thừa kế: 1 class có thể ```can-do``` nhiều thứ
- Nhiều class ko cùng bản chất với nhau nhưng có thể cùng implement 1 interface

### Tham trị vs tham chiếu
- Tham trị (tham số kiểu giá trị):
  + Là các tham số khai báo kiểu dữ liệu **primitive** (int, float, char..)
  + Lưu giá trị của biến chính xác tại địa chỉ bộ nhớ dành cho biến đó (nói cách khác địa chỉ bộ nhớ có lưu giá trị)
  + Pass by value: Khi truyền tham trị thì trình biên dịch sẽ tạo 1 bản sao và sau đó truyền bản sao đó vào nơi muốn truyền, vì vậy mà mọi thay đổi sẽ sảy ra trên bản sao này và ko ảnh hưởng đến biến gốc
  + VD:
```java
static void test1(int a) {
  a = a + 5;
}
int a = 10;
test1(a);
System.out.println(a);  // 10, ko đổi
```
- Tham chiếu (tham số kiểu tham chiếu):
  + Là các tham số khai báo kiểu dữ liệu **Object**, kiểu mảng của primitive (int[], boolean[]...)
  + Lưu trữ bên trong nó một địa chỉ tham khảo (chứ không phải giá trị) mà địa chỉ đó sẽ dùng để truy cập bộ nhớ khi lưu / lấy dữ liệu (giá trị) của biến (chính là các đối tượng).
  + Pass by reference: Khi truyền tham chiếu thì trình biên dịch sẽ truyền ngay địa chỉ của biến đó vào nơi cần truyền, nên ở trong hàm mà mình truyền vào có thay đổi gì thì biến ngoài cũng thay đổi theo
  + VD:
```java
static void test2(int[] arr) {
  arr[0] = arr[0] + 5;
}
int[] arr = {1, 2, 3};
test2(arr);
for (int i = 0; i < arr.length; i++) {
  System.out.println(arr[i]);
} // 6, 2, 3: phần tử đầu tiên đã bị thay đổi

// Another example
@Data
class Student {
  private String name;
}
static void test3(Student st ) {
  st.setName(st.getName() + "_hehehe");
}
Student st = new Student("att");
test3(st);
System.out.println(st.getName()); // att_hehehe: đã bị thay đổi
```

### OOP
- Tính kế thừa (Inheritance):
  + Cho phép xây dựng một lớp mới (lớp Con), **kế thừa và tái sử dụng** các thuộc tính, phương thức dựa trên lớp cũ (lớp Cha) đã có trước đó
  + Thể hiện qua việc 1 class có thể extends từ 1 ```class``` (single inheritance) hoặc implements từ 1 ```interface``` (single or multiple inheritance) (ngoài ra 1 interface cũng có thể extends nhiều interface khác)
- Tính đa hình (Polymorphism = many forms)
  + Nghĩa là 1 action (method) có thể được thực hiện bằng **nhiều cách khác nhau**
  + Tính kế thừa cho phép tái sử dụng lại các attribute, method. Tính đa hình cho phép thực hiện method đó dưới những cách khác nhau
  + Có 2 cách thể hiện tính đa hình:
    + Overload (compile time polymorphism): nhiều method cùng tên nhưng khác tham số
    + Override (run time polymorphism): nhiều class cùng implements/extends từ 1 interface/class cha, khi đó những class con đó sẽ thực thi method của class cha bằng nhiều cách khác nhau
  + VD1 (Overload): 2 method tính max:
  ```java
  int max(int a, int b) {}
  int max(int a, int b, int c) {}
  ```
  + VD2 (Override): có 1 interface Sort, interface này có 1 method sort(). Có thêm 2 class Mergesort và Quicksort cùng implements interface Sort đó, mỗi class sẽ thực thi method sort() theo cách khác nhau
  + ```final``` keyword: dùng để *restrict* (hạn chế) người dùng:
    + final variable ko thể bị thay đổi giá trị sau khi khởi tạo
    + final method: ko thể bị override ở class con (nhưng class con vẫn dùng được method này của class cha)
    + final class: ko thể extends nó được
- Tính đóng gói (Encapsulation):
  + Là việc đóng gói dữ liệu lại với nhau vào 1 đơn vị duy nhât (private class). Việc truy cập data chỉ được thông qua các method public (getter, setter)
  + Lợi ích:
    + Cho phép **che giấu thông tin** và những **tính chất** bên trong của đối tượng
    + Các đối tượng khác **không** thể **tác động trực tiếp** đến **dữ liệu bên trong** và làm thay đổi trạng thái của đối tượng (các biến, method private) mà bắt buộc phải **thông qua các phương thức công khai** do đối tượng đó cung cấp (các method public như getter, setter...)
    + Bằng việc cung cấp các method getter, setter, ta có thể biến 1 class thành *read-only* hoặc *write-only*
- Tính trừu tượng (Abstraction):
  + Là việc **ẩn các implementation details** (triển khai chi tiết) và chỉ hiển thị chức năng cho người dùng.
  + Tính trừu tượng tập trung vào việc **object đó sẽ làm gì** thay vì *object đó làm như thế nào* (focus on what the object does instead of how it does it)
  + Có 2 cách thể hiện tính trừu tượng: Abstract class (0 to 100%) và Interface (100%)
- So sánh Abstraction và Encapsulation
| Abstraction                                         | Encapsulation                                                                    |
|-----------------------------------------------------|----------------------------------------------------------------------------------|
| Xử lý ở mức design                                  | Xử lý ở mức implement                                                            |
| Che giấu những xử lý chi tiết                       | Che giấu data trong 1 class, giúp bảo vệ data ko bị thay đổi bởi bên ngoài class |
| Dùng interface, abstract class để che giấu chi tiết | Dùng access modifier (private, protected), và các getter, setter để bảo vệ data  |

### Abstract class và Interface
- Is-a và Can-do
- Abstract class:
  + Là một class cha cho tất cả các class có cùng bản chất
  + Class khi extend (thừa kế) một abstract class được gọi là ```Is-a```. VD: class Dog extends Animal, thì có thể nói **Dog Is-a Animal**
  + Không thể tạo thể hiện
  + Variable: như class bình thường (final, non-final, static, non-static variable)
  + Method: normal method và abstract method
  + Đơn thừa kế: tức là 1 class chỉ có cùng bản chất ```is-a``` với 1 class cha thôi
- Interface:
  + Là một chức năng có thể thêm và bất kì class nào
  + Class khi implement (thực hiện) một interface được gọi là ```can-do```
  + Không thể tạo thể hiện
  + Variable: chỉ có static và final variable
  + Method: chỉ gồm abstract method (tức là method ko có thân hàm) (tuy nhiên Java8 có thêm ```default method``` và ```static method``` giống normal method trong abstract class, tức là có thân hàm)
  + Đa thừa kế: 1 class có thể ```can-do``` nhiều thứ
- Nhiều class ko cùng bản chất với nhau nhưng có thể cùng implement 1 interface


## SOLID principle
- **S**ingle responsibility principle: Một class chỉ nên giữ 1 **trách nhiệm duy nhất**. Ngoài ra, chỉ sửa class đó với 1 lý do duy nhất

VD: thay vì 1 class chứa các method sau:
```java
public class DatabaseHelper {

  public Connection openConnection() {};

  public void saveUser(User user) {};

  public List<Product> getProducts() {};

  public void closeConnection() {};
}
```
Ta nên tách thành 3 class nhỏ hơn như sau:
```java
public class DatabaseHelper {
  public Connection openConnection() {};
  public void closeConnection() {};
}

public class UserRepository {
  public void saveUser(User user) {};
}

public class ProductRepository {
  public List<Product> getProducts() {};
}
```
- **O**pen/closed principle: Có thể thoải mái **mở rộng** 1 class, nhưng **không được sửa đổi** bên trong class đó (open for extension, but closed for modification):

Nói cách khác: không được thay đổi hiện trạng của các lớp có sẵn, nếu muốn thêm tính năng mới, thì hãy mở rộng bằng cách kế thừa để xây dựng class mới

VD: class sau quản lý connection tới database, ban đầu hệ thống dùng 2 CSDL là MySQL và SQL Server:
```java
class DatabaseConnection {
  public void connect(String db) {
    if(db == "SQLServer") {
       //connect with SQLServer
    } else if(db == "MySQL") {
      //connect with MySQL
    }
  }
}
```
Nếu như sau này cần thêm mongodb nữa thì phải sửa lại method ```connect``` đó, tức là phải sửa lại code cũ => ảnh hưởng tới code cũ đang chạy ngon lành

Giải pháp: thiết kế lại class DatabaseConnection dùng abstract:
```java
abstract class DatabaseConnection {
  public abstract void connect();  // ko cần param db nữa
}
class MySQLConnection extends DatabaseConnection {
  public void connect() {
    // connect with MySQL
  }
}
class SQLServerConnection extends DatabaseConnection {
  public void connect() {
    // connect with SQLServer
  }
}
public static void main(String[] args) {
  DatabaseConnection dc = new MySQLConnection();
  dc.connect();
}
```
Nếu sau này thêm mongodb thì có thể tạo 1 class MongoConnection kế thừa DatabaseConnection, tức là ko phải sửa lại bất cứ phần code nào đã có sẵn:
```java
class MongoConnection extends DatabaseConnection {
  public void connect() {
    // connect with Mongodb
  }
}
```

- **L**iskov substitution principle: Trong một chương trình, các object của **class con có thể thay thế class cha** mà không làm thay đổi tính đúng đắn của chương trình (substitution: sự thay thế)

VD:
```java
public abstract class Animal {
    protected String name;

    abstract void eat();
    abstract void fly();
}

public class Bird extends Animal {

    @Override
    void eat() {
        System.out.println("Bird " + name + " is eating");
    }

    @Override
    void fly() {
        System.out.println("Bird " + name + " is flying");
    }

}

public class Dog extends Animal {

    @Override
    void eat() {
        System.out.println("Dog " + name + " is eating");
    }

    @Override
    void fly() {
        throw new UnsupportedOperationException("Dog cannot fly!!!");
    }

}
public static void main(String[] args) {
    Animal animal1 = new Bird("Phụng hoàng bất tử");
    animal1.eat();
    animal1.fly();  // Bird Phụng hoàng bất tử is flying

    Animal animal2 = new Dog("Sói xám");
    animal2.fly();  // Exception in thread "main" java.lang.UnsupportedOperationException: Dog cannot fly!!!
}
```
=> Rõ ràng class Dog đã vi phạm nguyên lý thay thế Liskov, bởi vì 1 object Dog ko thể thay thế object Animal nếu object Dog gọi method fly()

Cách giải quyết: tách method fly ra 1 interface riêng, động vật nào biết bay mới cho phép implement interface đó:
```java
public abstract class Animal {
    protected String name;

    abstract void eat();
}
public interface Flyable {
    void fly();
}

public class Bird extends Animal implements Flyable {

    @Override
    void eat() {
        System.out.println("Bird " + name + " is eating");
    }

    @Override
    public void fly() {
        System.out.println("Bird " + name + " is flying");
    }

}

public class Dog extends Animal {

    @Override
    void eat() {
        System.out.println("Dog " + name + " is eating");
    }

}
```

- **I**nterface segregation principle: Thay vì dùng 1 interface lớn, ta nên **tách thành nhiều interface nhỏ**, với nhiều mục đích cụ thể (segregation: sự tách biệt)

VD1: Trong ví dụ Animal ở trên, ta đã tách class Animal thành 1 class và 1 interface, vì ko phải Animal nào cũng có thể fly()

VD2:
```java
interface Phone {
    public function call();
    public function sms();
    public function takePicture();
}
```
Hiển nhiên điện thoại 1280 ko thể chụp ảnh được, nên ta nên tách interface đó thành 3 interface nhỏ hơn: ```Callable, Smsable, TakePictureable```

- **D**ependency inversion principle: Các module cấp cao **không** nên **phụ thuộc vào các modules cấp thấp**. Cả 2 nên phụ thuộc vào abstraction (inversion: sự đảo ngược)
  + Các class giao tiếp với nhau thông qua interface, không phải thông qua implementation
  + Những thành phần trừu tượng không nên phụ thuộc vào các thành phần mang tính cụ thể mà nên ngược lại
  + Những cái cụ thể dù khác nhau thế nào đi nữa đều tuân theo các quy tắc chung mà cái trừu tượng đã định ra. Việc phụ thuộc vào cái trừu tượng sẽ giúp chương trình linh động và thích ứng tốt với các sự thay đổi diễn ra liên tục.
  + Là nguyên tắc khó hiểu nhất trong SOLID
