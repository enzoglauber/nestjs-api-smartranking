import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { AppService } from './app.service'
import { Challenge } from './shared/interfaces/challenge.interface'

const errors: string[] = ['E11000']

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly appService: AppService) {}

  @EventPattern('notification-new-challenge')
  async notification(@Payload() challenge: Challenge, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      this.logger.log(`Challenge: ${JSON.stringify(challenge)}`)

      await this.appService.notification(challenge)
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
