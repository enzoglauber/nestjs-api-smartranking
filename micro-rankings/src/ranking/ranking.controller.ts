import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { Match } from '../shared/interfaces/match.interface'
import { RankingService } from './ranking.service'

const errors: string[] = ['E11000']
@Controller()
export class RankingController {
  private readonly logger = new Logger(RankingController.name)
  constructor(private readonly rankingService: RankingService) {}

  @EventPattern('process-match')
  async process(
    @Payload()
    {
      matchId,
      challenge
    }: {
      matchId: string
      challenge: Match
    },
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef()
    const message = context.getMessage()

    try {
      this.logger.log(`data: ${JSON.stringify({ matchId, challenge })}`)

      await this.rankingService.process(matchId, challenge)
      await channel.ack(message)
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`)
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
