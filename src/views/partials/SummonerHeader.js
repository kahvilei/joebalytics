import {rootAddress} from '../../config/config';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import { useAuth } from "../../auth/auth";
import { getSummonerIcon } from "../../utils/riotCDN";
import LoadingCircle from "../components/LoadingCircle";
import SummonerStats from "./SummonerStats";

function SummonerHeader(props) {
  const [summoner, setSummoner] = useState({});
  const [isLoading, setIsLoading] = useState([]);
  const [isUpdating, setIsUpdating] = useState([]);

  const { region, name } = useParams();
  const navigate = useNavigate();

  let auth = useAuth();

  let tier = "unranked";
  let rank = "";
  if(summoner.rankedData){
    if (summoner.rankedData[0] != undefined) {
      if (summoner.rankedData[0].tier){
        tier = summoner.rankedData[0].tier.toLowerCase();
        rank = summoner.rankedData[0].rank;
      }else if(summoner.rankedData[1]){
        if(summoner.rankedData[1] != undefined){
        tier = summoner.rankedData[1].tier.toLowerCase();
        rank = summoner.rankedData[1].rank;
      }
    }
  }
  
  }

  var timeStamp = summoner.lastUpdated;
  var dateFormat = new Date(timeStamp);
  let amercianHours = dateFormat.toLocaleString([], {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  var lastUpdate = amercianHours;

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/summoners/${region}/${name}`)
      .then((res) => {
        setSummoner(res.data);
        setIsLoading(false);
        setIsUpdating(false);
      })
      .catch((err) => {
        console.log("Error from SummonerDetails");
      });
  }, [name, region]);

  const onDeleteClick = async (id) => {
    try {
      await axios.delete(rootAddress[process.env.NODE_ENV] + `/api/summoners/${summoner._id}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });
      navigate("/");
    } catch (err) {
      navigate("/login");
    }
  };
  const onUpdateClick = (id) => {
    setIsUpdating(true);
    axios
      .put(rootAddress[process.env.NODE_ENV] + `/api/summoners/${summoner._id}`)
      .then((res) => {
        axios
          .get(rootAddress[process.env.NODE_ENV] + `/api/summoners/${summoner._id}`)
          .then((res) => {
            setSummoner(res.data);
            setIsUpdating(false);
          })
          .catch((err) => {
            console.log("Error from SummonerDetails");
          });
      })
      .catch((err) => {
        console.log("Error in UpdateSummonerInfo!");
      });
  };

  function Update() {
    if (auth.user) {
      if (isUpdating) {
        return (
          <div className="delete-update-butt">
            <div className="pre-text">Updating...</div>
            <div className="update">
              <button className="button">
                <LoadingCircle color={"dark"} size = {"small"} aspectRatio={"square"} />
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="delete-update-butt">
            <div className="pre-text">Last update: {lastUpdate}</div>
            <div className="update">
              <button
                type="button"
                className="button"
                onClick={() => {
                  onUpdateClick(summoner._id);
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        );
      }
    }
  }

  function Delete() {
    if (auth.user.admin) {
      return (
        <div className="delete-update-butt">
          <div className="delete">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                onDeleteClick(summoner._id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      );
    }
  }

  if (isLoading) {
    return (
      <div className="summoner-header">
        <LoadingCircle color={"dark"} aspectRatio={"short-rectangle"} />
      </div>
    );
  } else {
    return (
      <div className="summoner-header">
        <div className="summoner-header-inner-wrap">
          <div className="summoner-icon">
            <img
              alt="summoner icon"
              src={getSummonerIcon(summoner.profileIconId)}
            ></img>
          </div>
          <div className="desc">
            <div className="name-and-rank">
              <div className="name-and-level">
                <h1 className="summoner-name">{summoner.name}</h1>
                <div className="summoner-level">
                  Level {summoner.summonerLevel}
                </div>
              </div>
              <Update />
              <Delete />
            </div>
            <SummonerStats/> 
          </div>
        </div>
      </div>
    );
  }
}

export default SummonerHeader;
