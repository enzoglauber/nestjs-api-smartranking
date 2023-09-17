import { Module } from '@nestjs/common'
import { CategoryModule } from 'src/category/category.module'
import { PlayerModule } from 'src/player/player.module'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { ChallengeController } from './challenge.controller'
import { ChallengeService } from './challenge.service';

@Module({
  imports: [ProxyRMQModule, PlayerModule, CategoryModule],
  controllers: [ChallengeController],
  providers: [ChallengeService]
})
export class ChallengeModule {}
