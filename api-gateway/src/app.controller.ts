import { Controller } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';

@Controller('api/v1')
export class AppController {
  private clientProxy: ClientProxy;

  constructor() {
    this.clientProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
    });
  }
}
