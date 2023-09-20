import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { passportJwtSecret } from 'jwks-rsa'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { CognitoService } from 'src/aws/cognito/cognito.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name)

  constructor(private readonly cognitoService: CognitoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: cognitoService.CLIENT_ID,
      issuer: cognitoService.AUTHORITY,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${cognitoService.AUTHORITY}/.well-known/jwks.json`
      })
    })
  }

  public async validate(payload: any) {
    this.logger.log(`payload: ${JSON.stringify(payload)}`)

    return { userId: payload.sub, email: payload.email }
  }
}
