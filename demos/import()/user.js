console.log('this is user module content')
const user = {
    name:'zhangsan'
}
export default  user
export function sayName(){
    console.log('user.name:',user.name)
}


