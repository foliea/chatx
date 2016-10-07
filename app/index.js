'use strict';

let express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http);

require('./chat')(io);

app
.use(express.static('public'))
.listen(3000, () => {
  console.log('listening on *:3000');
});
