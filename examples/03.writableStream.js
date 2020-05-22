const log = (...args) => console.log(...args)
const { createWriteStream, promises: { readFile } } = require('fs')

;
(async () => {
    const filename = `test.csv`
    const ws = createWriteStream(filename)
    ws.on("open", _ => log('opened!'))
    ws.on("close", _ => log('close!'))
    ws.on("drain", _ => log('drain!'))
    ws.on("finish", _ => log('finished!'))
    ws.on("error", (error) => log('error!', error.toString()))

    ws.write('name,age\n')
    ws.write(`Erick,25\n`)
    ws.write(`Mary,20\n`)
    ws.write(`Jose,30\n`)
    ws.emit('error', new Error('raising error!'))
    ws.end("Footer: I'm done bro")
    
    log(`\n${(await readFile(filename)).toString()}`)
})()