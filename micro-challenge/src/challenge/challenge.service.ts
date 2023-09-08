import { Injectable, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment-timezone'
import { Model } from 'mongoose'
import { ChallengeStatus } from './interfaces/challenge-status.enum'
import { Challenge } from './interfaces/challenge.interface'

@Injectable()
export class ChallengeService {
  constructor(@InjectModel('Challenge') private readonly challenge: Model<Challenge>) {}

  private readonly logger = new Logger(ChallengeService.name)

  async add(challenge: Challenge): Promise<Challenge> {
    try {
      const created = new this.challenge(challenge)

      created.when = new Date()
      created.status = ChallengeStatus.PENDING

      this.logger.log(`Add Challenge: ${JSON.stringify(created)}`)
      return await created.save()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async all(): Promise<Challenge[]> {
    try {
      return await this.challenge.find().exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async byPlayerId(_id: any): Promise<Challenge[] | Challenge> {
    try {
      return await this.challenge.find().where('players').in(_id).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async byId(_id: any): Promise<Challenge> {
    try {
      return await this.challenge.findOne({ _id }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async update(_id: string, challenge: Challenge): Promise<void> {
    try {
      /*
        We will update the response date when the challenge status comes filled
      */
      challenge.response = new Date()
      await this.challenge.findOneAndUpdate({ _id }, { $set: challenge }).exec()
    } catch (error) {
      this.logger.error(`rror: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async updateByMatch(matchId: string, challenge: Challenge): Promise<void> {
    try {
      /*
        When a match is registered by a user, we will change the challenge status to DONE
      */
      challenge.status = ChallengeStatus.DONE
      challenge.match = matchId
      await this.challenge.findOneAndUpdate({ _id: challenge._id }, { $set: challenge }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async remove({ _id, ...challenge }: Challenge): Promise<void> {
    try {
      /*
        We will carry out the logical deletion of the challenge, modifying its status to
        CANCELED
      */
      challenge.status = ChallengeStatus.CANCELED
      this.logger.log(`Challenge: ${JSON.stringify({ _id, challenge })}`)

      await this.challenge.findOneAndUpdate({ _id }, { $set: challenge }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async findByDate(categoryId: string, date: string): Promise<Challenge[]> {
    try {
      const when = moment(`${date} 23:59:59.999`).tz('UTC').toDate().getTime()

      return await this.challenge
        .find()
        .where('category')
        .equals(categoryId)
        .where('status')
        .equals(ChallengeStatus.DONE)
        .where('when')
        .lte(when)
        .exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }
}
