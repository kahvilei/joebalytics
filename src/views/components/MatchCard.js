import React, { useContext } from "react";
import { useGameData } from "../../context/DataContext";
import { IconCoin, IconEye, IconFlag, IconFlagFilled, IconInnerShadowBottomLeftFilled, IconSwords } from "@tabler/icons-react";
import { Card, Image, Group, Text, Container, Grid, Tooltip, Stack, Paper, BackgroundImage, Badge, useMantineTheme, Anchor } from '@mantine/core';
import Tags from "./Tags";
import { Link } from "react-router-dom";

export const MatchContext = React.createContext();
export const ParticipantContext = React.createContext();

const MatchCard = (props) => {
  const {
    getQueueName,
    getRegionName,
  } = useGameData();
  const match = props.match;
  const region = getRegionName(match.info.platformId);
  const matchMode = getQueueName(match.info.queueId).replace(/games$/, '');
  const gameDuration = match.info.gameDuration;
  const focusedSummoners = props.focusedSummoners;
  const date = new Date(match.info.gameCreation);

  const participants = match.info.participants;
  const focusedParticipants = participants.filter(participant => focusedSummoners.includes(participant.puuid));
  const matchModeColor = matchMode.includes("ARAM") ? 'blue' : matchMode.includes("Ranked") ? 'yellow' : 'green';

  if (!matchMode.includes("ARAM") && !matchMode.includes("Ranked") && !matchMode.includes("Draft")) {
    console.log(matchMode);
    return null;
  }

  return (
    <MatchContext.Provider value={{ match, region, matchMode, gameDuration, focusedParticipants }}>
      <Card padding="md" w={'100%'}>
        <Stack gap="xs">
        <Group align="center" justify="space-between">
          <Badge color={matchModeColor} variant="filled">{matchMode}</Badge>
          <Paper radius="md" >
            <Group gap="xs">
              <Text c={'dimmed'} size="xs">{date.toLocaleString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: "2-digit", minute: "2-digit" })}</Text>
              <Text c={'dimmed'} size="xs">{(gameDuration / 60).toFixed(0)}m</Text>
            </Group>
          </Paper>
        </Group>
        <Grid align="center" justify="space-between" >
          <Grid.Col span={8}>
            <FocusedParticipantList />
          </Grid.Col>
          <Grid.Col span={4}>
            <MatchSummaryTeams />
          </Grid.Col>
        </Grid>
        </Stack>
      </Card>
    </MatchContext.Provider>
  );
};

export default MatchCard;

function MatchSummaryTeams() {
  const { match } = useContext(MatchContext);
  const { getChampIcon } = useGameData();


  const team100 = match.info.participants.filter(participant => participant.teamId === 100);
  const team200 = match.info.participants.filter(participant => participant.teamId === 200);


  const playerMap = (team, side) => team.map(participant => (
    <Group key={participant.summonerName} justify={side} style={{ flexDirection: `row${side === 'end' ? '-reverse' : ''}` }} wrap="nowrap">
      <Image src={getChampIcon(participant.championId)} alt={participant.summonerName} w='md' h='md' radius={100} bd={'1px solid yellow'} />
      <Text c="dimmed" size="sm">
        {participant.riotIdGameName && <Anchor c="dimmed" target="_blank" href={`https://mobalytics.gg/lol/profile/na/${participant.riotIdGameName}-${participant.riotIdTagline}`}>{participant.riotIdGameName}</Anchor>}
        {!participant.riotIdGameName && (participant.summonerName || 'Unknown')}
      </Text>
    </Group>
  ));

  const team100Win = team100[0].win;
  const team200Win = team200[0].win;

    //check if either team surrendered by checking the gameEndedInSurrender and gameEndedInEarlySurrender fields on one player from each team
    let team100Surrendered = false;
    let team200Surrendered = false;
    let team100EarlySurrendered = false;
    let team200EarlySurrendered = false;
    if (match.info.participants[0].gameEndedInSurrender) {
      team100Win ? team200Surrendered = true : team100Surrendered = true;
    }
    if (match.info.participants[0].gameEndedInEarlySurrender) {
      team100Win ? team200EarlySurrendered = true : team100EarlySurrendered = true;
    }
  

  const team100Kills = team100.reduce((total, participant) => total + participant.kills, 0);
  const team200Kills = team200.reduce((total, participant) => total + participant.kills, 0);

  return (
    <Stack gap={2}>
      <Group gap={'xs'} justify="stretch" wrap="nowrap">
        <Stack w={'50%'} gap={0}>
          <Text size={'md'} ta={'right'} c={team100Win ? 'green' : 'red'}> {team100Surrendered ? <IconFlagFilled size={12} style={{transform: "scaleX(-1)"}}/> : team100EarlySurrendered ? <IconFlag size={12}/> : ''} {team100Kills}</Text>
          {playerMap(team100, 'end')}
          </Stack>
          <Text size={'xs'} c='dimmed'>vs.</Text>
        <Stack w={'50%'} gap={0}>
        <Text size={'md'} c={team200Win ? 'green' : 'red'}>{team200Kills} {team200Surrendered ? <IconFlagFilled size={12}/> : team200EarlySurrendered ? <IconFlag size={12}/> : ''}</Text>
          {playerMap(team200, 'start')}
          </Stack>
      </Group>
    </Stack>
  );
}

function FocusedParticipantList() {
  const { focusedParticipants, gameDuration } = useContext(MatchContext);

  return (
    <Stack gap="xs">
      {focusedParticipants.map(participant => (
        <ParticipantContext.Provider key={participant.summonerName} value={{ participant, gameDuration }}>
          <Participant />
        </ParticipantContext.Provider>
      ))}
    </Stack>
  );
}

function Participant() {
  const { participant } = useContext(ParticipantContext);
  const { getChampIcon, getRoleIcon } = useGameData();

  return (
    <Paper p="xs" radius="md" style={{ background: gradientColor(participant.win) }}>
      <Group justify="space-between" wrap="nowrap">
        <Group align="center" gap={'xs'}>
          <Tooltip label={participant.championName} position="top">
            <BackgroundImage bgsz={"110%"} src={getChampIcon(participant.championId)} alt={participant.summonerName} w='xl' h='xl' radius={100} bd={`2px solid ${participant.win ? 'green' : 'red'}`} />
          </Tooltip>
          <Image src={getRoleIcon(participant.teamPosition)} alt={participant.summonerName} w='md' h='md' />
          <Text size="sm">{participant.summonerName}</Text>
        </Group>
        <Stack align="end">
          <KeyStats />
          <Tags />
        </Stack>
      </Group>
    </Paper>
  );
}

function KeyStats() {
  const { participant } = useContext(ParticipantContext);
  const { matchMode } = useContext(MatchContext);
  const isAram = matchMode.includes('ARAM');

  return (
    <Group gap="xs" align="center">
      <KDA/>
      <KP/>
      <Damage/>
      {!isAram && <CS/>}
      {!isAram && <Vision/>}
      <Gold/>
    </Group>
  );
}

function gradientColor(win) {
  return win ? 'linear-gradient(90deg, var(--mantine-color-green-light) 0%, rgba(0,0,0,0.0) 100%)' : 'linear-gradient(90deg, var(--mantine-color-red-light) 0%, rgba(0,0,0,0.0) 100%)';
}

function KDA() {
  const {participant} = useContext(ParticipantContext);
  const kills = participant.kills;
  const deaths = participant.deaths || 1;
  const assists = participant.assists;


  const kda = (kills + assists) / deaths;
  let kdaColor = 'green';
  if (kda < 2) {
    kdaColor = 'red';
  }
  else if (kda < 3) {
    kdaColor = 'gray';
  }
  else if (kda > 5) {
    kdaColor = 'blue';  
  }

  return (
    <Tooltip label={`${kills} / ${deaths} / ${assists}`} position="top">
      <Group gap={'sm'}>
      <Group gap={2}>
        <Text size="sm" c={kdaColor}>{kda.toFixed(1)}</Text>
        <Text size={'10px'}>KDA</Text>
      </Group>
      <Group gap={3}>
        <Text size="sm">{kills} /</Text>
        <Text size="sm">{deaths} /</Text>
        <Text size="sm">{assists}</Text>
      </Group>
      </Group>
    </Tooltip>
  );
}

function Gold() {
  const {participant, gameDuration,} = useContext(ParticipantContext);
  const { matchMode } = useContext(MatchContext);
  const gold = participant.goldEarned;
  const lane = participant.teamPosition;

  let avgGold = 0;
  if (lane === 'TOP' || lane === 'MIDDLE') {
    avgGold = gameDuration / 60 * 350;
  }
  else if (lane === 'JUNGLE') {
    avgGold = gameDuration / 60 * 350;
  }
  else if (lane === 'BOTTOM') {
    avgGold = gameDuration / 60 * 400;
  }else if (matchMode.includes('ARAM')) {
    avgGold = gameDuration / 60 * 600;
  }
  else if (lane === 'UTILITY') {
    avgGold = gameDuration / 60 * 300;
  }

  let goldColor = 'green';
  if (gold < avgGold * 0.8) {
    goldColor = 'red';
  }
  else if (gold < avgGold * 1.2 || lane === 'UTILITY') {
    goldColor = 'gray';
  }
  else if (gold > avgGold * 2) {
    goldColor = 'blue';
  }
  
  let inner = gold;
  if (gold > 1000) {
    inner = `${(gold / 1000).toFixed(1)}k`;
  }
  return (
    <Tooltip label={`${gold} gold`} position="top">
      <Group gap={2}>
        <Text size="sm" c={goldColor}>{inner}</Text>
        <IconInnerShadowBottomLeftFilled size={10} />
      </Group>
    </Tooltip>
  );
}

function CS() {
  const {participant, gameDuration} = useContext(ParticipantContext);
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
  const lane = participant.teamPosition;
  const time = gameDuration;

  let avgCs = 0;
  if (lane === 'TOP' || lane === 'MIDDLE') {
    avgCs = time / 60 * 5;
  } else if (lane === 'JUNGLE') {
    avgCs = time / 60 * 5;
  } else if (lane === 'BOTTOM') {
    avgCs = time / 60 * 10;
  } else if (lane === 'UTILITY') {
    avgCs = time / 60 * 0;
  }
  let csColor = 'green';
  if (cs < avgCs * 0.8) {
    csColor = 'red';
  } else if (cs < avgCs * 1.2 || lane === 'UTILITY') {
    csColor = 'gray';
  } else if (cs > avgCs * 2) {
    csColor = 'blue';
  }
  const csPerMin = (cs / (time / 60)).toFixed(1);
  return (
    <Tooltip label={`${cs} CS, ${csPerMin} per minute`} position="top">
      <Group gap={2}>
        <Text size="sm" c={csColor}>{cs}({csPerMin}) </Text>
        <Text size={'12px'}>CS</Text>
      </Group>
    </Tooltip>
  );
}

function Damage() {
  const {participant, gameDuration} = useContext(ParticipantContext);
  const { matchMode } = useContext(MatchContext);
  const damage = participant.totalDamageDealtToChampions;
  const lane = participant.teamPosition;
  const time = gameDuration;

  let inner = damage;
  if (damage > 1000) {
    inner = `${(damage / 1000).toFixed(1)}k`;
  }

  let avgDamage = 0;
  if (lane === 'TOP' || lane === 'MIDDLE') {
    avgDamage = time / 60 * 500;
  } else if (lane === 'JUNGLE') {
    avgDamage = time / 60 * 500;
  } else if (lane === 'BOTTOM' || matchMode.includes('ARAM')) {
    avgDamage = time / 60 * 1000;
  } else if (lane === 'UTILITY') {
    avgDamage = time / 60 * 0;
  }
  let damageColor = 'green';
  if (damage < avgDamage * 0.8) {
    damageColor = 'red';
  } else if (damage < avgDamage * 1.2 || lane === 'UTILITY') {
    damageColor = 'gray';
  } else if (damage > avgDamage * 2) {
    damageColor = 'blue';
  }
  return (
    <Tooltip label={`${damage} damage`} position="top">
      <Group gap={2}>
        <Text size="sm" c={damageColor}>{inner}</Text>
        <IconSwords size={10} />
      </Group>
    </Tooltip>
  );
}

function KP() {
  const {participant} = useContext(ParticipantContext);
  const { matchMode } = useContext(MatchContext);
  const kp = participant.challenges.killParticipation;
  const lane = participant.teamPosition

  let avgKP = 0;
  if (lane === 'TOP' || lane === 'MIDDLE') {
    avgKP = 0.35;
  } else if (lane === 'JUNGLE') {
    avgKP = 0.5;
  } else if (lane === 'BOTTOM') {
    avgKP = 0.4;
  } else if (lane === 'UTILITY') {
    avgKP = 0.4;
  } else if (matchMode.includes('ARAM')) {
    avgKP = 0.6;
  }
  let kpColor = 'green';
  if (kp < avgKP * 0.8) {
    kpColor = 'red';
  } else if (kp < avgKP * 1.2) {
    kpColor = 'gray';
  } else if (kp > avgKP * 2.1) {
    kpColor = 'blue';
  }
  return (
    <Tooltip label={`${(kp * 100).toFixed(1)}% kill participation`} position="top">
      <Group gap={2}>
        <Text size="sm" c={kpColor}>{(kp * 100).toFixed(1)}%</Text>
        <Text size={'12px'}>KP</Text>
      </Group>
    </Tooltip>
  );
}

function Vision() {
  const {participant} = useContext(ParticipantContext);
  const wardsPlaced = participant.wardsPlaced;
  const wardsKilled = participant.wardsKilled;
  const visionScore = participant.visionScore;

  const lane = participant.teamPosition;
  let avgVision = 0;
  if (lane === 'TOP' || lane === 'MIDDLE') {
    avgVision = 10;
  } else if (lane === 'JUNGLE') {
    avgVision = 15;
  } else if (lane === 'BOTTOM') {
    avgVision = 15;
  } else if (lane === 'UTILITY') {
    avgVision = 20;
  }
  let visionColor = 'green';
  if (visionScore < avgVision * 0.8) {
    visionColor = 'red';
  } else if (visionScore < avgVision * 1.2) {
    visionColor = 'gray';
  } else if (visionScore > avgVision * 2) {
    visionColor = 'blue';
  }

  return (
    <Tooltip label={`${wardsPlaced} wards placed, ${wardsKilled} wards killed, ${visionScore} vision score`} position="top">
      <Group gap={2}>
        <Text size="sm" c={visionColor}>{visionScore}</Text>
        <IconEye size={10} />
      </Group>
    </Tooltip>
  );
}