const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const io = new Server({
  cors: {
    origin: 'http://localhost:3000',
  },
});

const usersSocket = [];
const messages = [];

io.on('connection', (socket) => {
  const userStringified = socket.handshake.query.loggedUser;
  if (userStringified) {
    const user = JSON.parse(userStringified);
    usersSocket.push({
      user,
      socket,
    });

    socket.emit('listMessages', messages);

    socket.on('newMessage', (text) => {
      const newMessage = { id: uuidv4(), text, user };
      messages.push(newMessage);
      io.emit('newMessageReceived', newMessage);
    });

    socket.on('typing', (nickname) => {
      socket.broadcast.emit('typing', nickname);
    });

    socket.on('stopTyping', (nickname) => {
      socket.broadcast.emit('stopTyping', nickname);
    });
  }
});

io.listen(3001);
console.log('socket listening at port 3001');
