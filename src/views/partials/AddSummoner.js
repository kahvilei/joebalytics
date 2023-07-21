import {rootAddress} from '../../config/config';

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

//import loading circle
import LoadingCircle from "../components/LoadingCircle";

const AddSummoner = (props) => {
  // Define the state with useState hook
  const navigate = useNavigate();
  const [summoner, setSummoner] = useState({
    regionDisplay: "NA",
    name: "",
  });
  const [status, setStatus] = useState({
    message: "",
    type: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  function showLoading() {
    // If isLoading is true, return the LoadingCircle component in small gold circle form. Otherwise, return null.
    if (isLoading) {
      return <LoadingCircle size = {"small"} color = {"gold"}/>;
    }
  }

  const onChange = (e) => {
    setSummoner({ ...summoner, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({
      message: "",
      type: "",
    });

    try {
      let config = {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      };
      await axios.post(
        rootAddress[process.env.NODE_ENV] + "/api/summoners/",
        summoner,
        config
      );
      setSummoner({
        regionDisplay: "NA",
        name: "",
      });
      setStatus({
        message: "Summoner added successfully",
        type: "success",
      });
      setIsLoading(false);

    } catch (err) {
      setStatus({
        message: err.response.data.msg,
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="add-summoner-page">
            <h2>Add summoner</h2>
            <form className='add-summoner-form'noValidate onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="regionDisplay">Region:</label>
                <select
                  value={summoner.regionDisplay}
                  onChange={onChange}
                  name="regionDisplay"
                  id="regionDisplay"
                  placeholder="Region"
                >
                  <option value="NA">NA</option>
                  <option value="KR">KR</option>
                  <option value="EUW">EUW</option>
                </select>
                <input
                  type="text"
                  placeholder="Summoner Name"
                  name="name"
                  className="form-control"
                  value={summoner.name}
                  onChange={onChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline-warning btn-block mt-4"
              >Create</button>
              {showLoading()}
              <div className={ status.type + '-text' }>{status.message}</div>
            </form>
            <div className="form-disclaimer">
              Adding a new summoner can take up to 5 minutes, depending on the amount of matches that need to be added to the database.
              </div>
        </div>

  );
};

export default AddSummoner;
