'use strict';

let _ = require('lodash'),
  moment = require('moment');

class Message {
  constructor(text, sender) {
    this.sentAt = moment();
    this.text   = text;
    this.sender = sender.nickname;
  }
  isValid() {
    return !_.isEmpty(this.text);
  }
}

module.exports = Message;
