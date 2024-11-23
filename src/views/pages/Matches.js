import React, { useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ShowMatchList from "../partials/ShowMatchList";
import SummonerStats from "../partials/SummonerStats";
import LoadingCircle from "../components/LoadingCircle";
import { Container, Group, Select, Stack, Avatar, Text, Loader, ActionIcon, Tooltip} from "@mantine/core";
import { useGameData } from "../../context/DataContext";
import { set } from "mongoose";
import { IconRefresh, IconZoomReset } from "@tabler/icons-react";


const MATCHES_PAGE_QUERY = gql`
 query MatchesPageData(
    $region: String
    $name: String
    $role: String
    $championId: Int
    $queueId: String
    $limit: Int
    $timestamp: Float
  ) {
    matches( region: $region
      summonerName: $name
      role: $role
      championId: $championId
      queueId: $queueId
      limit: $limit
      timestamp: $timestamp) {
      id
      metadata {
        matchId
        participants
      }
      info {
        gameMode
        gameStartTimestamp
        gameDuration
        platformId
        queueId
        gameCreation
        participants {
          teamPosition
          championId
          championName
          champLevel
          kills
          deaths
          assists
          win
          summonerName
          profileIcon
          puuid
          teamId
          totalMinionsKilled
          neutralMinionsKilled
          goldEarned
          goldSpent
          damageDealtToObjectives
          totalDamageDealtToChampions
          totalDamageShieldedOnTeammates
          totalHealsOnTeammates
          firstBloodKill
          pentaKills
          quadraKills
          totalDamageTaken
          perks {
            styles {
              style
            }
          }
          challenges {
            goldPerMinute
            killParticipation
            controlWardsPlaced
            visionScorePerMinute
            kda
            soloKills
            multikills
            multikillsAfterAggressiveFlash
            bountyGold
            takedownsFirstXMinutes
            teamDamagePercentage
            damagePerMinute
            damageTakenOnTeamPercentage
            turretPlatesTaken
            perfectGame
            visionScoreAdvantageLaneOpponent
            laneMinionsFirst1NumberMinutes
            jungleCsBefore1NumberMinutes
            maxCsAdvantageOnLaneOpponent
            maxLevelLeadLaneOpponent
            maxKillDeficit
            dragonTakedowns
            baronTakedowns
            teamElderDragonKills
            gameLength
            skillshotsDodged
            skillshotsHit
            dodgeSkillShotsSmallWindow
            snowballsHit
            teamElderDragonKills
            teamRiftHeraldKills
            enemyJungleMonsterKills
            takedownsFirstXMinutes
            takedownsAfterGainingLevelAdvantage
            survivedSingleDigitHpCount
            killsUnderOwnTurret
            killsNearEnemyTurret
            takedownsInEnemyFountain
            turretPlatesTaken
            deathsByEnemyChamps
            epicMonsterSteals
            controlWardsPlaced
            effectiveHealAndShielding
            survivedSingleDigitHpCount
            initialBuffCount
            killsWithHelpFromEpicMonster
            enemyChampionImmobilizations
            wardTakedowns
            saveAllyFromDeath
            takedownsInAlcove
            twentyMinionsIn3SecondsCount
            unseenRecalls
            dancedWithRiftHerald
            riftHeraldTakedowns
            turretsTakenWithRiftHerald
          }
          itemNumber
          item0
          item1
          item2
          item3
          item4
          item5
          item6
          sightWardsBoughtInGame
          totalDamageDealt
          wardsPlaced
          wardsKilled
          summoner1Id
          summoner2Id
          visionScore
          gameEndedInEarlySurrender
          gameEndedInSurrender
          turretTakedowns
          objectivesStolen
          objectivesStolenAssists
          totalTimeCCDealt
          timeCCingOthers
          largestMultiKill
          riotIdTagline
          riotIdGameName
          onMyWayPings
        }
      }
    }
  }
`;

function Matches() {
  const { region = "any", name = "any" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const role = searchParams.get("role") || "any";
  const championId = parseInt(searchParams.get("championId")) || "any";
  const queueId = searchParams.get("queueId") || "any";
  const limit = parseInt(searchParams.get("limit")) || 20;

  const { loading, error, data, fetchMore } = useQuery(MATCHES_PAGE_QUERY, {
    variables: {
      region: region === "any" ? null : region,
      name: name === "any" ? null : name,
      role: role === "any" || undefined ? null : role,
      championId: championId === "any" || undefined ? null : championId,
      queueId: queueId === "any" || undefined ? null : queueId,
      limit,
      statsLimit: limit,
      stats: [
        { path: "win", aggregation: "AVG" },
        { path: "visionScore", aggregation: "AVG" },
        { path: "challenges/visionScorePerMinute", aggregation: "AVG" },
        { path: "challenges/kda", aggregation: "AVG" },
        { path: "challenges/soloKills", aggregation: "AVG" }
      ]
    }
  });

  const { champions, items, queues, summoners, getChampIcon } = useGameData();

  const handleFilterChange = (newFilters) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...newFilters
    });
  };

  const loadMoreMatches = async () => {
    const lastMatch = data?.matches[data.matches.length - 1];
    if (lastMatch) {
      fetchMore({
        variables: {
          timestamp: lastMatch.info.gameStartTimestamp
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...prev,
            matches: [...prev.matches, ...fetchMoreResult.matches]
          };
        }
      }).then(() => {
        return "done";
      });
    }
  };

  function MatchListShow() {
    if (loading) {
      return <Loader />;
    }
    else if(!data || !data.matches || data.matches.length === 0) {
      return <div>No matches found</div>;
    }
    else if (error) {
      return <div>Error loading matches: {error.message}</div>;
    }
    else {
      return <ShowMatchList
        matches={data.matches}
        onLoadMore={() => loadMoreMatches()}
        infiniteScroll={true}
        focusedSummoners={summoners.map(s => s.puuid)}
      />;
    }
  }

  return (
    <Container size="xl">
     <Stack gap="lg">
        <Group position="center">
          <Select
            data={[
              { label: "Any Role", value: "any" },
              { label: "Top", value: "TOP" },
              { label: "Jungle", value: "JUNGLE" },
              { label: "Mid", value: "MIDDLE" },
              { label: "Bot", value: "BOTTOM" },
              { label: "Support", value: "UTILITY" }
            ]}
            value={role}
            onChange={(value) => handleFilterChange({ role: value })}
          />
          <Select
            data={[
              { label: "Any Champion", value: "any" },
              ...Object.values(champions).map((champion) => ({
                label: champion.name,
                value: champion.key
              }))
            ]}
            leftSection={<Avatar src={getChampIcon(championId)} alt="champion icon" size={'sm'} />}
            renderOption={({option, checked}) => (
              <Group gap={'xs'} align="left">
                <Avatar src={getChampIcon(parseInt(option.value))} alt="champion icon" size={'sm'} bd={checked ? '2px solid white' : 'none'} />
                <Text c={checked ? 'white' : 'dimmed'}>{option.label}</Text>
              </Group>
            )
            }
            value={championId.toString() || "any"} // make
            searchable
            onChange={(value) => handleFilterChange({ championId: value?parseInt(value)?parseInt(value):"any":"any" })}
          />
          <Select
            data={[
              { label: "Any Queue", value: "any" },
              ...Object.values(queues).map((queue) => ({
                label: queue.description || "unnamed",
                value: queue.queueId.toString()
              }))
            ]}
            searchable
            value={queueId.toString() || "any"}
            onChange={(value) => handleFilterChange({ queueId: value?parseInt(value)?parseInt(value):"any":"any" })}
          />
          <Tooltip label="Reset Filters" withArrow>
          <ActionIcon onClick={() => setSearchParams({})} color="blue">
            <IconZoomReset />
          </ActionIcon>
          </Tooltip>
        </Group>
        <MatchListShow />
      </Stack>
    </Container>
  );
}

export default Matches;