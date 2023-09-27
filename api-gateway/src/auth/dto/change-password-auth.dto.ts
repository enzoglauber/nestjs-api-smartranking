import { IsEmail, Matches } from 'class-validator'

export class ChangePasswordAuthDto {
  @IsEmail()
  email: string

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'Invalid password' })
  password: string

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'Invalid password' })
  newPassword: string
}
