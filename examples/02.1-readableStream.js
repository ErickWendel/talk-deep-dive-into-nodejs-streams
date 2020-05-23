let counter = 0
const log = (...args) => console.log(`[${++counter}]`, ...args)
const { Readable } = require('stream')
const readable = new Readable()

readable.on("resume", _ => log(`resuming..`))
readable.on("pause", _ => log(`pausing..`))
readable.on("end", _ => log(`No more data!`))
readable.on("close", () => log(`closing..`))

readable.on("error", msg => log(`Caught error!: ${msg}`))
readable.on("data", msg => log(`Chunk read: ${msg}`))

readable.push("ping")
readable.pause()
readable.push("pong")
readable.resume()
readable.push(null)

readable.emit("error", new Error('**raising error!!'))

