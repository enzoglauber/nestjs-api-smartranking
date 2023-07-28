import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'
import { AppService } from './app.service'
import { Category } from './category/category.interface'

const errors: string[] = ['E1100']
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  logger = new Logger(AppController.name)

  @EventPattern('add-category')
  async addCategory(@Payload() category: Category, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    
    this.logger.log(`category: ${JSON.stringify(category)}`)
    try {
      await this.appService.addCategory(category)
      await channel.ack(message) // remove da fila do rmq
    } catch (err) {
      this.logger.log(err)
      errors.map(async (error) => {
        if (err.message.includes(error)) {
          await channel.ack(message) // remove da fila do rmq
        }
      })
    }
  }

  @MessagePattern('all-categories')
  async allCategories(@Payload() _id: string): Promise<Category[]> {
    this.logger.log(`category: ${JSON.stringify(_id)}`)
    return await this.appService.allCategories({ _id })
  }
}
