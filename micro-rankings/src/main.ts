import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import * as moment from 'moment-timezone'
import { AppModule } from './app.module'

const logger = new Logger('micro-rankings')

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASSWORD}@${process.env.RMQ_IP}/rankings`
      ],
      noAck: false, // força o rmq somente deletar o item na fila após a confirmação
      queue: 'rankings'
    }
  })

  Date.prototype.toJSON = function (): string {
    return moment(this).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss.SSS')
  }

  await app.listen()
  logger.log('Rankings service is listening')
}
bootstrap().catch((error) => {
  logger.error('Error to starting rankings microservice', error)
})
