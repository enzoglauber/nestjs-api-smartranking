import { Module } from '@nestjs/common'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { RankingController } from './ranking.controller'

@Module({
  imports: [ProxyRMQModule],
  controllers: [RankingController]
})
export class RankingModule {}
