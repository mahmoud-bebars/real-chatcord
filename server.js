const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'chatCord Bot'

// run when a client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    console.log(`🙋‍♂️ user: ${username} has joined room: ${room}`)

    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome the current user
    socket.emit(
      'message',
      formatMessage(botName, `welcome ${username} to chatCord`)
    )

    // Brodcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      )

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // listen for ChatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // runs when client disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      )
      // send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const port = 5000 || process.env.PORT

server.listen(port, () =>
  console.log(`🚀 server is up & running on port ${port}`)
)
