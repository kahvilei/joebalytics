import { rootAddress } from "../../config/config";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams} from "react-router-dom";

import axios from "axios";
import {
  getChampName,
  getRoleName,
  getQueueName,
  getChampIcon,
} from "../../utils/riotCDN";
import LoadingCircle from "../components/LoadingCircle";
import DropDown from "../components/DropDown";

const generateHeaders = (name, region, champ, role, mode, limit, stat, aggregation) => ({
  'X-Champ': champ,
  'X-Role': role,
  'X-Mode': mode,
  'X-Limit': limit,
  'X-Stats': JSON.stringify([{ stat, aggregation }]),
  'X-Region': region,
  'X-Name': name
});

const generateHeadersPreJson = (name, region, champ, role, mode, limit, stat) => ({
  'X-Champ': champ,
  'X-Role': role,
  'X-Mode': mode,
  'X-Limit': limit,
  'X-Stats': JSON.stringify(stat),
  'X-Region': region,
  'X-Name': name
});

function SummonerStats(props) {
  const [stats, setStats] = useState("no stats found");

  const [searchParams, setSearchParams] = useSearchParams({});

  const [mode, setMode] = useState(searchParams.get('mode')?searchParams.get('mode'):'any');
  const [modeList, setModeList] = useState(["any"]);

  const [role, setRole] = useState(searchParams.get('role')?searchParams.get('role'):'any');
  const [roleList, setRoleList] = useState(["any"]);

  const [champ, setChamp] = useState(parseInt(searchParams.get('champ'))?parseInt(searchParams.get('champ')):'any');
  const [champList, setChampList] = useState(["any"]);


  //used to set and determine how many games to limit stats results to.
  //limitlist contains a set available numbers to limit to, capping at the max games that exist
  const [limit, setLimit] = useState(10);
  const [limitList, setLimitList] = useState([0]);

  const [isLoading, setIsLoading] = useState(true);
  const [limitIsLoading, setLimitIsLoading] = useState(true);
  const [roleIsLoading, setRoleIsLoading] = useState(true);
  const [modeIsLoading, setModeIsLoading] = useState(true);
  const [champIsLoading, setChampIsLoading] = useState(true);

  let { region, name } = useParams();
  //if no region or name is provided, set to any
  if (region === undefined || name === undefined) {
    region = "any";
    name = "any";
  } else {
  }
  
  useEffect(() => {
    setIsLoading(true);
    setLimitIsLoading(true);
    setModeIsLoading(true);
    setRoleIsLoading(true);
    setChampIsLoading(true);
  
    const stats = [
      { stat: "matchId", aggregation: "any" },
      { stat: "queueId", aggregation: "unique" },
      { stat: "teamPosition", aggregation: "unique" },
      { stat: "championId", aggregation: "unique" },
    ];
  
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats`, { headers: generateHeadersPreJson(name, region, champ, role, mode, '10000', stats) })
      .then((res) => {
        let limits = [];
        let hardLimit = res.data["matchId"].length;
        if (hardLimit > 4 && hardLimit < 10) {
          limits.push(5);
        }
        if (hardLimit > 9) {
          limits.push(10);
        }
        if (hardLimit > 55) {
          limits.push(50);
        }
        if (hardLimit > 105) {
          limits.push(100);
        }
        if (hardLimit > 0) {
          limits.push(hardLimit);
        }
        setLimitList(limits);
        setModeList(res.data["queueId"]);
        setRoleList(res.data["teamPosition"]);
        setChampList(res.data["championId"]);
  
        setIsLoading(false);
        setLimitIsLoading(false);
        setModeIsLoading(false);
        setRoleIsLoading(false);
        setChampIsLoading(false);
      })
      .catch((err) => {
        setLimitList([0]);
        setModeList([]);
        setRoleList([]);
        setChampList([]);
  
        setIsLoading(false);
        setLimitIsLoading(false);
        setModeIsLoading(false);
        setRoleIsLoading(false);
        setChampIsLoading(false);
      });
  }, [champ, role, mode, limit, region, name]);

  const onLimitUpdate = (value) => {
    setLimit(value);
  };

  function LimitFilter() {
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
        dataLoading={limitIsLoading}
        label={"Number of games"}
        className="mode-filter"
        selectFunction={onLimitUpdate}
        defaultValue={defaultLimit}
        items={options}
      />
    );
  }

  const onPositionUpdate = (value) => {
    searchParams.set('role', value);
    setSearchParams(searchParams);
    setRole(value);
  };

  function PositionFilter() {
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
        dataLoading={roleIsLoading}
        label={"Role"}
        className="position-filter"
        selectFunction={onPositionUpdate}
        defaultValue={defaultRole}
        items={options}
      />
    );
  }

  const onChampUpdate = (value) => {
    searchParams.set('champ', value);
    setSearchParams(searchParams);
    setChamp(value);
  };

  function ChampFilter() {
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
        dataLoading={champIsLoading}
        searchable={true}
        label={"Champion"}
        className="champ-filter"
        selectFunction={onChampUpdate}
        defaultValue={defaultChamp}
        items={options}
        isAlphaOrder={true}
      />
    );
  }

  const onModeUpdate = (value) => {
    searchParams.set('mode', value);
    setSearchParams(searchParams);
    setMode(value);
  };

  function ModeFilter() {
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
        dataLoading={modeIsLoading}
        label={"Game mode"}
        className="mode-filter"
        selectFunction={onModeUpdate}
        defaultValue={defaultMode}
        items={options}
      />
    );
  }

  const onReset = (e) => {
    setSearchParams({});
    setRole('any');
    setMode('any');
    setChamp('any');
    setLimit(10);
  };

  function LoadingNotify() {
    if (isLoading) {
      return (
        <div className="filter-loading">
          <LoadingCircle color={"gold"} size={"small"} aspectRatio={"square"} />
        </div>
      );
    } else {
      return <div></div>;
    }
  }

  return (
    <div className="summoner-stats">
      <div className="filters">
        <LimitFilter />
        <ModeFilter />
        <PositionFilter />
        <ChampFilter />
        <div className="reset-filter" onClick={onReset}>
          Reset Filters
        </div>
        <LoadingNotify></LoadingNotify>
      </div>
      <div className="stats">
        <StatCard
          stat={"win"}
          title={"Win Rate"}
          display={"percentage"}
          aggr={"avg"}
          champ={champ}
          role={role}
          mode={mode}
          limit={limit}
          region={region}
          name={name}
        />
        <StatCard
          stat={"visionScore"}
          title={"Avg. Vision Score"}
          display={"average"}
          aggr={"avg"}
          champ={champ}
          role={role}
          mode={mode}
          limit={limit}
          region={region}
          name={name}
        />
        <StatCard
          stat={"challenges/visionScorePerMinute"}
          title={"Vision per min."}
          display={"average"}
          aggr={"avg"}
          champ={champ}
          role={role}
          mode={mode}
          limit={limit}
          region={region}
          name={name}
        />
        <StatCard
          stat={"challenges/kda"}
          title={"Avg. KDA"}
          display={"average"}
          aggr={"avg"}
          champ={champ}
          role={role}
          mode={mode}
          limit={limit}
          region={region}
          name={name}
        />
        <StatCard
          stat={"challenges/soloKills"}
          title={"Avg. Solo Kills"}
          display={"average"}
          aggr={"avg"}
          role={role}
          champ={champ}
          mode={mode}
          limit={limit}
          region={region}
          name={name}
        />
      </div>
    </div>
  );
}

function StatCard(props) {
  const [stat, setStat] = useState("no stats found");
  const statProp = props.stat;
  const aggregation = props.aggr?props.aggr:'sum';
  const champ = props.champ?props.champ:'any';
  const role = props.role?props.role:'any';
  const mode = props.mode?props.mode:'any';
  const limit = props.limit?props.limit:10;
  const region = props.region?props.region:'na';
  const name = props.name?props.name:'any';
  const [isLoading, setIsLoading] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats`, { 
        headers: generateHeaders(name, region, champ, role, mode, limit, statProp, aggregation) 
      })
      .then((res) => {
        let stat = res.data[statProp];
        if (stat === null) {
          stat = "incompatible data";
        }else{
          stat = stat.toFixed(2);
        }
        if (props.display === "percentage") {
          stat = (stat * 100).toFixed(2) + "%";
        }
        setStat(stat);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error from SummonerDetails");
      });
  }, [statProp, aggregation, champ, role, mode, limit, region, name]);

  if (isLoading) {
    return (
      <div className="summoner-stat-card">
        <LoadingCircle
          color={"gold"}
          size={"small"}
          aspectRatio={"short-rectangle"}
        />
      </div>
    );
  } else {
    return (
      <div className="summoner-stat-card">
        <div className="title">{props.title}</div>
        <div className="stat">{stat}</div>
      </div>
    );
  }
}

export default SummonerStats;