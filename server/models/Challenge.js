const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema(
        {
            uniqueId: {
                type: String,
                unique: true
            },
            puuid: String,
            profileIconId: Number,
            summonerName: String,
            challengeId: Number,
            challengeName: String,
            shortDesc: String,
            percentile: Number,
            level: String,
            value: Number,
            achievedTime: Number,
        }
);

module.exports = mongoose.model('Challenge', ChallengeSchema);