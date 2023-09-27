import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { Match } from './match.interface'
import { MatchService } from './match.service'
const errors: string[] = ['E11000']

@Controller()
export class MatchController {
  private readonly logger = new Logger(MatchController.name)

  constructor(private readonly matchService: MatchService) {}

  @EventPattern('add-match')
  async add(@Payload() match: Match, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      this.logger.log(`Match: ${JSON.stringify(match)}`)
      await this.matchService.add(match)
      await channel.ack(message)
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`)
      this.ack(channel, message, error)
      await channel.nack(message)
    }
  }

  private async ack(channel: any, message: Record<string, any>, error) {
    const filter = errors.filter((code) => error.message.includes(code))

    if (filter.length) {
      await channel.ack(message)
    }
    return
  }
}
