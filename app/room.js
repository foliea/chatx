'use strict';

let _ = require('lodash');

class Room {
  constructor(io, name) {
    this.io      = io;
    this.name    = name;
    this.members = [];
  }
  add(chatter) {
    this.members.push(chatter);

    this.members = _.uniq(this.members);

    this.io.to(this.name).emit('active-room', this.infos);
  }
  remove(chatter) {
    _.remove(this.members, member => {
      return member.id == chatter.id;
    });
    this.io.to(this.name).emit('active-room', this.infos);
  }
  send(message) {
    this.io.to(this.name).emit('message', message);
  }
  get infos() {
    let membersNickname = _.map(this.members, member => {
      return member.nickname;
    });
    return { name: this.name, members: membersNickname };
  }
}

module.exports = Room;
