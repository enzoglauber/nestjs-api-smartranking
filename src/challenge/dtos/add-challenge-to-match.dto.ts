import { IsNotEmpty } from 'class-validator'
import { Player } from 'src/player/player.interface'
import { Result } from '../interfaces/challenge.interface'

export class AddChallengeToMatchDto {
  @IsNotEmpty()
  winner: Player

  @IsNotEmpty()
  result: Result[]
}
