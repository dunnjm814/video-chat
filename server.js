const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', async (req, res) => {
  // create a new room, redirect user to this room
  // req.body
  res.render('index')
  // await res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  // receive room ID generated from param
  res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
  // runs any time connection is made on web page
  socket.on('join-room', (roomId, userId) => {
    // On front end when we have roomId and user, call everything inside join-room
    // console.log({ userId, roomId })
    // user joins room, emits broadcast user connect message (dont emit message to self)
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)

    // listen for chatMessage
    socket.on('chatMessage', msg => {
      console.log(msg)
    })

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(port, console.log(`server listening on port: ${port}`))
