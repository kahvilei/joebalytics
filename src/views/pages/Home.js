import ShowSummonerList from "../partials/ShowSummonerList";
import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";
import ShowMatchList from "../partials/ShowMatchList";

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
        <section>
          <h2>Recent Matches</h2>
          <ShowMatchList count = {10}/>
          {/* //TODO: add pagination */}
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
