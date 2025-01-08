const { User } = require('./User');
const { Summoner } = require('./Summoner');
const { Match } = require('./Match');
const { Participant, createParticipantModelFromMemory, generateParticipantSchema} = require('./Participant');
const { Mastery } = require('./Mastery');
const { Challenge } = require('./Challenge');

module.exports = {
  // models
  User,
  Summoner,
  Match,
  Participant,
  createParticipantModelFromMemory,
  generateParticipantSchema,
  Mastery,
  Challenge,
};