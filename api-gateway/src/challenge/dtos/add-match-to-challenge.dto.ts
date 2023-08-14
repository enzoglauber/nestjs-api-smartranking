import { IsNotEmpty } from 'class-validator'
import { Player } from 'src/player/player.interface'
import { Result } from '../interface/challenge.interface'

export class AddMatchToChallenge {
  @IsNotEmpty()
  winner: Player

  @IsNotEmpty()
  result: Result[]
}
