import { rootAddress } from "../../config/config";
import DropDown from "../components/DropDown";
import { useState } from "react";


function SummonerStats({ 
  stats, 
  filterOptions, 
  currentFilters, 
  onFilterChange 
}) {
  const {
    queueId: modeList = [],
    teamPosition: roleList = [],
    championId: champList = [],
  } = filterOptions;


  // Filter components remain mostly the same but use props instead of state
  const LimitFilter = () => {
    const [limit, setLimit] = useState(10);
    const [limitList, setLimitList] = useState([0]);
    let options = {};
    let key = 0;
    let max = 10;
    for (let limitNum of limitList) {
      if (limitNum !== "") {
        if (limitNum === limitList.slice(-1)[0]) {
          options[limitNum] = (
            <div key={key++} value={limitNum}>
              {" "}
              All games ({limitNum})
            </div>
          );
          max = limitNum;
        } else {
          options[limitNum] = (
            <div key={key++} value={limitNum}>
              Past {limitNum} games
            </div>
          );
        }
      }
    }

    let defaultLimit = options[limit] ? options[limit] : options[max];
    return (
      <DropDown
        label="Number of games"
        className="mode-filter"
        selectFunction={(value) => onFilterChange({ limit: value })}
        defaultValue={options[currentFilters.limit]}
        items={options}
      />
    );
  };

  const ModeFilter = () => {
    return (
      <DropDown
        label="Game Mode"
        className="mode-filter"
        selectFunction={(value) => onFilterChange({ queueId: value })}
        defaultValue={currentFilters.queueId}
        items={modeList}
      />
    );
  }

  const PositionFilter = () => {
    return (
      <DropDown
        label="Position"
        className="position-filter"
        selectFunction={(value) => onFilterChange({ role: value })}
        defaultValue={currentFilters.role}
        items={roleList}
      />
    );
  }

  const ChampFilter = () => {
    return (
      <DropDown
        label="Champion"
        className="champ-filter"
        selectFunction={(value) => onFilterChange({ championId: value })}
        defaultValue={currentFilters.championId}
        items={champList}
      />
    );
  }


  return (
    <div className="summoner-stats">
      <div className="filters">
        <LimitFilter />
        <ModeFilter />
        <PositionFilter />
        <ChampFilter />
        <div className="reset-filter" onClick={() => onFilterChange({
          role: 'any',
          championId: 'any',
          queueId: 'any',
          limit: 20
        })}>
          Reset Filters
        </div>
      </div>
      <div className="stats">
        <StatCard title="Win Rate" value={stats.win * 100} format="percentage" />
        <StatCard title="Avg. Vision Score" value={stats.visionScore} />
        <StatCard title="Vision per min." value={stats.visionScorePerMinute} />
        <StatCard title="Avg. KDA" value={stats.kda} />
        <StatCard title="Avg. Solo Kills" value={stats.soloKills} />
      </div>
    </div>
  );
}

function StatCard({ title, value, format = 'number' }) {
  const formattedValue = format === 'percentage' 
    ? `${value.toFixed(2)}%` 
    : value.toFixed(2);

  return (
    <div className="summoner-stat-card">
      <div className="title">{title}</div>
      <div className="stat">{formattedValue}</div>
    </div>
  );
}

export default SummonerStats;

