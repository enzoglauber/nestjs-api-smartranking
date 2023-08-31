export interface RankingResponse {
  player?: string
  position?: number
  point?: number
  history?: History
}

export interface History {
  wins?: number
  losses?: number
}
