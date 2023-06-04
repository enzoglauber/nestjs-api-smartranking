import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category } from './category.interface'
import { InsertCategoryDto } from './dtos/insert-category.dto'

@Injectable()
export class CategoryService {
  constructor(@InjectModel('Category') private readonly category: Model<Category>) {}

  async insert(category: InsertCategoryDto): Promise<Category> {
    const { name } = category
    const find = await this.category.findOne({ name }).exec()

    if (find) {
      throw new BadRequestException(`category's name: ${name} already registered.`)
    }

    const created = new this.category(category)
    return await created.save()
  }
}
