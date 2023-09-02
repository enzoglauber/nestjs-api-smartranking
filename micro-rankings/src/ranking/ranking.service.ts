import { Injectable, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { EventEnum } from 'src/shared/interfaces/event.enum'
import { Category } from '../shared/interfaces/category.interface'
import { Match } from '../shared/interfaces/match.interface'
import { Ranking } from './ranking.schema'
@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name)
  private readonly challengeRMQ = this.proxyRMQService.get(`challenges`)
  private readonly adminRMQ = this.proxyRMQService.get(`admin-backend`)

  constructor(
    @InjectModel('Ranking') private readonly ranking: Model<Ranking>,
    private readonly proxyRMQService: ProxyRMQService
  ) {}

  async process(matchId: string, match: Match): Promise<void> {
    try {
      const category: Category = await lastValueFrom(
        this.adminRMQ.send('all-categories', match.category)
      )

      const createRankingEntry = async (player: string, isWinner: boolean): Promise<void> => {
        const event = isWinner ? EventEnum.VICTORY : EventEnum.DEFEAT
        const filter = category.events.find(({ name }) => name === event)

        if (!filter) {
          return
        }

        const ranking = new this.ranking({
          category: match.category,
          challenge: match.challenge,
          match: matchId,
          player,
          event,
          operation: filter.operation,
          point: filter.value
        })

        this.logger.log(`ranking: ${JSON.stringify(ranking)}`)
        await ranking.save()
      }

      await Promise.all(
        match.players.map(async (player) => {
          const isWinner = player === match.winner
          await createRankingEntry(player, isWinner)
        })
      )
    } catch (error) {
      this.logger.error(`error: ${error}`)
      throw new RpcException(error.message)
    }
  }
}
