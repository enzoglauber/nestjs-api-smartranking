import { Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { Category } from './category.interface'
import { InsertCategoryDto } from './dtos/insert-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(private readonly proxyRMQService: ProxyRMQService) {}
  private adminRMQ: ClientProxy = this.proxyRMQService.get()

  add(category: InsertCategoryDto) {
    this.adminRMQ.emit('add-category', category)
  }

  async all(id: string): Promise<Category[]> {
    return lastValueFrom<Category[]>(this.adminRMQ.send<Category[]>('all-categories', id ? id : ''))
  }

  update(category: UpdateCategoryDto, id: string) {
    this.adminRMQ.emit('update-category', {
      id,
      category
    })
  }
}
