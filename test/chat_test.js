'use strict';

let _ = require('lodash'),
  io = require('socket.io'),
  ioClient = require('socket.io-client'),
  moment = require('moment'),
  Room = require('../app/room'),
  Chat = require('../app/chat');

const PORT = 4000, URL = `http://localhost:${PORT}`;

describe('Chat', () => {
  let chat, server, client;

  before(() => {
    server = io.listen(PORT);

    chat = new Chat(server);

    chat.initialize();
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

    chat.rooms = [];
  });

  describe('on join-room', () => {
    context("when room doesn't exist", () => {
      const ROOM_NAME = 'test';

      it('creates a new room', done => {
        client.on('room-infos', () => {
          expect(chat.rooms.length).to.eq(1);

          done();
        });
        client.emit('join-room', ROOM_NAME);
      });

      it('chatter joins the room', done => {
        client.on('room-infos', () => {
          expect(chat.rooms[0].members.length).to.eq(1);

          done();
        });
        client.emit('join-room', ROOM_NAME);
      });
    });

    context("when room already exist", () => {
      const ROOM_NAME = '/b';

      beforeEach(() => {
        chat.rooms.push(new Room(server, '/b'));
      });

      it("doesn't create a new room", done => {
        client.on('room-infos', () => {
          expect(chat.rooms.length).to.eq(1);

          done();
        });
        client.emit('join-room', ROOM_NAME);
      });

      it('chatter joins the room', done => {
        client.on('room-infos', () => {
          expect(chat.rooms[0].members.length).to.eq(1);

          done();
        });
        client.emit('join-room', ROOM_NAME);
      });
    });
  });

  describe('on message', () => {
    context("when client isn't in a room", () => {
      beforeEach(() => {
        client.emit('message', 'test')
      });

      it('receives an error', done => {
        client.on('failure', message => {
          expect(_.isEmpty(message)).to.be.false;

          done();
        });
      });
    });

    context('when client has joined a room', () => {
      beforeEach(done => {
        client.on('room-infos', () => { done(); });

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

  describe('on disconnect', ()=> {
    context("wasn't in a room", () => {
      it("doesn't fail", done => {
        client.on('disconnect', () => { done(); });

        client.disconnect();
      });
    });

    context('when client was in a room', ()=> {
      beforeEach(done => {
        client.on('room-infos', () => {
          client.disconnect();

          done();
        });
        client.emit('join-room', 'test');
      });

      it('leaves the room', ()=> {
        client.on('disconnect', () => {
          expect(chat.findOrCreate('test').members).to.be.empty

          done();
        });

      });
    });
  });
});
