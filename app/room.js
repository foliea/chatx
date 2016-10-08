'use strict';

let _ = require('lodash');

class Room {
  constructor(io, name) {
    this.channel = io.to(name);
    this.name    = name;
    this.members = [];
  }
  add(chatter) {
    let member = _.find(this.members, member => {
      return member.id === chatter.id;
    });

    if (member) { return; }

    this.members.push(chatter);

    this.channel.emit('room-infos', this.infos);
  }
  remove(chatter) {
    _.remove(this.members, member => {
      return member.id === chatter.id;
    });
    this.channel.emit('room-infos', this.infos);
  }
  send(message) {
    this.channel.emit('message', message);
  }
  get infos() {
    let membersNickname = _.map(this.members, member => {
      return member.nickname;
    });
    return { members: membersNickname };
  }
}

module.exports = Room;
