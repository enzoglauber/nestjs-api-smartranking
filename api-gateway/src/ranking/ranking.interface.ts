export interface Ranking {
  player?: string
  position?: number
  point?: number
  history?: History
}

export interface History {
  wins?: number
  losses?: number
}
