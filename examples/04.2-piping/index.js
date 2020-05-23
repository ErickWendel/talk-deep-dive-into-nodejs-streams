let counter = 0
const log = (...args) => console.log(`[${++counter}]`, ...args)

const { createReadStream } = require('fs')
const { promisify } = require('util')
const { Transform, Writable, pipeline: pipeSync } = require('stream')
const csvtojson = require('csvtojson')

const pipeline = promisify(pipeSync)
const datasource = `${__dirname}/test.csv`
const currentYear = new Date().getFullYear()

const mapAge = new Transform({
    objectMode: true,
    transform: (chunk, enc, cb) => {
        const item = JSON.parse(chunk)
        const age = currentYear - item.birthYear
        if (age < 0) {
            const error = JSON.stringify({ message: 'age must be higher than 0', item })
            return cb(error)
        }

        const data = JSON.stringify({
            name: item.name,
            age
        })

        return cb(null, data)
    }
})

const showOutput = new Writable({
    write: (chunk, encoding, cb) => {
        const data = JSON.parse(chunk)

        log('name', chunk.toString())
        cb()
    }
})


createReadStream(datasource)
    .pipe(csvtojson())
    .on("error", msg => log('csvtojson error!', msg))

    .pipe(mapAge)
    .on("error", msg => log('mapAge error!', msg))

    .pipe(showOutput)
    .on("error", msg => log('showOutput error!', msg))

    .on("finish", msg => log("process finished!"))
    .on("error", msg => log("error"))


    {
        (async () => {
            try {
                await pipeline(
                    createReadStream(datasource),
                    csvtojson(),
                    mapAge,
                    showOutput,
                )
    
            } catch (error) {
                log('error on pipeline!', error)
            }
    
        })()
    
    }