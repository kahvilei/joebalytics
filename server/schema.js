//get string from schema.gql and put it in typeDefs
const fs = require('fs');

const path = require('path');

const yaml = require('js-yaml');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);


const typeDefs = async () => {
    const raw = fs.readFileSync('./server/schema.gql', 'utf8');
    try{
    const tags = await bucket.file("data/tags.yaml").download();
    // Generate GraphQL type for individual tag fields
    const tagList = yaml.load(tags.toString()).tags;
    const tagFields = Object.keys(tagList).map(tagKey => {
        return `    ${tagKey}: TagValueFloat`;
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