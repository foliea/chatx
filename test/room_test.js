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
    let chatter = { id: 'aiwx^plwm' }, clock, channel;

    beforeEach(() => {
      clock = sinon.useFakeTimers();

      channel = { emit: () => {} };

      sinon.stub(channel, 'emit');

      sinon.stub(room.io, 'to', roomName => {
        if (roomName === room.name) { return channel };
      });

      room.add(chatter, { as: 'johndoe' });
    });

    afterEach(() => {
      clock.restore();
    });

    it("adds the chatter to the room members", () => {
      expect(_.find(room.members, member => {
        return member.id === chatter.id && member.nickname == 'johndoe';
      })).to.exist;
    });

    it('broadcasts the updated room informations to the room chatters', () => {
      let data = { nickname: 'johndoe', at: moment() };

      expect(channel.emit).to.have.been.calledWith('member-joined', data);
    });
  });

  describe('#remove()', () => {
    let chatter = { id: '^pcwlwm' }, clock, channel;

    beforeEach(() => {
      clock = sinon.useFakeTimers();

      channel = { emit: () => {} };

      sinon.stub(channel, 'emit');

      sinon.stub(room.io, 'to', roomName => {
        if (roomName === room.name) { return channel };
      });

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

      expect(channel.emit).to.have.been.calledWith('member-left', data);
    });
  });

  describe('#send()', () => {
    let message = { text: 'hello!', sentAt: moment() },
        chatter = { id: 'eriojwpokxmMJ?LK', nickname: 'chirac' }, channel;

    beforeEach(() => {
      channel = { emit: () => {} };

      sinon.stub(channel, 'emit');

      sinon.stub(room.io, 'to', roomName => {
        if (roomName === room.name) { return channel };
      });

      room.members.push(chatter)

      room.send(message, { from: chatter.id });
    });

    it('broadcasts the message to the room chatters', () => {
      expect(channel.emit).to.have.been.calledWith('message', message);
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

  describe('#isAuthorized()', () => {
    it('returns true', () => {
      expect(room.isAuthorized('test')).to.be.true;
    });

    context('when nickname is undefined', () => {
      it('returns false', () => {
        expect(room.isAuthorized()).to.be.false;
      });
    });

    context('when nickname is empty', () => {
      it('returns false', () => {
        expect(room.isAuthorized('')).to.be.false;
      });
    });

    context('when nickname only contains spaces', () => {
      it('returns false', () => {
        expect(room.isAuthorized('    ')).to.be.false;
      });
    });

    context('when nickname only carriage returns', () => {
      it('returns false', () => {
        expect(room.isAuthorized('\r\n\r\n')).to.be.false;
      });
    });

    context('when nickname is too long', () => {
      it('returns false', () => {
        let nickname = _.fill(new Array(281), '.').toString();

        expect(room.isAuthorized(nickname)).to.be.false;
      });
    });

    context('when nickname is already in use', () => {
      const NICKNAME = 'sam';

      beforeEach(() => {
        room.members.push({ id: 'dspko;', nickname: NICKNAME });
      });

      it('returns false', () => {
        expect(room.isAuthorized(NICKNAME)).to.be.false;
      });
    });

    describe('#isMember()', () => {
      let id = 'dspok', nickname = 'poppy';

      context('when room has a member matching both given id and nickname', () => {
        beforeEach(() => {
          room.members.push({ id: id, nickname: nickname });
        });

        it('returns true', () => {
          expect(room.isMember(id, nickname)).to.be.true;
        });
      });

      context('when room has no member matching given id', () => {
        beforeEach(() => {
          room.members.push({ nickname: nickname });
        });

        it('returns false', () => {
          expect(room.isMember(id, nickname)).to.be.false;
        });
      });

      context('when room has no member matching given nickname', () => {
        beforeEach(() => {
          room.members.push({ nickname: nickname });
        });

        it('returns false', () => {
          expect(room.isMember(id, nickname)).to.be.false;
        });
      });
    });
  });
});
