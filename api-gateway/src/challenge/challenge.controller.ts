import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { Player } from 'src/player/player.interface'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { AddChallengeDto } from './dtos/add-challenge.dto'

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

    /*
      Validations related to the array of players participating in the challenge
    */
    const players: Player[] = await lastValueFrom(this.admin.send('consultar-player', ''))

    addChallenge.players.map((challengePlayer) => {
      const filter: Player[] = players.filter((player) => player._id == challengePlayer._id)

      this.logger.log(`filter: ${JSON.stringify(filter)}`)

      /*
        We check if the challenge players are registered
      */
      if (filter.length == 0) {
        throw new BadRequestException(`The id ${challengePlayer._id} isn't a player!`)
      }

      /*
        Check if the players are part of the category informed in the challenge
      */
      if (filter[0].category != addChallenge.category) {
        throw new BadRequestException(
          `The player ${filter[0]._id} not part of the specified category!`
        )
      }
    })

    /*
      We check if the requester is a player in the match
    */
    const isMatchRequester = addChallenge.players.filter(
      (player) => player._id == addChallenge.requester.toString()
    )

    this.logger.log(`isMatchRequester: ${JSON.stringify(isMatchRequester)}`)

    if (isMatchRequester.length == 0) {
      throw new BadRequestException(`The resquester has to be a player in the match`)
    }

    /*
      We check if the category is registered
    */
    const category = await lastValueFrom(this.admin.send('all-categories', addChallenge.category))

    this.logger.log(`category: ${JSON.stringify(category)}`)

    if (!category) {
      throw new BadRequestException(`category does not exist!`)
    }

    await this.challenge.emit('add-challenge', addChallenge)
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
  //   @Body(ChallengeStatusValidacaoPipe) challenge: UpdateChallengeDto,
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
