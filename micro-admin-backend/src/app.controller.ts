import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { AppService } from './app.service'
import { Category } from './interfaces/category/category.interface'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('add-category')
  async addCategory(@Payload() category: Category): Promise<Category> {
    return this.appService.addCategory(category)
  }
}
