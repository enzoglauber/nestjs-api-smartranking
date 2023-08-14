import { ChallengeStatus } from 'src/challenge/enum/challenge-status.enum'
import { Player } from 'src/player/player.interface'

export interface Challenge {
  when: Date
  status: ChallengeStatus
  request: Date
  response: Date
  requester: string
  category: string
  players: Player[]
  match?: string
}

// {
//   "_id": "1f35042a-8bba-11ea-bc55-0242ac130003",
//   "when": "2020-05-04 18:00:00",
//   "status": "DONE",
//   "request": "2020-04-25 08:30:00",
//   "response": "2020-04-26 08:30:00",
//   "requester": "534e5168-8baf-11ea-bc55-0242ac130003",
//   "category": "A",
//   "players": [{
//     "_id": "534e5168-8baf-11ea-bc55-0242ac130003"
//   },{
//     "_id": "f27263d6-8bb6-11ea-bc55-0242ac130003"
//   }],
//   "match": {
//     "_id": "1f35042a-8bba-11ea-bc55-0242ac130003",
//     "def": "534e5168-8baf-11ea-bc55-0242ac130003", winner
//     "result": [{
//       "set": "6-1"
//     }, {
//       "set": "6-3"
//     }],
//     "players": [{
//       "_id": "534e5168-8baf-11ea-bc55-0242ac130003"
//     },
//     {
//       "_id": "f27263d6-8bb6-11ea-bc55-0242ac130003"
//     }]
//   }
// }
