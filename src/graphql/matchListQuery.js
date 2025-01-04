import {gql} from "@apollo/client";

export const MATCHES_LIST_QUERY = gql`
    query MatchesPageData(
        $region: String
        $names: [String!]
        $roles: [String!]
        $championIds: [Int!]
        $queueIds: [Int!]
        $limit: Int
        $timestamp: Float
        $tags: [String!]
        $stats: [StatRequest!]

    ) {
        matches(
            region: $region
            summonerNames: $names
            roles: $roles
            championIds: $championIds
            queueIds: $queueIds
            limit: $limit
            timestamp: $timestamp
            tags: $tags
            stats: $stats
        ) {
            matchData {
                metadata {
                    matchId
                    participants
                }
                info {
                    gameMode
                    gameStartTimestamp
                    gameDuration
                    platformId
                    queueId
                    gameCreation

                    participants {
                        teamPosition
                        championId
                        championName
                        kills
                        deaths
                        assists
                        win
                        summonerName
                        puuid
                        teamId
                        riotIdTagline
                        riotIdGameName
                        matchId
                        totalMinionsKilled
                        neutralMinionsKilled
                        goldEarned
                        totalDamageDealtToChampions
                        visionScore
                        wardsPlaced
                        wardsKilled
                        gameEndedInEarlySurrender
                        gameEndedInSurrender
                        challenges {
                            killParticipation
                            kda
                            visionScorePerMinute
                            soloKills
                        }

                        tags {
                            blind {
                                isTriggered
                                value
                            }
                        }
                    }
                }
            }
            statData
        }
    }
`;

export function getMatchListQueryWithTagData(tags) {
    if (tags?.length > 0) {
        MATCHES_LIST_QUERY.definitions[0].selectionSet.selections.at(0).selectionSet.selections.at(0).selectionSet.selections.at(-1).selectionSet.selections.at(-1).selectionSet.selections.at(-1).selectionSet.selections = tags.map(tag => ({
            kind: "Field",
            name: { kind: "Name", value: tag.key },
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "isTriggered" }
                    },
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "value" }
                    }
                ]
            }
        }));
    }
    return MATCHES_LIST_QUERY;
}