const { performance } = require('perf_hooks');
const { calculateTeamStats, calculateGameMetrics, getPerformanceThresholds } = require('./tagUtils');

const Match = require('../models/Match');

async function calculateTags(participant, matchObj) {
  const startTime = performance.now();
  const tagStats = {
    red: { triggered: 0, total: 0 },
    gray: { triggered: 0, total: 0 },
    green: { triggered: 0, total: 0 },
    yellow: { triggered: 0, total: 0 }
  };

  try {
    console.log(`Starting tag calculation for participant ${participant._id}`);

    // Get teammates and opponents
    const matchId = participant.matchId;
    const match = matchObj ? matchObj : await Match.findOne({ 'metadata.matchId': matchId }).populate('info.participants');
    if (!match) throw new Error('Match not found');

    const team = match.info.participants.filter(p => p.teamId === participant.teamId);
    const opponents = match.info.participants.filter(p => p.teamId !== participant.teamId);
    const laneOpponent = opponents.find(p => p.teamPosition === participant.teamPosition) || opponents[0];

    // Calculate base metrics
    const teamStats = calculateTeamStats(participant, team);
    const gameMetrics = calculateGameMetrics(participant, participant.timePlayed / 60);
    const thresholds = getPerformanceThresholds(participant, teamStats, gameMetrics);

    // Initialize empty tags object
    const tags = {};

    // Calculate additional metrics
    const killDeficit = participant.challenges.maxKillDeficit || 0;
    const soloKills = participant.challenges.soloKills || 0;
    const earlyCSAdvantage = participant.challenges.laneMinionsFirst10Minutes || 0;
    const goldDiffWithOpponent = participant.goldEarned - (laneOpponent?.goldEarned || 0);
    const unspentGold = participant.goldEarned - participant.goldSpent;
    const objectiveKills = (participant.dragonKills || 0) + (participant.baronKills || 0) + (participant.challenges.riftHeraldTakedowns || 0);
    const pingSpam = gameMetrics.pingCount;
    const spellCasts = gameMetrics.spellCasts;
    const hasSkillShot = true; // This would need to be determined based on champion data
    const skillshotsHit = participant.challenges.skillshotsHit || 0;
    const skillshotsDodged = participant.challenges.skillshotsDodged || 0;

    // =====================
    // RED TAGS - Poor Performance
    // =====================
    // Vision control
   // Vision control
    if (validateMetrics(participant, ['challenges.visionScorePerMinute']) &&
    thresholds.hasPoorVision && !gameMetrics.gameRemake) {
    tags.blind = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Poor performance
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation']) &&
    thresholds.isLowPerformer && !gameMetrics.didWin && !gameMetrics.gameRemake) {
    tags.worstOfTheWorst = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Not participating
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation']) &&
    gameMetrics.kda <= 2 && thresholds.isLowImpact && gameMetrics.didWin && !gameMetrics.gameRemake) {
    tags.tagAlong = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Poor lane performance
    if (validateMetrics(participant, ['goldEarned']) &&
    goldDiffWithOpponent < -3000 && !gameMetrics.gameRemake && !gameMetrics.isAram) {
    tags.poor = tagBoolVal(true, goldDiffWithOpponent);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Playing too safe
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation']) &&
    thresholds.isLowImpact && gameMetrics.kda > 2 && !gameMetrics.didWin && !gameMetrics.gameRemake) {
    tags.coward = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Feeding
    if (validateMetrics(participant, ['deaths', 'goldEarned']) &&
    thresholds.isFeeding) {
    tags.atm = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Bad support performance
    if (validateMetrics(participant, ['challenges.visionScorePerMinute']) &&
    gameMetrics.isSupport && gameMetrics.visionScorePerMin < 1 && !gameMetrics.gameRemake) {
    tags.honoraryCarry = tagBoolVal(true, gameMetrics.visionScorePerMin);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Bad jungler performance
    if (validateMetrics(participant, ['neutralMinionsKilled']) &&
    gameMetrics.isJungle && participant.neutralMinionsKilled < 50 && !gameMetrics.didWin && !gameMetrics.gameRemake) {
    tags.jungleFullOfLife = tagBoolVal(true, participant.neutralMinionsKilled);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Died to jungle
    if (validateMetrics(participant, ['challenges.deathsByEnemyChamps', 'deaths']) &&
    participant.challenges.deathsByEnemyChamps < participant.deaths && gameMetrics.isJungle && !gameMetrics.gameRemake) {
    tags.jungleDiffCamps = tagBoolVal(true, participant.deaths - participant.challenges.deathsByEnemyChamps);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // No summoner spell usage
    if (validateMetrics(participant, ['challenges.effectiveHealAndShielding', 'summoner1Id', 'summoner2Id']) &&
    participant.challenges.effectiveHealAndShielding < 100 && 
    ['Heal', 'Barrier', 'Shield'].includes(getSummonerSpellName(participant.summoner1Id) || getSummonerSpellName(participant.summoner2Id))) {
    tags.forgotYourButtons = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Poor map awareness
    if (validateMetrics(participant, ['dragonKills', 'baronKills', 'visionScore', 'challenges.turretTakedowns']) &&
    (participant.dragonKills + participant.baronKills + participant.challenges.turretTakedowns) === 0 && gameMetrics.visionScore < 10 && !gameMetrics.isAram && !gameMetrics.gameRemake) {
    tags.mapControl0 = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Bad mechanics
    if (validateMetrics(participant, ['challenges.skillshotsHit']) &&
    skillshotsHit <= 2 && hasSkillShot && !gameMetrics.gameRemake) {
    tags.aimWhereTheyreGoing = tagBoolVal(true, skillshotsHit);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Poor dodging
    if (validateMetrics(participant, ['challenges.skillshotsDodged', 'deaths']) &&
    skillshotsDodged < participant.deaths * 0.5 && participant.deaths > 5) {
    tags.allergicToDodging = tagBoolVal(true, skillshotsDodged);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // Throws
    if (validateMetrics(participant, ['goldEarned']) &&
    goldDiffWithOpponent > 4000 && !gameMetrics.didWin) {
    tags.bigThrow = tagBoolVal(true, goldDiffWithOpponent);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;

    // High DPS (death per second)
    if (validateMetrics(participant, ['deaths']) && participant.deaths/gameMetrics.gameLength > 0.8) {
      tags.highDPS = tagBoolVal(true, participant.deaths/gameMetrics.gameLength);
      tagStats.red.triggered++;
    }
    tagStats.red.total++;

    //Struggling - low KDA and kill participation and high deaths
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation', 'deaths']) &&
    thresholds.isLowImpact && !gameMetrics.gameRemake) {
    tags.struggling = tagBoolVal(true, null);
    tagStats.red.triggered++;
    }
    tagStats.red.total++;


  //last hit tutoial needed - low laneMinionsFirst10Minutes
  if (validateMetrics(participant, ['challenges.laneMinionsFirst10Minutes']) &&
  participant.challenges.laneMinionsFirst10Minutes < 30) {
  tags.lastHitTutorialNeeded = tagBoolVal(true, participant.challenges.laneMinionsFirst10Minutes);
  tagStats.red.triggered++;
  }


    //

    // =====================
    // Gray TAGS - neutral performance
    // =====================

    // Average performance
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation']) &&
    gameMetrics.kda > 1.5 && gameMetrics.kda < 2.5 && 
    gameMetrics.killParticipation > 0.4 && gameMetrics.killParticipation < 0.6 && 
    !gameMetrics.gameRemake) {
    tags.jackOfAllTrades = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Unspent gold
    if (validateMetrics(participant, ['goldEarned', 'goldSpent']) &&
    unspentGold > 3000) {
    tags.dragonsHoard = tagBoolVal(true, unspentGold);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Balanced stats
    if (validateMetrics(participant, ['kills', 'deaths', 'assists']) &&
    participant.kills === participant.deaths && 
    participant.kills === participant.assists && 
    participant.kills > 3) {
    tags.perfectlyBalanced = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Close fights
    if (validateMetrics(participant, ['challenges.survivedSingleDigitHpCount']) &&
    participant.challenges.survivedSingleDigitHpCount > 1) {
    tags.iFeelFine = tagBoolVal(true, participant.challenges.survivedSingleDigitHpCount);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Farming focus
    if (validateMetrics(participant, ['totalMinionsKilled', 'challenges.killParticipation']) &&
    participant.totalMinionsKilled > 200 && thresholds.isLowImpact) {
    tags.afkFarmer = tagBoolVal(true, participant.totalMinionsKilled);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Split push focus
    if (validateMetrics(participant, ['totalDamageDealtToChampions', 'damageDealtToObjectives', 'kills', 'deaths']) &&
    gameMetrics.isTop && 
    participant.totalDamageDealtToChampions < participant.damageDealtToObjectives * 0.7 && 
    participant.kills < 3 && participant.deaths < 3) {
    tags.pve = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Tank issues
    if (validateMetrics(participant, ['totalDamageTaken', 'damageSelfMitigated']) &&
    gameMetrics.damageTaken > 40000 && gameMetrics.damageMitigated < gameMetrics.damageTaken * 0.3) {
    tags.paperTank = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Ward focused
    if (validateMetrics(participant, ['wardsPlaced', 'totalDamageDealtToChampions']) &&
    !gameMetrics.isSupport && gameMetrics.wardsPlaced > gameMetrics.totalDamageDealt / 1000) {
    tags.walkingWard = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Solo focus
    if (validateMetrics(participant, ['challenges.soloKills', 'kills']) &&
    soloKills > participant.kills - soloKills && !gameMetrics.gameRemake) {
    tags.worksBetterAlone = tagBoolVal(true, soloKills);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Is jungler and pings on my way more than 20 times
    if (validateMetrics(participant, ['onMyWayPings']) &&
    participant.onMyWayPings > 20 && gameMetrics.isJungle) {
    tags.yeahYeahOmw = tagBoolVal(true, participant.onMyWayPings);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    //spongey - high damage taken and low deaths
    if (validateMetrics(participant, ['totalDamageTaken', 'deaths']) &&
    participant.totalDamageTaken > 50000 && participant.deaths < 3) {
    tags.spongey = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }

    //objective - more objective damage than champion damage
    if (validateMetrics(participant, ['totalDamageDealtToChampions', 'damageDealtToObjectives']) &&
    participant.totalDamageDealtToChampions < participant.damageDealtToObjectives) {
    tags.objective = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }


    // Ping spammer
    if (validateMetrics(participant, ['allInPings', 'assistMePings', 'commandPings', 'pushPings', 
    'enemyMissingPings', 'enemyVisionPings', 'holdPings', 'getBackPings', 
    'needVisionPings', 'onMyWayPings', 'visionClearedPings']) &&
    pingSpam > 100) {
    tags.keyboardWarrior = tagBoolVal(true, pingSpam);
    tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Never used abilities
    if (validateMetrics(participant, ['spell1Casts']) && spellCasts < gameMetrics.gameLength/60 && !gameMetrics.gameRemake) {
      tags.autoAttackOnly = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Took both buffs early but died
    if (validateMetrics(participant, ['challenges.initialBuffCount', 'challenges.deathsByEnemyChamps']) &&
        participant.challenges.initialBuffCount > 1 && 
        participant.challenges.deathsByEnemyChamps > 0 && 
        gameMetrics.gameLength < 300) {
      tags.buffDeliveryService = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Got extremely tanky but never helped team
    if (validateMetrics(participant, ['damageSelfMitigated', 'totalDamageShieldedOnTeammates']) &&
        participant.damageSelfMitigated > 100000 && 
        participant.totalDamageShieldedOnTeammates < 1000) {
      tags.selfCare = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Bought lots of control wards but never used them effectively
    if (validateMetrics(participant, ['challenges.controlWardsPlaced', 'visionScore']) &&
        participant.challenges.controlWardsPlaced > 10 && 
        participant.visionScore < participant.challenges.controlWardsPlaced * 2) {
      tags.decorationEnthusiast = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Only used flash aggressively
    if (validateMetrics(participant, ['challenges.multikillsAfterAggressiveFlash', 'deaths']) &&
        participant.challenges.multikillsAfterAggressiveFlash > 0 && 
        participant.deaths > 8) {
      tags.flashGaming = tagBoolVal(true, participant.challenges.multikillsAfterAggressiveFlash);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Got carried by epic monsters
    if (validateMetrics(participant, ['challenges.killsWithHelpFromEpicMonster']) &&
        participant.challenges.killsWithHelpFromEpicMonster > 3) {
      tags.monsterTamer = tagBoolVal(true, participant.challenges.killsWithHelpFromEpicMonster);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    //blast em - multiple uses of blast cone opposite of enemy
    if (validateMetrics(participant, ['challenges.blastConeOppositeOpponentCount']) &&
    participant.challenges.blastConeOppositeOpponentCount > 3) {
    tags.blastEm = tagBoolVal(true, participant.challenges.blastConeOppositeOpponentCount);
    tagStats.gray.triggered++;
    }

    // Focused on immobilizing enemies
    if (validateMetrics(participant, ['challenges.enemyChampionImmobilizations']) &&
        participant.challenges.enemyChampionImmobilizations/gameMetrics.gameLength > 10) {
      tags.stopRightThere = tagBoolVal(true, participant.challenges.enemyChampionImmobilizations/gameMetrics.gameLength > 10);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Kept trying to save dying allies
    if (validateMetrics(participant, ['challenges.saveAllyFromDeath', 'deaths']) &&
        participant.challenges.saveAllyFromDeath > 5 && 
        participant.deaths > 10) {
      tags.selfless = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Always fighting in alcoves
    if (validateMetrics(participant, ['challenges.takedownsInAlcove']) &&
        participant.challenges.takedownsInAlcove > 3) {
      tags.alcoveClub = tagBoolVal(true, participant.challenges.takedownsInAlcove);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Got carried by minions
    if (validateMetrics(participant, ['challenges.twentyMinionsIn3SecondsCount']) &&
        participant.challenges.twentyMinionsIn3SecondsCount > 2) {
      tags.minionEater = tagBoolVal(true, participant.challenges.twentyMinionsIn3SecondsCount);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Stayed hidden a lot
    if (validateMetrics(participant, ['challenges.unseenRecalls']) &&
        participant.challenges.unseenRecalls > 5) {
      tags.hideAndSeekChampion = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Used herald but it died instantly
    if (validateMetrics(participant, ['challenges.turretsTakenWithRiftHerald', 'challenges.riftHeraldTakedowns']) &&
        participant.challenges.turretsTakenWithRiftHerald === 0 && 
        participant.challenges.riftHeraldTakedowns > 1) {
      tags.shyHerald = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Danced with herald dancedWithRiftHerald
    if (validateMetrics(participant, ['challenges.dancedWithRiftHerald']) &&
        participant.challenges.dancedWithRiftHerald > 1) {
      tags.dancePartner = tagBoolVal(true, participant.challenges.dancedWithRiftHerald);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Snowball performance
    if (validateMetrics(participant, ['challenges.takedownsAfterGainingLevelAdvantage', 'kills']) &&
        participant.challenges.takedownsAfterGainingLevelAdvantage > participant.kills * 0.5 && 
        participant.kills > 3 && 
        gameMetrics.didWin) {
      tags.snowball = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Damage balance
    if (validateMetrics(participant, ['physicalDamageDealtToChampions', 'magicDamageDealtToChampions', 'totalDamageDealt']) &&
        Math.abs(participant.physicalDamageDealtToChampions - participant.magicDamageDealtToChampions) < 1000 && 
        participant.totalDamageDealtToChampions > 10000) {
      tags.balancedDiet = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Assist focused
    if (validateMetrics(participant, ['kills', 'assists']) &&
        participant.assists > participant.kills * 3 && 
        participant.assists > 10) {
      tags.teamPlayer = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Build path
    if (validateMetrics(participant, ['physicalDamageDealtToChampions', 'magicDamageDealtToChampions', 'championName']) &&
        ((participant.physicalDamageDealtToChampions > participant.magicDamageDealtToChampions && 
          ['Ahri', 'Viktor', 'Syndra'].includes(participant.championName)) ||
        (participant.magicDamageDealtToChampions > participant.physicalDamageDealtToChampions && 
          ['Zed', 'Talon', 'Yasuo'].includes(participant.championName)))) {
      tags.identityCrisis = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Early game focus
    if (validateMetrics(participant, ['challenges.takedownsFirst25Minutes']) &&
        gameMetrics.earlyKills > 5 && 
        gameMetrics.gameLength > 2400) {
      tags.earlyBird = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Roaming
    if (validateMetrics(participant, ['challenges.killsOnOtherLanesEarlyJungleAsLaner', 'challenges.killParticipation']) &&
        participant.challenges.killsOnOtherLanesEarlyJungleAsLaner > 0 && 
        gameMetrics.killParticipation > 0.6 && 
        !gameMetrics.isAram) {
      tags.mercenary = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;

    // Low risk play
    if (validateMetrics(participant, ['deaths', 'challenges.killParticipation']) &&
        participant.deaths < 3 && 
        gameMetrics.killParticipation < 0.4 && 
        gameMetrics.gameLength > 1500) {
      tags.surviveAtAllCosts = tagBoolVal(true, null);
      tagStats.gray.triggered++;
    }
    tagStats.gray.total++;
   
    // =====================
    // GREEN TAGS - Good Performance
    // =====================

    // Good vision control
    if (validateMetrics(participant, ['visionScore', 'wardsKilled']) &&
    thresholds.hasHighVision) {
    tags.scout = tagBoolVal(true, null);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Strong carry performance
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation']) &&
    thresholds.isHighPerformer && gameMetrics.didWin) {
    tags.youreWelcome = tagBoolVal(true, null);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Support performance
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation']) &&
    gameMetrics.isSupport && 
    gameMetrics.kda > teamStats.avgKda + 1 && 
    gameMetrics.killParticipation > teamStats.avgKillParticipation && 
    thresholds.isBotLanePoor && 
    gameMetrics.didWin) {
    tags.midIsMyNewBestFriend = tagBoolVal(true, null);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Support carry
    if (validateMetrics(participant, ['totalDamageDealtToChampions']) &&
    gameMetrics.isSupport && 
    participant.totalDamageDealtToChampions > teamStats.botDamage) {
    if (gameMetrics.didWin) {
    tags.imTheCarryNow = tagBoolVal(true, null);
    tagStats.green.triggered++;
    } else {
    tags.arentYouForgettingSomeone = tagBoolVal(true, null);
    tagStats.gray.triggered++;
    }
    }
    tagStats.green.total++;

    // Lane dominance
    if (validateMetrics(participant, ['goldEarned']) &&
    goldDiffWithOpponent > 2000 && 
    !gameMetrics.gameRemake && 
    !gameMetrics.isAram) {
    tags.stomper = tagBoolVal(true, goldDiffWithOpponent);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Objective control
    if (validateMetrics(participant, ['dragonKills', 'baronKills', 'challenges.riftHeraldTakedowns']) &&
    gameMetrics.isJungle && objectiveKills > 2) {
    tags.adequateJungler = tagBoolVal(true, objectiveKills);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Counter jungling
    if (validateMetrics(participant, ['challenges.enemyJungleMonsterKills']) &&
    participant.challenges.enemyJungleMonsterKills > 19) {
    tags.counterJungler = tagBoolVal(true, participant.challenges.enemyJungleMonsterKills);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Team fighting
    if (validateMetrics(participant, ['kills', 'challenges.soloKills', 'challenges.kda', 'challenges.killParticipation']) &&
    (participant.kills - participant.challenges.soloKills)/participant.kills >= 0.7 && 
    gameMetrics.kda > 4 && 
    gameMetrics.killParticipation > 0.7 && 
    !gameMetrics.gameRemake && 
    !gameMetrics.isAram) {
    tags.betterTogether = tagBoolVal(true, null);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Tower takedowns
    if (validateMetrics(participant, ['turretTakedowns']) &&
    participant.turretTakedowns > 4) {
    tags.hatesArchitecture = tagBoolVal(true, participant.turretTakedowns);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Defensive plays
    if (validateMetrics(participant, ['challenges.killsUnderOwnTurret']) &&
    gameMetrics.killsUnderOwnTurret >= 2 && 
    !gameMetrics.isAram) {
    tags.niceDiveIdiot = tagBoolVal(true, gameMetrics.killsUnderOwnTurret);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Aggressive plays
    if (validateMetrics(participant, ['challenges.killsNearEnemyTurret']) &&
    gameMetrics.killsNearEnemyTurret > 2 && 
    !gameMetrics.isAram) {
    tags.coolTurret = tagBoolVal(true, gameMetrics.killsNearEnemyTurret);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Bounty collection
    if (validateMetrics(participant, ['challenges.bountyGold']) &&
    participant.challenges.bountyGold > 1000) {
    tags.bountyHunter = tagBoolVal(true, participant.challenges.bountyGold);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // Vision control
    if (validateMetrics(participant, ['challenges.controlWardsPlaced', 'wardsKilled']) &&
    participant.challenges.controlWardsPlaced > 3 && 
    gameMetrics.wardsKilled > 5) {
    tags.darkness = tagBoolVal(true, null);
    tagStats.green.triggered++;
    }
    tagStats.green.total++;

    // sneaky Stealthy - objective steals
    if (validateMetrics(participant, ['objectivesStolen', 'objectivesStolenAssists',]) &&
    participant.objectivesStolen > 1 || participant.objectivesStolenAssists > 1) {
    tags.sneakyStealthy = tagBoolVal(true, participant.objectivesStolen+ participant.objectivesStolenAssists);
    tagStats.green.triggered++;
    }

    // CS dominance
    if (
    earlyCSAdvantage > 30 && 
    gameMetrics.didWin && 
    !gameMetrics.isAram && 
    !gameMetrics.isJungle) {
    tags.laneKingdom = tagBoolVal(true, earlyCSAdvantage);
    }
    tagStats.green.total++;

    // =====================
    // YELLOW TAGS - Exceptional Performance
    // =====================

    // Perfect performance
    if (validateMetrics(participant, ['challenges.perfectGame', 'challenges.killParticipation']) &&
    thresholds.isPerfectGame && 
    gameMetrics.killParticipation > 0.7 && 
    !gameMetrics.gameRemake && 
    !gameMetrics.isAram) {
    tags.flawlessVictory = tagBoolVal(true, null);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // ARAM no deaths
    if (validateMetrics(participant, ['deaths']) &&
    gameMetrics.isAram && 
    participant.deaths <= 0) {
    tags.heGotANoNo = tagBoolVal(true, null);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // Multi-kills
    if (validateMetrics(participant, ['pentaKills', 'quadraKills'])) {
    if (participant.pentaKills > 0) {
    tags.pentakill = tagBoolVal(true, participant.pentaKills);
    tagStats.yellow.triggered++;
    } else if (participant.quadraKills > 0) {
    tags.quadraMaster = tagBoolVal(true, participant.quadraKills);
    tagStats.green.triggered++;
    }
    }
    tagStats.yellow.total++;

    //cs god 
    if (validateMetrics(participant, ['totalMinionsKilled']) &&
    participant.totalMinionsKilled/gameMetrics.gameLength > 9) {
    tags.csGod = tagBoolVal(true, participant.totalMinionsKilled/gameMetrics.gameLength);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // Vision dominance
    if (validateMetrics(participant, ['challenges.visionScorePerMinute', 'wardsPlaced']) &&
    gameMetrics.visionScorePerMin > 2 && 
    gameMetrics.wardsPlaced > 20 && 
    participant.challenges.visionAdvantage > 1.5) {
    tags.visionDomination = tagBoolVal(true, null);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // Hard carry
    if (validateMetrics(participant, ['challenges.soloKills', 'challenges.killParticipation', 'challenges.damagePerMinute']) &&
    participant.challenges.soloKills > 5 && 
    gameMetrics.killParticipation > 0.7 && 
    gameMetrics.damagePerMin > 1000) {
    tags.simplyTheBest = tagBoolVal(true, null);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // Perfect objective control
    if (validateMetrics(participant, ['dragonKills', 'baronKills', 'challenges.riftHeraldTakedowns']) &&
    gameMetrics.baronKills > 1 && 
    gameMetrics.heraldKills > 1 && 
    !gameMetrics.isAram) {
    tags.objectiveSupremacy = tagBoolVal(true, null);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // High damage
    if (validateMetrics(participant, ['totalDamageDealtToChampions']) &&
    participant.totalDamageDealtToChampions > 50000) {
    tags.damageMaster = tagBoolVal(true, participant.totalDamageDealtToChampions);
    tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // ARAM no deaths
    if (gameMetrics.isAram && participant.deaths <= 0) {
      tags.heGotANoNo = tagBoolVal(true, null);
      tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // Big comeback
    if (killDeficit > 10 && 
        gameMetrics.didWin && 
        gameMetrics.killParticipation > 0.7 && 
        gameMetrics.kda > 3) {
      tags.dontEverSayItsOver = tagBoolVal(true, killDeficit);
      tagStats.yellow.triggered++;
    }
    tagStats.yellow.total++;

    // Role-specific carrying
    if (gameMetrics.didWin && !gameMetrics.gameRemake && thresholds.isHighPerformer) {
      const poorTeamPerformance = teamStats.botKda < 3 && 
                                 teamStats.jungleKda < 3 && 
                                 teamStats.midKda < 3 && 
                                 teamStats.topKda < 3 && 
                                 teamStats.supportKda < 3;

      if (gameMetrics.isSupport && poorTeamPerformance) {
        tags.carryingIsKindOfSupporting = tagBoolVal(true, null);
        tagStats.yellow.triggered++;
      } else if (gameMetrics.isBot && poorTeamPerformance) {
        tags.justDoinMyJob = tagBoolVal(true, null);
        tagStats.yellow.triggered++;
      } else if (gameMetrics.isJungle && poorTeamPerformance) {
        tags.kingOfDaJungle = tagBoolVal(true, null);
        tagStats.yellow.triggered++;
      } else if (gameMetrics.isMid && poorTeamPerformance) {
        tags.notSoMiddling = tagBoolVal(true, null);
        tagStats.yellow.triggered++;
      } else if (gameMetrics.isTop && poorTeamPerformance) {
        tags.itsCalledTopForAReason = tagBoolVal(true, null);
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // Log final stats
    const totalEnd = performance.now();
    console.log(`Tag processing completed in ${totalEnd - startTime}ms. Final stats:`, {
      red: tagStats.red,
      gray: tagStats.gray,
      green: tagStats.green,
      yellow: tagStats.yellow,
      totalTriggered: tagStats.red.triggered + 
                     tagStats.gray.triggered + 
                     tagStats.green.triggered + 
                     tagStats.yellow.triggered,
      totalTags: tagStats.red.total + 
                tagStats.gray.total + 
                tagStats.green.total + 
                tagStats.yellow.total
    });

    return tags;

  } catch (error) {
    console.log('Error in calculateTags:', error);
    throw new Error(`Tag calculation failed: ${error.message}`);
  }
}

function validateMetrics(participant, requiredMetrics) {
  try {
    for (const metric of requiredMetrics) {
      const value = metric.split('.').reduce((obj, key) => obj?.[key], participant);
      if (value === undefined || value === null) {
        console.log(`Missing required metric: ${metric}`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log(`Error validating metrics: ${error.message}`);
    return false;
  }
}

function getSummonerSpellName(spellId) {
  const spellMap = {
    1: 'Cleanse',
    3: 'Exhaust',
    4: 'Flash',
    6: 'Ghost',
    7: 'Heal',
    11: 'Smite',
    12: 'Teleport',
    13: 'Clarity',
    14: 'Ignite',
    21: 'Barrier',
    32: 'Mark',
    39: 'Shield'
  };
  return spellMap[spellId];
}

function tagBoolVal (bool, value) {
  return { isTriggered: bool, value: value,};
}

module.exports = { calculateTags };
