let host = prompt('What is your socket server host?')
if (!host) host = "http://localhost:4000"

const socket = io.connect(host);

async function initialize() {
  console.log('initializing..')
  const remoteScreen = new RemoteScreen({ socket })
  await remoteScreen.showSources();
}

window.onload = async function () {
  socket.on('connect', initialize);
}




