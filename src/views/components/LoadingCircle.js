function ValidationError(props) {
  return (
    <div className={"lds-ring " + props.color + " " +  props.aspectRatio + " " +  props.size}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default ValidationError;
