import {gql} from "@apollo/client";

export const UPDATE_ALL_SUMMONERS_MUTATION = gql`
    mutation UpdateAllSummoners {
        updateAllSummoners {
            nameURL
        }
    }
`;