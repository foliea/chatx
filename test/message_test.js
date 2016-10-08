'use strict';

let _ = require('lodash'),
  moment = require('moment'),
  Message = require('../app/Message');

describe('Message', () => {
  const CHATTER = { nickname: 'JohnSnow' };

  let message;

  beforeEach(() => {
    message = new Message('hello', CHATTER);
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

  describe('#isValid()', () => {
    it('returns true', () => {
      expect(message.isValid()).to.be.true;
    });

    context('when text is undefined', () => {
      beforeEach(() => {
        message = new Message(undefined, CHATTER);
      });

      it('returns false', () => {
        expect(message.isValid()).to.be.false;
      });
    });

    context('when text is empty', () => {
      beforeEach(() => {
        message = new Message('', CHATTER);
      });

      it('returns false', () => {
        expect(message.isValid()).to.be.false;
      });
    });

    context('when text only contains spaces', () => {
      beforeEach(() => {
        message = new Message('      ', CHATTER);
      });

      it('returns false', () => {
        expect(message.isValid()).to.be.false;
      });
    });

    context('when text only carriage returns', () => {
      beforeEach(() => {
        message = new Message('\n\r\n\r', CHATTER);
      });

      it('returns false', () => {
        expect(message.isValid()).to.be.false;
      });
    });

    context('when text is too long', () => {
      beforeEach(() => {
        let text = _.fill(new Array(281), '.').toString();

        message = new Message(text, CHATTER);
      });

      it('returns false', () => {
        console.log();
        expect(message.isValid()).to.be.false;
      });
    });
  });
});
