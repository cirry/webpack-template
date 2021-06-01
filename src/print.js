export function print() {
    console.log('print.js')
}

const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('log')
        resolve()
    })
})
console.log(promise)

export const pp = () => {
    console.log('pp')
}
