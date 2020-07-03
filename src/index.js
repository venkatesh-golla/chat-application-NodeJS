const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

let count = 0


io.on('connection', (socket) => {
    console.log('New Websocket Connection')

    socket.on('join', ({ userName, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, userName, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome User!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.userName} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        const user= getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.userName,message))
        callback()
    })

    socket.on('sendLocation', (position, callback) => {
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.userName,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            socket.broadcast.to(user[0].room).emit('message', generateMessage('Admin',`${user[0].userName} has left`))
            io.to(user[0].room).emit('roomData',{
                room:user[0].room,
                users:getUsersInRoom(user[0].room)
            })
        }

    })
})

server.listen(port, () => {
    console.log(`Server is up on ${port}`)
})

//countUpdated is an event emitted by server and clients listens to it and client can send acknowledgment to server
//increment is an event emitted by client while server listens to it and server can send acknowledgment to client

//by using socket.emit only one connection will receive the message
//by using socket.broadcast.emit all connections except the joined connection will get the message
//by using io.emit all connections will receive the message

        //till now we had 3 functions to send data from server to client socket.emit, io.emit and socket.broadcast.emit
        //By introducing rooms we will have 2 new functions io.to.emit (everyone in a room), socket.broadcast.to.emit(everyone in a room except itself)