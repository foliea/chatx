'use strict';

let Message = require('./message'),
  Chatter = require('./chatter');

module.exports = function(io) {
  io.on('connection', socket => {
    let chatter = new Chatter(socket);

    socket.on('join-room', roomName => {
      chatter.join(roomName);
    });
    socket.on('message', content => {
      let message = new Message(content, chatter);

      if (!message.isValid()) {
        return chatter.error('Message must be present');
      }
      io.to(chatter.activeRoom).emit('message', message);
    });
  });
}
