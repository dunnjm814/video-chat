const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const formatMsg = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
const { v4: uuidV4 } = require('uuid')
const Qs = require("qs");

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
  console.log(req.params)
  res.render('room', {room: req.params.room})
})

io.on('connection', socket => {
  // runs any time connection is made on web page
  console.log('connection')
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    console.log({user})
    socket.join(user.room)
    socket.to(room).emit(`user-connected`, username);

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })

    socket.on("chatMessage", (msg) => {
      console.log(msg);
      const user = getCurrentUser(socket.id)
      io.to(user.room).emit("message", formatMsg(user.username, msg));
    });

    socket.on("disconnect", () => {
      const user = userLeave(socket.id)
      if (user) {
        socket.to(user.room).emit(`user-disconnected`, user.username);

        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  })
})

server.listen(port, console.log(`server listening on port: ${port}`))
