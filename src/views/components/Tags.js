import React, { useContext } from 'react';
import { Badge, Group, Tooltip, useMantineTheme } from '@mantine/core';
import { ParticipantContext } from './MatchCard';

function Tags() {

  const { participant } = useContext(ParticipantContext);
  const theme = useMantineTheme();
  const tagBools = participant.tags;

  const tags = [];

  for (const [key, value] of Object.entries(tagBools)) {
    if (value.isTriggered){
      tags.push(getTag(key, value.isTriggered, value.value));
    }
  }

return (
  <Group gap={4} justify="end">
    {tags.map((tag) => (
      <Tooltip key={tag.text + participant.id} label={tag.description} position="top">
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
  </Group>
);
}

const getTag = (tag, isTriggered, value) => {
  if (!isTriggered) return { text: 'Unknown Tag', color: 'dark', description: 'oopsie' };
  const valueString = value ? value.toString() : '0';
  switch (tag) {
    case 'blind':
      return { text: 'Blind', color: 'red', description: 'Low vision score — place and destroy more wards.' };
    case 'worstOfTheWorst':
      return { text: 'Worst of the Worst', color: 'red', description: 'Congratulations, you did the worst!' };
    case 'tagAlong':
      return { text: 'Tag Along', color: 'red', description: 'Daily reminder to thank your carry' };
    case 'poor':
      return { text: 'Poor', color: 'red', description: 'Low gold compared to lane opponent' };
    case 'coward':
      return { text: 'Coward', color: 'red', description: 'Low kill participation and high KDA in a loss. Go get in there, coward.' };
    case 'atm':
      return { text: 'ATM', color: 'red', description: 'Making the enemy team rich, one death at a time' };
    case 'honoraryCarry':
      return { text: 'Honorary Carry', color: 'red', description: 'Supports support, you uh... do something else' };
    case 'jungleFullOfLife':
      return { text: 'Jungle full of life', color: 'red', description: 'The camps miss you' };
    case 'jungleDiff':
      return { text: 'Jungle Diff (The camps won)', color: 'red', description: 'Imagine dying to neutral monsters' };
    case 'forgotYourButtons':
      return { text: 'Forgot Your Buttons', color: 'red', description: 'Those summoner spells are meant to be used' };
    case 'mapControl0':
      return { text: 'Map Control: 0', color: 'red', description: 'The minimap is the thing in the corner' };
    case 'aimWhereTheyreGoing':
      return { text: 'Aim where they\'re going', color: 'red', description: `Only hit ${valueString} skillshots` };
    case 'allergicToDodging':
      return { text: 'Allergic to Dodging', color: 'red', description: 'Have you tried pressing the right mouse button?' };
    case 'throwsForContent':
      return { text: 'Throws for Content', color: 'red', description: 'How do you lose with that gold lead?' };
    case 'lastHitTutorialNeeded':
      return { text: 'Last Hit Tutorial Needed', color: 'red', description: 'The minions under tower had families' };
    case 'struggling':
      return { text: 'Struggling', color: 'red', description: 'It ain\'t goin\' so well' };
    case 'jackOfAllTrades':
      return { text: 'Jack of All Trades', color: 'gray', description: 'Perfectly average at everything' };
    case 'dragonsHoard':
      return { text: 'Dragon\'s Hoard', color: 'gray', description: `Can't take it with you, friend — ${valueString} unspent gold` };
    case 'perfectlyBalanced':
      return { text: 'Perfectly Balanced', color: 'gray', description: 'As all things should be' };
    case 'iFeelFine':
      return { text: 'I feel fine', color: 'gray', description: `Survived ${valueString} fights with single-digit health` };
    case 'afkFarmer':
      return { text: 'AFK Farmer', color: 'gray', description: 'Nice farm, where were you in the fights?' };
    case 'pve':
      return { text: 'PVE', color: 'gray', description: 'How\'s the weather up there?' };
    case 'paperTank':
      return { text: 'Paper Tank', color: 'gray', description: 'Built tank items but forgot to press buttons' };
    case 'walkingWard':
      return { text: 'Walking Ward', color: 'gray', description: 'At least you provide vision' };
    case 'worksBetterAlone':
      return { text: 'Works better alone', color: 'gray', description: 'Get more solo kills than team kills' };
    case 'spongey':
      return { text: 'Spongey', color: 'gray', description: 'Absorbed 40k+ damage with few deaths' };
    case 'objective':
      return { text: 'Objective', color: 'gray', description: 'Towers > People' };
    case 'keyboardWarrior':
      return { text: 'Keyboard Warrior', color: 'gray', description: `${valueString} pings - We get it.` };
    case 'autoAttackOnly':
      return { text: 'Auto Attack Only', color: 'gray', description: 'Who needs abilities anyway?' };
    case 'buffDeliveryService':
      return { text: 'Buff Delivery Service', color: 'gray', description: 'Took both buffs just to deliver them to the enemy' };
    case 'selfCare':
      return { text: 'Self Care', color: 'gray', description: 'Tanky for yourself, not for your team' };
    case 'decorationEnthusiast':
      return { text: 'Decoration Enthusiast', color: 'gray', description: 'Those control wards sure look pretty' };
    case 'flashGaming':
      return { text: 'Flash Gaming', color: 'gray', description: `The F key is for Fight. ${valueString} multikills after aggressive flashes` };
    case 'monsterTamer':
      return { text: 'Monster Tamer', color: 'gray', description: 'Let Baron and Dragon do the work' };
    case 'blastEm':
      return { text: 'Blast \'em', color: 'gray', description: `Blast cone'd away from opponents ${valueString} times` };
    case 'stopRightThere':
      return { text: 'Stop right there', color: 'gray', description: `Immobilized enemies ${valueString} times` };
    case 'selfless':
      return { text: 'Selfless', color: 'gray', description: 'Died trying to save others' };
    case 'alcoveClub':
      return { text: 'Alcove club ', color: 'gray', description: `Got ${valueString} takedowns in alcoves` };
    case 'minionEater':
      return { text: 'Minion Eater', color: 'gray', description: `Killed 20 minions in 3 seconds ${valueString} times` };
    case 'hideAndSeekChampion':
      return { text: 'Hide and Seek Champion', color: 'gray', description: 'They can\'t kill you if they can\'t find you' };
    case 'shyHerald':
      return { text: 'Shy Herald', color: 'gray', description: 'The herald had performance anxiety' };
    case 'dancePartner':
      return { text: 'Dance Partner', color: 'gray', description: 'Made sure Herald had fun before work' };
    case 'snowball':
      return { text: 'Snowball', color: 'gray', description: 'Once you get ahead, you stay ahead' };
    case 'balancedDiet':
      return { text: 'Balanced Diet', color: 'gray', description: 'Equal parts physical and magical damage' };
    case 'teamPlayer':
      return { text: 'Team Player', color: 'gray', description: 'Happy to help' };
    case 'identityCrisis':
      return { text: 'Identity Crisis', color: 'gray', description: 'Building against type' };
    case 'earlyBird':
      return { text: 'Early Bird', color: 'gray', description: 'Great start, long game' };
    case 'mercenary':
      return { text: 'Mercenary', color: 'gray', description: 'Your lane is wherever you\'re needed' };
    case 'surviveAtAllCosts':
      return { text: 'Survive at all costs', color: 'gray', description: 'Staying alive > Being useful' };
    case 'scout':
      return { text: 'Scout', color: 'green', description: 'High vision score, wards cleared' };
    case 'youreWelcome':
      return { text: 'You\'re welcome', color: 'green', description: 'High KDA and kill participation in a win, with teammates who lagged behind.' };
    case 'midIsMyNewBestFriend':
      return { text: 'Mid is My New Best Friend', color: 'green', description: 'High kill participation and KDA as a support, with the bot lane doing poorly.' };
    case 'imTheCarryNow':
      return { text: 'I\'m the Carry Now', color: 'green', description: 'Dealt more damage as a support than the bot lane, in a win.' };
    case 'arentYouForgettingSomeone':
      return { text: 'Aren\'t you forgetting someone?', color: 'gray', description: 'Dealt more damage as a support than the bot lane, in a loss. Play a different role, maybe?' };
    case 'stomper':
      return { text: 'Stomper', color: 'green', description: 'High gold lead against lane opponent' };
    case 'adequateJungler':
      return { text: 'Adequate Jungler', color: 'green', description: `Secured ${valueString} major objectives` };
    case 'counterJungler':
      return { text: 'Counter Jungler', color: 'green', description: 'Dominated enemy jungle camps' };
    case 'betterTogether':
      return { text: 'Better Together', color: 'green', description: 'Team good together, team strong together.' };
    case 'hatesArchitecture':
      return { text: 'Hates Architecture', color: 'green', description: `Destroyed ${valueString} turrets` };
    case 'niceDiveIdiot':
      return { text: 'Nice dive, idiot', color: 'green', description: `Killed ${valueString} over-eager enemies` };
    case 'coolTurret':
      return { text: 'Cool Turret I guess', color: 'green', description: `Killed enemies under their own turret ${valueString} times` };
    case 'bountyHunter':
      return { text: 'Bounty Hunter', color: 'green', description: `Cashed in on ${valueString} bounty gold` };
    case 'sneakySneaky':
      return { text: 'Sneaky Sneaky', color: 'green', description: `Stole ${valueString} epic monsters` };
    case 'darkness':
      return { text: 'Darkness', color: 'green', description: 'The enemy team is playing with their monitors off' };
    case 'laneKingdom':
      return { text: 'Lane Kingdom', color: 'green', description: `Huge CS lead of ${valueString} over lane opponent` };
    case 'flawlessVictory':
      return { text: 'Flawless Victory', color: 'yellow', description: 'Perfect game with high impact' };
    case 'hesGotANoNoGoing':
      return { text: 'He\'s got a no no going', color: 'yellow', description: 'No deaths to champions in ARAM' };
    case 'pentakill':
      return { text: 'PENTAKILL', color: 'yellow', description: 'Achieved the pinnacle of League' };
    case 'quadraMaster':
      return { text: 'Quadra Master', color: 'green', description: 'Secured a quadra kill' };
    case 'dontEverSayItsOver':
      return { text: 'Don\'t ever say it\'s over if I\'m breathin\'', color: 'yellow', description: `Turned a ${valueString} kill deficit into victory` };
    case 'legendary':
      return { text: 'LEGENDARY', color: 'yellow', description: 'Multiple legendary kill streaks' };
    case 'visionDomination':
      return { text: 'Vision Domination', color: 'yellow', description: 'Complete vision control over the game' };
    case 'simplyTheBest':
      return { text: 'Simply the best', color: 'yellow', description: 'Single-handedly took over the game' };
    case 'objectiveSupremacy':
      return { text: 'Objective Supremacy', color: 'yellow', description: 'Controlled every major objective on the map' };
    case 'csGod':
      return { text: 'CS God', color: 'yellow', description: '9+ CS per minute' };
    case 'damageDealer':
      return { text: 'Damage Dealer', color: 'yellow', description: '50k+ damage to champions' };
    case 'carryingIsKindOfSupporting':
      return { text: 'Carrying is a kind of supporting, yes?', color: 'yellow', description: 'Supporting a team of feeders to victory (Win a game as support with poor performing teammates)' };
    case 'justDoinMyJob':
      return { text: 'Just doin\' my job', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as bot with poor performing teammates)' };
    case 'kingOfDaJungle':
      return { text: 'King of da Jungle', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as jungle with poor performing teammates)' };
    case 'notSoMiddling':
      return { text: 'Not so middling', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as mid with poor performing teammates)' };
    case 'itsCalledTopLaneForAReason':
      return { text: 'It\'s called top lane for a reason', color: 'yellow', description: 'Carrying a team of feeders to victory (Win a game as top with poor performing teammates)' };
    default:
      return { text: 'Unknown Tag', color: 'dark', description: `couldn't find ${tag} definition, oopsie` };
  }
}



export default Tags;

