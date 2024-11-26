const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ParticipantSchema = new Schema({
  uniqueId: {
    type: String,
    unique: true
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
    "12AssistStreakCount": Number,
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
    playerScore0: Number,
    playerScore1: Number,
    playerScore2: Number,
    playerScore3: Number,
    playerScore4: Number,
    playerScore5: Number,
    playerScore6: Number,
    playerScore7: Number,
    playerScore8: Number,
    playerScore9: Number,
    playerScore10: Number,
    playerScore11: Number
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
  tags: {
    //* Red tags*
    blind: {
      isTriggered: Boolean,
      value: Number
    },
    worstOfTheWorst: {
      isTriggered: Boolean,
      value: Number
    },
    tagAlong: {
      isTriggered: Boolean,
      value: Number
    },
    poor: {
      isTriggered: Boolean,
      value: Number
    },
    coward: {
      isTriggered: Boolean,
      value: Number
    },
    atm: {
      isTriggered: Boolean,
      value: Number
    },
    honoraryCarry: {
      isTriggered: Boolean,
      value: Number
    },
    jungleFullOfLife: {
      isTriggered: Boolean,
      value: Number
    },
    jungleDiffCamps: {
      isTriggered: Boolean,
      value: Number
    },
    forgotYourButtons: {
      isTriggered: Boolean,
      value: Number
    },
    mapControl0: {
      isTriggered: Boolean,
      value: Number
    },
    aimWhereTheyreGoing: {
      isTriggered: Boolean,
      value: Number
    },
    allergicToDodging: {
      isTriggered: Boolean,
      value: Number
    },
    bigThrow: {
      isTriggered: Boolean,
      value: Number
    },
    lastHitTutorialNeeded: {
      isTriggered: Boolean,
      value: Number
    },
    struggling: {
      isTriggered: Boolean,
      value: Number
    },
  
    //* Gray tags*
    jackOfAllTrades: {
      isTriggered: Boolean,
      value: Number
    },
    dragonsHoard: {
      isTriggered: Boolean,
      value: Number
    },
    perfectlyBalanced: {
      isTriggered: Boolean,
      value: Number
    },
    iFeelFine: {
      isTriggered: Boolean,
      value: Number
    },
    afkFarmer: {
      isTriggered: Boolean,
      value: Number
    },
    pve: {
      isTriggered: Boolean,
      value: Number
    },
    paperTank: {
      isTriggered: Boolean,
      value: Number
    },
    walkingWard: {
      isTriggered: Boolean,
      value: Number
    },
    worksBetterAlone: {
      isTriggered: Boolean,
      value: Number
    },
    spongey: {
      isTriggered: Boolean,
      value: Number
    },
    objective: {
      isTriggered: Boolean,
      value: Number
    },
    yeahYeahOmw: {
      isTriggered: Boolean,
      value: Number
    },
    keyboardWarrior: {
      isTriggered: Boolean,
      value: Number
    },
    autoAttackOnly: {
      isTriggered: Boolean,
      value: Number
    },
    buffDeliveryService: {
      isTriggered: Boolean,
      value: Number
    },
    selfCare: {
      isTriggered: Boolean,
      value: Number
    },
    decorationEnthusiast: {
      isTriggered: Boolean,
      value: Number
    },
    flashGaming: {
      isTriggered: Boolean,
      value: Number
    },
    monsterTamer: {
      isTriggered: Boolean,
      value: Number
    },
    blastEm: {
      isTriggered: Boolean,
      value: Number
    },
    stopRightThere: {
      isTriggered: Boolean,
      value: Number
    },
    selfless: {
      isTriggered: Boolean,
      value: Number
    },
    alcoveClub: {
      isTriggered: Boolean,
      value: Number
    },
    minionEater: {
      isTriggered: Boolean,
      value: Number
    },
    hideAndSeekChampion: {
      isTriggered: Boolean,
      value: Number
    },
    shyHerald: {
      isTriggered: Boolean,
      value: Number
    },
    dancePartner: {
      isTriggered: Boolean,
      value: Number
    },
    snowball: {
      isTriggered: Boolean,
      value: Number
    },
    balancedDiet: {
      isTriggered: Boolean,
      value: Number
    },
    teamPlayer: {
      isTriggered: Boolean,
      value: Number
    },
    identityCrisis: {
      isTriggered: Boolean,
      value: Number
    },
    earlyBird: {
      isTriggered: Boolean,
      value: Number
    },
    mercenary: {
      isTriggered: Boolean,
      value: Number
    },
    surviveAtAllCosts: {
      isTriggered: Boolean,
      value: Number
    },
    arentYouForgettingSomeone: {
      isTriggered: Boolean,
      value: Number
    },
  
    //* Green tags*
    scout: {
      isTriggered: Boolean,
      value: Number
    },
    youreWelcome: {
      isTriggered: Boolean,
      value: Number
    },
    midIsMyNewBestFriend: {
      isTriggered: Boolean,
      value: Number
    },
    imTheCarryNow: {
      isTriggered: Boolean,
      value: Number
    },
    stomper: {
      isTriggered: Boolean,
      value: Number
    },
    adequateJungler: {
      isTriggered: Boolean,
      value: Number
    },
    counterJungler: {
      isTriggered: Boolean,
      value: Number
    },
    betterTogether: {
      isTriggered: Boolean,
      value: Number
    },
    hatesArchitecture: {
      isTriggered: Boolean,
      value: Number
    },
    niceDiveIdiot: {
      isTriggered: Boolean,
      value: Number
    },
    coolTurret: {
      isTriggered: Boolean,
      value: Number
    },
    bountyHunter: {
      isTriggered: Boolean,
      value: Number
    },
    sneakyStealthy: {
      isTriggered: Boolean,
      value: Number
    },
    darkness: {
      isTriggered: Boolean,
      value: Number
    },
    laneKingdom: {
      isTriggered: Boolean,
      value: Number
    },
    quadraMaster: {
      isTriggered: Boolean,
      value: Number
    },
  
    //* Yellow tags*
    flawlessVictory: {
      isTriggered: Boolean,
      value: Number
    },
    heGotANoNo: {
      isTriggered: Boolean,
      value: Number
    },
    pentakill: {
      isTriggered: Boolean,
      value: Number
    },
    dontEverSayItsOver: {
      isTriggered: Boolean,
      value: Number
    },
    legendary: {
      isTriggered: Boolean,
      value: Number
    },
    visionDomination: {
      isTriggered: Boolean,
      value: Number
    },
    simplyTheBest: {
      isTriggered: Boolean,
      value: Number
    },
    objectiveSupremacy: {
      isTriggered: Boolean,
      value: Number
    },
    csGod: {
      isTriggered: Boolean,
      value: Number
    },
    damageMaster: {
      isTriggered: Boolean,
      value: Number
    },
    carryingIsKindOfSupporting: {
      isTriggered: Boolean,
      value: Number
    },
    justDoinMyJob: {
      isTriggered: Boolean,
      value: Number
    },
    kingOfDaJungle: {
      isTriggered: Boolean,
      value: Number
    },
    notSoMiddling: {
      isTriggered: Boolean,
      value: Number
    },
    itsCalledTopForAReason: {
      isTriggered: Boolean,
      value: Number
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

ParticipantSchema.index({ matchId: 1 });
ParticipantSchema.index({ puuid: 1 });
ParticipantSchema.index({ championId: 1 });
ParticipantSchema.index({ gameStartTimestamp: -1 });
ParticipantSchema.index({ gameMode: 1 });
ParticipantSchema.index({ win: 1 });
ParticipantSchema.index({ role: 1 });
ParticipantSchema.index({ queueId: 1 });

ParticipantSchema.index({ 'tags.blind.isTriggered': 1 });
ParticipantSchema.index({ 'tags.worstOfTheWorst.isTriggered': 1 });
ParticipantSchema.index({ 'tags.tagAlong.isTriggered': 1 });
ParticipantSchema.index({ 'tags.poor.isTriggered': 1 });
ParticipantSchema.index({ 'tags.coward.isTriggered': 1 });
ParticipantSchema.index({ 'tags.atm.isTriggered': 1 });
ParticipantSchema.index({ 'tags.honoraryCarry.isTriggered': 1 });
ParticipantSchema.index({ 'tags.jungleFullOfLife.isTriggered': 1 });
ParticipantSchema.index({ 'tags.jungleDiffCamps.isTriggered': 1 });
ParticipantSchema.index({ 'tags.forgotYourButtons.isTriggered': 1 });
ParticipantSchema.index({ 'tags.mapControl0.isTriggered': 1 });
ParticipantSchema.index({ 'tags.aimWhereTheyreGoing.isTriggered': 1 });
ParticipantSchema.index({ 'tags.allergicToDodging.isTriggered': 1 });
ParticipantSchema.index({ 'tags.bigThrow.isTriggered': 1 });
ParticipantSchema.index({ 'tags.lastHitTutorialNeeded.isTriggered': 1 });
ParticipantSchema.index({ 'tags.struggling.isTriggered': 1 });
ParticipantSchema.index({ 'tags.highDPS.isTriggered': 1 });

// Gray tags
ParticipantSchema.index({ 'tags.jackOfAllTrades.isTriggered': 1 });
ParticipantSchema.index({ 'tags.dragonsHoard.isTriggered': 1 });
ParticipantSchema.index({ 'tags.perfectlyBalanced.isTriggered': 1 });
ParticipantSchema.index({ 'tags.iFeelFine.isTriggered': 1 });
ParticipantSchema.index({ 'tags.afkFarmer.isTriggered': 1 });
ParticipantSchema.index({ 'tags.pve.isTriggered': 1 });
ParticipantSchema.index({ 'tags.paperTank.isTriggered': 1 });
ParticipantSchema.index({ 'tags.walkingWard.isTriggered': 1 });
ParticipantSchema.index({ 'tags.worksBetterAlone.isTriggered': 1 });
ParticipantSchema.index({ 'tags.spongey.isTriggered': 1 });
ParticipantSchema.index({ 'tags.objective.isTriggered': 1 });
ParticipantSchema.index({ 'tags.yeahYeahOmw.isTriggered': 1 });
ParticipantSchema.index({ 'tags.keyboardWarrior.isTriggered': 1 });
ParticipantSchema.index({ 'tags.autoAttackOnly.isTriggered': 1 });
ParticipantSchema.index({ 'tags.buffDeliveryService.isTriggered': 1 });
ParticipantSchema.index({ 'tags.selfCare.isTriggered': 1 });
ParticipantSchema.index({ 'tags.decorationEnthusiast.isTriggered': 1 });
ParticipantSchema.index({ 'tags.flashGaming.isTriggered': 1 });
ParticipantSchema.index({ 'tags.monsterTamer.isTriggered': 1 });
ParticipantSchema.index({ 'tags.blastEm.isTriggered': 1 });
ParticipantSchema.index({ 'tags.stopRightThere.isTriggered': 1 });
ParticipantSchema.index({ 'tags.selfless.isTriggered': 1 });
ParticipantSchema.index({ 'tags.alcoveClub.isTriggered': 1 });
ParticipantSchema.index({ 'tags.minionEater.isTriggered': 1 });
ParticipantSchema.index({ 'tags.hideAndSeekChampion.isTriggered': 1 });
ParticipantSchema.index({ 'tags.shyHerald.isTriggered': 1 });
ParticipantSchema.index({ 'tags.dancePartner.isTriggered': 1 });
ParticipantSchema.index({ 'tags.snowball.isTriggered': 1 });
ParticipantSchema.index({ 'tags.balancedDiet.isTriggered': 1 });
ParticipantSchema.index({ 'tags.teamPlayer.isTriggered': 1 });
ParticipantSchema.index({ 'tags.identityCrisis.isTriggered': 1 });
ParticipantSchema.index({ 'tags.earlyBird.isTriggered': 1 });
ParticipantSchema.index({ 'tags.mercenary.isTriggered': 1 });
ParticipantSchema.index({ 'tags.surviveAtAllCosts.isTriggered': 1 });
ParticipantSchema.index({ 'tags.arentYouForgettingSomeone.isTriggered': 1 });

// Green tags
ParticipantSchema.index({ 'tags.scout.isTriggered': 1 });
ParticipantSchema.index({ 'tags.youreWelcome.isTriggered': 1 });
ParticipantSchema.index({ 'tags.midIsMyNewBestFriend.isTriggered': 1 });
ParticipantSchema.index({ 'tags.imTheCarryNow.isTriggered': 1 });
ParticipantSchema.index({ 'tags.stomper.isTriggered': 1 });
ParticipantSchema.index({ 'tags.adequateJungler.isTriggered': 1 });
ParticipantSchema.index({ 'tags.counterJungler.isTriggered': 1 });
ParticipantSchema.index({ 'tags.betterTogether.isTriggered': 1 });
ParticipantSchema.index({ 'tags.hatesArchitecture.isTriggered': 1 });
ParticipantSchema.index({ 'tags.niceDiveIdiot.isTriggered': 1 });
ParticipantSchema.index({ 'tags.coolTurret.isTriggered': 1 });
ParticipantSchema.index({ 'tags.bountyHunter.isTriggered': 1 });
ParticipantSchema.index({ 'tags.sneakyStealthy.isTriggered': 1 });
ParticipantSchema.index({ 'tags.darkness.isTriggered': 1 });
ParticipantSchema.index({ 'tags.laneKingdom.isTriggered': 1 });
ParticipantSchema.index({ 'tags.quadraMaste.isTriggeredr': 1 });

// Yellow tags
ParticipantSchema.index({ 'tags.flawlessVictory.isTriggered': 1 });
ParticipantSchema.index({ 'tags.heGotANoNo.isTriggered': 1 });
ParticipantSchema.index({ 'tags.pentakill.isTriggered': 1 });
ParticipantSchema.index({ 'tags.dontEverSayItsOver.isTriggered': 1 });
ParticipantSchema.index({ 'tags.legendary.isTriggered': 1 });
ParticipantSchema.index({ 'tags.visionDomination.isTriggered': 1 });
ParticipantSchema.index({ 'tags.simplyTheBest.isTriggered': 1 });
ParticipantSchema.index({ 'tags.objectiveSupremacy.isTriggered': 1 });
ParticipantSchema.index({ 'tags.csGod.isTriggered': 1 });
ParticipantSchema.index({ 'tags.damageMaster.isTriggered': 1 });
ParticipantSchema.index({ 'tags.carryingIsKindOfSupporting.isTriggered': 1 });
ParticipantSchema.index({ 'tags.justDoinMyJob.isTriggered': 1 });
ParticipantSchema.index({ 'tags.kingOfDaJungle.isTriggered': 1 });
ParticipantSchema.index({ 'tags.notSoMiddling.isTriggered': 1 });
ParticipantSchema.index({ 'tags.itsCalledTopForAReason.isTriggered': 1 });




module.exports = mongoose.model("Participant", ParticipantSchema);
