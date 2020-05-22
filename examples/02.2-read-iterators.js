const { createReadStream } = require('fs')
const rs = createReadStream("/dev/urandom");

;
(async () => {
    for await (const chunk of rs) {
        console.log('words:\n', chunk)
    }
})()

