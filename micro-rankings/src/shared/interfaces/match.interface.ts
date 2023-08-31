export interface Match {
  category?: string
  challenge?: string
  players: string[]
  winner: string
  result: Result[]
}

export interface Result {
  set: string
}
