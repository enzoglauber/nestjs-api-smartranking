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
import { AddChallengeToMatchDto } from './dtos/add-challenge-to-match.dto'
import { AddChallengeDto } from './dtos/add-challenge.dto'
import { UpdateChallengeDto } from './dtos/update-challenge.dto'
import { Challenge } from './interfaces/challenge.interface'
import { ChallengeStatusValidacaoPipe } from './pipes/challenge-status-validation.pipe'

@Controller('api/v1/challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  private readonly logger = new Logger(ChallengeController.name)

  @Post()
  @UsePipes(ValidationPipe)
  async addChallenge(@Body() challenge: AddChallengeDto): Promise<Challenge> {
    this.logger.log(`challenge: ${JSON.stringify(challenge)}`)
    return await this.challengeService.addChallenge(challenge)
  }

  @Get()
  async consultarDesafios(@Query('idPlayer') _id: string): Promise<Challenge[]> {
    return _id
      ? await this.challengeService.consultarDesafiosDeUmJogador(_id)
      : await this.challengeService.consultarTodosDesafios()
  }

  @Put('/:_id')
  async atualizarDesafio(
    @Body(ChallengeStatusValidacaoPipe) challenge: UpdateChallengeDto,
    @Param('_id') _id: string
  ): Promise<void> {
    await this.challengeService.atualizarDesafio(_id, challenge)
  }

  @Post('/:_id/match/')
  async atribuirDesafioPartida(
    @Body(ValidationPipe) addChallengeToMatchDto: AddChallengeToMatchDto,
    @Param('_id') _id: string
  ): Promise<void> {
    return await this.challengeService.atribuirDesafioPartida(_id, addChallengeToMatchDto)
  }

  @Delete('/:_id')
  async deletarDesafio(@Param('_id') _id: string): Promise<void> {
    await this.challengeService.deletarDesafio(_id)
  }
}
