import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../auth/auth";

import {rootAddress} from '../../config/config';

function Menu() {
  const [summoners, setSummoners] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  function toggleMenu() {
    let menu = document.getElementById("menu");
    let navButton = document.getElementById("nav-collapse");
    if (!menu.className.includes("active")) {
      menu.className = "menu active";
      navButton.className = "active";
    } else {
      menu.className = "menu";
      navButton.className = "";
    }
  }

  const toggleSubMenu = (e) => {
    let menuHead = e.currentTarget;
    let subMenu = menuHead.nextSibling;
    if (!subMenu.className.includes("active")) {
      subMenu.className = "subMenu active";
      menuHead.className = "menuHead active";
    } else {
      subMenu.className = "subMenu";
      menuHead.className = "menuHead";
    }
  }
  //creates a link to add a summoner page if the user is an admin
  const AddSummoner = () => {
    const auth = useAuth();
    if (auth.user && auth.admin) {
      return (
        <Link to={`/add-summoner`}>Add Summoner</Link>
      );
    }
    return '';
  }

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(rootAddress[process.env.NODE_ENV] + '/api/summoners')
      .then((res) => {
        setSummoners(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('Error from ShowSummonerList');
      });
  }, [setIsLoading]);

  const summonerList =
    summoners.length === 0
      ? ''
      : summoners.map((summoner, k) => <Link to = {"/summoner/"+summoner.regionURL+"/"+summoner.nameURL} summoner={summoner} key={k}>{summoner.name}</Link>);

  return (
    <div
      onClick={() => {
        toggleMenu();
      }}
      id="menu"
      className="menu"
    >
      <Link to={`/`}>Home</Link>
      <div className="menuItem">
        <div className="menuHead" onClick={(e) => {toggleSubMenu(e);}}>
          <div className="menuHeadText">Summoners</div>
          <div className="menuHeadArrow">&#9662;</div>
        </div>
        <div className="subMenu">
          {isLoading ? <div className="loading">Loading...</div> : ''}
          {summonerList}
        </div>
      </div>
      <Link to={`/matches`}>Matches</Link>
      <Link to={`/champions`}>Champions</Link>
      <AddSummoner></AddSummoner>
    </div>
  );
}

export default Menu;