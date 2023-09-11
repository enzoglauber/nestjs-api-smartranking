import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ProxyRMQModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
