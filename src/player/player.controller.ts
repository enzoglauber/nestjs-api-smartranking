import { Body, Controller, Get, Post } from '@nestjs/common'
import { SavePlayerDto } from './dtos/save-player.dto'
import { PlayerService } from './player.service'

@Controller('api/v1/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  async save(@Body() player: SavePlayerDto) {
    return await this.playerService.save(player)
  }

  @Get()
  async get(@Body() player: SavePlayerDto) {
    return await this.playerService.save(player)
  }
}
