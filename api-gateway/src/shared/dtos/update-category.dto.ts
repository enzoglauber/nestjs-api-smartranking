import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator'
import { Event } from './event.interface'

export class UpdateCategoryDto {
  _id?: string

  @IsString()
  @IsNotEmpty()
  readonly description?: string

  @IsArray()
  @ArrayMinSize(1)
  readonly events?: Event[]
}
