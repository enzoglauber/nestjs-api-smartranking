import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { Category } from './category.interface'
import { CategoryService } from './category.service'
import { InsertCategoryDto } from './dtos/insert-category.dto'
@Controller('api/v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async insert(@Body() category: InsertCategoryDto): Promise<Category> {
    return await this.categoryService.insert(category)
  }
}
