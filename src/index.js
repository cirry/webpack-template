import $ from 'jquery'

console.log($)

const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve()
    })
})
console.log(promise)

