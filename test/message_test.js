'use strict';

let moment = require('moment'),
  Message = require('../app/Message');

describe('Message', () => {
  let message;

  beforeEach(() => {
    message = new Message('hello', { nickname: 'JohnSnow' });
  });

  describe('#sentAt', () => {
    it('is equal to the moment when the message has been sent', () => {
      expect(moment(message.sentAt).fromNow()).to.eq('a few seconds ago')
    });
  });

  describe('#sender', () => {
    it('is equal to the chatter nickname who sent the message', () => {
      expect(message.sender).to.eq('JohnSnow');
    });
  });

  describe('#text', () => {
    it('is equal to the message the chatter sent', () => {
      expect(message.text).to.eq('hello')
    });
  });

  describe('#isValid', () => {

  });
});
