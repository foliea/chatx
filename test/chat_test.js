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
    const DATA = { nickname: 'adrien', room: '/b' };

    context("when room doesn't exist", () => {
      it('creates a new room', done => {
        client.on('room-infos', () => {
          expect(chat.rooms.length).to.eq(1);

          done();
        });
        client.emit('join-room', DATA);
      });

      it('chatter joins the room', done => {
        client.on('room-infos', () => {
          expect(_.find(chat.rooms[0].members, member => {
            return member.nickname === DATA.nickname;
          })).to.exist;

          done();
        });
        client.emit('join-room', DATA);
      });
    });

    context("when room already exist", () => {
      beforeEach(() => {
        chat.rooms.push(new Room(server, DATA.room));
      });

      it("doesn't create a new room", done => {
        client.on('room-infos', () => {
          expect(chat.rooms.length).to.eq(1);

          done();
        });
        client.emit('join-room', DATA);
      });

      it('chatter joins the room', done => {
        client.on('room-infos', () => {
          expect(_.find(chat.rooms[0].members, member => {
            return member.nickname === DATA.nickname;
          })).to.exist;

          done();
        });
        client.emit('join-room', DATA);
      });
    });

    context('when room is invalid', () => {
      it("doesn't create a new room", done => {
        client.on('failure', error => {
          expect(error).to.not.be.empty;

          done();
        });
        client.emit('join-room', { nickname: 'johnsnow' });
      });
    });

    context('when chatter already joined the room', () => {
      beforeEach(done => {
        client.on('room-infos', () => { done(); });

        client.emit('join-room', { nickname: 'johnsnow', room: 'test' });
      });

      it('sends an error', () => {
        client.on('failure', done => {
          expect(error).to.not.be.empty;

          done();
        });
        client.emit('join-room', { nickname: 'johnsnow', room: 'test' });
      });
    });
  });

  describe('on message', () => {
    context("when client isn't in a room", () => {
      beforeEach(() => {
        client.emit('message', 'test')
      });

      it('sends an error', done => {
        client.on('failure', error => {
          expect(error).to.not.be.empty;

          done();
        });
      });
    });

    context('when client has joined a room', () => {
      beforeEach(done => {
        client.on('room-infos', () => { done(); });

        client.emit('join-room', { nickname: 'johnsnow', room: 'test' });
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

        it('sends an error', done => {
          client.on('failure', error => {
            expect(error).to.not.be.empty;

            done();
          });
        });
      });
    });
  });

  describe('on leave-room', () => {
    context('when client was not in a room', () => {
      it("doesn't fail", done => {
        client.on('leave-room', () => { done(); });

        client.emit('leave-room');
      });
    });

    context('when client was in a room', ()=> {
      beforeEach(done => {
        client.on('room-infos', () => { done() });

        client.emit('join-room', { nickname: 'johnsnow', room: 'test' });
      });

      it('leaves the room', done => {
        client.on('leave-room', () => {
          expect(chat.findOrCreate('test').members).to.be.empty;

          done();
        });
        client.emit('leave-room');
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
        client.on('room-infos', () => { done() });

        client.emit('join-room', { nickname: 'johnsnow', room: 'test' });
      });

      it('leaves the room', done => {
        client.on('disconnect', () => {
          setTimeout(() => {
            expect(chat.findOrCreate('test').members).to.be.empty;

            done();
          }, 500);
        });
        client.disconnect();
      });
    });
  });
});
