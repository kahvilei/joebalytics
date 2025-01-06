const { User } = require('./User');
const { Summoner } = require('./Summoner');
const { Match } = require('./Match');
const participantFunctions = require('./Participant');
const { Mastery } = require('./Mastery');
const { Challenge } = require('./Challenge');

module.exports = {
  // models
  User,
  Summoner,
  Match,
  participantFunctions,
  Mastery,
  Challenge,
};