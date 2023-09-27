import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { CognitoService } from 'src/aws/cognito/cognito.service'
import { ChangePasswordAuthDto } from './dto/change-password-auth.dto'
import { LoginAuthDto } from './dto/login-auth.dto'
import { RegisterAuthDto } from './dto/register-auth.dto'

@Controller('api/v1/auth')
export class AuthController {
  constructor(private cognitoService: CognitoService) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async registro(@Body() register: RegisterAuthDto) {
    return await this.cognitoService.register(register)
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body() login: LoginAuthDto) {
    return await this.cognitoService.login(login)
  }

  @Post('/change-password')
  @UsePipes(ValidationPipe)
  async alterarSenha(@Body() auth: ChangePasswordAuthDto) {
    const status = await this.cognitoService.changePassword(auth)

    return {
      status
    }
  }
}
