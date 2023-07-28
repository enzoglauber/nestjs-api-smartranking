import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CategorySchema } from './category/category.schema'
import { PlayerSchema } from './player/player.schema'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([
      { name: 'Player', schema: PlayerSchema },
      { name: 'Category', schema: CategorySchema }
    ])
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
