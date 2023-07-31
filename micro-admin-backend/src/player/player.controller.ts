import { Controller, Logger } from '@nestjs/common'

import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { Player } from './player.interface'
import { PlayerService } from './player.service'

const errors: string[] = ['E11000']

@Controller('api/v1/player')
export class PlayerController {
  logger = new Logger(PlayerController.name)
  constructor(private readonly playerService: PlayerService) {}

  @EventPattern('add-player')
  async add(@Payload() player: Player, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      this.logger.log(`jogador: ${JSON.stringify(player)}`)
      await this.playerService.add(player)
      await channel.ack(message)
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`)
      this.ack(channel, message, error)
    }
  }

  // @Post()
  // @UsePipes(ValidationPipe)
  // async insert(@Body() player: SavePlayerDto) {
  //   return await this.playerService.insert(player)
  // }

  // @Put('/:_id')
  // @UsePipes(ValidationPipe)
  // async update(@Body() player: SavePlayerDto, @Param('_id', ParamsValidationPipe) _id: string) {
  //   return await this.playerService.update({ ...player, _id })
  // }

  // @Get()
  // async find(): Promise<Player[] | Player> {
  //   return await this.playerService.find()
  // }

  // @Get('/:_id')
  // async findById(@Param('_id', ParamsValidationPipe) _id: string): Promise<Player> {
  //   return await this.playerService.findById(_id)
  // }

  // @Delete('/:_id')
  // async delete(@Param('_id', ParamsValidationPipe) _id: string): Promise<DeleteResult> {
  //   return await this.playerService.remove(_id)
  // }

  private async ack(channel: any, message: Record<string, any>, error) {
    const filter = errors.filter((code) => error.message.includes(code))

    if (filter.length) {
      await channel.ack(message)
    }
  }
}
