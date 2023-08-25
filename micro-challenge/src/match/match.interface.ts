import { Document } from 'mongoose'

export interface Match extends Document {
  category: string
  challenge: string
  players: string[] //Player[]
  winner: string //Player
  result: Result[]
}

export interface Result {
  set: string
}
