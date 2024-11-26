const { performance } = require('perf_hooks');

const { calculateTeamStats, calculateGameMetrics, getPerformanceThresholds } = require('./tagUtils');

async function calculateTags(participant, models) {
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
    const match = await models.Match.findOne({ 'metadata.matchId': matchId }).populate('info.participants');
    if (!match) throw new Error('Match not found');

    const team = match.info.participants.filter(p => p.teamId === participant.teamId);
    const opponents = match.info.participants.filter(p => p.teamId !== participant.teamId);
    const laneOpponent = opponents.find(p => p.teamPosition === participant.teamPosition) || opponents[0];

    // Calculate base metrics
    const teamStats = calculateTeamStats(participant, team);
    const gameMetrics = calculateGameMetrics(participant, participant.timePlayed / 60);
    const thresholds = getPerformanceThresholds(participant, teamStats, gameMetrics);

    const tags = {};
    
    // =====================
    // RED TAGS
    // =====================
    const redStart = performance.now();
    
    // Vision control
    if (validateMetrics(participant, ['challenges.visionScorePerMinute'])) {
      tags.blind = tagBoolVal(thresholds.hasPoorVision && !gameMetrics.gameRemake, gameMetrics.visionScorePerMin);
      if (tags.blind.isTriggered) {
        console.log('Blind tag triggered:', { 
          visionScorePerMin: gameMetrics.visionScorePerMin,
          isAram: gameMetrics.isAram,
          gameRemake: gameMetrics.gameRemake
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // Poor performance
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation'])) {
      tags.worstOfTheWorst = tagBoolVal(thresholds.isLowPerformer && !gameMetrics.didWin && !gameMetrics.gameRemake, null);
      if (tags.worstOfTheWorst.isTriggered) {
        console.log('Worst of the Worst tag triggered:', {
          kda: gameMetrics.kda,
          avgKda: teamStats.avgKda,
          killParticipation: gameMetrics.killParticipation,
          avgKillParticipation: teamStats.avgKillParticipation
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // Tag Along
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation'])) {
      tags.tagAlong = tagBoolVal(gameMetrics.kda <= 2 && gameMetrics.isLowImpact && 
                      gameMetrics.didWin && !gameMetrics.gameRemake,
                      null);
      if (tags.tagAlong.isTriggered) {
        console.log('Tag Along triggered:', {
          kda: gameMetrics.kda,
          killParticipation: gameMetrics.killParticipation,
          didWin: gameMetrics.didWin
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // Poor lane performance
    if (validateMetrics(participant, ['goldEarned'])) {
      const goldDiffWithOpponent = participant.goldEarned - laneOpponent.goldEarned;
      tags.poor =  tagBoolVal(goldDiffWithOpponent < -3000 && !gameMetrics.gameRemake && !gameMetrics.isAram, goldDiffWithOpponent);
      if (tags.poor.isTriggered) {
        console.log('Poor tag triggered:', {
          goldDiff: goldDiffWithOpponent,
          gameRemake: gameMetrics.gameRemake,
          isAram: gameMetrics.isAram
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // Coward
    if (validateMetrics(participant, ['challenges.killParticipation', 'challenges.kda'])) {
      tags.coward = tagBoolVal(gameMetrics.isLowImpact && gameMetrics.kda > 2 && 
                    !gameMetrics.didWin && !gameMetrics.gameRemake,
                    null);
      if (tags.coward.isTriggered) {
        console.log('Coward tag triggered:', {
          killParticipation: gameMetrics.killParticipation,
          kda: gameMetrics.kda,
          didWin: gameMetrics.didWin
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // ATM
    if (validateMetrics(participant, ['deaths', 'goldEarned'])) {
      tags.atm = tagBoolVal(thresholds.isFeeding, null);
      if (tags.atm.isTriggered) {
        console.log('ATM tag triggered:', {
          deaths: participant.deaths,
          goldEarned: participant.goldEarned,
          avgTeamGold: teamStats.avgGold
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // Honorary Carry (Bad Support)
    if (validateMetrics(participant, ['challenges.visionScorePerMinute'])) {
      tags.honoraryCarry = tagBoolVal(gameMetrics.isSupport && gameMetrics.visionScorePerMin < 1 && 
                          !gameMetrics.gameRemake,
                          gameMetrics.visionScorePerMin);
      if (tags.honoraryCarry.isTriggered) {
        console.log('Honorary Carry tag triggered:', {
          visionScorePerMin: gameMetrics.visionScorePerMin,
          isSupport: gameMetrics.isSupport
        });
        tagStats.red.triggered++;
      }
    }
    tagStats.red.total++;

    // ... (continuing with more red tags)

    const redEnd = performance.now();
    console.log(`Red tags processed in ${redEnd - redStart}ms. Stats:`, {
      triggered: tagStats.red.triggered,
      total: tagStats.red.total,
      percentage: (tagStats.red.triggered / tagStats.red.total * 100).toFixed(2) + '%'
    });

    // =====================
    // GRAY TAGS
    // =====================
    const grayStart = performance.now();

    // Jack of All Trades
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation'])) {
      tags.jackOfAllTrades = tagBoolVal(gameMetrics.kda > 1.5 && gameMetrics.kda < 2.5 && 
                            gameMetrics.killParticipation > 0.4 && 
                            gameMetrics.killParticipation < 0.6 && !gameMetrics.gameRemake,
                            null);
      if (tags.jackOfAllTrades.isTriggered) {
        console.log('Jack of All Trades triggered:', {
          kda: gameMetrics.kda,
          killParticipation: gameMetrics.killParticipation
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Dragon's Hoard
    if (validateMetrics(participant, ['goldEarned', 'goldSpent'])) {
      const unspentGold = participant.goldEarned - participant.goldSpent;
      tags.dragonsHoard = tagBoolVal(unspentGold > 3000, unspentGold);
      if (tags.dragonsHoard.isTriggered) {
        console.log('Dragons Hoard triggered:', { unspentGold });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Perfectly Balanced
    if (validateMetrics(participant, ['kills', 'deaths', 'assists'])) {
      tags.perfectlyBalanced = tagBoolVal(participant.kills === participant.deaths && 
                              participant.kills === participant.assists && 
                              participant.kills > 3,
                              null);
      if (tags.perfectlyBalanced.isTriggered) {
        console.log('Perfectly Balanced triggered:', {
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // I Feel Fine
    if (validateMetrics(participant, ['challenges.survivedSingleDigitHpCount'])) {
      tags.iFeelFine = tagBoolVal(participant.challenges.survivedSingleDigitHpCount > 1, participant.challenges.survivedSingleDigitHpCount);
      if (tags.iFeelFine.isTriggered) {
        console.log('I Feel Fine triggered:', {
          survivedLowHP: participant.challenges.survivedSingleDigitHpCount
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // AFK Farmer
    if (validateMetrics(participant, ['totalMinionsKilled', 'challenges.killParticipation'])) {
      tags.afkFarmer = tagBoolVal(participant.totalMinionsKilled > 200 && gameMetrics.isLowImpact, null);
      if (tags.afkFarmer.isTriggered) {
        console.log('AFK Farmer triggered:', {
          cs: participant.totalMinionsKilled,
          killParticipation: gameMetrics.killParticipation
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // PVE
    if (validateMetrics(participant, ['totalDamageDealtToChampions', 'damageDealtToObjectives', 'kills', 'deaths'])) {
      tags.pve = tagBoolVal(gameMetrics.isTop && 
                 participant.totalDamageDealtToChampions < participant.damageDealtToObjectives * 0.7 && 
                 participant.kills < 3 && participant.deaths < 3, null);
      if (tags.pve.isTriggered) {
        console.log('PVE triggered:', {
          championDamage: participant.totalDamageDealtToChampions,
          objectiveDamage: participant.damageDealtToObjectives,
          kills: participant.kills,
          deaths: participant.deaths
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Paper Tank
    if (validateMetrics(participant, ['totalDamageTaken', 'damageSelfMitigated'])) {
      tags.paperTank = tagBoolVal(gameMetrics.damageTaken > 40000 && 
                      gameMetrics.damageMitigated < gameMetrics.damageTaken * 0.3, null);
      if (tags.paperTank.isTriggered) {
        console.log('Paper Tank triggered:', {
          damageTaken: gameMetrics.damageTaken,
          damageMitigated: gameMetrics.damageMitigated,
          mitigationRatio: gameMetrics.damageMitigated / gameMetrics.damageTaken
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Yeah Yeah OMW
    if (validateMetrics(participant, ['onMyWayPings'])) {
      tags.yeahYeahOmw = tagBoolVal(participant.onMyWayPings > 20 && gameMetrics.isJungle, participant.onMyWayPings);
      if (tags.yeahYeahOmw.isTriggered) {
        console.log('Yeah Yeah OMW triggered:', {
          omwPings: participant.onMyWayPings,
          isJungle: gameMetrics.isJungle
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Keyboard Warrior
    if (validateMetrics(participant, ['allInPings', 'assistMePings', 'commandPings', 'pushPings',
                                    'enemyMissingPings', 'enemyVisionPings', 'holdPings',
                                    'getBackPings', 'needVisionPings', 'onMyWayPings', 'visionClearedPings'])) {
      tags.keyboardWarrior = tagBoolVal(gameMetrics.pingCount > 100, gameMetrics.pingCount);
      if (tags.keyboardWarrior.isTriggered) {
        console.log('Keyboard Warrior triggered:', { totalPings: gameMetrics.pingCount });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Blast Em
    if (validateMetrics(participant, ['challenges.blastConeOppositeOpponentCount'])) {
      tags.blastEm = tagBoolVal(participant.challenges.blastConeOppositeOpponentCount > 1, participant.challenges.blastConeOppositeOpponentCount);
      if (tags.blastEm.isTriggered) {
        console.log('Blast Em triggered:', {
          blastConeUses: participant.challenges.blastConeOppositeOpponentCount
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Stop Right There
    if (validateMetrics(participant, ['challenges.enemyChampionImmobilizations'])) {
      tags.stopRightThere = tagBoolVal(participant.challenges.enemyChampionImmobilizations/(gameMetrics.gameLength)>10, participant.challenges.enemyChampionImmobilizations/(gameMetrics.gameLength));
      if (tags.stopRightThere.isTriggered) {
        console.log('Stop Right There triggered:', {
          immobilizations: participant.challenges.enemyChampionImmobilizations
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Shy Herald
    if (validateMetrics(participant, ['challenges.turretsTakenWithRiftHerald', 'challenges.riftHeraldTakedowns'])) {
      tags.shyHerald = tagBoolVal(participant.challenges.turretsTakenWithRiftHerald === 0 && 
                       participant.challenges.riftHeraldTakedowns > 1, null);
      if (tags.shyHerald.isTriggered) {
        console.log('Shy Herald triggered:', {
          heraldTakedowns: participant.challenges.riftHeraldTakedowns,
          turretsTaken: participant.challenges.turretsTakenWithRiftHerald
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    // Dance Partner
    if (validateMetrics(participant, ['challenges.dancedWithRiftHerald'])) {
      tags.dancePartner = tagBoolVal(participant.challenges.dancedWithRiftHerald > 0, participant.challenges.dancedWithRiftHerald);
      if (tags.dancePartner.isTriggered) {
        console.log('Dance Partner triggered:', {
          dances: participant.challenges.dancedWithRiftHerald
        });
        tagStats.gray.triggered++;
      }
    }
    tagStats.gray.total++;

    const grayEnd = performance.now();
    console.log(`Gray tags processed in ${grayEnd - grayStart}ms. Stats:`, {
      triggered: tagStats.gray.triggered,
      total: tagStats.gray.total,
      percentage: (tagStats.gray.triggered / tagStats.gray.total * 100).toFixed(2) + '%'
    });

    // =====================
    // GREEN TAGS
    // =====================
    const greenStart = performance.now();

    // Scout
    if (validateMetrics(participant, ['wardsKilled', 'visionScore'])) {
      tags.scout = tagBoolVal(thresholds.hasHighVision, null);
      if (tags.scout.isTriggered) {
        console.log('Scout triggered:', {
          wardsKilled: gameMetrics.wardsKilled,
          visionScore: gameMetrics.visionScore
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // You're Welcome
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation'])) {
      tags.youreWelcome = tagBoolVal(thresholds.isHighPerformer && gameMetrics.didWin, null);
      if (tags.youreWelcome.isTriggered) {
        console.log('You\'re Welcome triggered:', {
          kda: gameMetrics.kda,
          killParticipation: gameMetrics.killParticipation,
          avgKda: teamStats.avgKda,
          avgKillParticipation: teamStats.avgKillParticipation
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Mid is My New Best Friend
    if (validateMetrics(participant, ['challenges.kda', 'challenges.killParticipation'])) {
      tags.midIsMyNewBestFriend = tagBoolVal(gameMetrics.isSupport && 
                                 gameMetrics.kda > teamStats.avgKda + 1 && 
                                 gameMetrics.killParticipation > teamStats.avgKillParticipation && 
                                 thresholds.isBotLanePoor && 
                                 gameMetrics.didWin, null);
      if (tags.midIsMyNewBestFriend.isTriggered) {
        console.log('Mid is My New Best Friend triggered:', {
          isSupport: gameMetrics.isSupport,
          kda: gameMetrics.kda,
          killParticipation: gameMetrics.killParticipation,
          botLaneKda: teamStats.botKda
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // I'm the Carry Now
    if (validateMetrics(participant, ['totalDamageDealtToChampions'])) {
      tags.imTheCarryNow = tagBoolVal(gameMetrics.isSupport && 
                          gameMetrics.totalDamageDealt > teamStats.botDamage && 
                          gameMetrics.didWin, null);
      if (tags.imTheCarryNow.isTriggered) {
        console.log('I\'m the Carry Now triggered:', {
          supportDamage: gameMetrics.totalDamageDealt,
          botDamage: teamStats.botDamage
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Stomper
    if (validateMetrics(participant, ['goldEarned'])) {
      const goldDiffWithOpponent = participant.goldEarned - laneOpponent.goldEarned;
      tags.stomper = tagBoolVal(goldDiffWithOpponent > 2000 && !gameMetrics.gameRemake && !gameMetrics.isAram, goldDiffWithOpponent);

      if (tags.stomper.isTriggered) {
        console.log('Stomper triggered:', {
          goldDiff: goldDiffWithOpponent,
          gameRemake: gameMetrics.gameRemake,
          isAram: gameMetrics.isAram
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Adequate Jungler
    if (validateMetrics(participant, ['challenges.dragonTakedowns', 'challenges.baronTakedowns', 'challenges.riftHeraldTakedowns'])) {
      tags.adequateJungler = tagBoolVal(gameMetrics.isJungle && gameMetrics.objectiveKills > 2, null);
      if (tags.adequateJungler.isTriggered) {
        console.log('Adequate Jungler triggered:', {
          objectiveKills: gameMetrics.objectiveKills,
          dragonKills: gameMetrics.dragonKills,
          baronKills: gameMetrics.baronKills,
          heraldKills: gameMetrics.heraldKills
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Counter Jungler
    if (validateMetrics(participant, ['challenges.enemyJungleMonsterKills'])) {
      tags.counterJungler = tagBoolVal(participant.challenges.enemyJungleMonsterKills > 19, participant.challenges.enemyJungleMonsterKills);
      if (tags.counterJungler.isTriggered) {
        console.log('Counter Jungler triggered:', {
          enemyJungleKills: participant.challenges.enemyJungleMonsterKills
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Better Together
    if (validateMetrics(participant, ['kills', 'challenges.soloKills', 'challenges.kda', 'challenges.killParticipation'])) {
      const teamKillRatio = (participant.kills - participant.challenges.soloKills) / participant.kills;
      tags.betterTogether = tagBoolVal(teamKillRatio >= 0.7 && 
                           gameMetrics.kda > 4 && 
                           gameMetrics.killParticipation > 0.7 && 
                           !gameMetrics.gameRemake && 
                           !gameMetrics.isAram, teamKillRatio);
      if (tags.betterTogether.isTriggered) {
        console.log('Better Together triggered:', {
          teamKillRatio,
          kda: gameMetrics.kda,
          killParticipation: gameMetrics.killParticipation
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Hates Architecture
    if (validateMetrics(participant, ['turretTakedowns'])) {
      tags.hatesArchitecture = tagBoolVal(participant.turretTakedowns > 4, participant.turretTakedowns);
      if (tags.hatesArchitecture.isTriggered) {
        console.log('Hates Architecture triggered:', {
          turretTakedowns: participant.turretTakedowns
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Nice Dive Idiot
    if (validateMetrics(participant, ['challenges.killsUnderOwnTurret'])) {
      tags.niceDiveIdiot = tagBoolVal(gameMetrics.killsUnderOwnTurret >= 2 && !gameMetrics.isAram, gameMetrics.killsUnderOwnTurret);
      if (tags.niceDiveIdiot.isTriggered) {
        console.log('Nice Dive Idiot triggered:', {
          killsUnderTurret: gameMetrics.killsUnderOwnTurret
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    // Cool Turret
    if (validateMetrics(participant, ['challenges.killsNearEnemyTurret'])) {
      tags.coolTurret = tagBoolVal(gameMetrics.killsNearEnemyTurret > 2 && !gameMetrics.isAram, gameMetrics.killsNearEnemyTurret);
      if (tags.coolTurret.isTriggered) {
        console.log('Cool Turret triggered:', {
          killsNearEnemyTurret: gameMetrics.killsNearEnemyTurret
        });
        tagStats.green.triggered++;
      }
    }
    tagStats.green.total++;

    const greenEnd = performance.now();
    console.log(`Green tags processed in ${greenEnd - greenStart}ms. Stats:`, {
      triggered: tagStats.green.triggered,
      total: tagStats.green.total,
      percentage: (tagStats.green.triggered / tagStats.green.total * 100).toFixed(2) + '%'
    });

    // =====================
    // YELLOW TAGS - Prestigious Achievements
    // =====================
    const yellowStart = performance.now();

    // Flawless Victory
    if (validateMetrics(participant, ['challenges.perfectGame', 'challenges.killParticipation'])) {
      tags.flawlessVictory = tagBoolVal(thresholds.isPerfectGame && 
                            gameMetrics.killParticipation > 0.7 && 
                            !gameMetrics.gameRemake && 
                            !gameMetrics.isAram, null);
      if (tags.flawlessVictory.isTriggered) {
        console.log('Flawless Victory triggered:', {
          perfectGame: thresholds.isPerfectGame,
          killParticipation: gameMetrics.killParticipation
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // He's Got a No No (ARAM no deaths)
    if (validateMetrics(participant, ['deaths'])) {
      tags.heGotANoNo = tagBoolVal(gameMetrics.isAram && participant.deaths === 0, participant.deaths);
      if (tags.heGotANoNo.isTriggered) {
        console.log('He\'s Got a No No triggered:', {
          isAram: gameMetrics.isAram,
          deaths: participant.deaths
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // PENTAKILL
    if (validateMetrics(participant, ['pentaKills'])) {
      tags.pentakill = tagBoolVal(participant.pentaKills > 0, participant.pentaKills);
      if (tags.pentakill.isTriggered) {
        console.log('PENTAKILL triggered:', {
          pentaKills: participant.pentaKills
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // Don't Ever Say It's Over
    if (validateMetrics(participant, ['challenges.maxKillDeficit', 'challenges.killParticipation', 'challenges.kda'])) {
      tags.dontEverSayItsOver = tagBoolVal(participant.challenges.maxKillDeficit > 10 && 
                               gameMetrics.didWin && 
                               gameMetrics.killParticipation > 0.7 && 
                               gameMetrics.kda > 3, participant.challenges.maxKillDeficit);
      if (tags.dontEverSayItsOver.isTriggered) {
        console.log('Don\'t Ever Say It\'s Over triggered:', {
          killDeficit: participant.challenges.maxKillDeficit,
          killParticipation: gameMetrics.killParticipation,
          kda: gameMetrics.kda
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // Simply The Best
    if (validateMetrics(participant, ['challenges.soloKills', 'challenges.killParticipation', 'challenges.damagePerMinute'])) {
      tags.simplyTheBest = tagBoolVal(participant.challenges.soloKills > 5 && 
                          gameMetrics.killParticipation > 0.7 && 
                          gameMetrics.damagePerMin > 1000, null);
      if (tags.simplyTheBest.isTriggered) {
        console.log('Simply The Best triggered:', {
          soloKills: participant.challenges.soloKills,
          killParticipation: gameMetrics.killParticipation,
          damagePerMin: gameMetrics.damagePerMin
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // Objective Supremacy
    if (validateMetrics(participant, ['challenges.dragonTakedowns', 'challenges.baronTakedowns', 'challenges.riftHeraldTakedowns'])) {
      tags.objectiveSupremacy = tagBoolVal(gameMetrics.dragonKills > 3 && 
                               gameMetrics.baronKills > 1 && 
                               gameMetrics.heraldKills > 1 && 
                               !gameMetrics.isAram, null);
      if (tags.objectiveSupremacy.isTriggered) {
        console.log('Objective Supremacy triggered:', {
          dragonKills: gameMetrics.dragonKills,
          baronKills: gameMetrics.baronKills,
          heraldKills: gameMetrics.heraldKills
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    // Carrying Types by Role
    if (validateMetrics(participant, ['challenges.kda']) && gameMetrics.didWin && !gameMetrics.gameRemake && !gameMetrics.isAram) {
      // Support carrying feeders
      tags.carryingIsKindOfSupporting = tagBoolVal(gameMetrics.isSupport && 
                                      teamStats.botKda < 3 && 
                                      teamStats.jungleKda < 3 && 
                                      teamStats.midKda < 3 && 
                                      teamStats.topKda < 3 && 
                                      gameMetrics.didWin && 
                                      !gameMetrics.gameRemake, null);
      
      // Bot carrying feeders
      tags.justDoinMyJob = tagBoolVal(gameMetrics.isBot && 
                          thresholds.isHighPerformer && 
                          teamStats.supportKda < 3 && 
                          teamStats.jungleKda < 3 && 
                          teamStats.midKda < 3 && 
                          teamStats.topKda < 3 && 
                          gameMetrics.didWin && 
                          !gameMetrics.gameRemake, null);
      
      // Jungle carrying feeders
      tags.kingOfDaJungle = tagBoolVal(gameMetrics.isJungle && 
                           thresholds.isHighPerformer && 
                           teamStats.botKda < 3 && 
                           teamStats.supportKda < 3 && 
                           teamStats.midKda < 3 && 
                           teamStats.topKda < 3 && 
                           gameMetrics.didWin && 
                           !gameMetrics.gameRemake, null);
      
      // Mid carrying feeders
      tags.notSoMiddling = tagBoolVal(gameMetrics.isMid && 
                          thresholds.isHighPerformer && 
                          teamStats.botKda < 3 && 
                          teamStats.jungleKda < 3 && 
                          teamStats.supportKda < 3 && 
                          teamStats.topKda < 3 && 
                          gameMetrics.didWin && 
                          !gameMetrics.gameRemake, null);
      
      // Top carrying feeders
      tags.itsCalledTopForAReason = tagBoolVal(gameMetrics.isTop && 
                                   thresholds.isHighPerformer && 
                                   teamStats.botKda < 3 && 
                                   teamStats.jungleKda < 3 && 
                                   teamStats.midKda < 3 && 
                                   teamStats.supportKda < 3 && 
                                   gameMetrics.didWin && 
                                   !gameMetrics.gameRemake, null);

      if (tags.carryingIsKindOfSupporting.isTriggered || tags.justDoinMyJob.isTriggered || 
          tags.kingOfDaJungle.isTriggered || tags.notSoMiddling.isTriggered || tags.itsCalledTopForAReason.isTriggered) {
        console.log('Carrying team triggered:', {
          role: participant.teamPosition,
          teamKDAs: {
            bot: teamStats.botKda,
            support: teamStats.supportKda,
            jungle: teamStats.jungleKda,
            mid: teamStats.midKda,
            top: teamStats.topKda
          }
        });
        tagStats.yellow.triggered++;
      }
    }
    tagStats.yellow.total++;

    const yellowEnd = performance.now();
    console.log(`Yellow tags processed in ${yellowEnd - yellowStart}ms. Stats:`, {
      triggered: tagStats.yellow.triggered,
      total: tagStats.yellow.total,
      percentage: (tagStats.yellow.triggered / tagStats.yellow.total * 100).toFixed(2) + '%'
    });

    // Log overall stats
    const totalEnd = performance.now();
    console.log(`Tag processing completed in ${totalEnd - startTime}ms. Final stats:`, {
      red: tagStats.red,
      gray: tagStats.gray,
      green: tagStats.green,
      yellow: tagStats.yellow,
      totalTriggered: tagStats.red.triggered + tagStats.gray.triggered + 
                     tagStats.green.triggered + tagStats.yellow.triggered,
      totalTags: tagStats.red.total + tagStats.gray.total + 
                tagStats.green.total + tagStats.yellow.total
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

function tagBoolVal (bool, value) {
  return { isTriggered: bool, value: value,};
}

module.exports = {
  calculateTags,
  validateMetrics
};

