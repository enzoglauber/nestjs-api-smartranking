import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AwsModule } from './aws/aws.module'
import { CategoryModule } from './category/category.module'
import { ChallengeModule } from './challenge/challenge.module'
import { PlayerModule } from './player/player.module'
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module'
import { ProxyRMQService } from './proxyrmq/proxyrmq.service'
import { RankingModule } from './ranking/ranking.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProxyRMQModule,
    AwsModule,
    PlayerModule,
    CategoryModule,
    ChallengeModule,
    RankingModule
  ],
  controllers: [],
  providers: [ProxyRMQService]
})
export class AppModule {}
