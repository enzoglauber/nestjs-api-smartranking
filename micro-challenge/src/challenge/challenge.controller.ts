import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import { ChallengeService } from './challenge.service'
import { Challenge } from './interfaces/challenge.interface'

const errors: string[] = ['E11000']

@Controller('api/v1/challenge')
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

  private async ack(channel: any, message: Record<string, any>, error) {
    const filter = errors.filter((code) => error.message.includes(code))

    if (filter.length) {
      await channel.ack(message)
    }
  }

  // @Post()
  // @UsePipes(ValidationPipe)
  // async add(@Body() challenge: AddChallengeDto): Promise<Challenge> {
  //   this.logger.log(`challenge: ${JSON.stringify(challenge)}`)
  //   return await this.challengeService.add(challenge)
  // }

  // @Get()
  // async search(@Query('idPlayer') _id: string): Promise<Challenge[]> {
  //   return _id ? await this.challengeService.byIdPlayer(_id) : await this.challengeService.all()
  // }

  // @Put('/:_id')
  // async update(
  //   @Body(ChallengeStatusValidationPipe) challenge: UpdateChallengeDto,
  //   @Param('_id') _id: string
  // ): Promise<void> {
  //   await this.challengeService.update(_id, challenge)
  // }

  // @Post('/:_id/match/')
  // async addChallengeMatch(
  //   @Body(ValidationPipe) match: AddMatchToChallenge,
  //   @Param('_id') _id: string
  // ): Promise<void> {
  //   return await this.challengeService.addMatch(_id, match)
  // }

  // @Delete('/:_id')
  // async remove(@Param('_id') _id: string): Promise<void> {
  //   await this.challengeService.remove(_id)
  // }
}