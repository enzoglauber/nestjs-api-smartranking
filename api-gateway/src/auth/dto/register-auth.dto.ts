import { IsMobilePhone, IsString, Matches } from 'class-validator'

export class RegisterAuthDto {
  @IsString()
  name: string

  @IsString()
  email: string

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'Invalid password!' })
  password: string

  @IsMobilePhone('pt-BR')
  phone: string
}
