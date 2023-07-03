import { Controller } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import * as dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

@Controller('api/v1')
export class AppController {
  private clientProxy: ClientProxy;

  constructor() {
    this.clientProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASSWORD}@${process.env.RMQ_IP}/smartranking`,
        ],
        queue: 'admin-backend',
      },
    });
  }
}
