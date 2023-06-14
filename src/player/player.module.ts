import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PlayerController } from './player.controller'
import { PlayerSchema } from './player.schema'
import { PlayerService } from './player.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: `Player`, schema: PlayerSchema }])],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
