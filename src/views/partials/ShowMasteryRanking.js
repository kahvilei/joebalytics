
import MasteryCard from '../components/MasteryCard';


function ShowMasteryRanking({ masteries }) {
  return (
    <div className="mastery-ranking">
      <div className="list">
        {masteries.map((mastery, k) => (
          <MasteryCard 
            mastery={mastery} 
            key={k} 
            rank={k + 1}
          />
        ))}
      </div>
    </div>
  );
}

export default ShowMasteryRanking;