import { rootAddress } from "../../config/config";
import { useGameData } from "../../context/DataContext";
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

  const { queueId: mode, teamPosition: role, championId: champ } = currentFilters;
  const { getQueueName, getRoleName, getChampName, getChampIcon } = useGameData();


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
    let options = {};
    let key = 0;

    options[0] = (
      <div key={key++} value={'any'}>
        All game modes
      </div>
    );

    for (let modeId of modeList) {

        options[modeId] = (
          <div key={key++} value={modeId}>
            {getQueueName(modeId)}
          </div>
        );
  
    }

    let defaultMode = options[mode] ? options[mode] : options[0];
    return (
      <DropDown
        label="Game Mode"
        className="mode-filter"
        selectFunction={(value) => onFilterChange({ queueId: value })}
        defaultValue={defaultMode}
        items={options}
      />
    );
  }

  const PositionFilter = () => {
    let options = {};
    let key = 0;
    options[0] = (
      <div key={key++} value={'any'}>
        All roles
      </div>
    );
    for (let roleId of roleList) {
      if (roleId !== "") {
        if (roleId === "any") {
          options[0] = (
            <div key={key++} value={roleId}>
              All roles
            </div>
          );
        } else {
          options[roleId] = (
            <div key={key++} value={roleId}>
              {getRoleName(roleId)}
            </div>
          );
        }
      }
    }

    let defaultRole = options[role] ? options[role] : options[0];
    return (
      <DropDown
        label="Position"
        className="position-filter"
        selectFunction={(value) => onFilterChange({ role: value })}
        defaultValue={defaultRole}
        items={options}
      />
    );
  }

  const ChampFilter = () => {
    let options = {};
    let key = 0;

    options[0] = (
      <div key={key++} value={'any'}>
        All champions
      </div>
    );
    
    for (let champId of champList) {
      if (champId !== "") {
        
          options[getChampName(champId)] = (
            <div className="champ-listing" key={key++} value={champId}>
               <div className='icon'><img alt = {getChampName(champId) + " icon"} src = {getChampIcon(champId)}></img></div>
              <div>{getChampName(champId)}</div>
            </div>
          );
        
      }
    }

    let defaultChamp = options[getChampName(champ)]
      ? options[getChampName(champ)]
      : options[0];

    return (
      <DropDown
        label="Champion"
        className="champ-filter"
        selectFunction={(value) => onFilterChange({ championId: value })}
        defaultValue={defaultChamp}
        items={options}
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
        <StatCard title="Vision per min." value={stats["challenges/visionScorePerMinute"]} />
        <StatCard title="Avg. KDA" value={stats["challenges/kda"]} />
        <StatCard title="Avg. Solo Kills" value={stats["challenges/soloKills"]} />
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

