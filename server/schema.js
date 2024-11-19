//get string from schema.gql and put it in typeDefs
const fs = require('fs');

const typeDefs = fs.readFileSync('./server/schema.gql', 'utf8');

module.exports = typeDefs;