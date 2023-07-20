function ValidationError(props) {
    if(!props.message) return null;
    return (
        <div className="error-text" >{props.message}</div>
    )
}

export default ValidationError;