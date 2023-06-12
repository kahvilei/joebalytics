import React, { useState } from "react";

function DropDown(props) {
  const [currentItem, setCurrentItem] = useState(props.defaultValue);
  const [currentSearch, setCurrentSearch] = useState("");

  let label = "";
  if (props.label) {
    label = props.label;
  }

  let isSearchable = false;

  if (Object.keys(props.items).length > 10) {
    isSearchable = true;
  }

  let isList = true;

  const mappedList = (list) => {
    let mappedList = {};
    let count = Object.keys(list).length;
    if (count === 0 || count === 1) {
      mappedList = "";
      isList = false;
    } else {
      mappedList = Object.entries(list).map((item, k) => {
        if (currentItem) {
          if (isSearchable) {
            if (item[1].props.children.toLowerCase().includes(currentSearch.toLowerCase())) {
              return (
                <div
                  className="item"
                  onClick={() => currentUpdate(item[1])}
                  key={k}
                >
                  {item[1]}
                </div>
              );
            }
          } else {
            if (item[1].props.value === currentItem.props.value) {
            } else {
              return (
                <div
                  className="item"
                  onClick={() => currentUpdate(item[1])}
                  key={k}
                >
                  {item[1]}
                </div>
              );
            }
          }
        } else {
        }
      });
    }
    return mappedList;
  };

  const [items, setItems] = useState(mappedList(props.items));
  const currentUpdate = (item) => {
    setCurrentItem(item);
    props.selectFunction(item.props.value);
  };

  const toggleDrop = (e) => {
    let dropHead = e.currentTarget;
    let dropMenu = dropHead.nextSibling;
    if (!dropMenu.className.includes("active")) {
      dropMenu.className = "list active";
      dropHead.className = "current active";
    } else {
      dropMenu.className = "list";
      dropHead.className = "current";
    }
  };

  const setSearchValue = (e) => {
    let search = e.currentTarget.innerText;
    setCurrentSearch(search);
    setItems(mappedList(props.items));
  }

  if (isSearchable) {
    return (
      <div className={"dropDown-wrap " + (isList ? "list" : "not-list")}>
        <div className="dropDown-label info-blue">{label}</div>
        <div tabIndex="0" className="dropDown">
          <div contentEditable = "true" onKeyUp={(e) => setSearchValue(e)} className="search" type="text"></div>
          <div className="current">
            {currentItem}
            <div className="arrow">&#9656;</div>
          </div>
          <div className="list">{items}</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={"dropDown-wrap " + (isList ? "list" : "not-list")}>
        <div className="dropDown-label info-blue">{label}</div>
        <div tabIndex="0" className="dropDown">
          <div onClick={toggleDrop} className="current">
            {currentItem}
            <div className="arrow">&#9656;</div>
          </div>
          <div className="list">{items}</div>
        </div>
      </div>
    );
  }
}

export default DropDown;
