import { useEffect, memo } from 'react';
import { Stack, Text } from '@mantine/core';
import MatchCard from "../components/MatchCard";
import MatchCardLoad from "../components/MarchCardLoad";


function ShowMatchList({ matches, onLoadMore, isLoading, infiniteScroll, focusedSummoners, hasMoreMatches }) {

  useEffect(() => {
    if (!infiniteScroll || isLoading) return;

    function handleScroll() {
      if (isLoading) return;
      const scrolledToBottom =
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 2;

      if (scrolledToBottom) {
        onLoadMore();
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll, isLoading, onLoadMore]);

  // Memoize the match list rendering logic
  const NoMoreMatches = memo(() => (
    <Text align="center" size="sm" weight={500} c="dimmed" fs={'italic'}>
      No more matches to show
    </Text>
  ));

  return (
    <Stack spacing="md" p="0px 0px 100px 0px">
      {matches.map((match, k) => (
        <MatchCard match={match} key={k} focusedSummoners={focusedSummoners} />
      ))}
      {isLoading &&
        <MatchCardLoad />
      }
      {!hasMoreMatches &&
        <NoMoreMatches />
      }
    </Stack>
  );
}

export default ShowMatchList;