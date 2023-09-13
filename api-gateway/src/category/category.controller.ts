import { Body, Controller, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common'
import { ParamsValidationPipe } from 'src/shared/pipes/params-validation.pipe'
import { Category } from './category.interface'
import { CategoryService } from './category.service'
import { InsertCategoryDto } from './dtos/insert-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'
@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(ParamsValidationPipe)
  add(@Body() category: InsertCategoryDto) {
    this.categoryService.add(category)
  }

  @Get()
  async all(@Query('id') id: string): Promise<Category[]> {
    return await this.categoryService.all(id)
  }

  @Put('/:_id')
  @UsePipes(ParamsValidationPipe)
  update(@Body() category: UpdateCategoryDto, @Param('_id') id: string) {
    this.categoryService.update(category, id)
  }
}
