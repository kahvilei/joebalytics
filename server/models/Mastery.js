const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MasterySchema = new Schema({
    championId: Number,
    championLevel: Number,
    championPoints: Number,
    lastPlayTime: Number,
    championPointsSinceLastLevel: Number,
    championPointsUntilNextLevel: Number,
    chestGranted: Boolean,
    tokensEarned: Number,
    summonerId: String,
    profileIconId: Number,
    summonerName: String,
    winRate: Number,
    gamesPlayed: Number
});

module.exports = mongoose.model('Mastery', MasterySchema);