import { Module } from '@nestjs/common'
import { ProxyRMQService } from './proxyrmq.service'

@Module({
  providers: [ProxyRMQService],
  exports: [ProxyRMQService]
})
export class ProxyRMQModule {}
