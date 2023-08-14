import { Player } from 'src/player/player.interface'

export interface Match {
  category?: string
  challenge?: string
  players: Player[]
  winner: Player
  result: Result[]
}

export interface Result {
  set: string
}
