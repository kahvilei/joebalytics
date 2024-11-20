import React from "react";
import { useGameData } from "../../context/DataContext";
import { Card, Image, Group, Text, Container, Tooltip, Anchor, Stack, Box, Grid } from '@mantine/core';

const MatchCard = (props) => {
  const {
    getRoleIcon,
    getChampIcon,
    getRoleName,
    getQueueName,
    getSummonerIcon,
    getItemIcon,
    getItemName,
    getPerkStyleIcon,
    getPerkStyleName,
    getSummonerSpellIcon,
    getSummonerSpellName,
    getRegionName,
  } = useGameData();
  const match = props.match;
  const region = getRegionName(match.info.platformId);
  const matchMode = getQueueName(match.info.queueId).replace(/games$/, '');
  const focusedSummoners = props.focusedSummoners;
  const date = new Date(match.info.gameCreation);

  function MatchSummaryTeams() {
    const team100 = match.info.participants.filter(participant => participant.teamId === 100);
    const team200 = match.info.participants.filter(participant => participant.teamId === 200);

    const team100Players = team100.map(participant => (
      <Group key={participant.summonerName}>
        <Image src={getChampIcon(participant.championId)} alt={participant.summonerName} />
        <Text>{participant.summonerName}</Text>
      </Group>
    ));

    const team200Players = team200.map(participant => (
      <Group key={participant.summonerName}>
        <Image src={getChampIcon(participant.championId)} alt={participant.summonerName} />
        <Text>{participant.summonerName}</Text>
      </Group>
    ));

    const team100Win = team100[0].win;
    const team200Win = team200[0].win;

    const team100Kills = team100.reduce((total, participant) => total + participant.kills, 0);
    const team200Kills = team200.reduce((total, participant) => total + participant.kills, 0);

    return (
      <Container>
        <Group position="center">
          <Text className={team100Win ? "victory" : "defeat"}>{team100Kills}</Text>
          <Text>vs.</Text>
          <Text className={team200Win ? "victory" : "defeat"}>{team200Kills}</Text>
        </Group>
        <Group position="apart">
          <Container>{team100Players}</Container>
          <Container>{team200Players}</Container>
        </Group>
      </Container>
    );
  }

  function FocusedMatchSummary({ summonerPuuid }) {
    const summonerData = match.info.participants.find(participant => participant.puuid === summonerPuuid);
    if (!summonerData) return null;

    const totalMinionsKilled = summonerData.totalMinionsKilled.toLocaleString();
    const goldEarnedSumm = summonerData.goldEarned >= 1000000
      ? `${Math.floor(summonerData.goldEarned / 1000000)}m`
      : summonerData.goldEarned >= 1000
        ? `${(Math.floor(summonerData.goldEarned / 100) / 10).toFixed(1)}k`
        : summonerData.goldEarned.toLocaleString();

    function PlayerKda({ summoner }) {
      const score = summoner.deaths === 0
        ? ((summoner.kills + summoner.assists) / 1).toFixed(1)
        : ((summoner.kills + summoner.assists) / summoner.deaths).toFixed(1);
      const kdaTag = score < 3.0 ? "bad" : score > 4.0 ? "good" : "neutral";

      return (
        <Stack gap="xs">
          <Text className={kdaTag}>{score} KDA</Text>
          <Text>{summoner.kills} / {summoner.deaths} / {summoner.assists}</Text>
        </Stack>
      );
    }

    function PlayerCsGoldVs({ summoner }) {
      const totalCs = parseInt(totalMinionsKilled) + parseInt(summoner.neutralMinionsKilled);
      const csPerMinute = (totalCs / (match.info.gameDuration / 60)).toFixed(1);
      const wardsPlacedPerMinute = (parseInt(summoner.wardsPlaced) / (match.info.gameDuration / 60)).toFixed(1);
      const goldPerMinute = (parseInt(summoner.goldEarned) / (match.info.gameDuration / 60)).toFixed(1);

      return (
        <Stack gap="xs">
          <Text>{totalCs} ({csPerMinute}) CS</Text>
          <Text>{goldEarnedSumm} ({goldPerMinute}) Gold</Text>
          <Text>{summoner.wardsPlaced} ({wardsPlacedPerMinute}) / {summoner.wardsKilled}</Text>
        </Stack>
      );
    }

    function PlayerDamageAndKillParticipation({ summoner }) {
      const killParticipation = summoner.challenges?.killParticipation
        ? (summoner.challenges.killParticipation * 100).toFixed(0)
        : "incompatible data";
      const killParticipationTag = killParticipation < 40 ? "bad" : killParticipation > 60 ? "good" : "neutral";

      return (
        <Stack gap="xs">
          <Text className={killParticipationTag}>{killParticipation}% KP</Text>
          <Text>{summoner.totalDamageDealtToChampions.toLocaleString()} Damage</Text>
        </Stack>
      );
    }

    function PlayerItems({ summoner }) {
      const itemIcons = Array.from({ length: 6 }, (_, i) => (
        summoner[`item${i}`]
          ? <Tooltip label={getItemName(summoner[`item${i}`])} key={i}>
            <Grid.Col span={4} key={i}>
              <Image src={getItemIcon(summoner[`item${i}`])} alt={summoner[`item${i}`]} w={'xl'} h={'xl'} />
            </Grid.Col>
            </Tooltip>

          : <Grid.Col span={4} key={i}><Box key={i} w={'xl'} h={'xl'} bg={'dark'} /></Grid.Col>
      ));

      const trinketIcon = summoner.item6
        ? <Tooltip label={getItemName(summoner.item6)} key={6}>
          <Grid.Col span={1}>
            <Image src={getItemIcon(summoner.item6)} alt={summoner.item6} w={'xl'} h={'xl'} /></Grid.Col>
          </Tooltip>
        : <Grid.Col span={1} ><Box w={'xl'} h={'xl'} bg={'dark'} /></Grid.Col>;

      return (
        <Group>
          <Grid w={100}>{itemIcons}</Grid>
          <Grid>{trinketIcon}</Grid>
        </Group>
      );
    }

    function PlayerSpellsAndRunes({ summoner }) {
      const spellIcons = [1, 2].map(i => (
        <Tooltip label={getSummonerSpellName(summoner[`summoner${i}Id`])} key={i}>
          <Image src={getSummonerSpellIcon(summoner[`summoner${i}Id`])} alt={getSummonerSpellName(summoner[`summoner${i}Id`])} w={24} h={24} />
        </Tooltip>
      ));

      const runeIcons = summoner.perks.styles.map((style, i) => (
        <Tooltip label={getPerkStyleName(style.style)} key={i}>
          <Image src={getPerkStyleIcon(style.style)} alt={getPerkStyleName(style.style)} />
        </Tooltip>
      ));

      return (
        <Group>
          <Group>{runeIcons}</Group>
          <Group>{spellIcons}</Group>
        </Group>
      );
    }

    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder className={summonerData.win ? "victory" : "defeat"}>
        <Group position="apart" wrap="nowrap">
          <Stack gap="xs">
            <Group wrap="nowrap">
            <Image src={getChampIcon(summonerData.championId)} alt={summonerData.championName} w={48} h={48} />
            <Group gap="xs">
              <Group>
                <Image src={getSummonerIcon(summonerData.profileIcon)} alt={summonerData.summonerName} />
                <Anchor href={`/summoner/${region}/${summonerData.summonerName.toLowerCase()}`}>
                  <Text>{summonerData.summonerName}</Text>
                </Anchor>
                <Text>•</Text>
                <Text>{summonerData.championName}</Text>
                {getRoleName(summonerData.teamPosition) !== "unnamed" && (
                  <>
                    <Text>•</Text>
                    <Text>{getRoleName(summonerData.teamPosition)}</Text>
                  </>
                )}
              </Group>
              <Text>{summonerData.win ? "Victory" : "Defeat"}</Text>
            </Group>
          </Group>
          
          <Group  justify="space-between" align="top">
            <PlayerKda summoner={summonerData} />
            <PlayerDamageAndKillParticipation summoner={summonerData} />
            <PlayerCsGoldVs summoner={summonerData} />
          </Group>
        </Stack>
        <Group>
          <PlayerSpellsAndRunes summoner={summonerData} />
          <PlayerItems summoner={summonerData} />
        </Group>
      </Group>
        
      </Card>
    );
  }

  const FocusedMatchSummaries = focusedSummoners.map(summonerPuuid => (
    <FocusedMatchSummary summonerPuuid={summonerPuuid} key={summonerPuuid} />
  ));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart">
        <Group direction="column" gap="xs">
          <Text>{matchMode}</Text>
          <Text>
            Duration: {Math.floor(match.info.gameDuration / 60)}:
            {match.info.gameDuration % 60 < 10
              ? "0" + (match.info.gameDuration % 60)
              : match.info.gameDuration % 60}
          </Text>
        </Group>
        <Text>{date.toLocaleString()}</Text>
      </Group>
      <Group direction="column" gap="xs">
        {FocusedMatchSummaries}
        <MatchSummaryTeams />
      </Group>
    </Card>
  );
};

export default MatchCard;