import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { DeleteResult } from 'mongodb'
import { Model } from 'mongoose'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  constructor(@InjectModel('Player') private readonly player: Model<Player>) {}

  // async save(player: SavePlayerDto): Promise<Player> {
  //   const { _id } = player
  //   const find = await this.find({ _id })

  //   if (find) {
  //     // throw new BadRequestException(`Player\`s email(${player.email}) already registered.`)
  //     return await this.update(player)
  //   } else {
  //     return await this.insert(player)
  //   }
  // }

  async remove(_id?: string): Promise<DeleteResult> {
    const notFound = !(await this.player.findOne({ _id }).exec())
    if (notFound) {
      throw new NotFoundException(`Player id: ${_id} not found`)
    }

    return await this.player.deleteOne({ _id }).exec()
  }

  async find(filter?: Partial<SavePlayerDto>): Promise<Player[] | Player> {
    if (filter) {
      return await this.player.findOne({ filter }).exec()
    } else {
      return await this.player.find({}).exec()
    }
  }

  async all(): Promise<Player[]> {
    return await this.player.find({}).exec()
  }

  async findById(_id?: string): Promise<Player> {
    const notFound = !(await this.player.findOne({ _id }).exec())
    if (notFound) {
      throw new NotFoundException(`Player id: ${_id} not found`)
    }

    return await this.player.findOne({ _id }).exec()
  }

  async update({ _id, ...player }: SavePlayerDto): Promise<void> {
    const notFound = !(await this.player.findOne({ _id }).exec())
    if (notFound) {
      throw new NotFoundException(`Player id: ${_id} not found`)
    }

    await this.player.findOneAndUpdate({ _id }, { $set: { ...player } }, { upsert: true }).exec()
  }

  async insert(player: SavePlayerDto): Promise<Player> {
    const { email } = player
    const find = await this.player.findOne({ email }).exec()

    if (find) {
      throw new BadRequestException(`Player's email ${email} already registered.`)
    }

    const created = new this.player(player)
    return await created.save()
  }
}
