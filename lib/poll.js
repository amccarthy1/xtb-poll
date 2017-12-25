/**
 * A simple poll which tracks user votes.
 * @param {*} choices 
 */
function Poll(choices) {
    this.choices = choices;
    this.votesPerChoice = choices.map(() => 0);
    this.voters = new Map();
}

/**
 * An exception thrown when an invalid vote is cast.
 * @param {string} message The error message
 */
function VoteException(message) {
    this.name = 'VoteException';
    this.message = message || '';
}
VoteException.prototype = Object.create(Error.prototype);

/**
 * Register a vote by a specific user for a given choice.
 * @param {string} userId Twitch user who is voting.
 * @param {int} choice Choice that user is voting for.
 */
Poll.prototype.vote = function(userId, choice) {
    if (!Number.isInteger(choice)) {
        throw new VoteException(`${userId} tried to cast a vote for non-integer choice ${choice}`);
    }
    if (choice < 0 || choice >= this.choices.length) {
        throw new VoteException(`${userId} tried to cast a vote for out-of-range choice ${choice}`);
    }
    const previousVote = this.voters.get(userId);
    if (typeof previousVote === 'number') {
        this.votesPerChoice[previousVote]--;
    }
    this.voters.set(userId, choice);
    this.votesPerChoice[choice]++;
};

/**
 * Returns all choices with the most votes.
 */
Poll.prototype.findWinners = function() {
    const v = this.votesPerChoice;
    let winners = [];
    for (var i = 0; i < this.choices.length; i++) {
        if (v[i] === 0) continue;
        if (winners.length === 0 || v[winners[0]] === v[i]) {
            winners.push(i);
        } else if (v[i] > v[winners[0]]) {
            winners = [];
        }
    }
    return winners.map(i => this.choices[i]);
};

module.exports = Poll;