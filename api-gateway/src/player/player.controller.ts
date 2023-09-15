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
import { lastValueFrom } from 'rxjs'
import { AwsService } from 'src/aws/aws.service'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { ParamsValidationPipe } from 'src/shared/pipes/params-validation.pipe'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'
import { PlayerService } from './player.service'
@Controller('api/v1/players')
export class PlayerController {
  private client: ClientProxy
  private logger = new Logger('micro-admin-backend')

  constructor(
    private readonly proxyRMQService: ProxyRMQService,
    private readonly awsService: AwsService,
    private readonly playerService: PlayerService
  ) {
    this.client = this.proxyRMQService.get()
  }

  @Post()
  @UsePipes(ParamsValidationPipe)
  async add(@Body() player: SavePlayerDto) {
    this.playerService.add(player)
  }

  @Get()
  async all(@Query('id') id: string): Promise<Player[]> {
    return await this.playerService.all(id)
  }

  @Put('/:_id')
  @UsePipes(ParamsValidationPipe)
  async update(@Body() player: Player, @Param('_id') _id: string) {
    await this.playerService.update({ ...player, _id })
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

    await this.playerService.update({ ...player, _id })

    return this.client.send<Player>('all-players', _id)
  }
}
