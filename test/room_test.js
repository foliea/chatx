'use strict';

let _ = require('lodash'),
  Room = require('../app/room');

describe('Room', () => {
  const NAME = '/b';

  let room;

  beforeEach(() => {
    let io = { to: () => { return { emit: () => {} }; } };

    room = new Room(io, NAME);
  });

  describe('#name', () => {
    it('is equal to given name', () => {
      expect(room.name).to.eq(NAME);
    });
  });

  describe('#members', () => {
    it('is empty by default', () => {
      expect(room.members).to.be.empty;
    });
  });

  describe('#infos', () => {
    beforeEach(() => {
      room.members = room.members.concat([{ nickname: 'John' }, { nickname: 'Connor' }]);
    });

    it('returns the room informations', () => {
      expect(room.infos).to.eql({ members: ['John', 'Connor'] });
    });
  });

  describe('#add()', () => {
    let chatter = { id: 'aiwx^plwm', nickname: 'john' };

    beforeEach(() => {
      sinon.stub(room.channel, 'emit');
    });

    context('when chatter is already a member of the room', () => {
      beforeEach(() => {
        room.members.push(chatter);

        room.add(chatter);
      });

      it('adds the chatter to the room members', () => {
        expect(_.find(room.members, member => {
          return member.id === chatter.id;
        })).to.exist;
      });

      it("doesn't broadcast the updated room informations", () => {
        expect(room.channel.emit).to.not.have.been.called;
      });
    });

    context('when chatter is not a member of the room', () => {
      beforeEach(() => {
        room.add(chatter);
      });

      it("doesn't add a duplicate of this chatter", () => {
        expect(room.members.count).to.eq(_.uniq(room.members).count);
      });

      it('broadcasts the updated room informations to the room chatters', () => {
        expect(room.channel.emit).to.have.been.calledWith('room-infos', room.infos);
      });
    });


  });

  describe('#remove()', () => {
    let chatter = { id: '^pcwlwm', nickname: 'john' };

    beforeEach(() => {
      sinon.stub(room.channel, 'emit');

      room.members.push(chatter);

      room.remove(chatter);
    });

    it('remove the chatter from the room members', () => {
      expect(_.find(room.members, member => {
        return member.id === chatter.id;
      })).to.not.exist;
    });

    it('broadcasts the updated room informations to the room chatters', () => {
      expect(room.channel.emit).to.have.been.calledWith('room-infos', room.infos);
    });
  });

  describe('#send()', () => {
    const MESSAGE = 'hello!'

    beforeEach(() => {
      sinon.stub(room.channel, 'emit');

      room.send(MESSAGE);
    });

    it('broadcasts the message to the room chatters', () => {
      expect(room.channel.emit).to.have.been.calledWith('message', MESSAGE);
    });
  });
});
