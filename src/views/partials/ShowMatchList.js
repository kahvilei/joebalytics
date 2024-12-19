import { useEffect } from "react";
import { Stack } from '@mantine/core';
import MatchCard from "../components/MatchCard";
import MatchCardLoad from "../components/MarchCardLoad";

function ShowMatchList({ matches, onLoadMore, isLoading, infiniteScroll, focusedSummoners }) {

  useEffect(() => {
    if (!infiniteScroll || isLoading ) return;

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

  return (
    <Stack spacing="md" p="0rem 0rem 300px 0rem">
        {matches.map((match, k) => (
          <MatchCard match={match} key={k} focusedSummoners={focusedSummoners} />
        ))}
      {isLoading && 
        <MatchCardLoad />
      }
    </Stack>
  );
}

export default ShowMatchList;