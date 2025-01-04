import {gql} from "@apollo/client";

export const UPDATE_TAGS_MUTATION = gql`
    mutation UpdateTagData($file: String!) {
        updateTagData(file: $file) {
            message
            success
        }
    }
`;