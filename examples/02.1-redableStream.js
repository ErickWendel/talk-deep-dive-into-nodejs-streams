const log = (...args) => console.log(...args)
const { createReadStream } = require("fs");
// forcing multiple events splitting in bytes
const rs = createReadStream(__filename, { highWaterMark: 100});
let eventCounter = 0
rs.on("data", msg => log(`${[++eventCounter]}`, msg.toString()))
