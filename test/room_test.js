'use strict';

let _ = require('lodash'),
  moment = require('moment'),
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
    let chatter = { id: 'aiwx^plwm', nickname: 'john' }, clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();

      sinon.stub(room.channel, 'emit');
    });

    afterEach(() => {
      clock.restore();
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
        let data = { nickname: chatter.nickname, at: moment() };

        expect(room.channel.emit).to.have.been.calledWith('member-joined', data);
      });
    });
  });

  describe('#remove()', () => {
    let chatter = { id: '^pcwlwm', nickname: 'john' }, clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();

      sinon.stub(room.channel, 'emit');

      room.members.push(chatter);

      room.remove(chatter);
    });

    afterEach(() => {
      clock.restore();
    });

    it('remove the chatter from the room members', () => {
      expect(_.find(room.members, member => {
        return member.id === chatter.id;
      })).to.not.exist;
    });

    it('broadcasts the updated room informations to the room chatters', () => {
      let data = { nickname: chatter.nickname, at: moment() };

      expect(room.channel.emit).to.have.been.calledWith('member-left', data);
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

  describe('#isValid', () => {
    let io = { to: () => {} };

    it('returns true', () => {
      expect(room.isValid).to.be.true;
    });

    context('when name is undefined', () => {
      beforeEach(() => {
        room = new Room(io);
      });

      it('returns false', () => {
        expect(room.isValid).to.be.false;
      });
    });

    context('when name is empty', () => {
      beforeEach(() => {
        room = new Room(io, '');
      });

      it('returns false', () => {
        expect(room.isValid).to.be.false;
      });
    });

    context('when name only contains spaces', () => {
      beforeEach(() => {
        room = new Room(io, '     ');
      });

      it('returns false', () => {
        expect(room.isValid).to.be.false;
      });
    });

    context('when name only carriage returns', () => {
      beforeEach(() => {
        room = new Room(io, '\n\r\n\r');
      });

      it('returns false', () => {
        expect(room.isValid).to.be.false;
      });
    });

    context('when name is too long', () => {
      beforeEach(() => {
        let name = _.fill(new Array(281), '.').toString();

        room = new Room(io, name);
      });

      it('returns false', () => {
        expect(room.isValid).to.be.false;
      });
    });
  });
});
