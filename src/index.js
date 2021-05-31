import data from '../test/data.json'
// import "@babel/polyfill";
import print from './print'

import '../test/test.css'
import '../test/tless.less'

import '../iconfont/iconfont.css'

import $ from 'jquery'

console.log($)

const promise = new Promise((resolve, reject) =>{
    setTimeout(() =>{
        console.log('log')
        resolve()
    })
})

console.log(promise)


print()

const add = (x, y) => {
    return x + y
}

console.log(add(1, 3))


