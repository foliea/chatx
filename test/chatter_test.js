'use strict';

let Room = require('../app/room'),
  Chatter = require('../app/chatter');

describe('Chatter', () => {
  let chatter;

  beforeEach(()=> {
    chatter = new Chatter(
      { id: 'ezwo^pkPOKD', emit: ()=>{}, join: ()=>{}, leave: ()=>{} }
    );
  });

  describe('#nickname', () => {
    it('equals its socket id', () => {
      expect(chatter.nickname).to.eq(chatter.socket.id);
    });
  });

  describe('#join()', () => {
    let room = new Room('test');

    let socketMock;

    beforeEach(() => {
      socketMock = sinon.mock(chatter.socket);

      socketMock.expects('join').withArgs(room.name)

      socketMock.expects('emit').withArgs('active-room', room.name)
    });

    afterEach(() => {
      socketMock.restore();
    });

    context('when chatter is in no room', () => {
      beforeEach(() => {
        socketMock.expects('leave').never();

        chatter.join(room);
      });

      it('joins the room and emits the room informations', () => {
        expect(socketMock.verify()).to.be.true;
      });

      it('changes its active room', () => {
        expect(chatter.activeRoom).to.eq(room);
      });
    });

    context('when chatter already joined a room', () => {
      beforeEach(() => {
        chatter.activeRoom = new Room('/b');

        socketMock.expects('leave').withArgs(chatter.activeRoom.name);

        chatter.join(room);
      });

      it('leaves the previous active room and joins the new room', () => {
        expect(socketMock.verify()).to.be.true;
      });

      it('changes its active room', () => {
        expect(chatter.activeRoom).to.eq(room);
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
