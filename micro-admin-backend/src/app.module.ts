import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CategorySchema } from './interfaces/category/category.schema'
import { PlayerSchema } from './interfaces/player/player.schema'

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
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: true
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
