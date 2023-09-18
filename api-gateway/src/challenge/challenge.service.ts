import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { Player } from 'src/player/player.interface'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { AddChallengeDto } from './dtos/add-challenge.dto'

@Injectable()
export class ChallengeService {
  private adminRMQ: ClientProxy = this.proxyRMQService.get()
  private challengeRMQ: ClientProxy = this.proxyRMQService.get('challenges')

  constructor(private readonly proxyRMQService: ProxyRMQService) {}

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
