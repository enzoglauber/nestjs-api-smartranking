import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { AwsService } from 'src/aws/aws.service'
import { Category } from 'src/category/category.interface'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'

@Injectable()
export class PlayerService {
  constructor(
    private readonly proxyRMQService: ProxyRMQService,
    private readonly awsService: AwsService
  ) {}
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

  async all<T = Player | Player[]>(id: string): Promise<T> {
    return lastValueFrom<T>(this.adminRMQ.send<T>('all-players', id ? id : ''))
  }

  async update(player: SavePlayerDto) {
    const category: Category = await lastValueFrom(
      this.adminRMQ.send('all-categories', player.category)
    )

    if (category) {
      return await lastValueFrom<void>(this.adminRMQ.emit('update-player', player))
    } else {
      throw new BadRequestException(`Category not registered!`)
    }
  }

  async remove(_id: string): Promise<void> {
    return await lastValueFrom<void>(this.adminRMQ.emit('remove-player', _id))
  }

  async upload(file: Express.Multer.File, _id: string): Promise<Player> {
    const player = await this.all<Player>(_id)

    if (!player) {
      throw new BadRequestException(`Player not found!`)
    }

    const photo = await this.awsService.upload(file, _id)
    player.photo = photo

    await this.update({ ...player, _id })

    return await this.all<Player>(_id)
  }
}
