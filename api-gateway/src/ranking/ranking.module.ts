import { Module } from '@nestjs/common'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { RankingController } from './ranking.controller'
import { RankingService } from './ranking.service';

@Module({
  imports: [ProxyRMQModule],
  controllers: [RankingController],
  providers: [RankingService]
})
export class RankingModule {}
