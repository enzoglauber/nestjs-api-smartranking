import { Controller, Logger } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { AppService } from './app.service'
import { Category } from './interfaces/category/category.interface'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  logger = new Logger(AppController.name)

  @EventPattern('add-category')
  async addCategory(@Payload() category: Category): Promise<Category> {
    this.logger.log(`category: ${JSON.stringify(category)}`)
    return this.appService.addCategory(category)
  }
}
