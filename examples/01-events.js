const log = (...args) => console.log(...args)
const EventEmitter = require('events')
class Downloader extends EventEmitter { }

const downloader = new Downloader()
downloader.on('data', msg => log('msg arrived!', msg))
downloader.on('error', msg => log('error!', msg))

downloader.on('my-custom-event', msg => log('custom!', msg))

setInterval(() => {
    downloader.emit('my-custom-event', { message: 'Hello!' })
    downloader.emit('data', 'Hey there!')    
}, 1000);



