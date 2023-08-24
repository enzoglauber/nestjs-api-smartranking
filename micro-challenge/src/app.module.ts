import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ChallengeModule } from './challenge/challenge.module'
import { MatchModule } from './match/match.module'
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI')
      }),
      inject: [ConfigService]
    }),

    ChallengeModule,
    ProxyRMQModule,
    MatchModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
