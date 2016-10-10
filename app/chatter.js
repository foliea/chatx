'use strict';

const JOIN_ROOM_ERROR = 'Please join a room first',
      ALREADY_IN_ROOM = 'Chatter already in room.';

class Chatter {
  constructor(socket) {
    this.socket     = socket;
    this.id         = socket.id;
    this.activeRoom = null;
  }
  join(room) {
    if (this.activeRoom) {
      if (this.activeRoom.name === room.name) {
        return this.error(ALREADY_IN_ROOM);
      }
      this.leave();
    };
    this.activeRoom = room;

    this.socket.join(room.name);

    this.socket.emit('room-infos', room.infos);
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
