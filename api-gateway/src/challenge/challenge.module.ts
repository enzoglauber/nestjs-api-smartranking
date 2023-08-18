import { Module } from '@nestjs/common'
import { CategoryModule } from 'src/category/category.module'
import { PlayerModule } from 'src/player/player.module'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { ChallengeController } from './challenge.controller'

@Module({
  imports: [ProxyRMQModule, PlayerModule, CategoryModule],
  controllers: [ChallengeController]
})
export class ChallengeModule {}
