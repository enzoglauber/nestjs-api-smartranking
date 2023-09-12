import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    // MailerModule.forRoot({
    //   transport: {
    //     host: 'email-smtp.us-east-1.amazonaws.com',
    //     port: 587,
    //     secure: false,
    //     tls: {
    //       ciphers: 'SSLv3'
    //     },
    //     auth: {
    //       user: 'AKIA4KCP6CKKMS2EP4NU',
    //       pass: 'BBMCxEYxkR5nbvAsC++XNSrWBMtIp9YOQ0WAoBTrlE9+'
    //     }
    //   }
    // }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAILER_HOST'),
          port: 587,
          secure: false,
          tls: {
            ciphers: 'SSLv3'
          },
          auth: {
            user: configService.get('MAILER_USER'),
            pass: configService.get('MAILER_PASS')
          }
        }
      }),
      inject: [ConfigService]
    }),
    ProxyRMQModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
