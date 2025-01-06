//get string from schema.gql and put it in typeDefs
const fs = require('fs');
const mongoose = require("mongoose");


const typeDefs = (tags) => {
    const raw = fs.readFileSync('./server/graphql/schema.gql', 'utf8');
    try {
        // Generate GraphQL type for individual tag fields
        const tagList = tags.tags;
        const tagFields = tagList.map(tag => {
            return `    ${tag.key}: TagValueFloat`;
        }).join(',\n');

        const Participant = mongoose.model('Participant');
        const challengeList = Object.keys(Participant.schema.obj.challenges);
        const challengeFields = challengeList.map(challenge => {
        return `    ${challenge}: Float`;
        }).join(',\n');

        let returnSchema = raw.replace('type Tags {', `type Tags {\n
        ${tagFields}
        `);

        returnSchema = returnSchema.replace('type Challenges {', `type Challenges {\n
        ${challengeFields}
        `);

        //replace Tag type with the actual tags
        return returnSchema;
    } catch (error) {
        console.log('Error fetching tags:', error);
        return raw;
    }
}

module.exports = typeDefs;