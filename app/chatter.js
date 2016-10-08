'use strict';

class Chatter {
  constructor(socket) {
    this.socket     = socket;
    this.nickname   = socket.id;
    this.id         = socket.id;
    this.activeRoom = null;
  }
  join(room) {
    this.leave();

    this.activeRoom = room;

    this.socket.join(room.name);

    room.add(this);
  }
  leave() {
    if (!this.activeRoom) { return; }

    this.socket.leave(this.activeRoom.name);

    this.activeRoom.remove(this);

    this.activeRoom = null;
  }
  write(message) {
    if (!this.activeRoom) { return; }

    this.activeRoom.send(message);
  }
  error(content) {
    this.socket.emit('failure', content);
  }
}

module.exports = Chatter;
