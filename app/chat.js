module.exports = function(io) {
  io.on('connection', socket => {
    socket.on('join-room', roomName => {
      socket.join(roomName);

      socket.emit('active-room', roomName);
    });
  });
}
