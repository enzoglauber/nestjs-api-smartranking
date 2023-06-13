import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PlayerService } from 'src/player/player.service'
import { Category } from './category.interface'
import { InsertCategoryDto } from './dtos/insert-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private readonly category: Model<Category>,
    private readonly playerService: PlayerService
  ) {}

  async insert(category: InsertCategoryDto): Promise<Category> {
    const { name } = category
    const notFind = !(await this.exists({ name }))
    if (notFind) {
      const created = new this.category(category)
      return await created.save()
    }
  }

  async atribuirCategoriaJogador(params: string[]): Promise<void> {
    const name = params['name']
    const idPlayer = params['idPlayer']

    const categoriaEncontrada = await this.category.findOne({ name }).exec()
    const jogadorJaCadastradoCategoria = await this.category
      .find({ name })
      .where('Player')
      .in(idPlayer)
      .exec()

    await this.playerService.findById(idPlayer)

    if (!categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${name} não cadastrada!`)
    }

    if (jogadorJaCadastradoCategoria.length > 0) {
      throw new BadRequestException(`Jogador ${idPlayer} já cadastrado na Categoria ${name}!`)
    }

    categoriaEncontrada.players.push(idPlayer)
    await this.category.findOneAndUpdate({ name }, { $set: categoriaEncontrada }).exec()
  }

  async addPlayer(name: string, idPlayer: any): Promise<void> {
    const category = await this.category.findOne({ name }).exec()
    if (!category) {
      throw new NotFoundException(`Category ${name} not found`)
    }

    const playerWithCategory = await this.category
      .find({ name })
      .where('Player')
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

  async update(name, category: UpdateCategoryDto): Promise<void> {
    const notFound = !(await this.category.findOne({ name }).exec())
    if (notFound) {
      throw new NotFoundException(`Category ${name} not found`)
    }

    await this.category.findOneAndUpdate({ name }, { $set: category }, { upsert: true }).exec()
  }

  async all(filter: Partial<InsertCategoryDto> = {}): Promise<Category[]> {
    return await this.category.find(filter).populate('Player').exec()
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
