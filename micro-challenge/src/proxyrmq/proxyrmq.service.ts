import { Injectable } from '@nestjs/common'
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices'

@Injectable()
export class ProxyRMQService {
  get(queue: string = 'admin-backend'): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASSWORD}@${process.env.RMQ_IP}/smartranking`
        ],
        queue
      }
    })
  }
}
