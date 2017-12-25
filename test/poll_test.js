const assert = require('assert');
const uuidv4 = require('uuid/v4');

const Poll = require('../lib/poll');

describe('Poll', function() {
    let poll;

    beforeEach(function() {
        poll = new Poll([
            'choice 1',
            'choice 2',
            'choice 3',
        ]);
    });

    it('accepts votes from users', function() {
        const user1 = uuidv4();
        poll.vote(user1, 1);
        poll.vote(user1, 0);
        const winners = poll.findWinners();
        assert.deepEqual(winners, ['choice 1']);
    });

    it('handles no votes', function() {
        assert.deepEqual(poll.findWinners(), []);
    });

    it('handles ties', function() {
        const user1 = uuidv4();
        const user2 = uuidv4();
        poll.vote(user1, 0);
        poll.vote(user2, 2);
        const winners = poll.findWinners();
        assert.deepEqual(winners, ['choice 1', 'choice 3']);
    });

    it('throws on invalid votes', function() {
        const user1 = uuidv4();
        assert.throws(() => {
            poll.vote(user1, 'orange');
        }, /non-integer/, 'voting for a string should throw non-integer exception');

        assert.throws(() => {
            poll.vote(user1, -4);
        }, /out-of-range/, 'voting for negative number should throw out-of-range exception');

        assert.throws(() => {
            poll.vote(user1, 3);
        }, /out-of-range/, 'voting for too high a number should throw out-of-range exception');
    });
});