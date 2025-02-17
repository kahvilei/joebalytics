const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { cache: data } = require('../controllers/data');

function generateParticipantSchema() {
    let tags;
    if (!data.tags) {
        tags = [];
    } else{
        tags = data.tags;
    }
    const config = tags;
    // Base schema definition
    const ParticipantSchema = new Schema({
        uniqueId: {
            type: String,
            unique: true,
            required: [true, "uniqueId required"],
        },
        gameMode: {
            type: String,
            default: 'NORMAL-TEST',
            required: [true, "gameMode required"],
        },
        gameStartTimestamp: Number,
        matchId: String,
        allInPings: Number,
        assistMePings: Number,
        assists: Number,
        baitPings: Number,
        baronKills: Number,
        basicPings: Number,
        bountyLevel: Number,
        queueId: Number,
        challenges: {
            TwelveAssistStreakCount: Number,
            abilityUses: Number,
            acesBefore15Minutes: Number,
            alliedJungleMonsterKills: Number,
            baronTakedowns: Number,
            blastConeOppositeOpponentCount: Number,
            bountyGold: Number,
            buffsStolen: Number,
            completeSupportQuestInTime: Number,
            controlWardsPlaced: Number,
            damagePerMinute: Number,
            damageTakenOnTeamPercentage: Number,
            dancedWithRiftHerald: Number,
            deathsByEnemyChamps: Number,
            dodgeSkillShotsSmallWindow: Number,
            doubleAces: Number,
            dragonTakedowns: Number,
            earlyLaningPhaseGoldExpAdvantage: Number,
            effectiveHealAndShielding: Number,
            elderDragonKillsWithOpposingSoul: Number,
            elderDragonMultikills: Number,
            enemyChampionImmobilizations: Number,
            enemyJungleMonsterKills: Number,
            epicMonsterKillsNearEnemyJungler: Number,
            epicMonsterKillsWithin3NumberSecondsOfSpawn: Number,
            epicMonsterSteals: Number,
            epicMonsterStolenWithoutSmite: Number,
            firstTurretKilledTime: Number,
            flawlessAces: Number,
            fullTeamTakedown: Number,
            gameLength: Number,
            getTakedownsInAllLanesEarlyJungleAsLaner: Number,
            goldPerMinute: Number,
            hadOpenNexus: Number,
            immobilizeAndKillWithAlly: Number,
            initialBuffCount: Number,
            initialCrabCount: Number,
            jungleCsBefore1NumberMinutes: Number,
            junglerTakedownsNearDamagedEpicMonster: Number,
            kTurretsDestroyedBeforePlatesFall: Number,
            kda: Number,
            killAfterHiddenWithAlly: Number,
            killParticipation: Number,
            killedChampTookFullTeamDamageSurvived: Number,
            killsNearEnemyTurret: Number,
            killsOnOtherLanesEarlyJungleAsLaner: Number,
            killsOnRecentlyHealedByAramPack: Number,
            killsUnderOwnTurret: Number,
            killsWithHelpFromEpicMonster: Number,
            knockEnemyIntoTeamAndKill: Number,
            landSkillShotsEarlyGame: Number,
            laneMinionsFirst10Minutes: Number,
            laningPhaseGoldExpAdvantage: Number,
            legendaryCount: Number,
            lostAnInhibitor: Number,
            maxCsAdvantageOnLaneOpponent: Number,
            maxKillDeficit: Number,
            maxLevelLeadLaneOpponent: Number,
            moreEnemyJungleThanOpponent: Number,
            multiKillOneSpell: Number,
            multiTurretRiftHeraldCount: Number,
            multikills: Number,
            multikillsAfterAggressiveFlash: Number,
            mythicItemUsed: Number,
            outerTurretExecutesBefore1NumberMinutes: Number,
            outnumberedKills: Number,
            outnumberedNexusKill: Number,
            perfectDragonSoulsTaken: Number,
            perfectGame: Number,
            pickKillWithAlly: Number,
            poroExplosions: Number,
            quickCleanse: Number,
            quickFirstTurret: Number,
            quickSoloKills: Number,
            riftHeraldTakedowns: Number,
            saveAllyFromDeath: Number,
            scuttleCrabKills: Number,
            skillshotsDodged: Number,
            skillshotsHit: Number,
            snowballsHit: Number,
            soloBaronKills: Number,
            soloKills: Number,
            stealthWardsPlaced: Number,
            survivedSingleDigitHpCount: Number,
            survivedThreeImmobilizesInFight: Number,
            takedownOnFirstTurret: Number,
            takedowns: Number,
            takedownsAfterGainingLevelAdvantage: Number,
            takedownsBeforeJungleMinionSpawn: Number,
            takedownsFirst25Minutes: Number,
            takedownsInAlcove: Number,
            takedownsInEnemyFountain: Number,
            teamBaronKills: Number,
            teamDamagePercentage: Number,
            teamElderDragonKills: Number,
            teamRiftHeraldKills: Number,
            threeWardsOneSweeperCount: Number,
            tookLargeDamageSurvived: Number,
            turretPlatesTaken: Number,
            turretTakedowns: Number,
            turretsTakenWithRiftHerald: Number,
            twentyMinionsIn3SecondsCount: Number,
            unseenRecalls: Number,
            visionScoreAdvantageLaneOpponent: Number,
            visionScorePerMinute: Number,
            wardTakedowns: Number,
            wardTakedownsBefore2NumberM: Number,
            wardsGuarded: Number,
        },
        champExperience: Number,
        champLevel: Number,
        championId: Number,
        championName: String,
        championTransform: Number,
        commandPings: Number,
        consumablesPurchased: Number,
        damageDealtToBuildings: Number,
        damageDealtToObjectives: Number,
        damageDealtToTurrets: Number,
        damageSelfMitigated: Number,
        dangerPings: Number,
        deaths: Number,
        detectorWardsPlaced: Number,
        doubleKills: Number,
        dragonKills: Number,
        eligibleForProgression: Boolean,
        enemyMissingPings: Number,
        enemyVisionPings: Number,
        firstBloodAssist: Boolean,
        firstBloodKill: Boolean,
        firstTowerAssist: Boolean,
        firstTowerKill: Boolean,
        gameEndedInEarlySurrender: Boolean,
        gameEndedInSurrender: Boolean,
        getBackPings: Number,
        goldEarned: Number,
        goldSpent: Number,
        holdPings: Number,
        individualPosition: String,
        inhibitorKills: Number,
        inhibitorTakedowns: Number,
        inhibitorsLost: Number,
        itemNumber: Number,
        item0: Number,
        item1: Number,
        item2: Number,
        item3: Number,
        item4: Number,
        item5: Number,
        item6: Number,
        itemsPurchased: Number,
        killingSprees: Number,
        kills: Number,
        lane: String,
        largestCriticalStrike: Number,
        largestKillingSpree: Number,
        largestMultiKill: Number,
        longestTimeSpentLiving: Number,
        magicDamageDealt: Number,
        magicDamageDealtToChampions: Number,
        magicDamageTaken: Number,
        missions: {
            type: Map,
            of: Number
        },
        needVisionPings: Number,
        neutralMinionsKilled: Number,
        nexusKills: Number,
        nexusLost: Number,
        nexusTakedowns: Number,
        objectivesStolen: Number,
        objectivesStolenAssists: Number,
        onMyWayPings: Number,
        participantId: Number,
        pentaKills: Number,
        perks: {
            statPerks: {
                defense: Number,
                flex: Number,
                offense: Number,
            },
            styles: [
                {
                    description: String,
                    selections: [
                        {
                            perk: Number,
                            var1: Number,
                            var2: Number,
                            var3: Number,
                        },
                        {
                            perk: Number,
                            var1: Number,
                            var2: Number,
                            var3: Number,
                        },
                        {
                            perk: Number,
                            var1: Number,
                            var2: Number,
                            var3: Number,
                        },
                        {
                            perk: Number,
                            var1: Number,
                            var2: Number,
                            var3: Number,
                        },
                    ],
                    style: Number,
                },
                {
                    description: String,
                    selections: [
                        {
                            perk: Number,
                            var1: Number,
                            var2: Number,
                            var3: Number,
                        },
                        {
                            perk: Number,
                            var1: Number,
                            var2: Number,
                            var3: Number,
                        },
                    ],
                    style: Number,
                },
            ],
        },
        physicalDamageDealt: Number,
        physicalDamageDealtToChampions: Number,
        physicalDamageTaken: Number,
        profileIcon: Number,
        pushPings: Number,
        puuid: String,
        quadraKills: Number,
        riotIdGameName: String,
        riotIdTagline: String,
        role: String,
        sightWardsBoughtInGame: Number,
        spell1Casts: Number,
        spell2Casts: Number,
        spell3Casts: Number,
        spell4Casts: Number,
        summoner1Casts: Number,
        summoner1Id: Number,
        summoner2Casts: Number,
        summoner2Id: Number,
        summonerId: String,
        summonerLevel: Number,
        summonerName: String,
        teamEarlySurrendered: Boolean,
        teamId: Number,
        teamPosition: String,
        timeCCingOthers: Number,
        timePlayed: Number,
        tagsVersion: Number,
        tags: {
            type: Map,
            of: {
                type: {
                    isTriggered: {
                        type: Boolean,
                        default: false
                    },
                    value: {
                        type: Number,
                        default: 0
                    }
                }
            }
        },
        totalDamageDealt: Number,
        totalDamageDealtToChampions: Number,
        totalDamageShieldedOnTeammates: Number,
        totalDamageTaken: Number,
        totalHeal: Number,
        totalHealsOnTeammates: Number,
        totalMinionsKilled: Number,
        totalTimeCCDealt: Number,
        totalTimeSpentDead: Number,
        totalUnitsHealed: Number,
        tripleKills: Number,
        trueDamageDealt: Number,
        trueDamageDealtToChampions: Number,
        trueDamageTaken: Number,
        turretKills: Number,
        turretTakedowns: Number,
        turretsLost: Number,
        unrealKills: Number,
        visionClearedPings: Number,
        visionScore: Number,
        visionWardsBoughtInGame: Number,
        wardsKilled: Number,
        wardsPlaced: Number,
        win: Boolean,
    });

    ParticipantSchema.index({matchId: 1});
    ParticipantSchema.index({puuid: 1});
    ParticipantSchema.index({championId: 1});
    ParticipantSchema.index({gameStartTimestamp: -1});
    ParticipantSchema.index({gameMode: 1});
    ParticipantSchema.index({win: 1});
    ParticipantSchema.index({role: 1});
    ParticipantSchema.index({queueId: 1});
    ParticipantSchema.index({uniqueId: 1});

    //compound indexes
    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1});

    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, championId: 1});
    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, role: 1});
    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, 'tags.$**' : 1});

    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, championId: 1, role: 1});
    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, 'tags.$**' : 1, role: 1});
    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, championId: 1, 'tags.$**' : 1});

    ParticipantSchema.index({puuid: 1, gameStartTimestamp: -1, queueId: 1, championId: 1, 'tags.$**' : 1, role: 1});


    return ParticipantSchema;
}

const Participant = mongoose.model("Participant", generateParticipantSchema());

module.exports = {
    generateParticipantSchema,
    // Export a function to create the model once the schema is generated
    createParticipantModelFromMemory: () => {
        const schema = generateParticipantSchema();
        return mongoose.model("Participant", schema);
    },
    Participant
};