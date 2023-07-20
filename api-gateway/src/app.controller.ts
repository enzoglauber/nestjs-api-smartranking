import { Body, Controller, Get, Logger, Post, Query, UsePipes } from '@nestjs/common'
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices'
import { Transport } from '@nestjs/microservices/enums'
import * as dotenv from 'dotenv'
import { Observable, tap } from 'rxjs'
import { Category } from './shared/dtos/category.interface'
import { InsertCategoryDto } from './shared/dtos/insert-category.dto'
import { ParamsValidationPipe } from './shared/pipes/params-validation.pipe'
dotenv.config() // Carrega as variáveis de ambiente do arquivo .env
@Controller('api/v1')
export class AppController {
  private clientProxy: ClientProxy
  private logger = new Logger('micro-admin-backend')
  constructor() {
    this.clientProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASSWORD}@${process.env.RMQ_IP}/smartranking`
        ],
        queue: 'admin-backend'
      }
    })
  }

  @Post('category')
  @UsePipes(ParamsValidationPipe)
  add(@Body() category: InsertCategoryDto) {
    this.clientProxy.emit('add-category', category).pipe(tap(() => this.logger.log('legal')))
  }

  @Get('categories')
  all(@Query('id') id: string): Observable<Category[]> {
    this.logger.log(`category: ${JSON.stringify(id)}`)
    return this.clientProxy.send('all-categories', id ? id : '')
  }
}
