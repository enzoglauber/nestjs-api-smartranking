import {
  BadRequestException,
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
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { Player } from 'src/player/player.interface'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { AddChallengeDto } from './dtos/add-challenge.dto'
import { AddMatchToChallenge } from './dtos/add-match-to-challenge.dto'
import { UpdateChallengeDto } from './dtos/update-challenge.dto'
import { ChallengeStatus } from './enum/challenge-status.enum'
import { Challenge } from './interface/challenge.interface'
import { Match } from './interface/match.interface'
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe'

@Controller('api/v1/challengies')
export class ChallengeController {
  private admin: ClientProxy = this.proxyRMQService.get()
  private challenge: ClientProxy = this.proxyRMQService.get('challenge')

  private logger = new Logger('micro-admin-backend')

  constructor(private readonly proxyRMQService: ProxyRMQService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async add(@Body() addChallenge: AddChallengeDto) {
    this.logger.log(`addChallenge: ${JSON.stringify(addChallenge)}`)

    await this.validatePlayers(addChallenge.players, addChallenge.category)
    await this.validateRequester(addChallenge.players, addChallenge.requester)
    await this.validateCategory(addChallenge.category)

    await this.challenge.emit('add-challenge', addChallenge)
  }

  private async validatePlayers(players: Player[], category: string): Promise<void> {
    const playersResponse = await lastValueFrom(this.admin.send('all-player', ''))

    for (const challengePlayer of players) {
      const filter: Player[] = playersResponse.filter(
        (player) => player._id === challengePlayer._id
      )

      if (filter.length === 0) {
        throw new BadRequestException(`The id ${challengePlayer._id} isn't a player!`)
      }

      if (filter[0].category !== category) {
        throw new BadRequestException(
          `The player ${filter[0]._id} is not part of the specified category!`
        )
      }
    }
  }

  private async validateRequester(players: Player[], requester: string): Promise<void> {
    const isMatchRequester = players.some((player) => player._id === requester)

    if (!isMatchRequester) {
      throw new BadRequestException(`The requester has to be a player in the match`)
    }
  }

  private async validateCategory(category: string): Promise<void> {
    const categoryResponse = await lastValueFrom(this.admin.send('all-categories', category))

    if (!categoryResponse) {
      throw new BadRequestException(`Category does not exist!`)
    }
  }

  @Get()
  async all(@Query('playerId') playerId: string): Promise<Challenge | Challenge[]> {
    if (playerId) {
      const player: Player = await lastValueFrom(this.admin.send('all-player', playerId))
      this.logger.log(`player: ${JSON.stringify(player)}`)
      if (!player) {
        throw new BadRequestException(`Player not found!`)
      }
    }

    /*
      In the challenges microservice, the method responsible for querying the challenges expect the structure below, where:
      - If we fill in the playerId, the query of challenges will be by the id of the informed player
      - If we fill in the _id field, the query will be by the challenge id
      - If we do not fill in any of the two fields, the query will return all registered challenges
    */
    return lastValueFrom(this.challenge.send('all-challenges', { playerId, _id: '' }))
  }

  @Put('/:id')
  async update(
    @Body(ChallengeStatusValidationPipe) challenge: UpdateChallengeDto,
    @Param('id') _id: string
  ) {
    const find: Challenge = await lastValueFrom(
      this.challenge.send('all-challenges', { playerId: '', _id })
    )

    this.logger.log(`Challenge: ${JSON.stringify(find)}`)

    if (!find) {
      throw new BadRequestException(`Challenge not found!`)
    }

    if (find.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Only challenges with PENDING status can be updated!')
    }

    await this.challenge.emit('update-challenge', { _id, challenge })
  }

  @Post('/:id/match/')
  async addChallengeMatch(
    @Body(ValidationPipe) challenge: AddMatchToChallenge,
    @Param('id') _id: string
  ) {
    const find: Challenge = await lastValueFrom(
      this.challenge.send('all-challenges', { playerId: '', _id })
    )

    this.logger.log(`Challenge: ${JSON.stringify(find)}`)

    if (!find) {
      throw new BadRequestException(`Challenge not found!`)
    }

    if (find.status === ChallengeStatus.DONE) {
      throw new BadRequestException(`Challenge already done!`)
    }

    if (find.status !== ChallengeStatus.ACCEPT) {
      throw new BadRequestException(
        `Matches can only be launched in challenges accepted by opponents!`
      )
    }

    if (!find.players.includes(challenge.winner)) {
      throw new BadRequestException(
        `The winning player of the match must take part in the challenge!`
      )
    }

    const match: Match = {
      category: find.category,
      winner: challenge.winner,
      challenge: _id,
      players: find.players,
      result: challenge.result
    }

    await this.challenge.emit('add-match', match)
  }

  @Delete('/:_id')
  async deletarDesafio(@Param('_id') _id: string) {
    const challenge: Challenge = await lastValueFrom(
      this.challenge.send('all-challenges', { playerId: '', _id })
    )

    this.logger.log(`Challenge: ${JSON.stringify(challenge)}`)

    if (!challenge) {
      throw new BadRequestException(`Challenge not found!`)
    }

    await this.challenge.emit('remove-challenge', challenge)
  }
}
