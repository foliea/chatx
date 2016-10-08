(function(fn){var d=document;(d.readyState=='loading')?d.addEventListener('DOMContentLoaded',fn):fn();})(function(){
  var selectors = {
    button: {
      join: function() {
        return document.getElementById('join-room');
      },
      send: function() {
        return document.getElementById('send');
      }
    },
    input: {
      room: function() {
        return document.querySelector('input[name="room"]');
      },
      message: function() {
        return document.querySelector('input[name="message"]');
      }
    },
    block: {
      messages: function() {
        return document.getElementById('messages');
      },
      members: function() {
        return document.getElementById('members');
      },
      activeRoom: function() {
        return document.getElementById('active-room');
      }
    }
  };

  function UI(selectors, client) {
    this.selectors  = selectors;
    this.client     = client;
    this.activeRoom = null;
  }

  UI.prototype.initialize = function() {
    var self = this;

    this.selectors.button.join().disabled = true;
    this.selectors.button.send().disabled = true;

    this.selectors.input.room().disabled  = true;

    this.selectors.button.join().addEventListener('click', function() {
      self.selectors.block.messages().innerHTML = '';

      self.client.emit('join-room', self.selectors.input.room().value);
    });

    this.selectors.button.send().addEventListener('click', function() {
      var message = self.selectors.input.message().value,
        roomName  = self.selectors.block.activeRoom().innerHTML;

      self.client.emit('message', message);
    });

    this.selectors.input.room().addEventListener('input', function(input) {
      if (self.selectors.input.room().value == '') {
        self.selectors.button.join().disabled = true;
      } else {
        self.selectors.button.join().disabled = false;
      }
    });

    this.selectors.input.message().addEventListener('input', function(input) {
      if (!self.activeRoom || self.selectors.input.message().value.trim() == '') {
        self.selectors.button.send().disabled = true;
      } else {
        self.selectors.button.send().disabled = false;
      }
    });

    this.client.on('connect', function() {
      self.activate();
    });

    this.client.on('active-room', function(room) {
      self.loadRoom(room);
    });
    this.client.on('message', function(content) {
      self.populateChat(content);
    });
  }

  UI.prototype.activate = function() {
    this.selectors.input.room().disabled = false;
  }

  UI.prototype.populateChat = function(content) {
    this.selectors.input.message().value = '';

    this.selectors.block.messages().innerHTML += '<span>[' + content.sentAt + '] [' + content.sender + '] ' + content.text + '</span><br>';
  }

  UI.prototype.loadRoom = function(room) {
    this.selectors.block.activeRoom().innerHTML = room.name;

    this.activeRoom = room.name;

    this.selectors.block.members().innerHTML = '';

    room.members.forEach(nickname => {
      this.selectors.block.members().innerHTML += '<li>' + nickname + '</li>'
    });
  }

  var ui = new UI(selectors, io.connect());

  ui.initialize();
});
