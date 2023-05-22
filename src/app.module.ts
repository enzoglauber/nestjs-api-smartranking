import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import env from 'config/env'
import { PlayerModule } from './player/player.module'

console.log(env())
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [env],
    }),
    MongooseModule.forRoot(env().database.MONGO_CONNECTION),
    PlayerModule,
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
