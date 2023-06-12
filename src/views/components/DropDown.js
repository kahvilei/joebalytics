import React, { useState } from "react";

function DropDown(props) {
  const [currentItem, setCurrentItem] = useState(props.defaultValue);

  let label = ""
  if(props.label){
    label = props.label
  }

  const mappedList = (list) => {
    let mappedList = {};
    if (list.count === 0 || list.count === 1) {
      mappedList = "";
    } else {
      mappedList = Object.entries(list).map((item, k) => {
        if (currentItem) {
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
        } else {
        }
      });
    }

    return mappedList;
  };

  const [items] = useState(mappedList(props.items));
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

  return (
    <div className="dropDown-wrap">
      <div className="dropDown-label info-blue">
        {label}
      </div>
      <div tabIndex="0" className="dropDown">
        <div onClick={toggleDrop} className="current">
          {currentItem}
        </div>
        <div className="list">{items}</div>
      </div>
    </div>
  );
}

export default DropDown;
