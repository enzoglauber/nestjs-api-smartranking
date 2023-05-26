import { Injectable, Logger, NotFoundException } from '@nestjs/common'
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
    this.logger.log(find)

    if (find) {
      return await this.update(player)
    } else {
      const data = await this.insert(player)
      this.logger.verbose(data)
      return data
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

  private async update({ _id, ...player }: SavePlayerDto): Promise<Player> {
    return await this.player.findOneAndUpdate({ _id }, { $set: { ...player } }).exec()
  }

  private findByEmail(email: string): Player[] {
    const filter = this.players.filter((_player) => _player.email === email)
    if (!filter.length) {
      throw new NotFoundException(`Email's player equal ${email}, not found!`)
    }
    return filter
  }

  private async insert(player: SavePlayerDto): Promise<Player> {
    const created = new this.player(player)
    return await created.save()
  }
}
