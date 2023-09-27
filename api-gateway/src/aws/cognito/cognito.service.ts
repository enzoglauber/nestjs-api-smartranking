import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession
} from 'amazon-cognito-identity-js'
import { ChangePasswordAuthDto } from 'src/auth/dto/change-password-auth.dto'
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto'
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto'

@Injectable()
export class CognitoService {
  readonly USER_POOL_ID = this.configService.get<string>('COGNITO_USER_POOL_ID')
  readonly CLIENT_ID = this.configService.get<string>('COGNITO_CLIENT_ID')
  readonly REGION = this.configService.get<string>('COGNITO_REGION')
  readonly AUTHORITY = `https://cognito-idp.${this.REGION}.amazonaws.com/${this.USER_POOL_ID}`
  private readonly userPool: CognitoUserPool = new CognitoUserPool({
    UserPoolId: this.USER_POOL_ID,
    ClientId: this.CLIENT_ID
  })

  constructor(private readonly configService: ConfigService) {}

  async register({ name, email, password, phone }: RegisterAuthDto): Promise<CognitoUser> {
    const attributes = [
      new CognitoUserAttribute({
        Name: 'phone_number',
        Value: phone
      }),
      new CognitoUserAttribute({
        Name: 'name',
        Value: name
      })
    ]

    return new Promise<CognitoUser>((resolve, reject) => {
      this.userPool.signUp(email, password, attributes, [], (err, result) => {
        if (err) {
          reject(new Error(`Registration failed: ${err.message}`))
        } else {
          resolve(result.user)
        }
      })
    })
  }

  async login({ email, password }: LoginAuthDto): Promise<CognitoUserSession> {
    const user = new CognitoUser({
      Username: email,
      Pool: this.userPool
    })
    const details = new AuthenticationDetails({
      Username: email,
      Password: password
    })

    return new Promise<CognitoUserSession>((resolve, reject) => {
      user.authenticateUser(details, {
        onSuccess: (result) => {
          resolve(result)
        },
        onFailure: (err) => {
          reject(new Error(`Login failed: ${err.message}`))
        }
      })
    })
  }

  async changePassword(auth: ChangePasswordAuthDto) {
    const { email, password, newPassword } = auth

    const userData = {
      Username: email,
      Pool: this.userPool
    }

    const details = new AuthenticationDetails({
      Username: email,
      Password: password
    })

    const user = new CognitoUser(userData)

    return new Promise((resolve, reject) => {
      user.authenticateUser(details, {
        onSuccess: () => {
          user.changePassword(password, newPassword, (err, result) => {
            if (err) {
              reject(err)
              return
            }
            resolve(result)
          })
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }
}
