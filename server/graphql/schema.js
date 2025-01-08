//get string from schema.gql and put it in typeDefs
const fs = require('fs');
const mongoose = require("mongoose");


const typeDefs = () => {
    const raw = fs.readFileSync('./server/graphql/schema.gql', 'utf8');
    try {
        const Participant = mongoose.model('Participant');
        const challengeList = Object.keys(Participant.schema.obj.challenges);
        const challengeFields = challengeList.map(challenge => {
        return `    ${challenge}: Float`;
        }).join(',\n');

        //replace Tag type with the actual tags
        return raw.replace('type Challenges {', `type Challenges {\n
        ${challengeFields}
        `);
    } catch (error) {
        console.log('Error fetching tags:', error);
        return raw;
    }
}

module.exports = typeDefs;