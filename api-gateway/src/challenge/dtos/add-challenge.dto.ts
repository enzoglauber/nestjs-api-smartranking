import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsNotEmpty } from 'class-validator'
import { Player } from 'src/player/player.interface'

export class AddChallengeDto {
  @IsNotEmpty()
  category: string

  @IsNotEmpty()
  @IsDateString()
  when: Date

  @IsNotEmpty()
  requester: string // Player

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  players: Player[]
}
