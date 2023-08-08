import { Body, Controller, Get, Logger, Param, Post, Put, Query, UsePipes } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Observable, tap } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { ParamsValidationPipe } from 'src/shared/pipes/params-validation.pipe'
import { Category } from './category.interface'
import { InsertCategoryDto } from './dtos/insert-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'
@Controller('api/v1/categories')
export class CategoryController {
  private client: ClientProxy
  private logger = new Logger('micro-admin-backend')

  constructor(private readonly proxyRMQService: ProxyRMQService) {
    this.client = this.proxyRMQService.get()
  }

  @Post()
  @UsePipes(ParamsValidationPipe)
  add(@Body() category: InsertCategoryDto) {
    this.client.emit('add-category', category).pipe(tap(() => this.logger.log('tap add-category')))
  }

  @Get()
  all(@Query('id') id: string): Observable<Category[]> {
    this.logger.log(`category: ${JSON.stringify(id)}`)
    return this.client.send('all-categories', id ? id : '')
  }

  @Put('/:_id')
  @UsePipes(ParamsValidationPipe)
  update(@Body() category: UpdateCategoryDto, @Param('_id') _id: string) {
    this.client.emit('update-category', {
      id: _id,
      category
    })
  }
}
