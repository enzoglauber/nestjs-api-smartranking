import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable, lastValueFrom, tap } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { ParamsValidationPipe } from 'src/shared/pipes/params-validation.pipe'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'
@Controller('api/v1/players')
export class PlayerController {
  private client: ClientProxy
  private logger = new Logger('micro-admin-backend')

  constructor(private readonly proxyRMQService: ProxyRMQService) {
    this.client = this.proxyRMQService.get()
  }

  @Post()
  @UsePipes(ParamsValidationPipe)
  async add(@Body() player: SavePlayerDto) {
    this.logger.log(`player: ${JSON.stringify(player)}`)

    try {
      const category = await lastValueFrom(this.client.send('all-categories', player.category))

      if (category) {
        await this.client
          .emit('add-player', player)
          .pipe(tap(() => this.logger.log('tap add-player')))
      }
    } catch (error) {
      throw new BadRequestException(`Category not registered!`)
    }
  }

  @Get()
  all(@Query('id') id: string): Observable<Player[]> {
    this.logger.log(`category: ${JSON.stringify(id)}`)
    return this.client.send('all-categories', id ? id : '')
  }

  @Put('/:_id')
  @UsePipes(ParamsValidationPipe)
  update(@Body() player: SavePlayerDto, @Param('_id') _id: string) {
    this.client.emit('update-player', {
      id: _id,
      player
    })
  }
}
