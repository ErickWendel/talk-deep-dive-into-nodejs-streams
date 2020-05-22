const { Duplex } = require('stream')
let counter = 0
const dp = new Duplex({
    write(c, e, cb) {
        console.log('c', c.toString())
        cb(null, c)
    },
    // called on creation!
    read(size) {
        console.log('called!', size)
        
        // this.push(`${++counter}`)
        // if (counter > 10)
        //     this.push(null)
    }
})

dp.on("data", msg => console.log('msg', msg.toString()))
// dp.push("1")
// dp.push("2")
// dp.push(null)

dp.write("avc")
dp.write("acc")

dp.pipe((dest) => dest1 => {
    console.log('called!!')
})