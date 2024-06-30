const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

let io;
/*
socket.send('40{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2Mjg1NTlmNDIzZmIzMDUxOGM3MWFjNiIsImlhdCI6MTcxMzkxOTUzMn0.o-OZBhhF2ZcQzrJvthkqD-aslKC3ixLIbTmCH4O8U5A"}')
console.log('Connected to WebSocket server.');
socket.emit('42["ONLINE_UPDATE",105]');
socket.emit('42["minesClick", 'row]');
*/
function initSocket(server) {
  io = socketIo(server);
  console.log('attempt1');

  io.on("connection", async (socket) => {
    io.emit("ONLINE_UPDATE", io.engine.clientsCount + 100);

    socket.on("message", (data) => {
      console.log("Message from client:", data);
    });
  });

  return io;
}

const getIO = () => {
  if (!io) {
    console.log("Socket.io not initialized!");
  }
  return io;
};

function joinRoom(socket) {
  const token = socket.handshake.auth.token;
  console.log(token);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (user) {
      const roomId = user.id; // Assuming user ID is the room ID
      socket.join(roomId);
    }
  });
}

module.exports = {
  initSocket,
  getIO,
};
