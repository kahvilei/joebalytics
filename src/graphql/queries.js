// graphql/queries.js
import { GAME_DATA_QUERY } from "./gameDataQuery";
import { MATCHES_LIST_QUERY, getMatchListQueryWithTagData } from "./matchListQuery";
import { TAG_VERSIONS_QUERY } from "./tagVersionsQuery";
import { TAG_FILE_BY_VERSION_QUERY } from "./tagFileByVersionQuery";

import { UPDATE_TAGS_MUTATION } from "./updateTagsMutation";
import { BACK_FILL_TAGS_MUTATION } from "./backFillTagsMutation";

//import our graphql files as strings
export {
    // queries
    GAME_DATA_QUERY,
    MATCHES_LIST_QUERY,
    getMatchListQueryWithTagData,
    TAG_VERSIONS_QUERY,
    TAG_FILE_BY_VERSION_QUERY,
    // mutations
    UPDATE_TAGS_MUTATION,
    BACK_FILL_TAGS_MUTATION
}

