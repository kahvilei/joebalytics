import { useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import ShowSummonerList from "../partials/ShowSummonerList";
import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";
import ShowMatchList from "../partials/ShowMatchList";
import LoadingCircle from "../components/LoadingCircle";

const HOME_PAGE_QUERY = gql`
  query HomePageData($matchLimit: Int!, $challengeLimit: Int!, $masteryLimit: Int!) {
    summoners {
      id
      name
      regionDisplay
      regionURL
      tagline
      profileIconId
      puuid
      summonerLevel
      rankedData {
        tier
        rank
        leaguePoints
      }
    }
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
    <div className="home page w-sidebar">
      <div className="main-column">
        <section>
          <h2>Recent Matches</h2>
          <ShowMatchList 
            matches={data.matches}
            focusedSummoners={data.summoners.map(s => s.puuid)}
          />
          <Link className="button" to={`/matches`}>See all matches</Link>
        </section>
        <section className="row">
          <div className="challenges column-50">
            <h2>Challenges Ranking</h2>
            <ShowChallengeRanking challenges={data.challenges} />
          </div>
          <div className="masteries column-50">
            <h2>Champion Masteries</h2>
            <ShowMasteryRanking masteries={data.masteries} />
          </div>
        </section>
      </div>
      <div className="side-column">
        <section>
          <h2>Summoners</h2>
          <ShowSummonerList summoners={data.summoners} />
        </section>
      </div>
    </div>
  );
}

export default Home;