import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Player } from 'src/player/player.interface'
import { PlayerService } from 'src/player/player.service'
import { Category } from './category.interface'
import { InsertCategoryDto } from './dtos/insert-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private readonly category: Model<Category>,
    private readonly playerService: PlayerService
  ) {}

  private readonly logger = new Logger(CategoryService.name)

  async addPlayer(name: string, idPlayer: any): Promise<void> {
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

  async add(category: Category): Promise<Category> {
    try {
      const created = new this.category(category)
      return await created.save()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async update(_id: string, category: Category): Promise<void> {
    try {
      await this.category.findOneAndUpdate({ _id }, { $set: category }).exec()
    } catch (error) {
      this.logger.error(`update error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async all(filter: Partial<InsertCategoryDto> = {}): Promise<Category[]> {
    try {
      return await this.category.find(filter).populate('players').exec()
    } catch (error) {
      this.logger.error(`all error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async one(filter: Partial<InsertCategoryDto> = {}): Promise<Category> {
    try {
      return await this.category.findOne(filter).populate('players').exec()
    } catch (error) {
      this.logger.error(`one error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async remove(_id: string): Promise<void> {
    try {
      await this.category.deleteOne({ _id }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async findByPlayer(idPlayer: any): Promise<Category> {
    const players = await this.playerService.all()
    const filter = players.filter((player: Player) => player._id == idPlayer)

    if (filter.length == 0) {
      throw new BadRequestException(`Id ${idPlayer} isn't player!`)
    }

    return await this.category.findOne().where('players').in(idPlayer).exec()
  }
}
