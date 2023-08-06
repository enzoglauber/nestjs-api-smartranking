import { Module } from '@nestjs/common'
import { PlayerModule } from 'src/player/player.module'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { CategoryController } from './category.controller'

@Module({
  imports: [ProxyRMQModule, PlayerModule],
  controllers: [CategoryController]
})
export class CategoryModule {}
