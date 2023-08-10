import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { FileInterceptor } from '@nestjs/platform-express'
import { Observable, lastValueFrom, tap } from 'rxjs'
import { AwsService } from 'src/aws/aws.service'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { ParamsValidationPipe } from 'src/shared/pipes/params-validation.pipe'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'
@Controller('api/v1/players')
export class PlayerController {
  private client: ClientProxy
  private logger = new Logger('micro-admin-backend')

  constructor(
    private readonly proxyRMQService: ProxyRMQService,
    private readonly awsService: AwsService
  ) {
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

  @Delete('/:_id')
  async remove(@Param('_id', ParamsValidationPipe) _id: string) {
    await this.client.emit('remove-player', { _id })
  }

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file, @Param('_id') _id: string) {
    this.logger.log(file)

    const player = await lastValueFrom(this.client.send('all-players', _id))

    if (!player) {
      throw new BadRequestException(`Player not found!`)
    }

    const photo = await this.awsService.upload(file, _id)
    player.photo = photo.url

    await this.client.emit('update-player', {
      id: _id,
      player
    })

    //Retornar o jogador atualizado para o cliente
    return this.client.send('all-players', _id)
  }
}
