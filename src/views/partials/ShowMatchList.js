import MatchCard from "../components/MatchCard";

function ShowMatchList({ matches, focusedSummoners }) {
  return (
    <div className="match-list-wrapper">
      <div className="match-list">
        <div className="list">
          {matches.map((match, k) => (
            <MatchCard
              focusedSummoners={focusedSummoners}
              match={match}
              key={k}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShowMatchList;
