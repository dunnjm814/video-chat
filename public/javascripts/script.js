const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    // listen for when somebody tries to call
    // answer call, send our stream
    call.answer(stream)

    const video = document.createElement('video')
    call.on('stream', otherUserStream => {
      // responds with the video stream from the other client
      addVideoStream(video, otherUserStream)
    })
  })

  socket.on('user-connected', userId => {
    connectNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  // console.log(`${userId} has disconnected`)
  // let closePeer = peer[userId]

  // if (closePeer) {
  //   closePeer.close()
  // }
  if (peers[userId]) peers[userId].close();
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-connected', userId => {
  console.log(`${userId} has connected`)
})

function connectNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    // close listens for client browser close.
    video.remove()
  })
  // directly links each peer userId to a call
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
