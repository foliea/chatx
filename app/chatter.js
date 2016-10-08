'use strict';

class Chatter {
  constructor(socket) {
    this.socket     = socket;
    this.nickname   = socket.id;
    this.activeRoom = null;
  }
  join(roomName) {
    if (this.activeRoom) {
      this.socket.leave(this.activeRoom);
    }
    this.socket.join(roomName);

    this.activeRoom = roomName;

    this.socket.emit('active-room', roomName);
  }
  error(content) {
    this.socket.emit('failure', content);
  }
}

module.exports = Chatter;
