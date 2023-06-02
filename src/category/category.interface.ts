import { Document } from 'mongoose'
import { Player } from 'src/player/player.interface'

export interface Category extends Document {
  readonly name: string
  description: string
  events: Event[]
  players: Player[]
}

export interface Event {
  name: string
  description: string
  operation: string
  value: number
}
