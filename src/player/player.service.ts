import { Injectable, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  private players: Player[] = []
  private readonly logger = new Logger(PlayerService.name)

  async save(player: SavePlayerDto): Promise<void> {
    await this.insert(player)
  }

  async get(): Promise<Player[]> {
    return await this.players
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
