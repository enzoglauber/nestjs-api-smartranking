import { Module } from '@nestjs/common'
import { PlayerModule } from 'src/player/player.module'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'

@Module({
  imports: [ProxyRMQModule, PlayerModule],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
