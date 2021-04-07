## JavaScript Values
- Two types of values: Fixed values and variable values.
- Fixed values are called literals. Variable values are called variables
- VD literals: ```"demo string", 1234, 943.43```
- VD variable: ```var x; x = 1234```

## undefined và null
- undefined: giá trị của 1 biến khi chưa được gán giá trị gì hoặc gán = undefined. Lúc này biến có kiểu undefined. VD:
```js
var a;           //a = undefined
a = undefined;   //a = undefined
typeof a;        //undefined
```

- null: giá trị của 1 biến: null is "nothing". It is supposed to be something that doesn't exist. Lúc này biến có kiểu object. VD:
```js
var a;    //a = undefined
a = null;
typeof a; //object
```

```js
- undefined and null are equal in value but different in type
typeof undefined           // undefined
typeof null                // object
null === undefined         // false
null == undefined          // true
```

## function vs method
- function định nghĩa ở ngoài 1 class, object, là 1 hàm độc lập. Ai cũng gọi được
- method: định nghĩa trong 1 object, class. Chỉ gọi được thông qua object (A function that is the property of an object is called its method)
```js
var person = {
	firstName: "John",
	lastName : "Doe",
	id       : 5566,
	// this is a method
	getfullName : function() {
		return this.firstName + " " + this.lastName;
	}
};

// this is a function
function myFunc() {
	console.log("this is a function");
}
```

- Từ đó có thể thấy:
	+ Trong Java ko có function, chỉ có method
	+ Trong C ko có method, chỉ có function

## ```this``` keyword
- In a method, this refers to the owner object.
- Alone, this refers to the global object. (In a browser window the Global object is [object Window])
- In a function, this refers to the global object. If function has strict mode, this is undefined.
  So, in a function, this refers to the Global object [object Window].
- In an event, this refers to the element that received the event.
- Methods like call(), and apply() can refer this to any object.
```js
// In a method:
var person = {
	firstName: "John",
	lastName : "Doe",
	id       : 5566,
	getfullName : function() {
		// this đại diện cho biến person
		return this.firstName + " " + this.lastName;
	}
};

// In an event:
// this chính là thẻ button
<button onclick="this.style.display='none'">
	Click to Remove Me!
</button>

// Refer this to another object:
var person1 = {
	fullName: function() {
		return this.firstName + " " + this.lastName;
	}
}
var person2 = {
	firstName:"John",
	lastName: "Doe",
}
person1.fullName.call(person2);  // Will return "John Doe"
```

## let vs var
- read here: https://www.w3schools.com/js/js_let.asp
- chú ý: let ko hoisting!
```
console.log(a); let a = 1;	//error!
console.log(b); var b = 1;	//undefined, but not error occured
```
- Lời khuyên: Dùng const cho tất cả khai báo biến vì nó sẽ giúp bạn hạn
  chế trường hợp “vô tình” thay đổi giá trị của biến. Chỉ dùng let
  trong trường hợp bất khả kháng, và tránh xa var.
```js
var a = 10;
if(true) {
	var a = 4;	// biến a bị reset trong này
}
console.log(a);	// 4

for (var i = 0; i < 4; i++) {
  setTimeout(function() {
    console.log(i);
  }, 300)
}
for (let i = 0; i < 4; i++) {
  setTimeout(function() {
    console.log(i);
  }, 3000)
}
```
Hãy so sánh và giải thích!

## object
- "In JavaScript, objects are king. If you understand objects, you understand JavaScript."
- JavaScript Accessors (Getters and Setters)
```js
var person = {
	firstName: "John",
	lastName : "Doe",
	language : "en",
	get lang() {
		return this.language;
	},
	get age() {return 24;},
	get fullname() {return this.firstName + " " + this.lastName;}
};
person.lang;	//en
person.age;	//24
```

- use an object constructor:
```js
function Person(first, last, age, eyecolor) {
	this.firstName = first;
	this.lastName = last;
	this.age = age;
	this.eyeColor = eyecolor;
}
var p1 = new Person("John", "Doe", 50, "blue");
```
- can not add a new property to an existing object constructor:
```js
Person.nationality = "English";	// ko có lỗi, vì JS coi Person.nationality là 1 string ko liên quan j đến Person
```

- Adding Properties and Methods to Objects must use Prototype:
```js
Person.prototype.nationality = "English";
Person.prototype.name = function() {
	return this.firstName + " " + this.lastName;
};
var p2 = new Person("John", "Doe", 50, "blue");
p2.name();	// "John Doe"
```

## Function
- Function Declarations:
```js
function functionName(parameters) {
	// code to be executed
}
```
- Function Expressions (anonymous function (not need function names), be stored in a variable):
```js
var x = function (parameters) {
	// code to be executed
};
```
- Self-Invoking Functions:
```js
(function () {
	var x = "Hello!!";  // I will invoke myself
})();
```
- Arrow Functions (ES6):
```js
const x = (x, y) => x * y;
```

- Function Declarations are hoisted
- Function Expressions are NOT hoisted
- Arrow functions are NOT hoisted
- In JavaScript all functions are object methods: ở trên đã so sánh giữa method và function: method là hàm trong 1 object,
còn function là hàm ở ngoài, ko liên quan đến 1 object nào. Do đó function trong JS thực chất chính là method của global object

## Call, Apply, Bind
- Hàm call():
  + With call(), an object can use a method belonging to another object
  + Cú pháp: ```func.call([thisArg[, arg1, arg2, ...argN]])```
  + Trong đó: thisArg (optional) là giá trị của this được đưa ra để gọi hàm
```js
var person = {
	fullName: function() {
		return this.firstName + " " + this.lastName;
	}
}
person.fullName();	// "undefined undefined"
person.fullName.call({firstName: "Anhtu", lastName: "Ta"});		// "Anhtu Ta"
```

- The call() method can accept arguments:
```js
var person = {
	fullName: function(city, country) {
		return this.firstName + " " + this.lastName + "," + city + "," + country;
	}
}
var att = {firstName: "Anhtu", lastName: "Ta"};
person.fullName.call(att, "Hanoi", "VN");	// "Anhtu Ta,Hanoi,VN"
```

- Hàm apply(): tương tự call, nhưng khác ở chỗ:
	+ The call() method takes arguments separately.
	+ The apply() method takes arguments as an array
	+ Cú pháp: ```func.apply(thisArg, [ argsArray])``` (thisArg là bắt buộc có)
```js
person.fullName.apply(att, ["Hanoi", "VN"]);
```

- Hàm bind():
  + Tương tự call, apply, nhưng nó return 1 function. Nếu muốn invoke nó luôn thì cần ()
  + Cú pháp: ```let boundFunc = func.bind(thisArg[, arg1, arg2, ...argN])``` (thisArg là bắt buộc có)
```js
person.fullName.bind({firstName: "Anhtu", lastName: "Ta"})();	// "Anhtu Ta"
```

- Hàm bind có thể tạo Partial Function do nó return 1 function
```js
function log(level, time, message) {
	console.log(level + ' - ' + time + ': ' + message);
}
var logErrToday = log.bind(null, 'Error', 'Today');
// logErrToday sẽ là 1 hàm, và có 1 tham số là message, vì nó tạo từ
// hàm bind của hàm log, mà tham số truyền vào cho hàm bind ít hơn 1 tham
// số so với hàm log, do đó hàm logErrToday sẽ có 1 tham số còn lại đó
logErrToday("Server die."); 	// tương đương với log("Error", "Today", "Server die.");
```
- ```logErrToday``` chính là 1 Partial Function (we create a new function by fixing some parameters of the existing one.)
```js
// VD khác:
var logErr = log.bind(null, "Error");
logErr("yesterday", "Internal server error");	// Error - yesterday: Internal server error

// VD Khác:
var person = {
  firstName: 'Hoang',
  lastName: 'Pham',
  showName: function() {
    console.log(this.firstName + ' ' + this.lastName);
  }
};
var a = person.showName;
a();	// undefined undefined
a.bind({firstName: "Hoang", lastName: "Pham"})();	// Hoang Pham
var b = person.showName.bind({firstName: "Hoang", lastName: "Pham"});
b();	// Hoang Pham
```

- ở trên có partial function, nên nói thêm về currying function:
```js
function sum(a, b) {
	return a + b;
}
let carriedSum = function(a) {
    return function(b) {
        return sum(a,b);
    }
}
```
  + carriedSum chính là 1 curry function. Sử dụng: carriedSum(2)(3)
  + Currying is a transform that makes f(a,b,c) callable as f(a)(b)(c). 

- this:
	+ ```"this"``` keyword behaves unlike most other programming languages.
	  It can be used in any function.
	+ The value of ```this``` is evaluated during the run-time. And it can be anything.
	+ usually a call of a function that uses ```this``` without an object is not normal,
	  but rather a programming mistake. If a function has ```this```, then it is
	  usually meant to be called in the context of an object.

- Nhận xét:
	+ reference: https://medium.com/@leonardobrunolima/javascript-tips-apply-vs-call-vs-bind-d738a9e8b4e1
	+ The method Call invokes the function and allows you to pass in
	  arguments one by one using commas.
	+ The method Apply invokes the function and allows you to pass in
	  arguments as an array
	+ The method Bind returns a new function, allowing you to pass in
      a this array and any number of arguments. Useful in events
	+ Call and Apply are interchangeable. Bind is different. It always
	  returns a new function
	+ dùng bind nếu muốn function sau này mới được gọi (invoke),
	  dùng call, apply nếu muốn invoke function ngay tức thì
	+ These JavaScript methods allow you to change the value of ```this```
	  for a given function (Các hàm này dùng để thay đổi giá trị của this
	  bên trong 1 function, method).
	  Trong các Vd ở trên, ta đã thay đổi this bên trong 1 method của 1 object. Xét VD sau:
```js
	  function demo() {
	    console.log("this = ", this);
	  }
	  demo();					// this =  Window {...}
	  demo.call({name:"att"});	// this =  {name: "att"}
	  demo.call(3);				// this =  Number {3}
```
- Xét VD function có tham số:
```js
function greeting(text) {
  console.log(text + " " + this.name);
}
greeting("Hello");	// Hello  	(this.name = undefined ở trường hợp này)
greeting.call({name:"Anhtu"}, "Hello");		// Hello Anhtu  (this của greeting được gán bằng {name:"Anhtu"})
greeting.apply({name:"Anhtu"}, ["Hello"]);	// tham số thứ 2 PHẢI là 1 mảng
greeting.bind({name:"Anhtu"}, "Hello")();	// cần thêm () để invoke hàm luôn
```
- nếu functionName có k tham số, mà ta gán: ```var newFunc = functionName.bind(thisArg, arg1, ... , argN)```
  + Tức là có N tham số trong hàm bind sau tham số đầu (thisArg), N <= k
  + this newFunc sẽ có số lượng tham số là: k - N
```js
functionName(name, address, age) {...}
var newFunc = functionName.bind(null, "Anhtu");

// khi invoke hàm newFunc cần truyền giá trị cho 2 tham số còn lại là address và age:
newFunc("Hanoi", 24);
```

## Closure
- A closure is a function having access to the parent scope, even after the parent function has closed
```JS
var add = (function () {
  var counter = 0;
  return function () {counter += 1; return counter}
})();
```
- Trong VD trên:
	+ Biến add = giá trị của 1 self-invoking function
	+ self-invoking function này lại return 1 function khác, do đó add là 1 function
	+ Trong hàm được return ở trên, nó có thể truy cập được biến ở scope cha của nó,
	  đó là biến counter
	+ do self-invoking function chỉ chạy 1 lần, nên biến counter chỉ được reset 1 lần
	+ Dù self-invoking function này bị close, nhưng cái hàm mà nó return vẫn
	  truy cập được biến của self-invoking function này (biến counter)

## Rest parameters and spread operator
- Rest parameters:
```JS
function (param1, param2, ...args) {
  // args chính là rest parameters, nó tương đương với nhiều tham số được truyền vào
}
```
- spread operator:
```JS
const arr = [21,3,211,32,432,31];
const arr2 = [3211,249,65,4,54];
Math.max(...arr);
Math.max(...arr, ...arr2);
const newArr = [1, 21, ...arr, 16];
console.log([...arr, ...arr2]);	//[21,3,211,32,432,31,3211,249,65,4,54];
```

## Promise
```JS
let promise = new Promise(function(resolve, reject) {
  // executor: do something here...
  // after that, it should call resolve or reject function:
  resolve(value);
  // Hoặc
  reject(Error);
  // chỉ được gọi 1 hàm resolve hoặc reject, và chỉ 1 lần
});
```
- Ngay khi khởi tạo thì promise có 2 property:
	+ state = "pending"
	+ result = undefined
- Sau khi gọi resolve, promise thay đổi trạng thái thành:
	+ state = "fulfilled"
	+ result = value
- Sau khi gọi reject, promise thay đổi trạng thái thành:
	+ state = "rejected"
	+ result = Error
- Hàm khởi tạo new Promise cần 1 tham số là 1 function gồm 2 tham số. Nếu chắc chắn
  promise sẽ được resolve thì có thể chỉ cần 1 tham số:
```js
let promise = new Promise(function(resolve) {
  //...
  resolve(value);
})
// Hoặc ngắn gọn hơn:
let promise = new Promise(resolve => {...});
```

- There can be only a single result or an error: tức là khi gọi resolve hoặc
  reject rồi thì gọi lần nữa cũng ko có tác dụng
- Reject is recommended to use Error objects
- Sau khi 1 promise được resolve, hoặc reject thì có thể lấy kết quả
  của việc resolve hoặc reject đó như sau:
```js
promise.then(
  function(result){
    // do something after promise resolved
  },
  function(error){
    // do something after promise rejected
  }
);
```
- Tham số của hàm then() ở trên gồm 2, nên có thể viết gọn là:
  ```promise.then(onResolve, onReject);```
- Nếu chỉ quan tâm tới kết quả resolve thì có thể dùng:
  ```promise.then(onResolve);```
- Nếu chỉ quan tâm tới kết quả reject thì có thể dùng:
  ```promise.catch(onReject);	// tương đương với: promise.then(null, onReject);```
```js
promise.then(function(result) {...});
promise.catch(function(error) {...});

promise = new Promise(function(resolve, reject) {
  setTimeout(() => resolve("done!"), 5000);
});
promise.then(
  function(result){console.log("resolve: ", result)},
  function(error){console.log("rejected: ", error)}
);
```
- Promises chaining (a call to promise.then returns a promise):
```js
var a = new Promise(function(resolve, reject) {
  setTimeout(() => resolve(2), 3000);
});
a.then(function(result) {
    console.log(result);	//2
    return result*2;	//giá trị được return này sẽ được dùng cho value của resolve của then() tiếp theo
}).then(function(result) {
    console.log(result);	//4
});
```
- Nếu trong then mà return 1 Promise thì promise đó phải được resolve xong
thì nó mới return value cho thằng then tiếp theo:
```js
a.then(function(result) {
    console.log(result);	//2
    return new Promise((resolve, reject) => {
		    setTimeout(() => resolve(result * 2), 1000);
	  });
}).then(function(result) {
	  console.log(result);	//4
});
```
- multiple handlers for one promise: trái ngược với cái ở trên, và ít dùng:
```js
a.then(function(result) {
    console.log(result);	//2
    return result*2;
});
a.then(function(result) {
    console.log(result);	//2
});
```
- Promise cũng là dùng callback, nhưng có những ưu điểm:
	+ Promise hỗ trợ “chaining” (Giá trị trả về của hàm then là 1 promise khác):
  ```js
  promise
    .then(abc)
    .then(def)
    .then(...)
  ```
	+ Promise giúp bắt lỗi dễ dàng hơn (1 then() có lỗi là nhảy vào catch ngay):
  ```js
  promise
    .then(abc)
    .then(def)
    .then(function() {...})
    .catch(function(err) {
      console.log(err);
    });
  ```
	+ Xử lý bất đồng bộ (Promise.all: cho phép gộp kết quả của nhiều promise: chạy song song)
  ```js
  Promise.all([prom1, prom2, prom3])
    .then(function(result) {
      // khi cả 3 promise ở trên được resolve thì mới nhảy vào đây làm gì đó tiếp
    });
  // Nếu như 3 promise ở trên, mỗi thằng đều phải xử lý 10s mới resolve thì
  // Sau đúng 10s sẽ nhảy vào hàm then ở dưới. Nếu như ta chạy lần lượt 3 cái
  // promise thì hàm then được gọi sau 30s.
  e_nhau_khong()
    .then(uong_ruou)
    .then(hut_thuoc)
    .then(ve_nha)
    .catch(console.log);
  // Nếu uong_ruou và hut_thuoc mỗi cái tốn 1h thì phải 2h mới ve_nha

  // Nếu dùng:
  e_nhau_khong()
    .then(function() {
      return Promise.all([
        uong_ruou(),
        hut_thuoc()
      ])    
    })
    .then(ve_nha)
    .catch(console.error.bind(console));
  // thì chỉ 1h là ve_nha
  ```
	  
## Async/Await
- async đặt trước 1 function, biến kết quả return của function đó là 1 promise
```js
async function f() {
  return 1;
}
// Tương đương với:
async function f() {
  return Promise.resolve(1);
}
f().then(alert);	//1

// Nếu hàm f() xảy ra lỗi thì giá trị return của nó là 1 Promise bị reject, khi đó có thể handle như sau:
f().catch(alert);
```
- await:
	+ chỉ xuất hiện bên trong 1 hàm async
	+ thường dùng để wait 1 promise thực hiện xong để làm việc gì tiếp theo:
  ```js
  async function f() {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 1000)
    });
    let result = await promise; // wait till the promise resolves (*)
    alert(result); // "done!" after 1s
  }
  f();
  ```
	+ await literally makes JavaScript wait until the promise settles, and then go on with the result
- KL:
- The async keyword before a function has two effects:
	+ Makes it always return a promise.
	+ Allows to use await in it.
- The await keyword before a promise makes JavaScript wait until that promise settles, and then:
	+ If it’s an error, the exception is generated
	+ Otherwise, it returns the result, so we can assign it to a value.
- Trường hợp ko nên dùng async await mà phải dùng Promise: nếu như gọi nhiều thao tác bất đồng bộ và chờ cho tất cả chúng kết thúc. VD:
  ```js
  async  function  getABC () {
    let A = await getValueA(); // getValueA takes 2 second to finish
    let B = await getValueB(); // getValueB takes 4 second to finish
    let C = await getValueC(); // getValueC takes 3 second to finish
    return A*B*C;
  }
  ```
	+ các wait sẽ đợi và thực hiện tuần tự, toàn bộ chức năng sẽ mất 9 giây
	để thực hiện xong hàm từ đầu đến cuối (2 + 4 + 3). Đây không phải là một giải 
	pháp tối ưu vì A, B và C không phụ thuộc vào nhau.
  + Nếu dùng Promise, chúng ta sẽ chỉ mất 4 giây để chờ cả 3 hàm trả về giá trị:
  ```js
  async function  getABC () {
    // Promise.all() allows us to send all requests at the same time.
    let results = await Promise.all([ getValueA, getValueB, getValueC ]); 
    return results.reduce((total,value) => total * value);
   }
   ```
- nếu await 1 Promise bị reject thì handle dùng try_catch như sau
  (We can also wrap multiple lines: có thể dùng chung catch để bắt nhiều ngoại lệ):
```js
async function f() {
  try {
    let response = await fetch('http://no-such-url');
    let res2 = await anotherRejectedPromise();
  } catch(err) {
    alert(err); // TypeError: failed to fetch
  }
}
```

## Module
- A module is a file. To make import/export work, browsers need <script type="module">
```js
// index.html
<!doctype html>
<script type="module" src="hello.js"></script>

// user.js
export let user = "John";

// hello.js
import {user} from './user.js';
document.body.innerHTML = user; // John
```

- Modules always use strict:
```js
// code trong thẻ script sau luôn use strict
<script type="module" src="hello.js">
	// luôn use strict here
	a = 4;	// error!
</script>
```

- How to use import, export
	+ Export before declarations (giả sử trong file abc.js):
  ```js
  // export an array
  export let months = ['Jan', 'Feb', 'Mar','Apr', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // export a constant
  export const MODULES_BECAME_STANDARD_YEAR = 2015;

  // export a class
  export class User {...} // no ; at the end

  // import từ file khác như sau (phải có cặp dấu {}):
  import {months} from "./abc.js";	// months phải trùng với tên biến được export trong file abc.js
  import {MODULES_BECAME_STANDARD_YEAR} from "./abc.js";
  import {User} from "./abc.js";

  // import tất cả:
  import {months, MODULES_BECAME_STANDARD_YEAR, User} from "./abc.js";
  // hoặc:
  import * as abc from "./abc.js";	//ko nên dùng vì giảm performance
  abc.months;		// gọi 1 hàm/biến trong file abc.js
  ```
  + Export apart from declarations:
  ```js
  function sayHi(user) {
    alert(`Hello, ${user}!`);
  }
  function sayBye(user) {
    alert(`Bye, ${user}!`);
  }
  export {sayHi, sayBye}; // a list of exported variables
  // lệnh trên tương đương với việc thêm từ export ở trước function

  // Sử dụng:
  import {sayHi, sayBye} from "./abc.js";
  import {sayHi} from "./abc.js";	// nếu chỉ dùng 1 hàm sayHi này
  import {sayHi as hi} from "./abc.js"; // có thể dùng alias
  ```
	- Export “as”:
  ```js
  export {sayHi as hi, sayBye as bye};

  // Sử dụng:
  import {hi, bye} from "./abc.js";
  ```
	- Export default:
		+ Nên dùng nếu toàn bộ module chỉ có 1 class
		+ lúc import thì ko cần cặp dấu {}
		+ Tên biến được export nên đặt trùng tên file để dễ tìm kiếm
		+ Tên biến lúc import có thể khác tên biến được export
    ```js
    class App extends React.Component {...}
    export default App;

    // Sử dụng:
    import App from "./App.js";		// Nên đặt tên là App để trùng nhau
    import Hehe from "./App.js";	// tên là Hehe vẫn được!
    ```

## Imperative Versus Declarative
- Imperative paradigm:
	+ giống lập trình hướng cấu trúc, hướng đối tượng trong C/C++, Java, PHP...
	+ Typically your code will make use of conditinal statements, loops and class inheritence
	```js
  class Number {
    constructor (number = 0) {
    this.number = number;
    }
    add (x) {
    this.number = this.number + x;
    }
  }
  ```
- Declarative paradigm:
	+ focuses on building logic of software without actually describing its flow
	+ You are saying what without adding how
	+ Functional programming based on lambda calculus is Turing complete,
	  avoids states, side effects and mutation of data.
	```js
  const sum = a => b => a + b;
  console.log (sum (5) (3)); // 8\
  ```

## Truyền tham số cho callback function
```js
// Cách 1:
function showName(name) {
	console.log(name);
}
function demo(callback) {
	// callback có bao nhiêu param vẫn ko cần truyền tại đây
	callback();
}
// truyền param cho callback ở đây
demo(showName.bind(null, "Att"));


// Cách 2 cách này thực ra ko dùng param mà dùng this:
function showName() {
	console.log(this.name);
}
function demo(callback) {
	// callback có bao nhiêu param vẫn ko cần truyền tại đây
	callback();
}
demo(showName.bind({name: "Att"}));
```

## Pure function
- It does not make outside network or database calls.
- Its return value depends solely on the values of its parameters.
- Its arguments should be considered "immutable", meaning they should not be changed.
- Calling a pure function with the same set of arguments will always return the same value.

## Destructuring assignment
```js
let json = {
    name: 'Zuka',
    age: 24,
	book: ['Conan', 'One Piece', 'Doraemon', 'JunDiary']
}
let {name, age} = json;
console.log(name, age);		// Zuka 24

let {book} = json;
book.push('Dragonball');

// tại sao thay đổi book = hàm push thì json cũng thay đổi theo:
// Dùng: let book = json.book; thì kết quả cũng tương tự!
console.log(json.book);	// ["Conan", "One Piece", "Doraemon", "JunDiary", "Dragonball"]

// Answer: vì việc gán như trên khiến biến book tham chiếu đến json.book, do đó thay đổi giá
// trị 1 thằng sẽ khiến thằng kia thay đổi theo
json.book.push("abc");
console.log(book);		// ["Conan", "One Piece", "Doraemon", "JunDiary", "Dragonball", "abc"]

// thay đổi kiểu sau lại ko sao:
book = [];
console.log(json.book);	// ["Conan", "One Piece", "Doraemon", "JunDiary", "Dragonball", "abc"]
// TL: Đơn giản là vì book = []; tức là tạo mới biến book, và ko cho nó tham chiếu
// đến json.book nữa
```

## Hàm tăng 1 đơn vị: Thằng nào nghĩ ra được cách này chắc IQ cao lắm nhỉ!
```js
function incByOne(i) {
  switch(i) {
    case -2,147,483,648: return -2,147,483,647;
    ...
    case 0: return 1;
    case 1: return 2;
    case 2: return 3;
    ...
    case 2,147,483,646: return 2,147,483,647;
  }
  throw UnsupportedOperationException();
}
function incByOne(i) {
  let m = 1;
  while ((i & m) >= 1) {
    i = i ^ m;
    m <<= 1;
  }
  i = i ^ m;
  return i;
}
```

## Hàm kiểm tra số chẵn dùng đệ quy
```js
// Hàm kiểm tra số chẵn
function even(n) {
  return odd(n-1);
}
// Hàm kiểm tra số lẻ
function odd(n) {
  if(n == 1) return true;
  if(n == 0) return false;
  return even(n-1);
}
// Nhưng mà 2 hàm trên, nếu n > 10000 thì tèo ngay (tràn stack)!
```
