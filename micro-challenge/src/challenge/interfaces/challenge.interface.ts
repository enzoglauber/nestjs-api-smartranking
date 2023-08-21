import { Document } from 'mongoose'
import { ChallengeStatus } from 'src/challenge/interfaces/challenge-status.enum'

export interface Challenge extends Document {
  when: Date
  status: ChallengeStatus
  request: Date
  response: Date
  requester: string
  category: string
  players: string[] // Player[]
}
// TODO
// export interface Match extends Document {
//   category: string
//   players: Player[]
//   winner: Player
//   result: Result[]
// }

// export interface Result {
//   set: string
// }
