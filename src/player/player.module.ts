import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PlayerController } from './player.controller'
import { PlayerSchema } from './player.schema'
import { PlayerService } from './player.service'

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
  imports: [MongooseModule.forFeature([{ name: `player`, schema: PlayerSchema }])]
})
export class PlayerModule {}
