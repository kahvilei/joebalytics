import { useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import ShowSummonerList from "../partials/ShowSummonerList";
import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";
import ShowMatchList from "../partials/ShowMatchList";
import LoadingCircle from "../components/LoadingCircle";
import { Container, Group, Grid, Stack } from "@mantine/core";

const HOME_PAGE_QUERY = gql`
  query HomePageData($matchLimit: Int!, $challengeLimit: Int!, $masteryLimit: Int!) {
    matches(limit: $matchLimit) {
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
          profileIcon
          puuid
          teamId
          totalMinionsKilled
          neutralMinionsKilled
          goldEarned
          totalDamageDealtToChampions
          perks {
            styles {
              style
            }
          }
          challenges {
            killParticipation
            controlWardsPlaced
            visionScorePerMinute
            kda
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
        }
      }
    }
    challenges(limit: $challengeLimit, sortBy: { field: PERCENTILE, direction: ASC }) {
      id
      uniqueId
      challengeId
      challengeName
      shortDesc
      percentile
      level
      value
      summonerName
      profileIconId
    }
    masteries(limit: $masteryLimit, sortBy: { field: CHAMPION_POINTS, direction: DESC }) {
      id
      uniqueId
      championId
      championLevel
      championPoints
      summonerName
      profileIconId
      winRate
      gamesPlayed
    }
  }
`;

function Home() {
  const { loading, error, data } = useQuery(HOME_PAGE_QUERY, {
    variables: {
      matchLimit: 5,
      challengeLimit: 12,
      masteryLimit: 6
    }
  });

  if (loading) {
    return <LoadingCircle color={"dark"} aspectRatio={"square"} />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <Container size="xl">
      <Grid gap="lg">
        <Grid.Col span={9}>
          <Stack>
            <h2>Recent Matches</h2>
            <ShowMatchList 
              matches={data.matches}
              focusedSummoners={data.summoners.map(s => s.puuid)}
            />
            <Link to={`/matches`}>See all matches</Link>
            <h2>Challenges Ranking</h2>
            <ShowChallengeRanking challenges={data.challenges} />
            <h2>Champion Masteries</h2>
            <ShowMasteryRanking masteries={data.masteries} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={3}>
        <Stack>
          <h2>Summoners</h2>
          <ShowSummonerList summoners={data.summoners} />
        </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Home;