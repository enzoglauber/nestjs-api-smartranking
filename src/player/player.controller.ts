import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { DeleteResult } from 'mongodb'
import { SavePlayerDto } from './dtos/save-player.dto'
import { PlayerParamsPipe } from './pipes/player.params.pipe'
import { Player } from './player.interface'
import { PlayerService } from './player.service'
@Controller('api/v1/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async save(@Body() player: SavePlayerDto) {
    return await this.playerService.save(player)
  }

  @Get()
  async find(@Query('email', PlayerParamsPipe) email: string): Promise<Player[] | Player> {
    return await this.playerService.find(email)
  }

  @Delete()
  async delete(@Query('email', PlayerParamsPipe) email: string): Promise<DeleteResult> {
    return await this.playerService.remove(email)
  }
}
