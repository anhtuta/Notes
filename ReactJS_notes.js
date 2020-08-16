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