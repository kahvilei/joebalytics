import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import ShowMatchList from "../partials/ShowMatchList";
import { Container, Grid, Paper, Title, Text, Stack, Group } from "@mantine/core";
import { useGameData } from "../../context/DataContext";
import { useState, useMemo, memo } from "react";
import MatchCardLoad from "../components/MarchCardLoad";
import MatchFilters from "../components/MatchFilters";
import { MATCHES_LIST_QUERY } from "../../graphql/queries";

// Memoize components to prevent unnecessary re-renders
const MemoizedMatchFilters = memo(MatchFilters);
const MemoizedShowMatchList = memo(ShowMatchList);

const StatsViewer = memo(({ matchStats, matchCount, isLoading }) => {
  if (isLoading) return (
      <MatchCardLoad />
  );
  if (!matchStats) return (
    <Paper p="md" withBorder>
      <Text>No stats available</Text>
    </Paper>
  );

  const StatItem = ({ label, value, unit = '' }) => (
    <Group gap="xs">
      <Text size="sm" c="dimmed">{label}</Text>
      <Group gap="xs">
        <Text size="xl" fw={700}>{value}</Text>
        {unit && <Text size="sm" c="dimmed">{unit}</Text>}
      </Group>
    </Group>
  );

  return (
    <Paper p="md"pos={'sticky'} top={80} bg='var(--mantine-color-dark-8)'>
      <Stack gap="md">
        <Title order={3}>Match Statistics</Title>
        <Text size="sm" c="dimmed" fs="italic">for {matchCount} loaded matches</Text>
        
        <StatItem 
          label="Win Rate"
          value={(matchStats.win * 100)?.toFixed(1)}
          unit="%"
        />
        
        <StatItem 
          label="Average KDA"
          value={matchStats['challenges/kda']?.toFixed(2)}
        />
        
        <StatItem 
          label="Vision Score"
          value={matchStats.visionScore?.toFixed(1)}
        />
        
        <StatItem 
          label="Vision per Minute"
          value={matchStats['challenges/visionScorePerMinute']?.toFixed(2)}
        />
        
        <StatItem 
          label="Solo Kills"
          value={matchStats['challenges/soloKills']?.toFixed(1)}
        />
      </Stack>
    </Paper>
  );
});

function Matches() {
  const [hasMoreMatches, setHasMoreMatches] = useState(true);
  const { summoners, getQueueIdsFromDisplayNames, getTags } = useGameData();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

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

  const statsConfig = useMemo(() => [
    { path: "win", aggregation: "AVG" },
    { path: "visionScore", aggregation: "AVG" },
    { path: "challenges/visionScorePerMinute", aggregation: "AVG" },
    { path: "challenges/kda", aggregation: "AVG" },
    { path: "challenges/soloKills", aggregation: "AVG" }
  ], []);

  const { loading, error, data, fetchMore } = useQuery(MATCHES_LIST_QUERY, {
    variables: {
      ...filterParams,
      stats: statsConfig
    }
  });

  const loadMoreMatches = async () => {
    const lastMatch = data?.matches.matchData[data.matches.matchData.length - 1];
    if (lastMatch) {
      setIsLoading(true);
      fetchMore({
        variables: {
          timestamp: lastMatch.info.gameStartTimestamp
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult){
            setHasMoreMatches(false);
            setIsLoading(false);
            return prev;
          }
          if (fetchMoreResult.matches.matchData.length === 0) {
            setHasMoreMatches(false);
            setIsLoading(false);
            return prev;
          }
          const toReturn = {
            ...prev,
            matches: {
              matchData: [...prev.matches.matchData, ...fetchMoreResult.matches.matchData],
              statData: {
                ...combineStats([prev.matches.statData, fetchMoreResult.matches.statData])
              }
            }
          };
          return toReturn;
        }
      }).then(() => {
        setIsLoading(false);
        return "done";
      });
    }
  };

  const combineStats = (statsArray) => {
    // Return empty result if no stats provided
    if (!statsArray || statsArray.length === 0) {
      return { stats: {}, matchCount: 0 };
    }
  
    // Initialize combined stats object
    const combinedResult = {
      stats: {},
      matchCount: 0
    };
  
    // Combine match counts
    combinedResult.matchCount = statsArray.reduce((total, curr) => 
      total + (curr?.matchCount || 0), 0
    );
  
    // If there's only one stat object, return it
    if (statsArray.length === 1) {
      return {
        stats: statsArray[0].stats || {},
        matchCount: statsArray[0].matchCount || 0
      };
    }
  
    // Get all unique stat keys
    const allKeys = [...new Set(
      statsArray.flatMap(stat => 
        stat?.stats ? Object.keys(stat.stats) : []
      )
    )];
  
    // Process each stat key
    allKeys.forEach(key => {
      const validStats = statsArray
        .filter(stat => stat?.stats && stat.stats[key] !== undefined)
        .map(stat => ({
          value: stat.stats[key],
          weight: stat.matchCount
        }));
  
      if (validStats.length === 0) {
        return;
      }
  
      // For averages (most common case), we need to weight by match count
      const totalValue = validStats.reduce((sum, stat) => 
        sum + (stat.value * stat.weight), 0
      );
      const totalWeight = validStats.reduce((sum, stat) => 
        sum + stat.weight, 0
      );
  
      combinedResult.stats[key] = totalValue / totalWeight;
    });
  
    return combinedResult;
  };

  const focusedSummoners = useMemo(() => 
    summoners.map(s => s.puuid),
    [summoners]
  );

  const MatchListShow = useMemo(() => {
    if (loading) {
      return <MatchCardLoad />;
    }
    if (!data || !data.matches.matchData || data.matches.matchData.length === 0) {
      return <Paper p="md" withBorder><Text>No matches found</Text></Paper>;
    }
    if (error) {
      return <Paper p="md" withBorder><Text c="red">Error loading matches: {error.message}</Text></Paper>;
    }
    return (
      <MemoizedShowMatchList
        matches={data.matches.matchData}
        onLoadMore={loadMoreMatches}
        isLoading={isLoading}
        infiniteScroll={hasMoreMatches}
        focusedSummoners={focusedSummoners}
        hasMoreMatches={hasMoreMatches}
      />
    );
  }, [loading, error, data, isLoading, loadMoreMatches, focusedSummoners, hasMoreMatches]);

  return (
    <Container size="xl">
      <Stack gap="md">
        <MemoizedMatchFilters />
        <Grid>
          <Grid.Col span={3}>
            <StatsViewer matchStats={data?.matches?.statData.stats} matchCount={data?.matches?.matchData?.length} isLoading={loading} />
          </Grid.Col>
          <Grid.Col span={9}>
            {MatchListShow}
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default memo(Matches);