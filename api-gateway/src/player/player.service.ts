import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { Category } from 'src/category/category.interface'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  constructor(private readonly proxyRMQService: ProxyRMQService) {}
  private adminRMQ: ClientProxy = this.proxyRMQService.get()

  async add(player: SavePlayerDto): Promise<void> {
    try {
      const category = await lastValueFrom(this.adminRMQ.send('all-categories', player.category))

      if (category) {
        return await lastValueFrom(this.adminRMQ.emit('add-player', player))
      }
    } catch (error) {
      throw new BadRequestException(`Category not registered!`)
    }
  }

  async all(id: string): Promise<Player[]> {
    return lastValueFrom<Player[]>(this.adminRMQ.send<Player[]>('all-players', id ? id : ''))
  }

  async update(player: SavePlayerDto) {
    const category: Category = await lastValueFrom(
      this.adminRMQ.send('all-categories', player.category)
    )

    if (category) {
      await this.adminRMQ.emit('update-player', player)
    } else {
      throw new BadRequestException(`Category not registered!`)
    }
  }
}
