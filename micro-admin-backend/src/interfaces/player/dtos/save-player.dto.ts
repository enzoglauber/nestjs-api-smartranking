import { IsEmail, IsNotEmpty } from 'class-validator'

export class SavePlayerDto {
  readonly _id?: string

  readonly phone?: string

  @IsEmail()
  readonly email?: string

  @IsNotEmpty()
  readonly name: string
}
