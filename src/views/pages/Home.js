import ShowSummonerList from "../components/ShowSummonerList";
import ShowChallengeRanking from "../components/ShowChallengeRanking";
import ShowMasteryRanking from "../components/ShowMasteryRanking";

function Home() {
  return (
    <div className="home page">
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
