=== 1 biến State là 1 mảng
Giả sử như sau:
this.state = {
  nameArr: []
}
Sau đó trong component update lại như sau:
doSomething = () => {
  let { nameArr } = this.state;
  nameArr.push("Anhtu");
  this.setState({
    nameArr
  })
}
Nếu làm như vậy, component này sẽ KHÔNG rerender, vì state nameArr ko bị thay đổi
=> Cách làm đúng:
doSomething = () => {
  let nameArr = [...this.state.nameArr];
  nameArr.push("Anhtu");
  this.setState({
    nameArr
  })
}

=== Redux demo:
import React from 'react';
import { connect } from 'react-redux';
import store from '../path/to/store';
import axios from 'axios';
import UserList from '../views/list-user';

const UserListContainer = React.createClass({
  componentDidMount: function() {
    axios.get('/path/to/user-api').then(response => {
      store.dispatch({
        type: 'USER_LIST_SUCCESS',
        users: response.data
      });
    });
  },
  render: function() {
	// this.props.users instead of this.state.users since the users array is now a prop
    return <UserList users={this.props.users} />;
  }
});
const mapStateToProps = function(store) {
  return {
    users: store.userState.users
  };
}
export default connect(mapStateToProps)(UserListContainer);

- The first argument to connect() is a function that should return an object.
  The object's properties will become "props" on the component.
- Also notice that mapStateToProps() will receive an argument
  which is the entire Redux store. The main idea of mapStateToProps() is to
  isolate which parts of the overall state this component needs as its props
- tạm hiểu là: cái hàm mapStateToProps sẽ lấy 1 phần state trong store để
  chuyển vào props của component. Component đó chính là tham số của
  hàm connect()()
- Bây giờ thì UserListContainer có thể dùng props.users
- store có userState bởi vì ta có reducer sau:
const reducers = combineReducers({
  userState: userReducer,
  widgetState: widgetReducer
});
- userState có users vì ta đã khởi tạo như sau:
const initialUserState = {
  users: []
}
const userReducer = function(state = initialUserState, action) {
  switch(action.type) {
  case 'USER_LIST_SUCCESS':
    return Object.assign({}, state, { users: action.users });
  }
  return state;
}

===
- this.setState({
	name: "att"
});
this.myFunc(this.state.name);
// KHÔNG thể lấy giá trị att ở chỗ this.state.name được,
// vì hàm setState ở trên là bất đồng bộ, và nó sẽ thực hiện sau cái hàm myFunc ở dưới

===
Thay vì dùng onChange, hãy dùng onBlur ở thẻ input:
<input type="text" onBlur={(e) => this.onChange('name', e.target.value)} />

=== Thêm props dạng json:
VD:
let jsonProps = {name: "att", address: "Hanoi"};
<User {...jsonProps} />

=== Axios:
...{ Pragma: 'no-cache' }, thêm cái này vào axios headers, nếu ko token sẽ bị cache ở cookie
khi run trên IE (Chrome thì ổn!)
VD:
request.headers = {
    ...{ 'Content-Type': 'application/json' },
    ...{ Authorization: "Bearer " + Cookie.get(TOKEN) },
    ...{ Pragma: 'no-cache' },
    ...request.headers
}
axios(request);

=== Sleep in ReactJS
sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async doSomething(flag) {
  if(flag) {
    await this.sleep(2000);
    return "abc";
  } else {
    return "xyz";
  }
}
handleDemo = () => {
  this.doSomething(true).then(res => {
    console.log("str = ", res);
  });
}
render() {
  return(
    <button onClick={() => this.handleDemo()}>Demo</button >
  )
}

=== handle leak
class Abc extends React.Component {
  const userInfo = this.props.location.state ? this.props.location.state.userInfo : null;
  state = {
    roles: {},
    userInfo
  }

  componentDidMount() {
    Service.getAllRoles(
      response => {
        this.setState({ roles: response.data.value });
      },
      error => {}
    );
  }

  render() {
    const { userInfo, roles } = this.state;
    if(!userInfo) {
      return <Redirect to"/" />;
    }
    
    return (
      <div>
        <div>{userInfo}</div>
        <div>{roles}</div>
      </div>
    )
  }
}

Giả sử trang /abc sẽ render component Abc này
Với ví dụ trên, nếu như user vào trực tiếp trang /abc
=> this.props.location.state = null
=> redirect ngay về home: "/"
=> Vẫn bị lỗi memory leak, bởi vì sau khi Service.getAllRoles => state change => rerender
=> chả còn component Abc mà render roles nữa
=> Cách xử lý 1: dùng biến check xem component đã bị unmounted chưa, nếu rồi thì ko change state nữa
=> ko rerender
class Abc extends React.Component {
  const userInfo = this.props.location.state ? this.props.location.state.userInfo : null;
  state = {
    roles: {},
    userInfo
  }

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    Service.getAllRoles(
      response => {
        if(this._isMounted) {
          this.setState({ roles: response.data.value });
        }
      },
      error => {}
    );
  }

  componentWillMount() {
    _isMounted = false;
  }

  render() {
    const { userInfo, roles } = this.state;
    if(!userInfo) {
      return <Redirect to"/" />;
    }
    
    return (
      <div>
        <div>{userInfo}</div>
        <div>{roles}</div>
      </div>
    )
  }
}

- Cách xử lý 2: check luôn userInfo trong componentDidMount:
class Abc extends React.Component {
  state = {
    roles: {},
    userInfo: null,
    isRedirect: false
  }

  componentDidMount() {
    const userInfo = this.props.location.state ? this.props.location.state.userInfo : null;
    if(userInfo) {
      Service.getAllRoles(
        response => {
          this.setState({ roles: response.data.value, userInfo });
        },
        error => {}
      );
    } else {
      this.setState({
        isRedirect: true
      })
    }
  }

  render() {
    const { userInfo, roles, isRedirect } = this.state;
    if(isRedirect) {
      return <Redirect to"/" />;
    }
    
    return (
      <div>
        <div>{userInfo}</div>
        <div>{roles}</div>
      </div>
    )
  }
}
