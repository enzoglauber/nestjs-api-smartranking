import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { DeleteResult } from 'mongodb'
import { Model } from 'mongoose'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  private players: Player[] = []
  private readonly logger = new Logger(PlayerService.name)

  constructor(@InjectModel('Player') private readonly player: Model<Player>) {}

  async save(player: SavePlayerDto): Promise<Player> {
    const { email } = player
    const find = await this.find(email)

    if (find) {
      return await this.update(player)
    } else {
      return await this.insert(player)
    }
  }

  async remove(email?: string): Promise<DeleteResult> {
    return await this.player.deleteOne({ email }).exec()
  }

  async find(email?: string): Promise<Player[] | Player> {
    if (email) {
      return await this.player.findOne({ email }).exec()
    } else {
      return await this.player.find({}).exec()
    }
  }

  async findById(_id?: string): Promise<Player> {
    return await this.player.findOne({ _id }).exec()
  }

  private async update({ _id, ...player }: SavePlayerDto): Promise<Player> {
    return await this.player
      .findOneAndUpdate({ _id }, { $set: { ...player } }, { upsert: true })
      .exec()
  }

  private async insert(player: SavePlayerDto): Promise<Player> {
    const created = new this.player(player)
    return await created.save()
  }
}
