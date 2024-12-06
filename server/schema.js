//get string from schema.gql and put it in typeDefs
const fs = require('fs');

const { getTagFile } = require('./controllers/tags');


const typeDefs = async () => {
    const raw = fs.readFileSync('./server/schema.gql', 'utf8');
    try{
    const tags = await getTagFile();
    // Generate GraphQL type for individual tag fields
    const tagList = tags.tags;
    const tagFields = tagList.map(tag => {
        return `    ${tag.key}: TagValueFloat`;
    }).join(',\n');

    const returnSchema = raw.replace('type Tags {', `type Tags {\n
        ${tagFields}
    `);
  
    //replace Tag type with the actual tags
    return returnSchema;
    } catch (error) {
        console.log('Error fetching tags:', error);
        return raw;
    }
}

module.exports = typeDefs;