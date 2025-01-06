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

ChallengeSchema.index({puuid: 1});
ChallengeSchema.index({percentile: -1});
ChallengeSchema.index({challengeId: 1});

const Challenge = mongoose.model('Challenge', ChallengeSchema);

module.exports = { Challenge};