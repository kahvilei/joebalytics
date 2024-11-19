import SummonerCard from '../components/SummonerCard';


function ShowSummonerList({ summoners }) {
  return (
    <div className="ShowSummonerList">
      <div className="list">
        {summoners.map((summoner, k) => (
          <SummonerCard 
            summoner={summoner} 
            key={k} 
          />
        ))}
      </div>
    </div>
  );
}

export default ShowSummonerList;