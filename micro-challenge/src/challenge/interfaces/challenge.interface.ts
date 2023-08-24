import { Document } from 'mongoose'
import { ChallengeStatus } from 'src/challenge/interfaces/challenge-status.enum'

export interface Challenge extends Document {
  when: Date
  status: ChallengeStatus
  request: Date
  response: Date
  requester: string
  category: string
  match?: string
  players: string[] // Player[]
}
