const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema(
        {
            puuid: String,
            challengeId: Number,
            percentile: Number,
            level: String,
            value: Number,
            achievedTime: Number,
        }
);

module.exports = mongoose.model('Challenge', ChallengeSchema);