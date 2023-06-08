import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category } from './category.interface'
import { InsertCategoryDto } from './dtos/insert-category.dto'

@Injectable()
export class CategoryService {
  constructor(@InjectModel('Category') private readonly category: Model<Category>) {}

  async insert(category: InsertCategoryDto): Promise<Category> {
    const { name } = category
    const notFind = !(await this.exists({ name }))
    if (notFind) {
      const created = new this.category(category)
      return await created.save()
    }
  }

  async update({ _id, ...category }: InsertCategoryDto): Promise<void> {
    const notFound = !(await this.category.findOne({ _id }).exec())
    if (notFound) {
      throw new NotFoundException(`Category id: ${_id} not found`)
    }

    await this.category
      .findOneAndUpdate({ _id }, { $set: { ...category } }, { upsert: true })
      .exec()
  }

  async all(filter: Partial<InsertCategoryDto> = {}): Promise<Category[]> {
    return await this.category.find(filter).exec()
  }

  async one(filter: Partial<InsertCategoryDto> = {}): Promise<Category> {
    const find = await this.category.findOne(filter).exec()
    if (!find) {
      throw new BadRequestException(`Category ${filter.name} not found.`)
    } else {
      return find
    }
  }

  private async exists(filter: Partial<InsertCategoryDto>) {
    const find = await this.category.findOne(filter).exec()

    if (find) {
      throw new BadRequestException(`Category ${filter.name} already registered.`)
    } else {
      return find
    }
  }
}
