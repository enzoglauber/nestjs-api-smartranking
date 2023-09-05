import { Injectable, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import * as _ from 'lodash'
import * as moment from 'moment-timezone'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { Challenge } from 'src/shared/interfaces/challenge.interface'
import { EventEnum } from 'src/shared/interfaces/event.enum'
import { RankingResponse } from 'src/shared/interfaces/ranking-response.interface'
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

  async all(
    categoryId: any,
    date: string = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD')
  ): Promise<RankingResponse[] | RankingResponse> {
    try {
      this.logger.log(`categoryId: ${categoryId} date: ${date}`)

      const rankings = await this.ranking.find().where('category').equals(categoryId).exec()

      const challenges: Challenge[] = await lastValueFrom(
        this.challengeRMQ.send('consultar-desafios-realizados', { categoryId, date })
      )

      const filteredRankings = rankings.filter((item) =>
        challenges.some((challenge) => challenge._id === item.challenge)
      )

      const groupedRankings = _(filteredRankings)
        .groupBy('player')
        .map((items, key) => ({
          player: key,
          history: _.countBy(items, 'event'),
          point: _.sumBy(items, 'point')
        }))
        .value()

      const orderedRankings = _.orderBy(groupedRankings, 'point', 'desc')

      const rankingResponseList: RankingResponse[] = orderedRankings.map((item, index) => ({
        player: item.player,
        position: index + 1,
        point: item.point,
        history: {
          wins: item.history.WIN || 0,
          losses: item.history.LOSE || 0
        }
      }))

      this.logger.log(`ordered: ${JSON.stringify(orderedRankings)}`)

      return rankingResponseList
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }
}
