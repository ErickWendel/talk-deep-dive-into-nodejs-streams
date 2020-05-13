let peerConnection;
const config = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"]
        }
    ]
};
let host = prompt('What is your socket server host?')
if (!host) host = "http://localhost:4000"

const socket = io.connect(host);
const camera = document.getElementById('camera')
const video = document.getElementById('screen')

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config);
    peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
        });

    peerConnection.ontrack = event => {
        const item = event.streams[0]
        const isCamera = item.getVideoTracks().length && item.getAudioTracks().length 
        
        if(isCamera) {
            camera.srcObject = item;
            return;
        }

        video.srcObject = item; 
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };
});

socket.on("candidate", (id, candidate) => {
    peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
});

socket.on("connect", () => {
    console.log('connected!')
    socket.emit("watcher");
});

socket.on("broadcaster", () => {
    console.log('broadcaster!')
    socket.emit("watcher");
});

socket.on("disconnectPeer", () => {
    console.log('disconnectPeer!')
    peerConnection.close();
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
};

