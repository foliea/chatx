'use strict';

let Chatter = require('../app/chatter');

describe('Chatter', () => {
  let chatter;

  beforeEach(()=> {
    chatter = new Chatter(
      { id: 'ezwo^pkPOKD', emit: ()=>{}, join: ()=>{}, leave: ()=>{} }
    );
  });

  describe('#id', () => {
    it('equals its socket id', () => {
      expect(chatter.id).to.eq(chatter.socket.id);
    });
  });

  describe('#isInARoom', () => {
    it('returns false', () => {
      expect(chatter.isInARoom).to.be.false;
    });

    context('when chatter is in a room', ()=> {
      beforeEach(()=> {
        chatter.activeRoom = {};
      });

      it('returns true', () => {
        expect(chatter.isInARoom).to.be.true;
      });
    });
  });

  describe('#join()', () => {
    let room;

    beforeEach(() => {
      sinon.stub(chatter, 'leave');

      sinon.stub(chatter.socket, 'join');

      sinon.stub(chatter.socket, 'emit');

      room = { name: '/b', add: ()=>{}, infos: {} };
    });

    context('when chatter was not in a room', ()=> {
      beforeEach(() => {
        chatter.join(room);
      });

      it("doesn't leave the previous room", () => {
        expect(chatter.leave).to.not.have.been.called;
      });

      it('joins given room', () => {
        expect(chatter.socket.join).to.have.been.calledWith(room.name);
      });

      it('sets its active room to given room', ()=> {
        expect(chatter.activeRoom).to.eq(room);
      });

      it('sends the room infos to the chatter', () => {
        expect(chatter.socket.emit).to.have.been.calledWith('room-infos', room.infos);
      });
    });

    context('when chatter was in another room', ()=> {
      beforeEach(() => {
        chatter.activeRoom = { name: '/c'};

        chatter.join(room);
      });

      it('leaves the previous room', () => {
        expect(chatter.leave).to.have.been.called;
      });

      it('joins given room', () => {
        expect(chatter.socket.join).to.have.been.calledWith(room.name);
      });

      it('sets its active room to given room', ()=> {
        expect(chatter.activeRoom).to.eq(room);
      });

      it('sends the room infos to the chatter', () => {
        expect(chatter.socket.emit).to.have.been.calledWith('room-infos', room.infos);
      });
    });

    context('when chatter was already in this room', ()=> {
      beforeEach(() => {
        chatter.activeRoom = { name: '/c' };

        chatter.join(room);

        sinon.stub(chatter, 'error');

        chatter.join(room);
      });

      it('returns an error', ()=> {
        expect(chatter.error).to.have.been.calledOnce;
      });
    });
  });

  describe('#write()', () => {
    context('when chatter is in a room', ()=> {
      let room;

      beforeEach(() => {
        room = { name: '/c', remove: ()=> {} };

        chatter.activeRoom = room;

        sinon.stub(chatter.socket, 'leave');

        sinon.stub(room, 'remove');

        chatter.leave();
      });

      it('leaves the room', ()=> {
        expect(chatter.socket.leave).to.have.been.calledWith(room.name);
      });

      it('removes itself from the room', ()=> {
        expect(room.remove).to.have.been.calledWith(chatter);
      });

      it('reset its active room', ()=> {
        expect(chatter.activeRoom).to.be.null;
      });
    });

    context('when chatter is not in a room', ()=> {
      beforeEach(() => {
        sinon.stub(chatter, 'error');

        chatter.leave();
      });

      it('sends an error to the chatter', () => {
        expect(chatter.error).to.have.been.calledWith('Please join a room first');
      });
    });
  });

  describe('#write()', () => {
    context('when chatter is in a room', ()=> {
      beforeEach(() => {
        chatter.activeRoom = { name: '/c', send: ()=> {} };

        sinon.stub(chatter.activeRoom, 'send');

        chatter.write('message');
      });

      it('sends a message to the chatter active room', () => {
        expect(chatter.activeRoom.send).to.have.been.calledWith('message', { from: chatter.id });
      });
    });

    context('when chatter is not in a room', ()=> {
      beforeEach(() => {
        sinon.stub(chatter, 'error');

        chatter.write('message');
      });

      it('sends an error to the chatter', () => {
        expect(chatter.error).to.have.been.calledWith('Please join a room first');
      });
    });
  });

  describe('#error()', () => {
    const ERROR = 'Error.'

    beforeEach(() => {
      sinon.stub(chatter.socket, 'emit');

      chatter.error(ERROR);
    });

    it('sends an error to the chatter socket', ()=> {
      expect(chatter.socket.emit).to.have.been.calledWith('failure', ERROR);
    });
  });
});
