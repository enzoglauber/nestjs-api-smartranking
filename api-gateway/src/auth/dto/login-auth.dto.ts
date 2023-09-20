import { IsEmail, Matches } from 'class-validator'

export class LoginAuthDto {
  @IsEmail()
  email: string

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'Invalid password!' })
  password: string
}
