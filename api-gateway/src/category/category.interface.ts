import { Player } from 'src/player/player.interface'

export interface Category {
  readonly name: string
  description: string
  events: Event[]
  players: Array<Player>
}

export interface Event {
  name: string
  description: string
  operation: string
  value: number
}
