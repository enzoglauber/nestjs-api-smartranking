import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  async insert(@Body() player: SavePlayerDto) {
    return await this.playerService.save(player)
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async update(@Body() player: SavePlayerDto, @Param('_id', PlayerParamsPipe) _id: string) {
    return await this.playerService.save({ ...player, _id })
  }

  @Get()
  async find(): Promise<Player[] | Player> {
    return await this.playerService.find()
  }

  @Get('/:_id')
  async findById(@Param('_id', PlayerParamsPipe) _id: string): Promise<Player> {
    return await this.playerService.findById(_id)
  }

  @Delete()
  async delete(@Query('email', PlayerParamsPipe) email: string): Promise<DeleteResult> {
    return await this.playerService.remove(email)
  }
}
