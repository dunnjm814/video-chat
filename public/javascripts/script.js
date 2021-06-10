const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3002'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})
console.log(username, room)

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
socket.on('user-connected', userId => {
  console.log(`${userId} has connected`)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
socket.emit('joinRoom', { username, room } )

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
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

const muteButton = document.getElementById('mute')
const muteIcon = document.getElementById('mute-icon')
const camButton = document.getElementById('cam-off')
const camIcon = document.getElementById('video-on')

muteButton.addEventListener('click', e => {
  e.preventDefault()
  console.log('clicked')
  if (muteIcon.classList.contains("fa-volume-up")) {
    muteIcon.classList.remove("fa-volume-up");
    muteIcon.classList.add("fa-volume-mute");
  } else {
    muteIcon.classList.remove("fa-volume-mute");
    muteIcon.classList.add("fa-volume-up");
  }
})

camButton.addEventListener('click', e => {
  e.preventDefault();
  console.log('clicked')
  if (camIcon.classList.contains('fa-video')) {
    camIcon.classList.remove("fa-video");
    camIcon.classList.add("fa-video-slash");
  } else {
    camIcon.classList.remove("fa-video-slash");
    camIcon.classList.add("fa-video");
  }
})

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages")

socket.on('message', message => {
  console.log(message)
  outputMessage(message)

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // get message text from form
  const msg = e.target.elements.msg.value
  // message to server
  socket.emit('chatMessage', msg)
  // clear input then focus
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add('message')
  div.innerHTML = `
  <p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.txt}
  </p>
  `
  document.querySelector('.chat-messages').appendChild(div)
}
