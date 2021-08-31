const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const socketIo = require('socket.io')
const io = socketIo(server)
const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')
app.use(express.static(publicDir))
const filter = require('bad-words')
const { genrateMessage , genrateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUserInTheRoom,getUser} = require('./utils/users')
io.on('connection', (socket) => {

    console.log('New WebSocket connection')

    socket.on('join', (options,callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', genrateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', genrateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomDate', {
        room : user.room,
        users : getUserInTheRoom(user.room)
        })
        callback()
    })
    socket.on('sendmessage', (message, callback) => {
        const user = getUser(socket.id) 

        const Filter = new filter()
        if (Filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', genrateMessage(user.username,message))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user)
        {
        io.to(user.room).emit('Admin','message', genrateMessage(`${user.username} has left`))
        io.to(user.room).emit('roomDate', {
            room : user.room,
            users : getUserInTheRoom(user.room)
            })
        }
    })
    socket.on('sendlocation', (coords, callback) => {
        const user = getUser(socket.id) 

        io.to(user.room).emit('location-message', genrateLocationMessage(user.username,`https://www.google.com/maps/@15${coords.latitude}, ${coords.longitude},15z`))
        callback()
    })

})
server.listen(port, () => {
    console.log(`Port is set on  ${port} `)
})