import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ShowMatchList from "../partials/ShowMatchList";
import { Container, Group, MultiSelect, Stack, Avatar, Text, Loader, ActionIcon, Tooltip, Card } from "@mantine/core";
import { useGameData } from "../../context/DataContext";
import { IconCheck, IconRestore } from "@tabler/icons-react";
import { useState } from "react";

function Matches() {
  const { getMatchListQuery, getTags, champions, queuesSimplified, summoners, getChampIcon, getQueueIdsFromDisplayNames} = useGameData();
  const tagsList = getTags();
  const matchPageQuery = getMatchListQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const roles = searchParams.getAll("role") || null;
  const championIds = searchParams.getAll("championId").map(id => parseInt(id)) || null;
  const gameModes = searchParams.getAll("gameMode") || null;
  const queueIds = gameModes? getQueueIdsFromDisplayNames(gameModes) : [];
  const tags = searchParams.getAll("tag") || null;
  const limit = parseInt(searchParams.get("limit")) || 10;

  const [isLoading, setIsLoading] = useState(false);

  const { loading, error, data, fetchMore } = useQuery(matchPageQuery, {
    variables: {
      roles: roles.includes("any") ? [] : roles,
      championIds: championIds.includes("any") ? [] : championIds,
      queueIds: gameModes ? queueIds: [],
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

  const handleFilterChange = (newFilters) => {
    setSearchParams({
      role: newFilters.role || roles,
      championId: newFilters.championId || championIds,
      gameMode: newFilters.gameMode || gameModes,
      tag: newFilters.tag || tags,
    });
  };

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

  function MatchListShow() {
    if (loading) {
      return (
        <Card shadow="xs" padding="xl" radius="lg">
        <Group align="center" justify="center">
          <Loader type='bars' />
        </Group>
      </Card>
      )
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
        isLoading={isLoading}
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
            onChange={(value) => handleFilterChange({ role: value })}
          />
          <MultiSelect
            data={[
              ...Object.values(queuesSimplified).map((queue) => ({
                label: queue,
                value: queue
              }))
            ]}
            searchable
            clearable
            withCheckIcon
            placeholder={gameModes.length ? "" : "All Game Modes"}
            value={gameModes}
            onChange={(value) => handleFilterChange({ gameMode: value })}
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
            placeholder={championIds.length ? "" : "All Champions"}
            onChange={(value) => handleFilterChange({ championId: value.map(id => parseInt(id)) })}
          />
          <MultiSelect
            data={[
              ...tagsList.map((tag) => ({
                label: tag.text,
                value: tag.key
              }))
            ]}
            searchable
            clearable
            withCheckIcon
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
        <MatchListShow/>
      </Stack>
    </Container>
  );
}

export default Matches;