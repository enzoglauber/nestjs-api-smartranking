import { Module } from '@nestjs/common'
import { RankingController } from './ranking.controller'
import { RankingService } from './ranking.service'

import { MongooseModule } from '@nestjs/mongoose'
import { RankingSchema } from './ranking.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ranking', schema: RankingSchema }])],
  providers: [RankingService],
  controllers: [RankingController]
})
export class RankingModule {}
