import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
const logger = new Logger('micro-admin-backend')

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASSWORD}@${process.env.RMQ_IP}/smartranking`
        ],
        noAck: false, // força o rmq somente deletar o item na fila após a confirmação
        queue: 'admin-backend'
      }
    },
  );
  await app.listen();
  logger.log('Microservices is listening');
}
bootstrap().catch((error) => {
  logger.error('Error to starting microservices', error);
});
