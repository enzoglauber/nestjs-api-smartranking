import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common'
import { Category } from './category.interface'
import { CategoryService } from './category.service'
import { InsertCategoryDto } from './dtos/insert-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'
@Controller('api/v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async insert(@Body() category: InsertCategoryDto): Promise<Category> {
    return await this.categoryService.insert(category)
  }

  @Get()
  async all(@Body() category?: InsertCategoryDto): Promise<Category[]> {
    return await this.categoryService.all(category)
  }

  @Get('/:name')
  async one(@Param('name') name: string): Promise<Category> {
    return await this.categoryService.one({ name })
  }

  @Put('/:name')
  @UsePipes(ValidationPipe)
  async update(@Body() category: UpdateCategoryDto, @Param('name') name: string) {
    return await this.categoryService.update(name, category)
  }

  @Post('/:name/player/:idPlayer')
  @UsePipes(ValidationPipe)
  async addPlayer(@Body() category: UpdateCategoryDto, @Param('name') name: string) {
    return await this.categoryService.update(name, category)
  }
}
