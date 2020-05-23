// process.stdin.pipe(process.stdout)

const { Transform } = require('stream')
const {
    createWriteStream,
    readFileSync
} = require('fs')

const filename = `${__dirname}/logger.log`

const mapCommands = new Transform({
    transform(chunk, enc, cb) {
        const cmd = chunk.toString().trim()
        if (!cmd) return cb()

        const at = new Date().toISOString()
        const item = `cmd: ${cmd},at: ${at},\n`

        cb(null, item)
    }
})

console.log('Write commands and then <Ctrl> + C to show output')
process.stdin
    .pipe(mapCommands)
    .pipe(createWriteStream(filename))

process.on("SIGINT", msg => {
    console.log()
    console.log(readFileSync(filename).toString())
    process.exit(0)
})