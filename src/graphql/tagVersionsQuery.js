import {gql} from "@apollo/client";

export const TAG_VERSIONS_QUERY = gql`
    query TagVersions{
        gameData {
            tagFileVersions{
                id
                user
            }
            tagCurrentVersion{
                id
                user
            }
            tagLastBackFill {
                id
                user
                results {
                    total
                    success
                    failed
                    errors
                }
            }
        }
    }
`;