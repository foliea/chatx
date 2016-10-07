'use strict';

let io = require('socket.io'),
  ioClient = require('socket.io-client'),
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

  describe('join-room', () => {
    it('allows clients to join or create a room', done => {
      let name = 'test;'

      client.on('active-room', roomName => {
        expect(roomName).to.eq(name);

        done();
      });
      client.emit('join-room', name);
    });
  });
});
