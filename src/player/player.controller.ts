import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'
import { PlayerService } from './player.service'

@Controller('api/v1/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  async save(@Body() player: SavePlayerDto) {
    return await this.playerService.save(player)
  }

  @Get()
  async find(@Query('email') email: string): Promise<Player[]> {
    return await this.playerService.find(email)
  }
}
