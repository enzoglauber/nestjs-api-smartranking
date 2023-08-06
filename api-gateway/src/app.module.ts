import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module'
import { ProxyRMQService } from './proxyrmq/proxyrmq.service'

@Module({
  imports: [ProxyRMQModule],
  controllers: [AppController],
  providers: [ProxyRMQService]
})
export class AppModule {}
