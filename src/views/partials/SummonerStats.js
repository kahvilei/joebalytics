import { rootAddress } from "../../config/config";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import {
  getChampName,
  getRoleName,
  getQueueName,
  getChampIcon,
} from "../../utils/riotCDN";
import LoadingCircle from "../components/LoadingCircle";
import DropDown from "../components/DropDown";

function SummonerStats(props) {
  const [stats, setStats] = useState("no stats found");

  const [mode, setMode] = useState("any");
  const [modeList, setModeList] = useState(["any"]);

  const [role, setRole] = useState("any");
  const [roleList, setRoleList] = useState(["any"]);

  const [champ, setChamp] = useState("any");
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

  const { region, name } = useParams();

  useEffect(() => {
    setIsLoading(true);
    setLimitIsLoading(true);
    //get number of games that fit current selection
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/stats/${champ}/${role}/${mode}/queueId/10000/any/${region}/${name}`
      )
      .then((res) => {
        let limits = [];
        let hardLimit = res.data.length;
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
        setIsLoading(false);
        setLimitIsLoading(false);
      })
      .catch((err) => {
        setLimitList([0]);
        setIsLoading(false);
        console.log("Error from SummonerDetails");
      });
  }, [champ, role, mode, region, name]);

  useEffect(() => {
    //get list of modes played, returns queue IDs
    setModeIsLoading(true);
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/stats/${champ}/${role}/any/queueId/${limit}/unique/${region}/${name}`
      )
      .then((res) => {
        res.data.push("any");
        setModeList(res.data);
        setModeIsLoading(false);
      })
      .catch((err) => {
        setModeList(["any"]);

        console.log("Error from SummonerDetails");
      });
  }, [champ, role, limit, region, name]);

  useEffect(() => {
    //get list of roles played, returns role IDs
    setRoleIsLoading(true);
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/stats/${champ}/any/${mode}/teamPosition/${limit}/unique/${region}/${name}`
      )
      .then((res) => {
        res.data.push("any");
        setRoleList(res.data);
        setRoleIsLoading(false);
      })
      .catch((err) => {
        setRoleList(["any"]);
        console.log("Error from SummonerDetails");
      });
  }, [champ, mode, limit, region, name]);

  useEffect(() => {
    //get list of champs played, returns champ IDs
    setChampIsLoading(true);
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/stats/any/${role}/${mode}/championId/${limit}/unique/${region}/${name}`
      )
      .then((res) => {
        res.data.push("any");
        setChampList(res.data);
        setChampIsLoading(false);
      })
      .catch((err) => {
        setChampList(["any"]);

        console.log("Error from SummonerDetails");
      });
  }, [role, mode, limit, region, name]);

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
    setRole(value);
  };

  function PositionFilter() {
    let options = {};
    let key = 0;
    for (let roleId of roleList) {
      if (roleId !== "") {
        if (roleId === "any") {
          options[roleId] = (
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

    let defaultRole = options[role] ? options[role] : options["any"];

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
    setChamp(value);
  };

  function ChampFilter() {
    let options = {};
    let key = 0;
    for (let champId of champList) {
      if (champId !== "") {
        if (champId === "any") {
          options[0] = (
            <div key={key++} value={champId}>
              All champions
            </div>
          );
        } else {
          options[getChampName(champId)] = (
            <div className="champ-listing" key={key++} value={champId}>
               <div className='icon'><img alt = {getChampName(champId) + " icon"} src = {getChampIcon(champId)}></img></div>
              <div>{getChampName(champId)}</div>
            </div>
          );
        }
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
    setMode(value);
  };

  function ModeFilter() {
    let options = {};
    let key = 0;
    for (let modeId of modeList) {
      if (modeId === "any") {
        options[modeId] = (
          <div key={key++} value={modeId}>
            All game modes
          </div>
        );
      } else {
        options[modeId] = (
          <div key={key++} value={modeId}>
            {getQueueName(modeId)}
          </div>
        );
      }
    }

    let defaultMode = options[mode] ? options[mode] : options["any"];

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
    setMode("any");
    setRole("any");
    setChamp("any");
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
        <a className="reset-filter" href="#" onClick={onReset}>
          Reset Filters
        </a>
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
  const aggregation = props.aggr;
  const champ = props.champ;
  const role = props.role;
  const mode = props.mode;
  const limit = props.limit;
  const region = props.region;
  const name = props.name;
  const [isLoading, setIsLoading] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/stats/${champ}/${role}/${mode}/${statProp}/${limit}/${aggregation}/${region}/${name}`
      )
      .then((res) => {
        setStat(res.data);
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
        <div className="stat">{stat.toFixed(2)}</div>
      </div>
    );
  }
}

export default SummonerStats;
