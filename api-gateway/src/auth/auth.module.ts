import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AwsModule } from '../aws/aws.module'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AwsModule],
  providers: [JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
