const log = (...args) => console.log(...args)

const { Readable } = require('stream')
const rs = new Readable()

rs.on("resume", _ => log("resuming.."))
rs.on("pause", _ => log("pausing.."))
rs.on("end", _ => log("No more data!"))
rs.on("close", () => log("closing.."))

rs.on("data", msg => log(`Chunk read: ${msg}`))
rs.on("error", msg => log(`Caught error!: ${msg}`))

rs.push("ping")
rs.pause()
rs.push("pong")
rs.resume()
rs.push(null)

rs.emit("error", new Error('**raising error!!'))

