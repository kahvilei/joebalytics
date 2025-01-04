import {gql} from "@apollo/client";

export const GAME_DATA_QUERY = gql`
    query GameData {
        gameData {
            champions {
                data
                version
                type
                format
            }
            items {
                id
                name
                description
                iconPath
            }
            summonerSpells {
                data
                version
                type
            }
            queueTypes {
                queueId
                map
                description
            }
            tagData {
                precalcs{
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
                tags{
                    key
                    text
                    color
                    description
                    triggers
                    value
                }
            }
            summoners {
                id
                name
                regionDisplay
                regionURL
                tagline
                profileIconId
                puuid
                summonerLevel
                rankedData {
                    tier
                    rank
                    leaguePoints
                }
            }
        }
    }
`;