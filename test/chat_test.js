'use strict';

let _ = require('lodash'),
  io = require('socket.io'),
  ioClient = require('socket.io-client'),
  moment = require('moment'),
  chat = require('../app/chat');

const PORT = 4000, URL = `http://localhost:${PORT}`;

describe('Chat', () => {
  let server, client;

  before(() => {
    server = io.listen(PORT);

    chat(server);
  });

  after(() => {
    server.close();
  });

  beforeEach(done => {
    client = ioClient.connect(URL);

    client.on('connect', done);
  });

  afterEach(() => {
    client.disconnect();
  });

  describe('on join-room', () => {
    const ROOM_NAME = 'test';

    it('allows clients to join or create a room', done => {
      client.on('active-room', roomName => {
        expect(roomName).to.eq(ROOM_NAME);

        done();
      });
      client.emit('join-room', ROOM_NAME);
    });
  });

  describe('on message', () => {
    beforeEach(done => {
      client.on('active-room', () => {
        done();
      });
      client.emit('join-room', 'test');
    });

    context('when message is valid', () => {
      const MESSAGE = 'plop';

      beforeEach(() => {
        client.emit('message', MESSAGE)
      });

      it('sends a formated message to all members of a given room', done => {
        client.on('message', message => {
          expect(moment(message.sentAt).fromNow()).to.eq('a few seconds ago')

          expect(message.text).to.eq(MESSAGE)

          done();
        });
      });
    });

    context('when message is invalid', () => {
      beforeEach(() => {
        client.emit('message');
      });

      it('receives an error', done => {
        client.on('failure', message => {
          expect(_.isEmpty(message)).to.be.false;
          done();
        });
      });
    });
  });
});
