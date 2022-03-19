const chatForm = document.getElementById('chat-form')
const ChatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')
// Get user name and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const socket = io()

// join chat room
socket.emit('joinRoom', { username, room })

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputusers(users)
})

// Message from server
socket.on('message', (message) => {
  console.log(message)
  outPutMessage(message)

  // scroll down
  ChatMessages.scrollTop = ChatMessages.scrollHeight
})

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // Get message text value
  const msg = e.target.elements.msg.value

  // Emit message to server
  socket.emit('chatMessage', msg)

  // clear input
  e.target.elements.msg.value = ''
})

// outPut message to DOM
function outPutMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
              ${message.text}
            </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// Add users to DOM
function outputusers(users) {
  usersList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}
 `
}
