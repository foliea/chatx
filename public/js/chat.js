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

    this.isInARoom  = false;

    this.activeRoom = null;
  }

  UI.prototype.initialize = function() {
    var self = this;

    this.selectors.button.join().disabled = true;
    this.selectors.button.send().disabled = true;

    this.selectors.input.room().focus();

    this.selectors.button.join().addEventListener('click', function() {
      self.activeRoom = self.selectors.input.room().value;

      self.client.emit('join-room', self.activeRoom);
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

    this.selectors.input.room().addEventListener('keydown', function(e) {
      if (e.which !== 13) { return; }

      self.selectors.button.join().click();
    });

    this.selectors.input.message().addEventListener('input', function(input) {
      if (!self.isInARoom || self.selectors.input.message().value.trim() == '') {
        self.selectors.button.send().disabled = true;
      } else {
        self.selectors.button.send().disabled = false;
      }
    });

    this.selectors.input.message().addEventListener('keydown', function(e) {
      if (e.which !== 13) { return; }

      self.selectors.button.send().click();
    });

    this.client.on('connect', function() {
      self.activate();
    });

    this.client.on('disconnect', function() {
      self.activeRoom = false;
      self.inARoom    = false;

      self.selectors.button.join().disabled = true;
      self.selectors.button.send().disabled = true;

      self.selectors.block.activeRoom().innerHTML = 'Waiting for reconnection...';
    });

    this.client.on('reconnect', function() {
      self.selectors.block.activeRoom().innerHTML = 'No active channel';
    });

    this.client.on('room-infos', function(room) {
      self.loadRoom(room);
    });
    this.client.on('message', function(content) {
      self.populateChat(content);
    });

    this.client.on('member-joined', function(content) {
      self.populateChat({ sentAt: content.at, sender: content.nickname, text: 'joined the room.' });

      self.addMember(content.nickname);
    });

    this.client.on('member-left', function(content) {
      self.populateChat({ sentAt: content.at, sender: content.nickname, text: 'left the room.' });

      self.removeMember(content.nickname);
    });
  };

  UI.prototype.activate = function() {
    this.selectors.input.room().disabled = false;

    this.selectors.input.room();
  };

  UI.prototype.populateChat = function(content) {
    this.selectors.input.message().value = '';

    this.selectors.button.send().disabled = true;

    this.selectors.block.messages().innerHTML += '<code>[' + content.sentAt + '] [' + content.sender + '] ' + content.text + '</code><br>';
  };

  UI.prototype.loadRoom = function(room) {
    this.selectors.block.messages().innerHTML = '';

    this.selectors.block.activeRoom().innerHTML = '#' + this.activeRoom;

    this.isInARoom = true;

    this.selectors.block.members().innerHTML = '';

    var self = this;

    room.members.forEach(function(nickname) {
      self.addMember(nickname);
    });

    this.selectors.input.message().focus();

    this.selectors.block.messages().innerHTML += '<code>** Welcome to #' + this.activeRoom + '. **</code><br>';
  };

  UI.prototype.addMember = function(nickname) {
    this.selectors.block.members().innerHTML += '<li id="' + nickname + '" class="list-group-item">' + nickname + '</li>';
  };

  UI.prototype.removeMember = function(nickname) {
    document.getElementById(nickname).remove();
  };

  var ui = new UI(selectors, io.connect());

  ui.initialize();
});
