import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";


import SummonerHeader from "../partials/SummonerHeader";
import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";
import ShowMatchList from "../partials/ShowMatchList";

function SummonerDetails(props) {
  const { region, name, champ, mode, role, page } = useParams();

  function SubPage() {
    if(page === 'challenges'){
      return(
        <section>
        <h2>Challenges</h2>
        <ShowChallengeRanking mode = {'listing'} count={1000} />
      </section>
      );
       
      }else if(page === 'mastery'){
        return(
        <section>
          <h2>Champion Masteries</h2>
          <ShowMasteryRanking count={1000} />
        </section>
        );
      }else {
        return(
        <section>
          <h2>Match History</h2>
          <ShowMatchList champ = {champ} mode = {mode} role = {role}/>
        </section>
        );
      }
    }
  

 
  return (
    <div className="summoner page">
      <section className="full-width">
        <SummonerHeader name={name} region={region} />
      </section>
      <section className={`summoner-nav ${page}`}>
        <Link id = {'matches'} to={`../summoner/${region}/${name}`}>Matches</Link>
        <Link id = {'challenges'} to={`../summoner/${region}/${name}/challenges`}>Challenges</Link>
        <Link id = {'mastery'} to={`../summoner/${region}/${name}/mastery`}>Mastery</Link>
      </section>
      <SubPage/>
    </div>
  );
}

export default SummonerDetails;
