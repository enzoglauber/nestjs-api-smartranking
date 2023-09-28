import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { CognitoService } from 'src/aws/cognito/cognito.service'
import { ChangePasswordAuthDto } from './dto/change-password-auth.dto'
import { ConfirmPasswordAuthDto } from './dto/confirm-password-auth.dto'
import { ForgotPasswordAuthDto } from './dto/forgot-password-auth.dto'
import { LoginAuthDto } from './dto/login-auth.dto'
import { RegisterAuthDto } from './dto/register-auth.dto'

@Controller('api/v1/auth')
export class AuthController {
  constructor(private cognitoService: CognitoService) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async registro(@Body() auth: RegisterAuthDto) {
    return await this.cognitoService.register(auth)
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body() auth: LoginAuthDto) {
    return await this.cognitoService.login(auth)
  }

  @Post('/change-password')
  @UsePipes(ValidationPipe)
  async alterarSenha(@Body() auth: ChangePasswordAuthDto) {
    const status = await this.cognitoService.changePassword(auth)

    return {
      status
    }
  }

  @Post('/forgot-password')
  @UsePipes(ValidationPipe)
  async forgotPassword(@Body() auth: ForgotPasswordAuthDto) {
    return await this.cognitoService.forgotPassword(auth)
  }

  @Post('/confirm-password')
  @UsePipes(ValidationPipe)
  async confirmarSenha(@Body() auth: ConfirmPasswordAuthDto) {
    return await this.cognitoService.confirmPassword(auth)
  }

  @Get('/users')
  async consultarUsuario(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email parameter is required!')
    }

    return await this.cognitoService.users(email)
  }
}
