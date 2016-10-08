'use strict';

let _ = require('lodash'),
  Message = require('./message'),
  Chatter = require('./chatter'),
  Room = require('./room');

const INVALID_MESSAGE_ERROR = 'Message must be present.';

class Chat {
  constructor(io) {
    this.io    = io;
    this.rooms = [];
  }
  initialize() {
    this.io.on('connection', socket => {
      let chatter = new Chatter(socket);

      socket.on('join-room', roomName => {
        chatter.join(this.findOrCreate(roomName));
      });
      socket.on('message', content => {
        let message = new Message(content, chatter);

        if (!message.isValid()) {
          return chatter.error(INVALID_MESSAGE_ERROR);
        }
        chatter.write(message);
      });
      socket.on('disconnect', ()=> {
        if (chatter.isInARoom) { chatter.leave(); }
      });
    });
  }
  findOrCreate(roomName) {
    let room = _.find(this.rooms, room => {
      return room.name === roomName;
    });
    return room ? room : this.create(roomName);
  }
  create(roomName) {
    let room = new Room(this.io, roomName);

    this.rooms.push(room);

    return room;
  }
}

module.exports = Chat;
