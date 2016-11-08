'use strict';

let _ = require('lodash'),
  Message = require('./message'),
  Chatter = require('./chatter'),
  Room = require('./room');

const INVALID_MESSAGE_ERROR = 'Message must be present.',
      INVALID_ROOM_ERROR    = 'Room name must be present.',
      INVALID_NICKNAME      = "You can't join this room with this nickname.",
      ALREADY_IN_ROOM       = 'You already are in this room with this nickname.';

class Chat {
  constructor(io) {
    this.io    = io;
    this.rooms = [];
  }
  initialize() {
    this.io.on('connection', socket => {
      let chatter = new Chatter(socket);

      socket.on('join-room', req => {
        req = req || {};

        let room = this.findOrCreate(req.room);

        if (!room.isValid) {
          return chatter.error(INVALID_ROOM_ERROR);
        }
        if (!room.isAuthorized(req.nickname)) {
          return chatter.error(INVALID_NICKNAME);
        }
        if (room.isMember(chatter.id, req.nickname)) {
          return chatter.error(INVALID_NICKNAME);
        }
        chatter.join(room);

        room.add(chatter, { as: req.nickname.trim() })
      });
      socket.on('leave-room', () => {
        if (chatter.isInARoom) { chatter.leave(); }

        socket.emit('leave-room');
      });
      socket.on('message', req => {
        let message = new Message(req, chatter);

        if (!message.isValid) {
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

    if (room.isValid) {
      this.rooms.push(room);
    }
    return room;
  }
}

module.exports = Chat;
