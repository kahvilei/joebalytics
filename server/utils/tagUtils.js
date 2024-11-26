// Utility functions
function calculateTeamStats(participant, teammates) {
    const stats = {
      kills: 0,
      deaths: 0,
      assists: 0,
      killParticipation: 0,
      participants: 0,
      botDamage: 0,
      botKda: 0,
      botParticipation: 0,
      jungleDamage: 0,
      jungleKda: 0,
      jungleParticipation: 0,
      midDamage: 0,
      midKda: 0,
      midParticipation: 0,
      topDamage: 0,
      topKda: 0,
      topParticipation: 0,
      supportDamage: 0,
      supportKda: 0,
      supportParticipation: 0
    };
  
    try {
      for (const teammate of teammates) {
        if (teammate.puuid !== participant.puuid) {
          // Basic stats
          stats.kills += teammate.kills;
          stats.deaths += teammate.deaths;
          stats.assists += teammate.assists;
          stats.killParticipation += teammate.challenges.killParticipation;
          stats.participants++;


          const position = teammate.teamPosition;
  
          // Role-specific stats
          switch (position) {
            case 'BOTTOM':
              stats.botDamage = teammate.totalDamageDealtToChampions;
              stats.botKda = teammate.challenges.kda;
              stats.botParticipation = teammate.challenges.killParticipation;
              break;
            case 'JUNGLE':
              stats.jungleDamage = teammate.totalDamageDealtToChampions;
              stats.jungleKda = teammate.challenges.kda;
              stats.jungleParticipation = teammate.challenges.killParticipation;
              break;
            case 'MIDDLE':
              stats.midDamage = teammate.totalDamageDealtToChampions;
              stats.midKda = teammate.challenges.kda;
              stats.midParticipation = teammate.challenges.killParticipation;
              break;
            case 'TOP':
              stats.topDamage = teammate.totalDamageDealtToChampions;
              stats.topKda = teammate.challenges.kda;
              stats.topParticipation = teammate.challenges.killParticipation;
              break;
            case 'UTILITY':
              stats.supportDamage = teammate.totalDamageDealtToChampions;
              stats.supportKda = teammate.challenges.kda;
              stats.supportParticipation = teammate.challenges.killParticipation;
              break;
          }
        }
      }
  
      // Calculate averages
      stats.avgKda = (stats.kills + stats.assists) / Math.max(1, stats.deaths);
      stats.avgKillParticipation = stats.killParticipation / Math.max(1, stats.participants);
      stats.avgGold = teammates.reduce((sum, p) => sum + p.goldEarned, 0) / teammates.length;
  
      console.log('Team stats calculated successfully');
      return stats;
    } catch (error) {
      console.log('Error calculating team stats:', error);
      throw new Error(`Team stats calculation failed: ${error.message}`);
    }
  }
  
  function calculateGameMetrics(participant, gameLength) {
    try {
      return {
        // Game state
        isAram: participant.gameMode.includes('ARAM'),
        gameRemake: participant.timePlayed < 300,
        didWin: participant.win,
        gameLength: gameLength,
  
        // Role checks
        isSupport: participant.teamPosition === 'UTILITY',
        isJungle: participant.teamPosition === 'JUNGLE',
        isTop: participant.teamPosition === 'TOP',
        isMid: participant.teamPosition === 'MIDDLE',
        isBot: participant.teamPosition === 'BOTTOM',
        isCarryRole: !['UTILITY', 'JUNGLE'].includes(participant.teamPosition),
  
        // Performance metrics
        kda: participant.challenges.kda,
        killParticipation: participant.challenges.killParticipation,
        visionScore: participant.visionScore,
        visionScorePerMin: participant.challenges.visionScorePerMinute,
        csPerMin: participant.totalMinionsKilled / gameLength,
        damagePerMin: participant.challenges.damagePerMinute,
        ccPerMin: participant.totalTimeCCDealt / gameLength,
        teamDamageShare: participant.challenges.teamDamagePercentage,
  
        // Combat stats
        totalDamageDealt: participant.totalDamageDealtToChampions,
        damageTaken: participant.totalDamageTaken,
        damageMitigated: participant.damageSelfMitigated,
        healingDone: participant.totalHealsOnTeammates,
        
        // Vision metrics
        wardsPlaced: participant.wardsPlaced,
        wardsKilled: participant.wardsKilled,
        controlWards: participant.challenges.controlWardsPlaced,
  
        // Early game
        earlyKills: participant.challenges.takedownsFirst25Minutes,
        killsUnderOwnTurret: participant.challenges.killsUnderOwnTurret,
        killsNearEnemyTurret: participant.challenges.killsNearEnemyTurret,

        // Objectives
        towersDestroyed: participant.turretTakedowns,
        inhibitorsDestroyed: participant.inhibitorTakedowns,
        dragonsKilled: participant.dragonKills,
        baronsKilled: participant.baronKills,
        riftHeraldsKilled: participant.challenges.riftHeraldTakedowns,
        
        // Misc
        pingCount: calculatePingCount(participant),
        spellCasts: calculateSpellCasts(participant)
      };
    } catch (error) {
      console.log('Error calculating game metrics:', error);
      throw new Error(`Game metrics calculation failed: ${error.message}`);
    }
  }
  
  function calculatePingCount(participant) {
    return participant.allInPings || 0 +
           participant.assistMePings || 0 +
           participant.commandPings || 0 +
           participant.pushPings || 0 +
           participant.holdPings || 0 +
           participant.enemyMissingPings || 0 +
           participant.enemyVisionPings || 0 +
           participant.getBackPings || 0 +
           participant.needVisionPings || 0 +
           participant.onMyWayPings || 0 +
          participant.visionClearedPings;
  }
  
  function calculateSpellCasts(participant) {
    return participant.spell1Casts + 
           participant.spell2Casts + 
           participant.spell3Casts + 
           participant.spell4Casts;
  }
  
  function getPerformanceThresholds(participant, teamStats, metrics) {
    return {
      isHighPerformer: metrics.kda > teamStats.avgKda + 2 && 
                       metrics.killParticipation > teamStats.avgKillParticipation + 0.2,
      isLowPerformer: metrics.kda < teamStats.avgKda - 2 && 
                      metrics.killParticipation < teamStats.avgKillParticipation - 0.2,
      isPerfectGame: participant.challenges.perfectGame,
      isLegendary: participant.challenges.legendaryCount > 2,
      isFeeding: participant.deaths > 8 && participant.goldEarned < teamStats.avgGold * 0.7,
      isCarrying: metrics.teamDamageShare > 0.35 && metrics.killParticipation > 0.7,
      hasHighVision: metrics.visionScore > 30 && metrics.wardsKilled > 3,
      hasPoorVision: metrics.visionScorePerMin < 0.5 && !metrics.isAram,
      isBotLanePoor: teamStats.botKda < 2 && teamStats.botParticipation < 0.5 && !metrics.isAram,
      isJunglePoor: teamStats.jungleKda < 2 && teamStats.jungleParticipation < 0.5 && !metrics.isAram,
      isMidPoor: teamStats.midKda < 2 && teamStats.midParticipation < 0.5 && !metrics.isAram,
      isTopPoor: teamStats.topKda < 2 && teamStats.topParticipation < 0.5 && !metrics.isAram,
      isSupportPoor: teamStats.supportKda < 2 && teamStats.supportParticipation < 0.5 && !metrics.isAram,
      hasHighCS: metrics.csPerMin > 9,
      isLowImpact: metrics.killParticipation < 0.3
    };
  }
  
  module.exports = {
    calculateTeamStats,
    calculateGameMetrics,
    calculatePingCount,
    calculateSpellCasts,
    getPerformanceThresholds
  };