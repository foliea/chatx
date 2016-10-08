'use strict';

let _ = require('lodash'),
  moment = require('moment');

class Message {
  constructor(text, chatter) {
    this.sentAt = moment();
    this.text   = text;
    this.sender = chatter.nickname;
  }
  isValid() {
    return !_.isEmpty(this.text);
  }
}

module.exports = Message;
