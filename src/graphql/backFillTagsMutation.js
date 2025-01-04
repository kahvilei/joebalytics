import {gql} from "@apollo/client";

export const BACK_FILL_TAGS_MUTATION = gql`
    mutation FormatAllParticipants {
        formatAllParticipants {
            total
            success
            failed
            errors
        }
    }
`;