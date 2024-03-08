//this is a react element that displays a radar chart. The radar chart is a polygon with vertices representing different metrics. The scores are placed within the polygon based on how much less than the top score they are.

//for example, a triangle representing the damage style of a champion may have a vertex labeled "magic", "physical", and "true" damage.
//function will also receive a number for the top scale of all metrics, the scores will be placed within the triangle based on how much less than the top score they are.
//polygon will always be equilateral
import e from 'cors';
import React from 'react';

function RadarChart(props) {
    const {scores, labels, max, height} = props;
    const scale = 50 / max;
    //vertices for full polygon
    const numVertices = scores.length;
    const angle = 360 / numVertices;
    const radius = 50; // adjust the radius as needed

    //Because polygons with and odd number of sides do not have a diameter equal to twice its radius, we will need to calculate a y value offset to center the polygon in the div vertically, which is a square who's length is equal to twice that of the polygon's radius.
    //we will do this by determining the distance between the base of the polygon and its center, and then subtracting that from the top of the div to get the y value for the top vertex of the polygon.

    const modNumVertices = numVertices % 2; 
    const lengthFromBaseToCenter = Math.abs(radius * Math.sin(angle/2));
    const yValueOffset = ((radius - lengthFromBaseToCenter) * modNumVertices)/2;


    //calculate vertices for polygon, calculating from the midpoint of the div. No values should be negative or the clipPath will not work
    const vertices = Array.from({length: numVertices}, (_, i) => {
        const y = -radius * Math.cos((angle * i * Math.PI) / 180) + yValueOffset;
        const x = radius * Math.sin((angle * i * Math.PI) / 180);
        return `calc(50% + ${x}%) calc(50% + ${y}%)`;
    }).join(", ");  
    //vertices for scores/metrics
    const verticesScores = Array.from({length: numVertices}, (_, i) => {
        const y = -scores[i] * scale * Math.cos((angle * i * Math.PI) / 180) + yValueOffset;
        const x = scores[i] * scale * Math.sin((angle * i * Math.PI) / 180);
        return `calc(50% + ${x}%) calc(50% + ${y}%)`;
    }).join(", ");

    //generates inner shapes for the scale on the radar chart. polygon will have inner lines to represent the scale of the chart. total shapes should be equal to max score
    const innerShapes = Array.from({length: max}, (_, i) => {
        const innerScale = (10 - i) * scale;
        const innerVertices = Array.from({length: numVertices}, (_, j) => {
            const y = -innerScale * Math.cos((angle * j * Math.PI) / 180) + yValueOffset;
            const x = innerScale * Math.sin((angle * j * Math.PI) / 180);
            return `calc(50% + ${x}%) calc(50% + ${y}%)`;
        }).join(", ");
        return (
            <div className='inner-polygon' style={{clipPath: `polygon(${innerVertices})`}} key={i}>
                <div className='inner' style={{clipPath: `polygon(${innerVertices})`}}></div>
            </div>
        );
    });
   
    return (
        <div className='RadarChart'>
            <div className='polygon' style={{clipPath: `polygon(${vertices})`, height: `${height}px`, width:`${height}px`}}>
                <div className='polygon-scores' style={{clipPath: `polygon(${verticesScores})`}}></div>
                {innerShapes}
            </div>
        </div>
    );
}

export default RadarChart;