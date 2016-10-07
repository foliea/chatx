'use strict';

let express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server);

require('./chat')(io);

app.use(express.static('public'))

server.listen(3000, () => {
  console.log('listening on *:3000');
});
