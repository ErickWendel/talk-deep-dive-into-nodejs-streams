
"use strict";
const { promisify } = require('util')
const { pipeline: pipeSync } = require('stream')
const pipeline = promisify(pipeSync)

const { spawn } = require("child_process");
const subprocess = spawn(
    "sh",
    [
        "-c",
        `
        node -e "setInterval(() => {
            console.log(process.pid)
        }, 500);"
        `
    ],
    {
        stdio: "pipe",
    }
);


pipeline(
    subprocess.stdout,
    async function* (source) {
        for await (const chunk of source) {
            console.log('chunk', chunk.toString())
            yield chunk
        }
    }
).catch(err => console.log('error', err))

setTimeout(() => {
    subprocess.kill(); // Does not terminate the Node.js process in the shell.
}, 2000);