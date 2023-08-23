import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'
import { Types } from 'mongoose'
import { ChallengeService } from './challenge.service'
import { Challenge } from './interfaces/challenge.interface'

const errors: string[] = ['E11000']

@Controller('api/v1/challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  private readonly logger = new Logger(ChallengeController.name)

  @EventPattern('add-challenge')
  async add(@Payload() challenge: Challenge, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      this.logger.log(`Challenge: ${JSON.stringify(challenge)}`)
      await this.challengeService.add(challenge)
      await channel.ack(message)
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`)
      this.ack(channel, message, error)
    }
  }

  @MessagePattern('all-challenges')
  async all(
    @Payload() data: { playerId: Types.ObjectId; _id: Types.ObjectId },
    @Ctx() context: RmqContext
  ): Promise<Challenge[] | Challenge> {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      const { playerId, _id } = data
      this.logger.log(`data: ${JSON.stringify(data)}`)

      if (playerId) {
        return await this.challengeService.byPlayerId(playerId)
      } else if (_id) {
        return await this.challengeService.byId(_id)
      } else {
        return await this.challengeService.all()
      }
    } finally {
      await channel.ack(message)
    }
  }

  @EventPattern('update-challenge')
  async update(
    @Payload() { _id, challenge }: { _id: string; challenge: Challenge },
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef()
    const message = context.getMessage()

    try {
      this.logger.log(`data: ${JSON.stringify({ _id, challenge })}`)

      await this.challengeService.update(_id, challenge)
      await channel.ack(message)
    } catch (error) {
      this.ack(channel, message, error)
    }
  }

  @EventPattern('update-challenge-by-match')
  async updateByMatch(
    @Payload() { matchId, challenge }: { matchId: string; challenge: Challenge },
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      this.logger.log(`matchId: ${matchId}`)

      await this.challengeService.updateByMatch(matchId, challenge)
      await channel.ack(message)
    } catch (error) {
      this.ack(channel, message, error)
    }
  }

  @EventPattern('remove-challenge')
  async remove(@Payload() challenge: Challenge, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      await this.challengeService.remove(challenge)
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
