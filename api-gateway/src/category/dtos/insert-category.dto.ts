import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator'
import { Event } from '../category.interface'

export class InsertCategoryDto {
  _id?: string

  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  @IsNotEmpty()
  readonly description?: string

  @IsArray()
  @ArrayMinSize(1)
  readonly events: Event[]
}
