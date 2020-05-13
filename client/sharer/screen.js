// const { name: appName } = require('./../package.json')
const peerConnections = {};
const config = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"]
        }
    ]
};
const videoCamera = document.getElementById('camera')
const videoScreen = document.getElementById('screen')

const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");


function getDevices() {
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos;
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

async function getCameraStream() {
    if (window.cameraScreen) {
        window.cameraScreen.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };
    const str = await navigator.mediaDevices.getUserMedia(constraints)
    return handleSelects(str)
}

function handleSelects(stream) {
    window.cameraScreen = stream;
    audioSelect.selectedIndex = [...audioSelect.options].findIndex(
        option => option.text === stream.getAudioTracks()[0].label
    );
    videoCamera.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
    );
    videoCamera.srcObject = stream;
    socket.emit("broadcaster");
}

function handleError(error) {
    console.error("Error: ", error);
}


class RemoteScreen {
    constructor({ socket }) {
        this.socket = socket
        this.registerSocketEvents(socket)
    }

    registerSocketEvents(socket) {
        socket.on("answer", (id, description) => {
            peerConnections[id].setRemoteDescription(description);
        });

        socket.on("watcher", id => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections[id] = peerConnection;

            const screenStream = videoScreen.srcObject;
            const cameraStream = videoCamera.srcObject;
 
            screenStream.getTracks()
                .forEach(track => peerConnection.addTrack(track, screenStream));

            cameraStream.getTracks()
                .forEach(track => peerConnection.addTrack(track, cameraStream));


            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };

            peerConnection
                .createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socket.emit("offer", id, peerConnection.localDescription);
                });
        });

        socket.on("candidate", (id, candidate) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on("disconnectPeer", id => {
            peerConnections[id].close();
            delete peerConnections[id];
        });

        window.onunload = window.onbeforeunload = () => {
            socket.close();
        };
    }
    async handleScreen() {
        const screen = await navigator.mediaDevices.getDisplayMedia()
        this.shareScreen(screen)
    }
    async handleCamera() {
        const str = await getCameraStream()
        const devices = await getDevices(str)
        await gotDevices(devices)
    }
    async  showSources() {


        await Promise.all([
            this.handleScreen(),
            this.handleCamera()
        ])

        this.socket.emit("broadcaster");

        audioSelect.onchange = getCameraStream;
        videoSelect.onchange = getCameraStream;
    }

    shareScreen(screen) {

        if (!screen) {
            console.log('Desktop Capture access rejected.');
            return;
        }
        if (window.stream) {
            window.stream
                .getTracks()
                .forEach(track => track.stop());
        }

        console.log("Desktop sharing started.. desktop_id:" + screen.id);

        try {
            videoScreen.srcObject = screen
            window.stream = screen;

            videoScreen.onloadedmetadata = (e) => videoScreen.play()
        } catch (e) {
            console.log('ERROR***', e)
            // System Preferences / Security & Privacy / Camera / Checkbox next to "Chrome"
        }

    }

}
