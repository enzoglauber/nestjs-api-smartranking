import { IsEmail, IsString, Matches } from 'class-validator'

export class ConfirmPasswordAuthDto {
  @IsEmail()
  email: string

  @IsString()
  verificationCode: string

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'senha inválida' })
  newPassword: string
}
