import MatchCard from "../components/MatchCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { useEffect, useState } from "react";


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
    <div className="match-list-wrapper">
      <div className="match-list">
        <div className="list">
          {matches.map((match, k) => (
            <MatchCard match={match} key={k} focusedSummoners={focusedSummoners} />
          ))}
        </div>
      </div>
      {isLoading && <SkeletonLoader />}
    </div>
  );
}

export default ShowMatchList;