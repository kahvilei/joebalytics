import React, { useContext } from 'react';
import { Badge, Group, Tooltip, useMantineTheme } from '@mantine/core';
import { MatchContext } from './MatchCard';
import { ParticipantContext } from './MatchCard';
import { useGameData } from '../../context/DataContext';


const formatMinutes = (seconds) => (seconds / 60).toFixed(1);

function Tags() {
    const { participant } = useContext(ParticipantContext);
    const { matchMode, match, gameDuration } = useContext(MatchContext);
    const { getSummonerSpellName, champions } = useGameData();
    const theme = useMantineTheme();
  
    // ========= GAME STATE =========
    const isAram = matchMode.includes('ARAM');
    const gameRemake = gameDuration < 300;
    const didWin = participant.win;
    const gameLength = gameDuration / 60; // in minutes
  
    // ========= ROLE CHECKS =========
    const isSupport = participant.teamPosition === 'UTILITY';
    const isJungle = participant.teamPosition === 'JUNGLE';
    const isTop = participant.teamPosition === 'TOP';
    const isCarryRole = !isSupport && !isJungle;
    const isMid = participant.teamPosition === 'MIDDLE';
    const isBot = participant.teamPosition === 'BOTTOM';
  
    // ========= TEAM DATA =========
    const team = match.info.participants.filter(p => p.teamId === participant.teamId);
    const opponents = match.info.participants.filter(p => p.teamId !== participant.teamId);
    const laneOpponent = opponents.find(p => p.teamPosition === participant.teamPosition) || opponents[0];
    
    // ========= PERFORMANCE METRICS =========
    const kda = participant.challenges.kda;
    const killParticipation = participant.challenges.killParticipation;
    const visionScore = participant.visionScore;
    const visionScorePerMin = participant.challenges.visionScorePerMinute;
    const csPerMin = participant.totalMinionsKilled / gameLength;
    const damagePerMin = participant.challenges.damagePerMinute;
    const ccPerMin = participant.totalTimeCCDealt / gameLength;
    const teamDamageShare = participant.challenges.teamDamagePercentage;
    const skillshotsDodged = participant.challenges.skillshotsDodged;
    const skillshotsHit = participant.challenges.skillshotsHit;
    
    // ========= ECONOMY METRICS =========
    const goldDiffWithOpponent = participant.goldEarned - laneOpponent.goldEarned;
    const unspentGold = participant.goldEarned - participant.goldSpent;
    const goldPerMin = participant.challenges.goldPerMinute;
    
    // ========= COMBAT STATS =========
    const soloKills = participant.challenges.soloKills;
    const deathCount = participant.deaths;
    const killCount = participant.kills;
    const assistCount = participant.assists;
    const multiKills = participant.challenges.multikills;
    const killDeficit = participant.challenges.maxKillDeficit;
    const pentaKills = participant.pentaKills;
    const quadraKills = participant.quadraKills;
    const totalDamageDealt = participant.totalDamageDealtToChampions;
    const damageTaken = participant.totalDamageTaken;
    const damageMitigated = participant.damageSelfMitigated;
    const physicalDamage = participant.physicalDamageDealtToChampions;
    const magicDamage = participant.magicDamageDealtToChampions;
    const healingDone = participant.totalHealsOnTeammates;
    
    // ========= VISION METRICS =========
    const wardsPlaced = participant.wardsPlaced;
    const wardsKilled = participant.wardsKilled;
    const visionAdvantage = participant.challenges.visionScoreAdvantageLaneOpponent;
    const controlWards = participant.challenges.controlWardsPlaced;
    
    // ========= OBJECTIVE CONTROL =========
    const dragonKills = participant.challenges.dragonTakedowns;
    const baronKills = participant.challenges.baronTakedowns;
    const heraldKills = participant.challenges.riftHeraldTakedowns;
    const turretKills = participant.turretTakedowns;
    const objectiveKills = dragonKills + baronKills + heraldKills;
    const objectivesStolen = participant.challenges.epicMonsterSteals;
    const objectivesStolenAssists = participant.challenges.epicMonsterStealAssists;
    const damageToObjectives = participant.damageDealtToObjectives;
  
    // ========= EARLY GAME METRICS =========
    const earlyKills = participant.challenges.takedownsFirstXMinutes;
    const earlyCSAdvantage = participant.challenges.maxCsAdvantageOnLaneOpponent;
    const earlyVisionAdvantage = participant.challenges.visionScoreAdvantageLaneOpponent;
    const turretPlates = participant.challenges.turretPlatesTaken;
    const killsUnderOwnTurret = participant.challenges.killsUnderOwnTurret;
    const killsNearEnemyTurret = participant.challenges.killsNearEnemyTurret;
    const bountyGold = participant.challenges.bountyGold;
    const firstBlood = participant.firstBloodKill;

    // ========= CHAMPION SPECIFIC METRICS =========
    const champDetails = champions[participant.championName];
    const champRole = champDetails.tags[0];
    const champDifficulty = champDetails.info.difficulty;
    const champAttack = champDetails.info.attack;
    const champDefense = champDetails.info.defense;
    const champMagic = champDetails.info.magic;
    const champUtility = champDetails.info.utility;
    const champTags = champDetails.tags;
    const champStats = champDetails.stats;
    const champPassive = champDetails.passive;
    const hasSkillShot = participant.challenges.skillshotsHit > 0;

  
    // ========= TEAM AVERAGES =========
    const teamStats = team.reduce((acc, p) => {
      if (p.puuid !== participant.puuid) {
        acc.kills += p.kills;
        acc.deaths += p.deaths;
        acc.assists += p.assists;
        acc.killParticipation += p.challenges.killParticipation;
        acc.participants++;
        if (p.teamPosition === 'BOTTOM') {
          acc.botDamage = p.totalDamageDealtToChampions;
          acc.botKda = p.challenges.kda;
          acc.botParticipation = p.challenges.killParticipation;
        }
        if (p.teamPosition === 'JUNGLE') {
          acc.jungleDamage = p.totalDamageDealtToChampions;
          acc.jungleKda = p.challenges.kda;
          acc.jungleParticipation = p.challenges.killParticipation;
        }
        if (p.teamPosition === 'MIDDLE') {
          acc.midDamage = p.totalDamageDealtToChampions;
          acc.midKda = p.challenges.kda;
          acc.midParticipation = p.challenges.killParticipation;
        }
        if (p.teamPosition === 'TOP') {
          acc.topDamage = p.totalDamageDealtToChampions;
          acc.topKda = p.challenges.kda;
          acc.topParticipation = p.challenges.killParticipation;
        }
        if (p.teamPosition === 'UTILITY') {
          acc.supportDamage = p.totalDamageDealtToChampions;
          acc.supportKda = p.challenges.kda;
          acc.supportParticipation = p.challenges.killParticipation;
        }
      }
      return acc;
    }, { 
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
    });
  
    const avgKda = (teamStats.kills + teamStats.assists) / Math.max(1, teamStats.deaths);
    const avgKillParticipation = teamStats.killParticipation / Math.max(1, teamStats.participants);
    const teamAvgGold = team.reduce((sum, p) => sum + p.goldEarned, 0) / team.length;
  
    // ========= PERFORMANCE THRESHOLDS =========
    const isHighPerformer = kda > avgKda + 2 && killParticipation > avgKillParticipation + 0.2;
    const isLowPerformer = kda < avgKda - 2 && killParticipation < avgKillParticipation - 0.2;
    const isPerfectGame = participant.challenges.perfectGame;
    const isLegendary = participant.challenges.legendaryCount > 2;
    const isFeeding = deathCount > 8 && participant.goldEarned < teamAvgGold * 0.7;
    const isCarrying = teamDamageShare > 0.35 && killParticipation > 0.7;
    const hasHighVision = visionScore > 30 && wardsKilled > 3;
    const hasPoorVision = visionScorePerMin < 0.5 && !isAram;
    const isSplitPushing = turretKills > objectiveKills * 2;
    const isBotLanePoor = teamStats.botKda < 2 && teamStats.botParticipation < 0.5;
    const hasHighCS = csPerMin > 9;
    const isLowImpact = killParticipation < 0.3;

    const pingSpam = participant.allInPings + participant.assistMePings + participant.baitPings + 
                participant.basicPings + participant.dangerPings + participant.enemyMissingPings + 
                participant.enemyVisionPings + participant.getBackPings + participant.needVisionPings + 
                participant.onMyWayPings;

    const spellCasts = participant.spell1Casts + participant.spell2Casts + 
                  participant.spell3Casts + participant.spell4Casts;

  
    const tags = [];
  
    // =====================
    // RED TAGS - Performance Issues
    // =====================
    
    // Vision control
    if (hasPoorVision && !gameRemake) {
      tags.push({ text: 'Blind', color: 'red', description: 'Low vision score — place and destroy more wards.' });
    }
  
    // Poor performance
    if (isLowPerformer && !didWin && !gameRemake) {
      tags.push({ text: 'Worst of the Worst', color: 'red', description: 'Congratulations, you did the worst!' });
    }
  
    // Not participating
    if (kda <= 2 && isLowImpact && didWin && !gameRemake) {
      tags.push({ text: 'Tag Along', color: 'red', description: 'Daily reminder to thank your carry' });
    }
  
    // Poor lane performance
    if (goldDiffWithOpponent < -3000 && !gameRemake && !isAram) {
      tags.push({ text: 'Poor', color: 'red', description: 'Low gold compared to lane opponent' });
    }
  
    // Playing too safe
    if (isLowImpact && kda > 2 && !didWin && !gameRemake) {
      tags.push({ text: 'Coward', color: 'red', description: 'Low kill participation and high KDA in a loss. Go get in there, coward.' });
    }
  
    // Feeding
    if (isFeeding) {
      tags.push({ text: 'ATM', color: 'red', description: 'Making the enemy team rich, one death at a time' });
    }
  
    // Bad support performance
    if (isSupport && visionScorePerMin < 1 && !gameRemake) {
      tags.push({ text: 'Honorary Carry', color: 'red', description: 'Supports support, you uh... do something else' });
    }
  
    // Bad jungler performance
    if (isJungle && participant.neutralMinionsKille < 50 && !didWin && !gameRemake) {
      tags.push({ text: 'Jungle full of life', color: 'red', description: 'The camps miss you' });
    }
  
    // Died to jungle
    if (participant.challenges.deathsByEnemyChamps < deathCount && isJungle && !gameRemake) {
      tags.push({ text: 'Jungle Diff (The camps won)', color: 'red', description: 'Imagine dying to neutral monsters' });
    }
  
    // No summoner spell usage
    if (participant.challenges.effectiveHealAndShielding < 100 && 
        ['Heal', 'Barrier', 'Shield'].includes(getSummonerSpellName(participant.summoner1Id) || getSummonerSpellName(participant.summoner2Id))) {
      tags.push({ text: 'Forgot Your Buttons', color: 'red', description: 'Those summoner spells are meant to be used' });
    }
  
    // Poor map awareness
    if (dragonKills + baronKills + turretPlates === 0 && visionScore < 10 && !isAram && !gameRemake) {
      tags.push({ text: 'Map Control: 0', color: 'red', description: 'The minimap is the thing in the corner' });
    }
  
    // Bad mechanics
    if (skillshotsHit <= 2 && hasSkillShot && !gameRemake) {
      tags.push({ text: 'Aim where they\'re going', color: 'red', description: `Only hit ${skillshotsHit} skillshots` });
    }
  
    // Poor dodging
    if (skillshotsDodged < deathCount * 0.5 && deathCount > 5) {
      tags.push({ text: 'Allergic to Dodging', color: 'red', description: 'Have you tried pressing the right mouse button?' });
    }
  
    // Throws
    if (goldDiffWithOpponent > 4000 && !didWin) {
      tags.push({ text: 'Throws for Content', color: 'red', description: 'How do you lose with that gold lead?' });
    }
  
    // Poor early CS
    if (participant.challenges.laneMinionsFirst10Minutes < 30 && isCarryRole) {
      tags.push({ text: 'Last Hit Tutorial Needed', color: 'red', description: 'The minions under tower had families' });
    }
  
    // Bad mechanics overall
    if (kda < 1 && isLowImpact && !isAram && !gameRemake) {
      tags.push({ text: 'Struggling', color: 'red', description: 'It ain\'t goin\' so well' });
    }
  
    // =====================
    // GRAY TAGS - Neutral/Interesting Patterns
    // =====================
  
    // Average performance
    if (kda > 1.5 && kda < 2.5 && killParticipation > 0.4 && killParticipation < 0.6 && !gameRemake) {
      tags.push({ text: 'Jack of All Trades', color: 'gray', description: 'Perfectly average at everything' });
    }
  
    // Unspent gold
    if (unspentGold > 3000) {
      tags.push({ text: 'Dragon\'s Hoard', color: 'gray', description: `Can't take it with you, friend — ${unspentGold} unspent gold` });
    }
  
    // Balanced stats
    if (killCount === deathCount && killCount === assistCount && killCount > 3) {
      tags.push({ text: 'Perfectly Balanced', color: 'gray', description: 'As all things should be' });
    }
  
    // Close fights
    if (participant.challenges.survivedSingleDigitHpCount > 1) {
      tags.push({ text: 'I feel fine', color: 'gray', description: `Survived ${participant.challenges.survivedSingleDigitHpCount} fights with single-digit health` });
    }
  
    // Farming focus
    if (participant.totalMinionsKilled > 200 && isLowImpact) {
      tags.push({ text: 'AFK Farmer', color: 'gray', description: 'Nice farm, where were you in the fights?' });
    }
  
    // Split push focus
    if (isTop && totalDamageDealt < damageToObjectives * 0.7 && killCount < 3 && deathCount < 3) {
      tags.push({ text: 'PVE', color: 'gray', description: 'How\'s the weather up there?' });
    }
  
    // Tank issues
    if (damageTaken > 40000 && damageMitigated < damageTaken * 0.3) {
      tags.push({ text: 'Paper Tank', color: 'gray', description: 'Built tank items but forgot to press buttons' });
    }
  
    // Ward focused
    if (!isSupport && wardsPlaced > totalDamageDealt / 1000) {
      tags.push({ text: 'Walking Ward', color: 'gray', description: 'At least you provide vision' });
    }
  
    // Solo focus
    if (soloKills > killCount - soloKills && !gameRemake) {
      tags.push({ text: 'Works better alone', color: 'gray', description: 'Get more solo kills than team kills' });
    }
  
    // Tank performance
    if (damageTaken > 40000 && deathCount < 6) {
      tags.push({ text: 'Spongey', color: 'gray', description: 'Absorbed 40k+ damage with few deaths' });
    }
  
    // Objective focus
    if (damageToObjectives > totalDamageDealt * 1.5) {
      tags.push({ text: 'Objective', color: 'gray', description: 'Towers > People' });
    }

    // is jungler and pings on my way more than 20 times
    if (participant.onMyWayPings > 20 && isJungle) {
        tags.push({ text: 'Yeah, yeah. omw', color: 'gray', description: `Pinged "on my way" ${participant.onMyWayPings} times` });
    }

  // Ping spammer
if (pingSpam > 100) {
    tags.push({ text: 'Keyboard Warrior', color: 'gray', description: `${pingSpam} pings - We get it.` });
  }
  
  // Never used abilities
  if (spellCasts < gameDuration/60 && !gameRemake) {
    tags.push({ text: 'Auto Attack Only', color: 'gray', description: 'Who needs abilities anyway?' });
  }
  
  // Took both buffs early but died
  if (participant.challenges.initialBuffCount > 1 && participant.challenges.deathsByEnemyChamps > 0 && gameDuration < 300) {
    tags.push({ text: 'Buff Delivery Service', color: 'gray', description: 'Took both buffs just to deliver them to the enemy' });
  }
  
  // Got extremely tanky but never helped team
  if (participant.damageSelfMitigated > 100000 && participant.totalDamageShieldedOnTeammates < 1000) {
    tags.push({ text: 'Self Care', color: 'gray', description: 'Tanky for yourself, not for your team' });
  }
  
  // Bought lots of control wards but never used them effectively
  if (participant.challenges.controlWardsPlaced > 10 && participant.visionScore < participant.challenges.controlWardsPlaced * 2) {
    tags.push({ text: 'Decoration Enthusiast', color: 'gray', description: 'Those control wards sure look pretty' });
  }
  
  // Only used flash aggressively
  if (participant.challenges.multikillsAfterAggressiveFlash > 0 && deathCount > 8) {
    tags.push({ text: 'Flash Gaming', color: 'gray', description: `The F key is for Fight. ${participant.challenges.multikillsAfterAggressiveFlash} multikills after aggressive flashes` });
  }
  
  // Got carried by epic monsters
  if (participant.challenges.killsWithHelpFromEpicMonster > 3) {
    tags.push({ text: 'Monster Tamer', color: 'gray', description: 'Let Baron and Dragon do the work' });
  }
  
  // Used blast cone a lot
  if (participant.challenges.blastConeOppositeOpponentCount > 1) {
    tags.push({ text: 'Blast \'em', color: 'gray', description: `Blast cone'd away from opponents ${participant.challenges.blastConeOppositeOpponentCount} times` });
  }
  
  // Focused on immobilizing enemies
  if (participant.challenges.enemyChampionImmobilizations > 30) {
    tags.push({ text: 'Stop right there', color: 'gray', description: `Immobilized enemies ${participant.challenges.enemyChampionImmobilizations} times` });
  }
  
  // Kept trying to save dying allies
  if (participant.challenges.saveAllyFromDeath > 5 && participant.deaths > 10) {
    tags.push({ text: 'Selfless', color: 'gray', description: 'Died trying to save others' });
  }
  
  // Always fighting in alcoves
  if (participant.challenges.takedownsInAlcove > 3) {
    tags.push({ text: 'Alcove club ', color: 'gray', description: `Got ${participant.challenges.takedownsInAlcove} takedowns in alcoves` });
  }
  
  // Got carried by minions
  if (participant.challenges.twentyMinionsIn3SecondsCount > 2) {
    tags.push({ text: 'Minion Eater', color: 'gray', description: `Killed 20 minions in 3 seconds ${participant.challenges.twentyMinionsIn3SecondsCount} times` });
  }
  
  // Stayed hidden a lot
  if (participant.challenges.unseenRecalls > 5) {
    tags.push({ text: 'Hide and Seek Champion', color: 'gray', description: 'They can\'t kill you if they can\'t find you' });
  }
  
  // Used herald but it died instantly
  if (participant.challenges.turretsTakenWithRiftHerald === 0 && participant.challenges.riftHeraldTakedowns > 1) {
    tags.push({ text: 'Shy Herald', color: 'gray', description: 'The herald had performance anxiety' });
  }
  
  // Danced with herald
  if (participant.challenges.dancedWithRiftHerald > 0) {
    tags.push({ text: 'Dance Partner', color: 'gray', description: 'Made sure Herald had fun before work' });
  }

  // Snowball performance
  if (participant.challenges.takedownsAfterGainingLevelAdvantage > killCount * 0.5 && killCount > 3 && didWin) {
    tags.push({ text: 'Snowball', color: 'gray', description: 'Once you get ahead, you stay ahead' });
  }

  // Damage balance
  if (Math.abs(physicalDamage - magicDamage) < 1000 && totalDamageDealt > 10000) {
    tags.push({ text: 'Balanced Diet', color: 'gray', description: 'Equal parts physical and magical damage' });
  }

  // Assist focused
  if (assistCount > killCount * 3 && assistCount > 10) {
    tags.push({ text: 'Team Player', color: 'gray', description: 'Happy to help' });
  }

  // Build path
  if ((physicalDamage > magicDamage && ['Ahri', 'Viktor', 'Syndra'].includes(participant.championName)) ||
      (magicDamage > physicalDamage && ['Zed', 'Talon', 'Yasuo'].includes(participant.championName))) {
    tags.push({ text: 'Identity Crisis', color: 'gray', description: 'Building against type' });
  }

  // Early game focus
  if (earlyKills > 5 && gameDuration > 2400) {
    tags.push({ text: 'Early Bird', color: 'gray', description: 'Great start, long game' });
  }

  // Roaming
  if (participant.challenges.killsOnOtherLanesEarlyJungleAsLaner > 0 && killParticipation > 0.6 && !isAram) {
    tags.push({ text: 'Mercenary', color: 'gray', description: 'Your lane is wherever you\'re needed' });
  }

  // Low risk play
  if (deathCount < 3 && killParticipation < 0.4 && gameDuration > 1500) {
    tags.push({ text: 'Survive at all costs', color: 'gray', description: 'Staying alive > Being useful' });
  }

  // =====================
  // GREEN TAGS - Good Performance
  // =====================

  // Good vision control
  if (hasHighVision) {
    tags.push({ text: 'Scout', color: 'green', description: 'High vision score, wards cleared' });
  }

  // Strong carry performance
  if (isHighPerformer && didWin) {
    tags.push({ text: 'You\'re welcome', color: 'green', description: 'High KDA and kill participation in a win, with teammates who lagged behind.' });
  }

  // Support performance
  if (isSupport && kda > avgKda + 1 && killParticipation > avgKillParticipation && isBotLanePoor && didWin) {
    tags.push({ text: 'Mid is My New Best Friend', color: 'green', description: 'High kill participation and KDA as a support, with the bot lane doing poorly.' });
  }

  // Support carry
  if (isSupport && totalDamageDealt > teamStats.botDamage) {
    if (didWin) {
      tags.push({ text: 'I\'m the Carry Now', color: 'green', description: 'Dealt more damage as a support than the bot lane, in a win.' });
    } else {
      tags.push({ text: 'Aren\'t you forgetting someone?', color: 'gray', description: 'Dealt more damage as a support than the bot lane, in a loss. Play a different role, maybe?' });
    }
  }

  // Lane dominance
  if (goldDiffWithOpponent > 2000 && !gameRemake && !isAram) {
    tags.push({ text: 'Stomper', color: 'green', description: 'High gold lead against lane opponent' });
  }

  // Objective control
  if (isJungle && objectiveKills > 2) {
    tags.push({ text: 'Adequate Jungler', color: 'green', description: `Secured ${objectiveKills} major objectives` });
  }

  // Counter jungling
  if (participant.challenges.enemyJungleMonsterKills > 19) {
    tags.push({ text: 'Counter Jungler', color: 'green', description: 'Dominated enemy jungle camps' });
  }

  // Team fighting
  if ((killCount - soloKills)/killCount >= 0.7 && kda > 4 && killParticipation > 0.7 && !gameRemake && !isAram) {
    tags.push({ text: 'Better Together', color: 'green', description: 'Team good together, team strong together.' });
  }

  // Tower takedowns
  if (turretKills > 4) {
    tags.push({ text: 'Hates Architecture', color: 'green', description: `Destroyed ${turretKills} turrets` });
  }

  // Defensive plays
  if (killsUnderOwnTurret >= 2 && !isAram) {
    tags.push({ text: 'Nice dive, idiot', color: 'green', description: `Killed ${killsUnderOwnTurret} over-eager enemies` });
  }

  // Aggressive plays
  if (killsNearEnemyTurret > 2 && !isAram) {
    tags.push({ text: 'Cool Turret I guess', color: 'green', description: `Killed enemies under their own turret ${killsNearEnemyTurret} times` });
  }

  // Bounty collection
  if (bountyGold > 1000) {
    tags.push({ text: 'Bounty Hunter', color: 'green', description: `Cashed in on ${bountyGold} bounty gold` });
  }

  // Objective steals
  if (objectivesStolen + objectivesStolenAssists > 1) {
    tags.push({ text: 'Sneaky Sneaky', color: 'green', description: `Stole ${objectivesStolen + objectivesStolenAssists} epic monsters` });
  }

  // Vision control
  if (controlWards > 3 && wardsKilled > 5) {
    tags.push({ text: 'Darkness', color: 'green', description: 'The enemy team is playing with their monitors off' });
  }

  // CS dominance
  if (earlyCSAdvantage > 30 && didWin && !isAram && !isJungle) {
    tags.push({ text: 'Lane Kingdom', color: 'green', description: `Huge CS lead of ${earlyCSAdvantage} over lane opponent` });
  }

  // =====================
  // YELLOW TAGS - Exceptional Performance
  // =====================

  // Perfect performance
  if (isPerfectGame && killParticipation > 0.7 && !gameRemake && !isAram) {
    tags.push({ text: 'Flawless Victory', color: 'yellow', description: 'Perfect game with high impact' });
  }

  //It's a NO NO (ARAM no deaths)
    if (isAram && deathCount <= 0) {
        tags.push({ text: 'He\'s got a no no going', color: 'yellow', description: 'No deaths to champions in ARAM' });
    }

  // Multi-kills
  if (pentaKills > 0) {
    tags.push({ text: 'PENTAKILL', color: 'yellow', description: 'Achieved the pinnacle of League' });
  } else if (quadraKills > 0) {
    tags.push({ text: 'Quadra Master', color: 'green', description: 'Secured a quadra kill' });
  }

  // Big comeback
  if (killDeficit > 10 && didWin && killParticipation > 0.7 && kda > 3) {
    tags.push({ text: 'Don\'t ever say it\'s over if I\'m breathin\'', color: 'yellow', description: `Turned a ${killDeficit} kill deficit into victory` });
  }

  // Multiple streaks
  if (isLegendary) {
    tags.push({ text: 'LEGENDARY', color: 'yellow', description: 'Multiple legendary kill streaks' });
  }

  // Vision dominance
  if (visionScorePerMin > 2 && wardsPlaced > 20 && visionAdvantage > 1.5) {
    tags.push({ text: 'Vision Domination', color: 'yellow', description: 'Complete vision control over the game' });
  }

  // Hard carry
  if (soloKills > 5 && killParticipation > 0.7 && damagePerMin > 1000) {
    tags.push({ text: 'Simply the best', color: 'yellow', description: 'Single-handedly took over the game' });
  }

  // Perfect objective control
  if (dragonKills > 3 && baronKills > 1 && heraldKills > 1 && !isAram) {
    tags.push({ text: 'Objective Supremacy', color: 'yellow', description: 'Controlled every major objective on the map' });
  }

  // CS perfection
  if (hasHighCS && !isAram) {
    tags.push({ text: 'CS God', color: 'yellow', description: '9+ CS per minute' });
  }

  // High damage
  if (totalDamageDealt > 50000) {
    tags.push({ text: 'Damage Dealer', color: 'yellow', description: '50k+ damage to champions' });
  }

  // game where player was support and every other teammate was bad, in a win
    if (isSupport && teamStats.botKda < 2 && teamStats.jungleKda < 2 && teamStats.midKda < 2 && teamStats.topKda < 2 && didWin && !gameRemake) {
        tags.push({ text: 'Carrying is a kind of supporting, yes?', color: 'yellow', description: 'Supporting a team of feeders to victory (Win a game as support with poor performing teammates)' });
    }

  // game where player was bot and every other teammate was bad, in a win
  if (isBot && isHighPerformer && teamStats.supportKdaKda < 2 && teamStats.jungleKda < 2 && teamStats.midKda < 2 && teamStats.topKda < 2 && didWin && !gameRemake) {
    tags.push({ text: 'Just doin\' my job', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as bot with poor performing teammates)' });
  }

    // game where player was jungle and every other teammate was bad, in a win
    if (isJungle && isHighPerformer && teamStats.botKda < 2 && teamStats.supportKda < 2 && teamStats.midKda < 2 && teamStats.topKda < 2 && didWin && !gameRemake) {
        tags.push({ text: 'King of da Jungle', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as jungle with poor performing teammates)' });
    }

   // game where player was mid and every other teammate was bad, in a win
    if (isMid && isHighPerformer && teamStats.botKda < 2 && teamStats.jungleKda < 2 && teamStats.supportKda < 2 && teamStats.topKda < 2 && didWin && !gameRemake) {
     tags.push({ text: 'Not so middling', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as mid with poor performing teammates)' });
    }

    // game where player was top and every other teammate was bad, in a win
    if (isTop && isHighPerformer && teamStats.botKda < 2 && teamStats.jungleKda < 2 && teamStats.midKda < 2 && teamStats.supportKda < 2 && didWin && !gameRemake) {
        tags.push({ text: 'It\s called top lane for a reason', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as top with poor performing teammates)' });
    }

  return (
    <Group gap={4} justify="end">
      {tags.map(tag => (
        <Tooltip key={tag.text} label={tag.description} position="top">
          {tag.color === 'yellow' ? (
            <Badge
              c={'rgb(156, 88, 16)'}
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 30%, #FFD700 50%, #FDB931 70%, #FFD700 100%)',
                boxShadow: '0 2px 4px rgba(253, 185, 49, 0.3)',
                border: '1px solid #FDB931',
                animation: 'shine 2s infinite linear'
              }}
              variant="filled"
            >
              {tag.text}
            </Badge>
          ) : (
            <Badge c={tag.color} color={theme.colors.dark[8]} variant="filled">
              {tag.text}
            </Badge>
          )}
        </Tooltip>
      ))}

      <style jsx global>{`
        @keyframes shine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </Group>
  );
}


export default Tags;