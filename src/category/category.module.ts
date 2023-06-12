import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PlayerModule } from 'src/player/player.module'
import { PlayerService } from 'src/player/player.service'
import { CategoryController } from './category.controller'
import { CategorySchema } from './category.schema'
import { CategoryService } from './category.service'

@Module({
  imports: [
    PlayerModule,
    MongooseModule.forFeature([{ name: `Category`, schema: CategorySchema }])
  ],
  controllers: [CategoryController],
  providers: [CategoryService, PlayerService]
})
export class CategoryModule {}
