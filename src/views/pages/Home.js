
import ShowSummonerList from "../components/ShowSummonerList";
import ShowChallengeRanking from "../components/ShowChallengeRanking";

function Home() {


    return (
      <div className="home page">
        <div className="main-column">
        <h2>Challenges Ranking</h2>
        <ShowChallengeRanking />
        </div>
        <div className="side-column">
        <h2>Summoners</h2>
        <ShowSummonerList />
        </div>
  
      </div>
    );

}

export default Home;