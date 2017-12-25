xtb-poll
========

An extremely simple polling plugin for xtb. Allows mods to create polls
for chatters to vote.

## Usage
Make sure you have this plugin installed using `npm install --save github:amccarthy1/xtb-poll`.
Then, adding this plugin is as simple as calling `xtb.loadPlugin`.
```js
const Poll = require('xtb-poll');

// first initialize xtb with a tmi client, then call this
xtb.loadPlugin(new Poll());
```
