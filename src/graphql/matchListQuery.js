import {gql} from "@apollo/client";

export const MATCHES_LIST_QUERY = gql`
    query MatchesPageData(
        $region: String
        $summoners: [String!]
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
            summonerNames: $summoners
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
                        tags
                    }
                }
            }
            statData
        }
    }
`;