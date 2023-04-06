import ShowSummonerList from "../partials/ShowSummonerList";
import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";

function Home() {
  return (
    <div className="home page w-sidebar">
      <div className="main-column">
        <section>
          <h2>Challenges Ranking</h2>
          <ShowChallengeRanking count = {12}/>
        </section>
        <section>
          <h2>Champion Masteries</h2>
          <ShowMasteryRanking count = {8}/>
        </section>
      </div>
      <div className="side-column">
        <h2>Summoners</h2>
        <ShowSummonerList />
      </div>
    </div>
  );
}

export default Home;
