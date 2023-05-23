import {rootAddress} from '../../config/config';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import { useAuth } from "../../auth/auth";
import { getSummonerIcon, getQueueName } from "../../utils/riotCDN";
import LoadingCircle from "../components/LoadingCircle";

function SummonerStats(props) {
  const [stats, setStats] = useState('no stats found');
  const [mode, setMode] = useState('any');
  const [modeList, setModeList] = useState(['any']);

  const [role, setRole] = useState('any');
  const [roleList, setRoleList] = useState(['any']);

  const [champ, setChamp] = useState('any');
  const [limit, setLimit] = useState(20);

  const [isLoading, setIsLoading] = useState([]);

  const { region, name } = useParams();


  useEffect(() => {
 
    setIsLoading(true);
    //get list of modes played, returns queue IDs
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/${role}/any/queueId/1000/unique/${region}/${name}`)
      .then((res) => {
        res.data.push('any');
        setModeList(res.data); 
        
      })
      .catch((err) => {
        setModeList(['any']); 
        
        console.log("Error from SummonerDetails");
      });
      axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/any/${mode}/teamPosition/1000/unique/${region}/${name}`)
      .then((res) => {
        res.data.push('any');
        setRoleList(res.data); 
        setIsLoading(false);
      })
      .catch((err) => {
        setRoleList(['any']); 
        setIsLoading(false);
        console.log("Error from SummonerDetails");
      });
  }, [champ, role, mode, limit, region, name]);
   


  const onLimitUpdate = (e) => {
    setLimit(e.target.value);
  };

  function LimitFilter(){
    return(
        <select  onChange={onLimitUpdate} value={limit}>
            <option value='10' >10</option>
            <option value='20' >20</option>
            <option value='50' >50</option>
        </select>
    );
  }

  const onPositionUpdate = (e) => {
    setRole(e.target.value);
  };

  function PositionFilter(){
    let options = [];
    for (let roleId of roleList){
      if(roleId !== ''){
        options.push(<option value={roleId} >{roleId}</option>);
      }
    }
    return(
        <select  onChange={onPositionUpdate} value={role}>
            {options}
        </select>
    );
  }

  const onModeUpdate = (e) => {
    setMode(e.target.value);
  };

  function ModeFilter(){
    let options = [];
    for (let modeId of modeList){
      options.push(<option value={modeId} >{getQueueName(modeId)}</option>);
    }
    return(
        <select  onChange={onModeUpdate} value={mode}>
            {options}
        </select>
    );
  }

    return (
      <div className="summoner-stats">
        <div className="filters">
            <LimitFilter />
            <ModeFilter />
            <PositionFilter />
        </div>
        <div className="stats">
            <StatCard stat = {"win"} title = {"Win Rate"} display = {"percentage"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"visionScore"} title = {"Avg. Vision Score"} display = {"average"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"challenges/visionScorePerMinute"} title = {"Vision per min."} display = {"average"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"challenges/kda"} title = {"Avg. KDA"} display = {"average"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"challenges/soloKills"} title = {"Avg. Solo Kills"} display = {"average"} aggr = {"avg"} role = {role} champ = {champ} mode = {mode} limit = {limit} region = {region} name = {name}/>
        </div>
      </div>
    );
}

function StatCard(props){
  const [stat, setStat] = useState('no stats found');
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
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/${role}/${mode}/${statProp}/${limit}/${aggregation}/${region}/${name}`)
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
       <LoadingCircle color={"gold"} size = {"small"} aspectRatio={"short-rectangle"} />
     </div>
   );
 } else {
   return (
     <div className="summoner-stat-card">
      <div className="title">
           {props.title}
       </div>
       <div className="stat">
           {stat.toFixed(2)}
       </div>
     </div>
   );
 }
 }



export default SummonerStats;
