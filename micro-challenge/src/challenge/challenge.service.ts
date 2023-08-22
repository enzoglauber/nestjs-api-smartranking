import { Injectable, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AddChallengeDto } from './dtos/add-challenge.dto'
import { ChallengeStatus } from './interfaces/challenge-status.enum'
import { Challenge } from './interfaces/challenge.interface'

@Injectable()
export class ChallengeService {
  constructor(@InjectModel('Challenge') private readonly challenge: Model<Challenge>) {}

  private readonly logger = new Logger(ChallengeService.name)

  async add(challenge: AddChallengeDto): Promise<Challenge> {
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
}
