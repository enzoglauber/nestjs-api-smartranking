import { Injectable, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { Challenge } from 'src/challenge/interfaces/challenge.interface'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { Match } from './match.interface'

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name)
  private readonly challengeRMQ = this.proxyRMQService.get(`challenges`)
  private readonly rankingRMQ = this.proxyRMQService.get(`rankings`)

  constructor(
    @InjectModel('Match') private readonly match: Model<Match>,
    private readonly proxyRMQService: ProxyRMQService
  ) {}

  async add(match: Match): Promise<Match> {
    try {
      /*
        We will persist the game and soon after we will update the
        challenge. The challenge will receive the match ID and its status
        will be changed to DONE.
      */
      const created = new this.match(match)
      this.logger.log(`Created Match: ${JSON.stringify(created)}`)

      const result = await created.save()
      this.logger.log(`Match: ${JSON.stringify(result)}`)
      const matchId = result._id
      /*
        With the challenge ID we received in the request, we retrieve the challenge.
      */
      const challenge: Challenge = await lastValueFrom(
        this.challengeRMQ.send('all-challenges', { playerId: '', _id: match.challenge })
      )
      /*
        We activated the topic 'update-challenge-match' which will be
        responsible for updating the challenge.
      */
      await lastValueFrom(
        this.challengeRMQ.emit('update-challenge-by-match', { matchId, challenge })
      )

      /*
        We send the match to the rankings microservice,
        indicating the need to process this item
      */
      return await lastValueFrom(this.rankingRMQ.emit('process-match', { matchId, challenge }))
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }
}
