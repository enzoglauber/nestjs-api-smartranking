import { ChallengeStatus } from './challenge-status.enum'

export interface Challenge {
  when: Date
  status: ChallengeStatus
  request: Date
  response: Date
  requester: string
  category: string
  match?: string
  players: string[]
}
