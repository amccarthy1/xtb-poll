const Poll = require('./poll');
const Winston = require('winston');

function PollPlugin(prefix) {
    this.prefix = prefix || '!';
    this.poll = null;
    this.xtb = null;
}

/**
 * A user error that should be sent via chat.
 * @param {string} message The error message to show.
 */
function UsageException(message) {
    this.name = 'UsageException';
    this.message = message || '';
}
UsageException.prototype = Object.create(Error.prototype);

/**
 * Starts a poll with options specified by the given array of choices.
 * @param {string[]} choices The list of choices users can vote for.
 */
PollPlugin.prototype.startPoll = function(choices) {
    const p = this.prefix;
    if (this.poll !== null) {
        throw new UsageException(`A poll is already in progress! End it with ${p}endpoll first!`);
    }
    this.poll = new Poll(choices);
    if (!this.xtb) return; // don't try to send a 'poll started' message if this plugin hasn't been fully initialized.
    return this.xtb.say(`A poll has been started! Use ${p}vote [number] to vote!`).then(() => {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }).then(() => {
        let choiceStrings = [];
        choices.forEach((choice, i) => {
            choiceStrings.push(`(${i}) '${choice}'`);
        });
        let message = 'Choices: ' + choiceStrings.join(', ');
        return this.xtb.say(message);
    });
};

PollPlugin.prototype.endPoll = function() {
    const p = this.prefix;
    if (this.poll === null) {
        throw new UsageException(`There is no active poll. Start wone with ${p}startpoll!`);
    }
    const winners = this.poll.findWinners();
    if (winners.length === 0) {
        return this.xtb.say('Nobody voted on the poll! So there is no winner :(');
    } else if (winners.length === 1) {
        return this.xtb.say(`The poll is over! The winner was ${winners[0]}`);
    } else {
        const winString = winners.join(', ');
        return this.xtb.say(`The poll ended with a tie! The winners are ${winString}`);
    }
};

PollPlugin.prototype.initialize = function(xtb) {
    const p = this.prefix;
    this.xtb = xtb;
    xtb.registerCommand(`${p}startpoll`, (message) => {
        const choices = message.contents.split(/\s+/).slice(1);
        try {
            return this.startPoll(choices);
        } catch (ex) {
            if (ex instanceof UsageException) {
                return this.xtb.say(ex.message);
            }
            return Promise.reject(ex);
        }
    });
    xtb.registerCommand(`${p}vote`, (message) => {
        const parts = message.contents.split(/\s+/);
        if (parts.length === 1) {
            return;
        }
        const vote = parseInt(parts[1], 10);
        // TODO error handling
        // TODO user ID instead of display name
        try {
            this.poll.vote(message.user['display-name'], vote);
        } catch (ex) {
            return;
        }
    });
    xtb.registerCommand(`${p}endpoll`, () => {
        try {
            return this.endPoll();
        } catch (ex) {
            if (ex instanceof UsageException) {
                return this.xtb.say(ex.message);
            }
            return Promise.reject(ex);
        }
    });
};

PollPlugin.prototype.cleanup = function() {
    Winston.log('info', 'PollPlugin cleaning up');
};

module.exports = PollPlugin;