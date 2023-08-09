import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AwsModule } from './aws/aws.module'
import { CategoryModule } from './category/category.module'
import { PlayerModule } from './player/player.module'
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module'
import { ProxyRMQService } from './proxyrmq/proxyrmq.service'

@Module({
  imports: [
    ProxyRMQModule,
    AwsModule,
    PlayerModule,
    CategoryModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
  controllers: [],
  providers: [ProxyRMQService]
})
export class AppModule {}
