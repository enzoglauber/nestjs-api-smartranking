import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category } from './interfaces/category/category.interface'
import { InsertCategoryDto } from './interfaces/category/dtos/insert-category.dto'
import { UpdateCategoryDto } from './interfaces/category/dtos/update-category.dto'
import { Player } from './interfaces/player/player.interface'

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Category') private readonly category: Model<Category>,
    @InjectModel('Player') private readonly player: Model<Player>
  ) {}

  async addCategory(category: InsertCategoryDto): Promise<Category> {
    const { name } = category
    const notFind = !(await this.existsCategory({ name }))
    if (notFind) {
      const created = new this.category(category)
      return await created.save()
    }
  }

  async addPlayerToCategory(name: string, idPlayer: any): Promise<void> {
    const category = await this.category.findOne({ name }).exec()
    if (!category) {
      throw new NotFoundException(`Category ${name} not found`)
    }

    const playerWithCategory = await this.category
      .find({ name })
      .where('players')
      .in([idPlayer])
      .exec()

    if (playerWithCategory.length > 0) {
      throw new BadRequestException(`Player ${idPlayer} already registered at category ${name}!`)
    }

    // const player = await this.playerService.findById(idPlayer)
    // if (player) {
    //   category.players.push(player)
    // }

    category.players.push(idPlayer)
    await this.category.findOneAndUpdate({ name }, { $set: category }, { upsert: true }).exec()
  }

  async updateCategory(name, category: UpdateCategoryDto): Promise<void> {
    const notFound = !(await this.category.findOne({ name }).exec())
    if (notFound) {
      throw new NotFoundException(`Category ${name} not found`)
    }

    await this.category.findOneAndUpdate({ name }, { $set: category }, { upsert: true }).exec()
  }

  async allCategories(filter: Partial<InsertCategoryDto> = {}): Promise<Category[]> {
    return await this.category.find(filter).populate('players').exec()
  }

  async oneCategory(filter: Partial<InsertCategoryDto> = {}): Promise<Category> {
    const find = await this.category.findOne(filter).populate('players').exec()
    if (!find) {
      throw new BadRequestException(`Category ${filter.name} not found.`)
    } else {
      return find
    }
  }

  // async findCategoryByPlayer(idPlayer: any): Promise<Category> {
  //   const players = await this.playerService.all()
  //   const filter = players.filter((player: Player) => player._id == idPlayer)

  //   if (filter.length == 0) {
  //     throw new BadRequestException(`Id ${idPlayer} isn't player!`)
  //   }

  //   return await this.category.findOne().where('players').in(idPlayer).exec()
  // }

  private async existsCategory(filter: Partial<InsertCategoryDto>) {
    const find = await this.category.findOne(filter).exec()

    if (find) {
      throw new BadRequestException(`Category ${filter.name} already registered.`)
    } else {
      return find
    }
  }
}
