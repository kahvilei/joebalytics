import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import ShowMatchList from "../partials/ShowMatchList";
import { Container, Stack } from "@mantine/core";
import { useGameData } from "../../context/DataContext";
import { useState, useMemo, memo } from "react";
import MatchCardLoad from "../components/MarchCardLoad";
import MatchFilters from "../components/MatchFilters";
import { set } from "mongoose";

// Memoize MatchFilters to prevent re-renders when matches update
const MemoizedMatchFilters = memo(MatchFilters);

// Memoize the match list component to prevent re-rendering of existing items
const MemoizedShowMatchList = memo(ShowMatchList);

function Matches() {
  const [hasMoreMatches, setHasMoreMatches] = useState(true);
  const { getMatchListQuery, summoners, getQueueIdsFromDisplayNames } = useGameData();
  const matchPageQuery = getMatchListQuery();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Memoize filter parameters to prevent unnecessary recalculations
  const filterParams = useMemo(() => {
    const roles = searchParams.getAll("role") || null;
    const championIds = searchParams.getAll("championId").map(id => parseInt(id)) || null;
    const gameModes = searchParams.getAll("gameMode") || null;
    const queueIds = gameModes ? getQueueIdsFromDisplayNames(gameModes) : [];
    const tags = searchParams.getAll("tag") || null;
    const limit = parseInt(searchParams.get("limit")) || 10;

    setHasMoreMatches(true);

    return {
      roles: roles.includes("any") ? [] : roles,
      championIds: championIds.includes("any") ? [] : championIds,
      queueIds: gameModes ? queueIds : [],
      limit,
      tags: tags.includes("any") ? [] : tags,
    };
  }, [searchParams, getQueueIdsFromDisplayNames]);

  // Memoize stats configuration
  const statsConfig = useMemo(() => [
    { path: "win", aggregation: "AVG" },
    { path: "visionScore", aggregation: "AVG" },
    { path: "challenges/visionScorePerMinute", aggregation: "AVG" },
    { path: "challenges/kda", aggregation: "AVG" },
    { path: "challenges/soloKills", aggregation: "AVG" }
  ], []);

  const { loading, error, data, fetchMore } = useQuery(matchPageQuery, {
    variables: {
      ...filterParams,
      stats: statsConfig
    }
  });

  const loadMoreMatches = async () => {
    const lastMatch = data?.matches[data.matches.length - 1];
    if (lastMatch) {
      setIsLoading(true);
      fetchMore({
        variables: {
          timestamp: lastMatch.info.gameStartTimestamp
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          if (fetchMoreResult.matches.length === 0) {
            setHasMoreMatches(false);
            return prev;
          }
          return {
            ...prev,
            matches: [...prev.matches, ...fetchMoreResult.matches]
          };
        }
      }).then(() => {
        setIsLoading(false);
        return "done";
      });
    }
  };

  // Memoize the focused summoners array
  const focusedSummoners = useMemo(() => 
    summoners.map(s => s.puuid),
    [summoners]
  );

  const MatchListShow = useMemo(() => {
    if (loading) {
      return <MatchCardLoad />;
    }
    if (!data || !data.matches || data.matches.length === 0) {
      return <div>No matches found</div>;
    }
    if (error) {
      return <div>Error loading matches: {error.message}</div>;
    }
    return (
      <>
        <MemoizedShowMatchList
          matches={data.matches}
          onLoadMore={loadMoreMatches}
          isLoading={isLoading}
          infiniteScroll={hasMoreMatches}
          focusedSummoners={focusedSummoners}
          hasMoreMatches={hasMoreMatches}
        />
      </>
    );
  }, [loading, error, data, isLoading, loadMoreMatches, focusedSummoners]);

  return (
    <Container size="xl">
      <Stack gap="lg">
        <MemoizedMatchFilters />
        {MatchListShow}
      </Stack>
    </Container>
  );
}

export default memo(Matches);