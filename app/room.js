'use strict';

let _ = require('lodash'),
  moment = require('moment');

class Room {
  constructor(io, name) {
    this.io      = io;
    this.name    = name;
    this.members = [];
  }
  add(chatter, options) {
    this.members.push({ id: chatter.id, nickname: options.as });

    this.io.to(this.name).emit('member-joined', { nickname: chatter.nickname, at: moment() });
  }
  remove(chatter) {
    _.remove(this.members, member => {
      return member.id === chatter.id;
    });
    this.io.to(this.name).emit('member-left', { nickname: chatter.nickname, at: moment() });
  }
  send(message) {
    this.io.to(this.name).emit('message', message);
  }
  isAuthorized(nickname) {
    return !_.isUndefined(nickname) && !_.isEmpty(nickname.trim()) &&
      nickname.trim().length <= 10 && !this._isAlreadyInUse(nickname);
  }
  _isAlreadyInUse(nickname) {
    return _.find(this.members, member => {
      return member.nickname === nickname;
    });
  }
  get infos() {
    let membersNickname = _.map(this.members, member => {
      return member.nickname;
    });
    return { members: membersNickname };
  }
  get isValid() {
    return !_.isUndefined(this.name) && !_.isEmpty(this.name.trim()) &&
      this.name.length <= 10;
  }
}

module.exports = Room;
