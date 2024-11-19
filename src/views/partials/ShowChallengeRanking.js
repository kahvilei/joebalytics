import ChallengeCard from "../components/ChallengeCard";


function ShowChallengeRanking({ challenges }) {
  return (
    <div className="challenge-ranking">
      <div className="list">
        {challenges
          .filter(challenge => challenge.level !== "NONE" && parseInt(challenge.challengeId) > 5)
          .map((challenge, k) => (
            <ChallengeCard
              challenge={challenge}
              key={k}
              rank={k + 1}
            />
          ))}
      </div>
    </div>
  );
}

export default ShowChallengeRanking;
