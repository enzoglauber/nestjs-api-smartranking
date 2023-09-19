import { BadRequestException, Injectable } from '@nestjs/common'
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

@Injectable()
export class ChallengeService {
  private adminRMQ: ClientProxy = this.proxyRMQService.get()
  private challengeRMQ: ClientProxy = this.proxyRMQService.get('challenges')

  constructor(private readonly proxyRMQService: ProxyRMQService) {}

  async remove(_id: string): Promise<void> {
    const challenge: Challenge = await lastValueFrom(
      this.challengeRMQ.send('all-challenges', { playerId: '', _id })
    )

    if (!challenge) {
      throw new BadRequestException(`Challenge not found!`)
    }

    await this.challengeRMQ.emit('remove-challenge', challenge)
  }

  async addChallengeMatch(_id: string, challenge: AddMatchToChallenge): Promise<void> {
    const find: Challenge = await lastValueFrom(
      this.challengeRMQ.send('all-challenges', { playerId: '', _id })
    )

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

    await this.challengeRMQ.emit('add-match', match)
  }
  async update(_id: string, challenge: UpdateChallengeDto): Promise<void> {
    const find: Challenge = await lastValueFrom(
      this.challengeRMQ.send('all-challenges', { playerId: '', _id })
    )

    if (!find) {
      throw new BadRequestException(`Challenge not found!`)
    }

    if (find.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Only challenges with PENDING status can be updated!')
    }

    return await lastValueFrom(this.challengeRMQ.emit('update-challenge', { _id, challenge }))
  }

  async all<T = Challenge | Challenge[]>(playerId: string): Promise<T> {
    if (playerId) {
      const player: Player = await lastValueFrom(this.adminRMQ.send('all-player', playerId))
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
    return lastValueFrom<T>(this.challengeRMQ.send<T>('all-challenges', { playerId, _id: '' }))
  }

  async add(challenge: AddChallengeDto): Promise<void> {
    try {
      await this.validatePlayers(challenge.players, challenge.category)
      await this.validateRequester(challenge.players, challenge.requester)
      await this.validateCategory(challenge.category)

      return await lastValueFrom(this.challengeRMQ.emit('add-challenge', challenge))
    } catch (error) {
      throw new BadRequestException(`Category not registered!`)
    }
  }

  private async validatePlayers(players: Player[], category: string): Promise<void> {
    const playersResponse = await lastValueFrom(this.adminRMQ.send('all-player', ''))

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
    const categoryResponse = await lastValueFrom(this.adminRMQ.send('all-categories', category))

    if (!categoryResponse) {
      throw new BadRequestException(`Category does not exist!`)
    }
  }
}
