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
- Tính đóng gói (Encapsulation):
  + Là việc đóng gói dữ liệu lại với nhau vào 1 đơn vị duy nhât (private class). Việc truy cập data chỉ được thông qua các method public (getter, setter)
  + Lợi ích:
    + Cho phép **che giấu thông tin** và những **tính chất** bên trong của đối tượng
    + Các đối tượng khác **không** thể **tác động trực tiếp** đến **dữ liệu bên trong** và làm thay đổi trạng thái của đối tượng (các biến, method private) mà bắt buộc phải **thông qua các phương thức công khai** do đối tượng đó cung cấp (các method public như getter, setter...)
    + Bằng việc cung cấp các method getter, setter, ta có thể biến 1 class thành *read-only* hoặc *write-only*
- Tính kế thừa (Inheritance): cho phép xây dựng một lớp mới (lớp Con), **kế thừa và tái sử dụng** các thuộc tính, phương thức dựa trên lớp cũ (lớp Cha) đã có trước đó. Chẳng hạn, 1 class có thể implements 1 ```interface``` hoặc extends từ 1 ```abstract class``` khác
- Tính đa hình (Polymorphism = many forms)
  + Nghĩa là 1 action (method) có thể được thực hiện bằng **nhiều cách khác nhau**
  + Tính kế thừa cho phép tái sử dụng lại các attribute, method. Tính đa hình cho phép thực hiện method đó dưới những cách khác nhau
  + Có 2 cách thể hiện tính đa hình:
    + Overload (compile time polymorphism): nhiều method cùng tên nhưng khác tham số
    + Override (run time polymorphism): nhiều class cùng implements/extends từ 1 interface/class cha
  + VD1 (Overload): 2 method tính max:
  ```java
  int max(int a, int b) {}
  int max(int a, int b, int c) {}
  ```
  + VD2 (Override): có 1 interface Sort, interface này có 1 method sort(). Có thêm 2 class Mergesort và Quicksort cùng implements interface Sort đó, mỗi class sẽ override method sort theo cách khác nhau
  + ```final``` keyword: dùng để *restrict* (hạn chế) người dùng:
    + final variable ko thể bị thay đổi giá trị sau khi khởi tạo
    + final method: ko thể bị override ở class con (nhưng class con vẫn dùng được method này của class cha)
    + final class: ko thể extends nó được
- Tính trừu tượng (Abstraction):
  + Là việc ẩn các implementation details (triển khai chi tiết) và chỉ hiển thị chức năng cho người dùng. Tính trừu tượng tập trung vào việc object đó sẽ làm gì thay vì object đó làm như thế nào (focus on what the object does instead of how it does it)
  + Có 2 cách thể hiện tính trừu tượng: Abstract class (0 to 100%) và Interface (100%)

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

