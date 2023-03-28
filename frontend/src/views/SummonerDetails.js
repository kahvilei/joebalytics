import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../App.css";
import axios from "axios";
import { useAuth } from "../auth/auth";

function SummonerDetails(props) {
  const [summoner, setSummoner] = useState({});

  const { region, name } = useParams();
  const navigate = useNavigate();

  let auth = useAuth();

  var timeStamp = summoner.lastUpdated;
  var dateFormat = new Date(timeStamp);
  let amercianHours = dateFormat.getHours();
  if (amercianHours > 12) {
    amercianHours -= 12;
  }

  var lastUpdate =
    "Last Updated: " +
    (dateFormat.getMonth() + 1) +
    "/" +
    dateFormat.getDate() +
    "/" +
    dateFormat.getFullYear() +
    " " +
    amercianHours +
    ":" +
    dateFormat.getMinutes();

  useEffect(() => {
    axios
      .get(`http://localhost:8082/api/summoners/${region}/${name}`)
      .then((res) => {
        setSummoner(res.data);
      })
      .catch((err) => {
        console.log("Error from SummonerDetails");
      });
  }, [summoner._id]);

  const onDeleteClick = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8082/api/summoners/${summoner._id}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
      navigate("/");
    } catch (err) {
      navigate("/login");
    }
  };
  const onUpdateClick = (id) => {
    axios
      .put(`http://localhost:8082/api/summoners/${summoner._id}`)
      .then((res) => {
        axios
          .get(`http://localhost:8082/api/summoners/${summoner._id}`)
          .then((res) => {
            setSummoner(res.data);
          })
          .catch((err) => {
            console.log("Error from SummonerDetails");
          });
      })
      .catch((err) => {
        console.log("Error in UpdateSummonerInfo!");
      });
  };

  const SummonerItem = (
    <div>
      <table className="table table-hover table-dark">
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Name</td>
            <td>{summoner.name}</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Level</td>
            <td>{summoner.summonerLevel}</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Region</td>
            <td>{summoner.regionDisplay}</td>
          </tr>
          <tr>
            <th scope="row">4</th>
            <td>Icon</td>
            <td>{summoner.profileIconId}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  function Options (){
    if(auth.user){
      return (
        <div>
        <div className="col-md-6 m-auto">
        <button
          type="button"
          className="btn btn-outline-danger btn-lg btn-block"
          onClick={() => {
            onDeleteClick(summoner._id);
          }}
        >
          Delete Summoner
        </button>
      </div>
      <div className="col-md-6 m-auto">
        <button
          type="button"
          className="btn btn-outline-danger btn-lg btn-block"
          onClick={() => {
            onUpdateClick(summoner._id);
          }}
        >
          Update Summoner
        </button>
        
      </div>
      </div>
      )
    }
   
  }

  return (
    <div className="SummonerDetails">
      <div className="container">
        <div className="row">
          <div className="col-md-10 m-auto">
            <br /> <br />
            <Link to="/" className="btn btn-outline-warning float-left">
              Show Summoner List
            </Link>
          </div>
          <br />
          <div className="col-md-8 m-auto">
            <h1 className="display-4 text-center">Summoner's Record</h1>
            <p className="lead text-center">View Summoner's Info</p>
            <hr /> <br />
          </div>
          <div className="col-md-10 m-auto">{SummonerItem}</div>
          <Options></Options>
          <div>{lastUpdate}</div>
        </div>
      </div>
    </div>
  );
}

export default SummonerDetails;
