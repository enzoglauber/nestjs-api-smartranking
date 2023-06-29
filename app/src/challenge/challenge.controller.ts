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
import { Challenge } from './interfaces/challenge.interface'
import { ChallengeStatusValidacaoPipe } from './pipes/challenge-status-validation.pipe'

@Controller('api/v1/challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  private readonly logger = new Logger(ChallengeController.name)

  @Post()
  @UsePipes(ValidationPipe)
  async add(@Body() challenge: AddChallengeDto): Promise<Challenge> {
    this.logger.log(`challenge: ${JSON.stringify(challenge)}`)
    return await this.challengeService.add(challenge)
  }

  @Get()
  async search(@Query('idPlayer') _id: string): Promise<Challenge[]> {
    return _id ? await this.challengeService.byIdPlayer(_id) : await this.challengeService.all()
  }

  @Put('/:_id')
  async update(
    @Body(ChallengeStatusValidacaoPipe) challenge: UpdateChallengeDto,
    @Param('_id') _id: string
  ): Promise<void> {
    await this.challengeService.update(_id, challenge)
  }

  @Post('/:_id/match/')
  async addChallengeMatch(
    @Body(ValidationPipe) match: AddMatchToChallenge,
    @Param('_id') _id: string
  ): Promise<void> {
    return await this.challengeService.addMatch(_id, match)
  }

  @Delete('/:_id')
  async remove(@Param('_id') _id: string): Promise<void> {
    await this.challengeService.remove(_id)
  }
}
