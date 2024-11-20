import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ShowMatchList from "../partials/ShowMatchList";
import SummonerStats from "../partials/SummonerStats";
import LoadingCircle from "../components/LoadingCircle";

const MATCHES_PAGE_QUERY = gql`
 query MatchesPageData(
    $region: String
    $name: String
    $role: String
    $championId: Int
    $queueId: String
    $limit: Int
    $timestamp: Float
    $statsLimit: Int
    $stats: [StatRequest!]!
  ) {
    matches(
      region: $region
      summonerName: $name
      role: $role
      championId: $championId
      queueId: $queueId
      limit: $limit
      timestamp: $timestamp
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
    
    stats(
      region: $region
      summonerName: $name
      role: $role
      championId: $championId
      queueId: $queueId
      limit: $statsLimit
      stats: $stats
    ) {
      results
      matchCount
    }

    # Query for filter options
    availableFilters: stats(
      region: $region
      summonerName: $name
      limit: 1000
      stats: [
        { path: "queueId", aggregation: UNIQUE }
        { path: "teamPosition", aggregation: UNIQUE }
        { path: "championId", aggregation: UNIQUE }
      ]
    ) {
      results
      matchCount
    }
  }
`;

function Matches() {
  const { region = "any", name = "any" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const role = searchParams.get("role") || "any";
  const championId = searchParams.get("champ") || "any";
  const queueId = searchParams.get("mode") || "any";
  const limit = parseInt(searchParams.get("limit")) || 20;

  const { loading, error, data, fetchMore } = useQuery(MATCHES_PAGE_QUERY, {
    variables: {
      region: region === "any" ? null : region,
      name: name === "any" ? null : name,
      role: role === "any" ? null : role,
      championId: championId === "any" ? null : championId,
      queueId: queueId === "any" ? null : queueId,
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

  const handleFilterChange = (newFilters) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...newFilters
    });
  };

  const loadMoreMatches = () => {
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
      });
    }
  };

  if (loading && !data) {
    return <LoadingCircle color="dark" aspectRatio="square" />;
  }

  if (error) {
    return <div>Error loading matches: {error.message}</div>;
  }

  return (
    <div className="page">
      <section>
        <h1>Match History</h1>
        <SummonerStats
          stats={data.stats.results}
          filterOptions={data.availableFilters.results}
          currentFilters={{
            role,
            championId,
            queueId,
            limit
          }}
          onFilterChange={handleFilterChange}
        />
        <ShowMatchList
          matches={data.matches}
          onLoadMore={loadMoreMatches}
          infiniteScroll={true}
          focusedSummoners={data.summoners}
        />
      </section>
    </div>
  );
}

export default Matches;