function ValidationError(props) {
  return (
    <div className={"lds-ring " + props.color + " " +  props.aspectRatio}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default ValidationError;
