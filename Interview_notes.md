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

