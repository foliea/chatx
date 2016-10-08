'use strict';

let Chance = require('chance'),
  chance = new Chance();

const JOIN_ROOM_ERROR = 'Please join a room first';

class Chatter {
  constructor(socket) {
    this.socket     = socket;
    this.id         = socket.id;
    this.nickname   = chance.name();
    this.activeRoom = null;
  }
  join(room) {
    if (this.activeRoom) { this.leave() };

    this.activeRoom = room;

    this.socket.join(room.name);

    room.add(this);
  }
  leave() {
    if (!this.activeRoom) {
      return this.error(JOIN_ROOM_ERROR);
    }
    this.socket.leave(this.activeRoom.name);

    this.activeRoom.remove(this);

    this.activeRoom = null;
  }
  write(message) {
    if (!this.activeRoom) {
      return this.error(JOIN_ROOM_ERROR);
    }
    this.activeRoom.send(message);
  }
  error(content) {
    this.socket.emit('failure', content);
  }
  get isInARoom() {
    return this.activeRoom !== null;
  }
}

module.exports = Chatter;
