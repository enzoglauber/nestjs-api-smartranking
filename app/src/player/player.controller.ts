import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { DeleteResult } from 'mongodb'
import { ParamsValidationPipe } from '../shared/pipes/params-validation.pipe'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'
import { PlayerService } from './player.service'
@Controller('api/v1/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async insert(@Body() player: SavePlayerDto) {
    return await this.playerService.insert(player)
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async update(@Body() player: SavePlayerDto, @Param('_id', ParamsValidationPipe) _id: string) {
    return await this.playerService.update({ ...player, _id })
  }

  @Get()
  async find(): Promise<Player[] | Player> {
    return await this.playerService.find()
  }

  @Get('/:_id')
  async findById(@Param('_id', ParamsValidationPipe) _id: string): Promise<Player> {
    return await this.playerService.findById(_id)
  }

  @Delete('/:_id')
  async delete(@Param('_id', ParamsValidationPipe) _id: string): Promise<DeleteResult> {
    return await this.playerService.remove(_id)
  }
}
