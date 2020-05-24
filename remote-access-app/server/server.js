const { promises: { readFile } } = require('fs');

const server = require('http').createServer(handler)
const io = require('socket.io')(server); 


let broadcaster
const port = process.env.PORT || 4000

async function handler(req, res) {
    const data = await readFile(__dirname + '/index.html')
    res.writeHead(200);
    res.end(data);
}


io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
    console.log('connection received!', socket.id)

    socket.on("broadcaster", () => {
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster");
    });
    socket.on("watcher", () => {
        socket.to(broadcaster).emit("watcher", socket.id);
    });
    socket.on("offer", (id, message) => {
        console.log('offer', message)
        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {
        console.log('answer', message)
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
        console.log('candidate', message)
        socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("disconnect", () => {
        socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });

   
});

server.listen(port, () => console.log(`Server is running on port ${port}`));


//Move the mouse down by 100 pixels.
// setInterval(() => {

//     const mouse = robot.getMousePos();
//     console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y);
//     // robot.moveMouse(mouse.x, mouse.y + 100);
// }, 1000);

//Left click!
// robot.mouseClick();