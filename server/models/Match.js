const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('Match', MatchSchema);