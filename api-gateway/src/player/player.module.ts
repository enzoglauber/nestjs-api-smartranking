import { Module } from '@nestjs/common'
import { AwsModule } from 'src/aws/aws.module'
import { AwsService } from 'src/aws/aws.service'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { PlayerController } from './player.controller'
import { PlayerService } from './player.service'

@Module({
  imports: [ProxyRMQModule, AwsModule],
  controllers: [PlayerController],
  providers: [PlayerService, AwsService]
})
export class PlayerModule {}
