import React, { useState, useEffect } from "react";

function DropDown(props) {
  const [dataLoading, setDataLoading] = useState(props.dataLoading);

  const [currentItem, setCurrentItem] = useState(props.defaultValue);
  // const defaultItem = props.defaultValue;
  const isAlphaOrder = props.isAlphaOrder;

  const [itemCount, setItemCount] = useState(0);
  const [currentSearch, setCurrentSearch] = useState("");
  const [cursor, setCursor] = useState(0);

  const selectFunction = props.selectFunction;

  let label = "";
  if (props.label) {
    label = props.label;
  }

  let isSearchable = false;

  if (Object.keys(props.items).length > 10) {
    isSearchable = true;
  }

  const [isList, setIsList] = useState(true);

  const [items, setItems] = useState();

  useEffect(() => {
    let mappedList = [];
    let count = Object.keys(props.items).length;
    let listToMap = Object.entries(props.items);
    if (isAlphaOrder) {
      listToMap = Object.entries(props.items).sort();
    }
    let counter = 0;
    if (count === 0 || count === 1 || dataLoading) {
      mappedList = "";
      setIsList(false);
    } else {
      listToMap.map((item, k) => {
        if (currentItem) {
          let cursorState = counter === cursor ? "cursor" : "";
          if (isSearchable) {
            let text = item[1].props.children;
            if(typeof text !== 'string'){
              text = reduceObjToString(text, "");
            }
            if (
              text
                .toLowerCase()
                .includes(currentSearch.toLowerCase())
            ) {
              mappedList[counter] = (
                <div
                  className={"item " + cursorState}
                  onClick={() => currentUpdate(item[1])}
                  key={k}
                >
                  {item[1]}
                </div>
              );
              counter++;
            }
          } else {
            if (item[1].props.value === currentItem.props.value) {
            } else {
              mappedList[counter] = (
                <div
                  className={"item " + cursorState}
                  onClick={() => currentUpdate(item[1])}
                  key={k}
                >
                  {item[1]}
                </div>
              );
              counter++;
            }
          }
        } else {
        }
      });
    }
    setItemCount(counter + 1);
    setItems(mappedList);
  }, [
    currentItem,
    currentSearch,
    cursor,
    isSearchable,
    props.items,
    dataLoading,
  ]);

  const reduceObjToString = (obj, agr) => {
    if(Array.isArray(obj)){
      let returnString = "";
      for(let item of obj){
        returnString += reduceObjToString(item.props.children, agr);
      }
      return returnString;
    }else if(typeof obj === 'object' ){
      let returnString = "";
      return returnString;
    }else{
      return agr + obj;
    }
  }

  const currentUpdate = (item) => {
    setCurrentItem(item);
    selectFunction(item.props.value);
  };

  const toggleDrop = (e) => {
    let dropHead = e.currentTarget;
    let dropMenu = e.currentTarget;   
    if(e.currentTarget.className.includes("search")){
      dropHead = e.currentTarget.nextSibling;
      dropMenu = dropHead.nextSibling;   
    }else{
      dropHead = e.currentTarget.children[0];
      dropMenu = dropHead.nextSibling;   
    }
    
    if(e.type === "click"){
      if (dropHead.className.includes("active")) {
        dropMenu.className = "list";
        dropHead.className = "current";
        e.currentTarget.blur()
      } else {
        dropMenu.className = "list active";
        dropHead.className = "current active";
        e.currentTarget.focus()
      }
    }else{
        dropMenu.className = "list";
        dropHead.className = "current";
    }
  };

  const handleKeyUp = (e) => {
    if (cursor > itemCount - 1) {
      setCursor(0);
    }
    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38 && cursor > 0) {
      e.preventDefault();
      e.stopPropagation();
      setCursor(cursor - 1);
    } else if (e.keyCode === 40 && cursor < itemCount) {
      e.preventDefault();
      e.stopPropagation();
      setCursor(cursor + 1);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      currentUpdate(items[cursor].props.children);
    } else {
      setSearchValue(e);
    }
  };

  const handleKeyDown = (e) => {
    // prevent defautl key behavior
    if (e.keyCode === 38) {
      e.preventDefault();
      e.stopPropagation();
    } else if (e.keyCode === 40) {
      e.preventDefault();
      e.stopPropagation();
    } else if (e.keyCode === 13) {
      e.preventDefault();
    } else {
    }
  };

  const setSearchValue = async (e) => {
    let search = e.currentTarget.innerText;
    setCurrentSearch(search);
  };

  if (isSearchable) {
    return (
      <div className={"dropDown-wrap " + (isList ? "list" : "not-list")}>
        <div className="dropDown-label info-blue">{label}</div>
        <div
          onKeyDown={(e) => handleKeyDown(e)}
          tabIndex="0"
          className="dropDown"
        >
          <div
            contentEditable="true"
            onKeyUp={(e) => handleKeyUp(e)}
            onClick={(e) => toggleDrop(e)}
            onBlur={(e) => toggleDrop(e)}
            className="search"
            type="text"
          ></div>
          <div className="current">
            {currentItem}
            <div className="arrow">&#9662;</div>
          </div>
          <div className="list">{items}</div>
        </div>
      </div>
    );
  } else if (!dataLoading) {
    return (
      <div className={"dropDown-wrap " + (isList ? "list" : "not-list")}>
        <div className="dropDown-label info-blue">{label}</div>
        <div
          onKeyDown={(e) => handleKeyDown(e)}
          onKeyUp={(e) => handleKeyUp(e)}
          onClick={(e) => toggleDrop(e)}
          onBlur={(e) => toggleDrop(e)}
          tabIndex="0"
          className="dropDown"
        >
          <div className="current">
            {currentItem}
            <div className="arrow">&#9662;</div>
          </div>
          <div className="list">{items}</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="dropDown-wrap loading">
        <div className="dropDown-label info-blue">{label}</div>
        <div className="dropDown empty">
          <div className="current">
            {currentItem}
            <div className="arrow">&#9662;</div>
          </div>
        </div>
      </div>
    );
  }
}

export default DropDown;