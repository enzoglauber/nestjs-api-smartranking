import { Controller, Logger } from '@nestjs/common'

import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'
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

  @MessagePattern('all-players')
  async all(@Payload() _id: string, @Ctx() context: RmqContext): Promise<Player[] | Player> {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      if (_id) {
        return await this.playerService.one({ _id })
      } else {
        return await this.playerService.all()
      }
    } finally {
      await channel.ack(message)
    }
  }

  @EventPattern('update-player')
  async edit(@Payload() player: Player, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      await this.playerService.update(player)
      await channel.ack(message)
    } catch (error) {
      this.ack(channel, message, error)
    }
  }

  @EventPattern('remove-player')
  async remove(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      await this.playerService.remove(_id)
      await channel.ack(message)
    } catch (error) {
      this.ack(channel, message, error)
    }
  }

  private async ack(channel: any, message: Record<string, any>, error) {
    const filter = errors.filter((code) => error.message.includes(code))

    if (filter.length) {
      await channel.ack(message)
    }
  }
}
