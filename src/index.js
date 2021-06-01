import data from '../test/data.json'
// import "@babel/polyfill";


import '../test/test.css'
import '../test/tless.less'

import '../iconfont/iconfont.css'

import $ from 'jquery'
console.log($)

console.log(data)

import (/* webpackChunkName:'printJs' */'./print').then(({print}) => {
    print()
})


const add = (x, y) => {
    return x + y
}

console.log(add(1, 3))


