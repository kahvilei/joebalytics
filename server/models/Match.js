const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Participant = require("./Participant");

const MatchSchema = new Schema({
        metadata: {
            dataVersion: String,
            matchId: {
                type: String,
                unique: true
            },
            participants: [String]
        },
        info: {
            gameCreation: Number,
            gameDuration: Number,
            gameEndTimestamp: Number,
            gameId: Number,
            gameMode:String,
            gameName: String,
            gameStartTimestamp: Number,
            gameType: String,
            gameVersion: String,
            mapId: Number,
            participants: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Participant",
                },
            ],
            platformId: String,
            queueId: Number,
            teams: [
                {
                    bans: [],
                    objectives: {
                        baron: {
                            first: Boolean,
                            kills: Number
                        },
                        champion: {
                            first: Boolean,
                            kills: Number
                        },
                        dragon: {
                            first: Boolean,
                            kills: Number
                        },
                        inhibitor: {
                            first: Boolean,
                            kills: Number
                        },
                        riftHerald: {
                            first: Boolean,
                            kills: Number
                        },
                        tower: {
                            first: Boolean,
                            kills: Number
                        }
                    },
                    teamId: Number,
                    win: Boolean
                }
            ],
            tournamentCode: String
        }
    }
);

MatchSchema.pre(
    "deleteOne",
    { document: true, query: false },
    async function () {
        if (this) {
            await Participant.deleteMany({
                _id: {
                    $in: this.info.participants,
                },
            });
        }
    }
);

MatchSchema.index({ 'metadata.matchId': 1 });
MatchSchema.index({ 'metadata.participants': 1 });
MatchSchema.index({ 'info.gameStartTimestamp': -1 });
MatchSchema.index({ 'info.queueId': 1 });

//compound index
MatchSchema.index({ 'metadata': 1, 'info.gameStartTimestamp': -1 });

const Match= mongoose.model('Match', MatchSchema);

module.exports = { Match };