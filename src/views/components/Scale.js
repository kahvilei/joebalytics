//this returns a react element that displays a horizontal scale for a single metric. Made up of blocks. The first blocks appear in color to represent the metric, the rest are grey. The scale is based on a max value passed down as a prop.
//
import React from 'react';

function Scale(props) {
    const {max, value, label} = props;
    const scale = Array.from({length: max}, (_, i) => {
        return i < value ? <div className='block' key={i}></div> : <div className='block null' key={i}></div>;
    });
    return (
        <div className='scale-wrap'>
            <div className='scale'>{scale}</div>
            <div className='label'>{label}</div>
        </div>
    );
}

export default Scale;