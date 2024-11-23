import { useEffect, useState } from "react";
import { Container, Loader, ScrollArea, Stack } from '@mantine/core';
import MatchCard from "../components/MatchCard";

function ShowMatchList({ matches, onLoadMore, infiniteScroll, focusedSummoners }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!infiniteScroll || isLoading ) return;
    function loadMore() {
      onLoadMore().finally(() => setIsLoading(false)).catch(() => setIsLoading(false));
    }

    function handleScroll() {  
      if (isLoading) return;
      const scrolledToBottom = 
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 2;

      if (scrolledToBottom) {
        setIsLoading(true);
        loadMore();
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll, isLoading, onLoadMore]);

  return (
    <Stack spacing="md">
        {matches.map((match, k) => (
          <MatchCard match={match} key={k} focusedSummoners={focusedSummoners} />
        ))}
      {isLoading && <Loader />}
    </Stack>
  );
}

export default ShowMatchList;