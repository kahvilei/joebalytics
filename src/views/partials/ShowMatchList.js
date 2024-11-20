import { useEffect, useState } from "react";
import { Container, Loader, ScrollArea } from '@mantine/core';
import MatchCard from "../components/MatchCard";

function ShowMatchList({ matches, onLoadMore, infiniteScroll, focusedSummoners }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!infiniteScroll) return;

    function handleScroll() {
      if (isLoading) return;

      const scrolledToBottom = 
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 2;

      if (scrolledToBottom) {
        setIsLoading(true);
        onLoadMore().finally(() => setIsLoading(false));
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll, isLoading, onLoadMore]);

  return (
    <Container>
      <ScrollArea>
        {matches.map((match, k) => (
          <MatchCard match={match} key={k} focusedSummoners={focusedSummoners} />
        ))}
      </ScrollArea>
      {isLoading && <Loader />}
    </Container>
  );
}

export default ShowMatchList;