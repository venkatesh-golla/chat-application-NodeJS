const users = []

const addUser = ({ id, userName, room }) => {
    //clean data
    userName = userName.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if (!userName || !room) {
        return {
            error: 'UserName and Room are required to use this application'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => user.room === room && user.userName === userName)

    //validate userName
    if (existingUser) {
        return {
            error: 'UserName is in use'
        }
    }

    //store User
    const user = { id, userName, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)
    }
}

const getUser = (id) => {
    return userGot = users.find((user) => user.id === id)

}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}