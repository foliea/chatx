(function(fn){var d=document;(d.readyState=='loading')?d.addEventListener('DOMContentLoaded',fn):fn();})(function(){
  var joinButton = document.getElementById('join-room'),
       roomInput = document.querySelector('input[name="room"]');

  joinButton.disabled = true;
  roomInput.disabled  = true;

  let client = io.connect();

  client.on('connect', function() {
    roomInput.disabled = false;
  });

  client.on('active-room', function(roomName) {
    document.getElementById('active-room').innerHTML = roomName;
  });

  joinButton.addEventListener('click', function() {
    let roomName = roomInput.value;

    client.emit('join-room', roomName);
  });

  roomInput.addEventListener('input', function(input) {
    if (roomInput.value == '') {
      joinButton.disabled = true;
    } else {
      joinButton.disabled = false;
    }
  });
});
