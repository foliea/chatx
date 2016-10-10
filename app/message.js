'use strict';

let _ = require('lodash'),
  moment = require('moment');

class Message {
  constructor(text, chatter) {
    this.sentAt = moment();
    this.text   = text;
  }
  get isValid() {
    return !_.isUndefined(this.text) && !_.isEmpty(this.text.trim()) &&
      this.text.length <= 280;
  }
}

module.exports = Message;
