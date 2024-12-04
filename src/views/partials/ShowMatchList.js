import { useEffect, useState } from "react";
import { Card, Container, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import MatchCard from "../components/MatchCard";

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
    <Stack spacing="md">
        {matches.map((match, k) => (
          <MatchCard match={match} key={k} focusedSummoners={focusedSummoners} />
        ))}
      {isLoading && 
        <Card shadow="xs" padding="xl" radius="lg">
          <Group align="center" justify="center">
            <Loader type='bars' />
          </Group>
        </Card>
      }
    </Stack>
  );
}

export default ShowMatchList;