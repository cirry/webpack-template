import data from '../test/data.json'
// import "@babel/polyfill";
import print from './print'

import '../test/test.css'
import '../test/tless.less'

import '../iconfont/iconfont.css'

const promise = new Promise((resolve, reject) =>{
    setTimeout(() =>{
        console.log('log 1s hou')
        resolve()
    })
})

console.log(promise)


print()

const add = (x, y) => {
    return x + y
}

console.log(add(1, 3))
console.log(data)

console.log('123456')

