import {gql} from "@apollo/client";

export const TAG_FILE_BY_VERSION_QUERY = gql`
    query TagFileByVersion($version: ID!) {
        tagFileByVersion(version: $version) {
            precalcs {
                name
                type
                from {
                    list
                    type
                    path
                    conditions
                }
                list
                value
                conditions
            }
            tags {
                key
                text
                color
                description
                triggers
                value
            }
        }
    }
`;