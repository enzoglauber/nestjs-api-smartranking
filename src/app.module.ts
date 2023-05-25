import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { PlayerModule } from './player/player.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log(configService.get('MONGODB_URI'))
        return { uri: configService.get('MONGODB_URI') }
      },
      inject: [ConfigService]
    }),
    PlayerModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
