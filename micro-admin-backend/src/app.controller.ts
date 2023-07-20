import { Controller, Logger } from '@nestjs/common'
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'
import { AppService } from './app.service'
import { Category } from './interfaces/category/category.interface'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  logger = new Logger(AppController.name)

  @EventPattern('add-category')
  addCategory(@Payload() category: Category) {
    this.logger.log(`category: ${JSON.stringify(category)}`)
    this.appService.addCategory(category)
  }

  @MessagePattern('all-categories')
  async allCategories(@Payload() _id: string): Promise<Category[]> {
    this.logger.log(`category: ${JSON.stringify(_id)}`)
    return await this.appService.allCategories({ _id })
  }
}
