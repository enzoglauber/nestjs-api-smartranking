import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ChallengeService } from './challenge.service'
import { AddChallengeDto } from './dtos/add-challenge.dto'
import { AddMatchToChallenge } from './dtos/add-match-to-challenge.dto'
import { UpdateChallengeDto } from './dtos/update-challenge.dto'
import { Challenge } from './interface/challenge.interface'
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe'

@Controller('api/v1/challengies')
export class ChallengeController {
  private logger = new Logger('micro-admin-backend')

  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async add(@Body() challenge: AddChallengeDto): Promise<void> {
    this.logger.log(`addChallenge: ${JSON.stringify(challenge)}`)
    return await this.challengeService.add(challenge)
  }

  @Get()
  async all(@Query('playerId') playerId: string): Promise<Challenge | Challenge[]> {
    return this.challengeService.all(playerId)
  }

  @Put('/:id')
  async update(
    @Body(ChallengeStatusValidationPipe) challenge: UpdateChallengeDto,
    @Param('id') _id: string
  ) {
    await this.challengeService.update(_id, challenge)
  }

  @Post('/:id/match/')
  async addChallengeMatch(
    @Body(ValidationPipe) challenge: AddMatchToChallenge,
    @Param('id') _id: string
  ) {
    await this.challengeService.addChallengeMatch(_id, challenge)
  }

  @Delete('/:_id')
  async remove(@Param('_id') _id: string) {
    this.challengeService.remove(_id)
  }
}
