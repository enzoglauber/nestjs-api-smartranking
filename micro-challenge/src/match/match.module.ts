import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module'
import { MatchController } from './match.controller'
import { MatchSchema } from './match.schema'
import { MatchService } from './match.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Match', schema: MatchSchema }]), ProxyRMQModule],
  controllers: [MatchController],
  providers: [MatchService]
})
export class MatchModule {}
