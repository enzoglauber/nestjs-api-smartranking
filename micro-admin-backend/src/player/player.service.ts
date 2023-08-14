import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

import { RpcException } from '@nestjs/microservices'

@Injectable()
export class PlayerService {
  constructor(@InjectModel('Player') private readonly player: Model<Player>) {}
  private readonly logger = new Logger(PlayerService.name)

  async add(player: Player): Promise<void> {
    try {
      const added = new this.player(player)
      await added.save()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async remove(_id: string): Promise<void> {
    try {
      await this.player.deleteOne({ _id }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async all(filter: Partial<SavePlayerDto> = {}): Promise<Player[]> {
    try {
      return await this.player.find(filter).exec()
    } catch (error) {
      this.logger.error(`all error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async one(filter: Partial<SavePlayerDto> = {}): Promise<Player> {
    try {
      return await this.player.findOne(filter).exec()
    } catch (error) {
      this.logger.error(`one error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async update({ _id, ...player }: SavePlayerDto): Promise<void> {
    try {
      this.player.findOneAndUpdate({ _id }, { $set: { ...player } }, { upsert: true }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async findById(_id?: string): Promise<Player> {
    try {
      return await this.one({ _id })
    } catch (error) {
      this.logger.error(`one error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }
}
