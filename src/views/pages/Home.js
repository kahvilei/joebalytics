import ShowSummonerList from "../partials/ShowSummonerList";
import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";
import ShowMatchList from "../partials/ShowMatchList";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home page w-sidebar">
      <div className="main-column">
      <section>
          <h2>Recent Matches</h2>
          <ShowMatchList infiniteScroll={false} count = {5}/>
          <Link className="button" to={`/matches`}>See all matches</Link>
        </section>
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
      <section>
        <h2>Summoners</h2>
        <ShowSummonerList />
      </section>
      </div>
    </div>
  );
}

export default Home;
