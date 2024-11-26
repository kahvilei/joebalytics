import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ShowMatchList from "../partials/ShowMatchList";
import { Container, Group, MultiSelect, Stack, Avatar, Text, Loader, ActionIcon, Tooltip } from "@mantine/core";
import { useGameData } from "../../context/DataContext";
import { IconCheck, IconRestore, IconZoomReset } from "@tabler/icons-react";
import tagsJSON from '../../utils/tags.json';

const MATCHES_PAGE_QUERY = gql`
 query MatchesPageData(
    $region: String
    $names: [String!]
    $roles: [String!]
    $championIds: [Int!]
    $queueIds: [String!]
    $limit: Int
    $timestamp: Float
    $tags: [String!]
  ) {
    matches(
      region: $region
      summonerNames: $names
      roles: $roles
      championIds: $championIds
      queueIds: $queueIds
      limit: $limit
      timestamp: $timestamp
      tags: $tags
    ) {
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
          kills
          deaths
          assists
          win
          summonerName
          puuid
          teamId
          riotIdTagline
          riotIdGameName

          totalMinionsKilled
          neutralMinionsKilled
          goldEarned
          totalDamageDealtToChampions
          visionScore
          wardsPlaced
          wardsKilled

          gameEndedInEarlySurrender
          gameEndedInSurrender

          challenges {
            killParticipation
            kda
            visionScorePerMinute
          }

          tags {
            blind {
              isTriggered
              value
            }
            worstOfTheWorst {
              isTriggered
              value
            }
            tagAlong {
              isTriggered
              value
            }
            poor {
              isTriggered
              value
            }
            coward {
              isTriggered
              value
            }
            atm {
              isTriggered
              value
            }
            honoraryCarry {
              isTriggered
              value
            }
            jungleFullOfLife {
              isTriggered
              value
            }
            jungleDiffCamps {
              isTriggered
              value
            }
            forgotYourButtons {
              isTriggered
              value
            }
            mapControl0 {
              isTriggered
              value
            }
            aimWhereTheyreGoing {
              isTriggered
              value
            }
            allergicToDodging {
              isTriggered
              value
            }
            bigThrow {
              isTriggered
              value
            }
            lastHitTutorialNeeded {
              isTriggered
              value
            }
            struggling {
              isTriggered
              value
            }
            highDPS {
              isTriggered
              value
            }
            jackOfAllTrades {
              isTriggered
              value
            }
            dragonsHoard {
              isTriggered
              value
            }
            perfectlyBalanced {
              isTriggered
              value
            }
            iFeelFine {
              isTriggered
              value
            }
            afkFarmer {
              isTriggered
              value
            }
            pve {
              isTriggered
              value
            }
            paperTank {
              isTriggered
              value
            }
            walkingWard {
              isTriggered
              value
            }
            worksBetterAlone {
              isTriggered
              value
            }
            spongey {
              isTriggered
              value
            }
            objective {
              isTriggered
              value
            }
            yeahYeahOmw {
              isTriggered
              value
            }
            keyboardWarrior {
              isTriggered
              value
            }
            autoAttackOnly {
              isTriggered
              value
            }
            buffDeliveryService {
              isTriggered
              value
            }
            selfCare {
              isTriggered
              value
            }
            decorationEnthusiast {
              isTriggered
              value
            }
            flashGaming {
              isTriggered
              value
            }
            monsterTamer {
              isTriggered
              value
            }
            blastEm {
              isTriggered
              value
            }
            stopRightThere {
              isTriggered
              value
            }
            selfless {
              isTriggered
              value
            }
            alcoveClub {
              isTriggered
              value
            }
            minionEater {
              isTriggered
              value
            }
            hideAndSeekChampion {
              isTriggered
              value
            }
            shyHerald {
              isTriggered
              value
            }
            dancePartner {
              isTriggered
              value
            }
            snowball {
              isTriggered
              value
            }
            balancedDiet {
              isTriggered
              value
            }
            teamPlayer {
              isTriggered
              value
            }
            identityCrisis {
              isTriggered
              value
            }
            earlyBird {
              isTriggered
              value
            }
            mercenary {
              isTriggered
              value
            }
            surviveAtAllCosts {
              isTriggered
              value
            }
            arentYouForgettingSomeone {
              isTriggered
              value
            }
            scout {
              isTriggered
              value
            }
            youreWelcome {
              isTriggered
              value
            }
            midIsMyNewBestFriend {
              isTriggered
              value
            }
            imTheCarryNow {
              isTriggered
              value
            }
            stomper {
              isTriggered
              value
            }
            adequateJungler {
              isTriggered
              value
            }
            counterJungler {
              isTriggered
              value
            }
            betterTogether {
              isTriggered
              value
            }
            hatesArchitecture {
              isTriggered
              value
            }
            niceDiveIdiot {
              isTriggered
              value
            }
            coolTurret {
              isTriggered
              value
            }
            bountyHunter {
              isTriggered
              value
            }
            sneakyStealthy {
              isTriggered
              value
            }
            darkness {
              isTriggered
              value
            }
            laneKingdom {
              isTriggered
              value
            }
            quadraMaster {
              isTriggered
              value
            }
            flawlessVictory {
              isTriggered
              value
            }
            heGotANoNo {
              isTriggered
              value
            }
            pentakill {
              isTriggered
              value
            }
            dontEverSayItsOver {
              isTriggered
              value
            }
            legendary {
              isTriggered
              value
            }
            visionDomination {
              isTriggered
              value
            }
            simplyTheBest {
              isTriggered
              value
            }
            objectiveSupremacy {
              isTriggered
              value
            }
            csGod {
              isTriggered
              value
            }
            damageMaster {
              isTriggered
              value
            }
            carryingIsKindOfSupporting {
              isTriggered
              value
            }
            justDoinMyJob {
              isTriggered
              value
            }
            kingOfDaJungle {
              isTriggered
              value
            }
            notSoMiddling {
              isTriggered
              value
            }
            itsCalledTopForAReason {
              isTriggered
              value
            }
          }
        }
      }
    }
  }
`;

function Matches() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const roles = searchParams.getAll("role") || null;
  const championIds = searchParams.getAll("championId").map(id => parseInt(id)) || null;
  const queueIds = searchParams.getAll("queueId") || null;
  const tags = searchParams.getAll("tag") || null;
  const limit = parseInt(searchParams.get("limit")) || 20;

  const { loading, error, data, fetchMore } = useQuery(MATCHES_PAGE_QUERY, {
    variables: {
      roles: roles.includes("any") ? [] : roles,
      championIds: championIds.includes("any") ? [] : championIds,
      queueIds: queueIds.includes("any") ? [] : queueIds,
      limit,
      tags: tags.includes("any") ? [] : tags,
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
      role: newFilters.role || roles,
      championId: newFilters.championId || championIds,
      queueId: newFilters.queueId || queueIds,
      tag: newFilters.tag || tags,
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
      <Group gap="lg" align="center" wrap="nowrap">
        <Group align="start">
          <MultiSelect
            data={[
              { label: "Top", value: "TOP" },
              { label: "Jungle", value: "JUNGLE" },
              { label: "Mid", value: "MIDDLE" },
              { label: "Bot", value: "BOTTOM" },
              { label: "Support", value: "UTILITY" }
            ]}
            value={roles}
            placeholder={roles.length ? "" : "All Roles"}
            withCheckIcon
            clearable
            w={350}
            onChange={(value) => handleFilterChange({ role: value })}
          />
          <MultiSelect
            data={[
              ...Object.values(queues).map((queue) => ({
                label: queue.description || "unnamed",
                value: queue.queueId.toString()
              }))
            ]}
            searchable
            clearable
            withCheckIcon
            w={350}
            placeholder={queueIds.length ? "" : "All Queues"}
            value={queueIds}
            onChange={(value) => handleFilterChange({ queueId: value })}
          />
           <MultiSelect
            data={[
              ...Object.values(champions).map((champion) => ({
                label: champion.name,
                value: champion.key
              }))
            ]}
            renderOption={({ option, checked }) => (
              <Group gap={'xs'} align="center" justify="start">
                {checked && <IconCheck size={18} />}
                <Avatar src={getChampIcon(parseInt(option.value))} alt="champion icon" size={'sm'} bd={checked ? '2px solid white' : 'none'} />
                <Text c={checked ? 'white' : 'dimmed'}>{option.label}</Text>
              </Group>
            )}
            value={championIds.map(id => id.toString())}
            searchable
            clearable
            withCheckIcon
            w={450}
            placeholder={championIds.length ? "" : "All Champions"}
            onChange={(value) => handleFilterChange({ championId: value.map(id => parseInt(id)) })}
          />
          <MultiSelect
            data={[
              ...Object.keys(tagsJSON).map((tag) => ({
                label: tagsJSON[tag].text,
                value: tag
              }))
            ]}
            searchable
            clearable
            withCheckIcon
            w={450}
            placeholder={tags.length ? "" : "All Tags"}
            value={tags}
            onChange={(value) => handleFilterChange({ tag: value })}
          />
          </Group>
          <Tooltip label="Reset Filters" withArrow>
            <ActionIcon onClick={() => setSearchParams({})} color="blue">
              <IconRestore />
            </ActionIcon>
          </Tooltip>
          </Group>
        <MatchListShow />
      </Stack>
    </Container>
  );
}

export default Matches;