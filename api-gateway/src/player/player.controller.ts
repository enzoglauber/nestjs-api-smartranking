import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { ParamsValidationPipe } from 'src/shared/pipes/params-validation.pipe'
import { SavePlayerDto } from './dtos/save-player.dto'
import { Player } from './player.interface'
import { PlayerService } from './player.service'
@Controller('api/v1/players')
export class PlayerController {
  private logger = new Logger(PlayerController.name)

  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @UsePipes(ParamsValidationPipe)
  async add(@Body() player: SavePlayerDto) {
    this.playerService.add(player)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async all(@Req() request: Request, @Query('id') id: string): Promise<Player[]> {
    this.logger.log(`req: ${JSON.stringify(request.user)}`)
    return await this.playerService.all(id)
  }

  @Put('/:_id')
  @UsePipes(ParamsValidationPipe)
  async update(@Body() player: Player, @Param('_id') _id: string): Promise<void> {
    await this.playerService.update({ ...player, _id })
  }

  @Delete('/:_id')
  async remove(@Param('_id', ParamsValidationPipe) _id: string): Promise<void> {
    await this.playerService.remove(_id)
  }

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Param('_id') _id: string) {
    await this.playerService.upload(file, _id)
  }
}
