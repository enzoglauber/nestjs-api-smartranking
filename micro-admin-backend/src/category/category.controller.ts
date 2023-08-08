import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'
import { Category } from './category.interface'
import { CategoryService } from './category.service'

const errors: string[] = ['E1100']
@Controller('api/v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  logger = new Logger(CategoryController.name)

  @EventPattern('add-category')
  async add(@Payload() category: Category, @Ctx() context: RmqContext): Promise<Category> {
    const channel = context.getChannelRef()
    const message = context.getMessage()

    this.logger.log(`category: ${JSON.stringify(category)}`)
    try {
      const added = await this.categoryService.add(category)
      await channel.ack(message) // remove da fila do rmq
      return added
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      this.ack(channel, message, error)
    }
  }

  @MessagePattern('all-categories')
  async all(@Payload() _id: string, @Ctx() context: RmqContext): Promise<Category[] | Category> {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      if (_id) {
        return await this.categoryService.one({ _id })
      } else {
        return await this.categoryService.all()
      }
    } finally {
      await channel.ack(message)
    }
  }

  @EventPattern('update-category')
  async update(
    @Payload() { id, category }: { id: string; category: Category },
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    this.logger.log(`data: ${JSON.stringify({ id, category })}`)

    try {
      await this.categoryService.update(id, category)
      await channel.ack(message)
    } catch (error) {
      this.ack(channel, message, error)
    }
  }

  @EventPattern('remove-category')
  async remove(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    try {
      await this.categoryService.remove(_id)
      await channel.ack(message)
    } catch (error) {
      this.ack(channel, message, error)
    }
  }

  private async ack(channel: any, message: Record<string, any>, error) {
    const filter = errors.filter((code) => error.message.includes(code))

    if (filter.length) {
      await channel.ack(message)
    }
  }
}
