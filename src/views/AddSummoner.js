import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AddSummoner = (props) => {
  // Define the state with useState hook
  const navigate = useNavigate();
  const [summoner, setSummoner] = useState({
    regionDisplay: "NA",
    name: "",
  });
  const [status, setStatus] = useState({
    message: "",
  });

  const onChange = (e) => {
    setSummoner({ ...summoner, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      let config = {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      };
      await axios.post(
        "/api/summoners/",
        summoner,
        config
      );
      setSummoner({
        regionDisplay: "NA",
        name: "",
      });
      navigate("/");
    } catch (err) {
      setStatus({
        message: err.response.data.msg,
      });
    }
  };

  return (
    <div className="CreateBook">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/" className="btn btn-outline-warning float-left">
              Show Summoners
            </Link>
          </div>
          <div className="col-md-8 m-auto">
            <h1 className="display-4 text-center">Add summoner</h1>
            <p className="lead text-center">Create new summoner</p>
            <div>{status.message}</div>
            <form noValidate onSubmit={onSubmit}>
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
              </div>
              <br />

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Summoner Name"
                  name="name"
                  className="form-control"
                  value={summoner.name}
                  onChange={onChange}
                />
              </div>

              <input
                type="submit"
                className="btn btn-outline-warning btn-block mt-4"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSummoner;
