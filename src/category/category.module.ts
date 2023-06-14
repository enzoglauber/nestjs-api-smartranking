import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PlayerModule } from 'src/player/player.module'
import { CategoryController } from './category.controller'
import { CategorySchema } from './category.schema'
import { CategoryService } from './category.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: `Category`, schema: CategorySchema }]),
    PlayerModule
  ],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
