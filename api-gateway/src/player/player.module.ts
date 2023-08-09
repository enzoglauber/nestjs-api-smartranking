import { Module } from '@nestjs/common'
import { AwsModule } from 'src/aws/aws.module'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { PlayerController } from './player.controller'

@Module({
  imports: [ProxyRMQModule, AwsModule],
  controllers: [PlayerController]
})
export class PlayerModule {}
