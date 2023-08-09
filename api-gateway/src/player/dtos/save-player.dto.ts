import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator'

export class SavePlayerDto {
  readonly _id?: string

  readonly phone?: string

  @IsEmail()
  readonly email?: string

  @IsNotEmpty()
  readonly name: string

  @IsNotEmpty()
  readonly category: string

  @IsOptional()
  readonly photo?: string
}
