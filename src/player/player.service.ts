import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  private players: Player[] = []
  private readonly logger = new Logger(PlayerService.name)

  constructor(@InjectModel('Player') private readonly player: Model<Player>) {}

  async save(player: SavePlayerDto): Promise<void> {
    const { email } = player
    const find = await this.player.findOne({ email }).exec()

    if (find) {
      this.update(find, player)
    } else {
      this.insert(player)
    }
  }

  async remove(email?: string): Promise<void> {
    const find = this.players.find((player) => player.email === email)
    this.players = this.players.filter((player) => player.email !== find.email)
  }

  async find(email?: string): Promise<Player[]> {
    if (email) {
      return this.findByEmail(email)
    } else {
      return this.players
    }
  }

  private update(find: Player, player: SavePlayerDto): void {
    const { name } = player
    find.name = name
  }

  private findByEmail(email: string): Player[] {
    const filter = this.players.filter((_player) => _player.email === email)
    if (!filter.length) {
      throw new NotFoundException(`Email's player equal ${email}, not found!`)
    }
    return filter
  }

  private insert(savePlayer: SavePlayerDto): void {
    const { name, email, phone } = savePlayer
    const player: Player = {
      _id: uuidv4(),
      name,
      email,
      phone,
      ranking: 'A',
      position: 1,
      photo: 'www.google.com.br/foto123.jpg'
    }
    this.logger.log(player)
    this.players.push(player)
  }
}
