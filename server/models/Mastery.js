const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MasterySchema = new Schema({
    uniqueId: {
        type: String,
        unique: true
    },
    championId: Number,
    championLevel: Number,
    championPoints: Number,
    lastPlayTime: Number,
    championPointsSinceLastLevel: Number,
    championPointsUntilNextLevel: Number,
    chestGranted: Boolean,
    tokensEarned: Number,
    summonerId: String,
    puuid: String,
    profileIconId: Number,
    summonerName: String,
    winRate: Number,
    gamesPlayed: Number  
});

module.exports = mongoose.model('Mastery', MasterySchema);