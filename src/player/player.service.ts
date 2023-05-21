import { Injectable, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  private players: Player[] = []
  private readonly logger = new Logger(PlayerService.name)

  async save(player: SavePlayerDto): Promise<void> {
    const { email } = player
    const find = this.players.find((_player) => _player.email === email)
    if (find) {
      this.update(find, player)
    } else {
      this.insert(player)
    }
  }

  async find(email?: string): Promise<Player[]> {
    if (email) {
      return await this.findByEmail(email)
    } else {
      return await this.players
    }
  }

  private update(find: Player, player: SavePlayerDto): void {
    const { name } = player
    find.name = name
  }

  private findByEmail(email: string): Player[] {
    return this.players.filter((_player) => _player.email === email)
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
