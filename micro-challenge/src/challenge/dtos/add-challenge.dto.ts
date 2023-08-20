import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsNotEmpty } from 'class-validator'
import { Player } from 'src/player/player.interface'

export class AddChallengeDto {
  @IsNotEmpty()
  @IsDateString()
  when: Date

  @IsNotEmpty()
  requester: Player

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  players: Player[]
}
