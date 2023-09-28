import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession
} from 'amazon-cognito-identity-js'
import * as AWS from 'aws-sdk'
import { ChangePasswordAuthDto } from 'src/auth/dto/change-password-auth.dto'
import { ConfirmPasswordAuthDto } from 'src/auth/dto/confirm-password-auth.dto'
import { ForgotPasswordAuthDto } from 'src/auth/dto/forgot-password-auth.dto'
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto'
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto'

@Injectable()
export class CognitoService {
  readonly USER_POOL_ID = this.configService.get<string>('COGNITO_USER_POOL_ID')
  readonly CLIENT_ID = this.configService.get<string>('COGNITO_CLIENT_ID')
  readonly REGION = this.configService.get<string>('COGNITO_REGION')
  readonly AUTHORITY = `https://cognito-idp.${this.REGION}.amazonaws.com/${this.USER_POOL_ID}`
  //
  readonly AWS_S3_REGION = this.configService.get<string>('AWS_S3_REGION')
  readonly AWS_S3_ACCESS_KEY_ID = this.configService.get<string>('AWS_S3_ACCESS_KEY_ID')
  readonly AWS_S3_SECRET_ACCESS_KEY = this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY')

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

  async forgotPassword(auth: ForgotPasswordAuthDto) {
    const { email } = auth

    const data = {
      Username: email,
      Pool: this.userPool
    }

    const user = new CognitoUser(data)

    return new Promise((resolve, reject) => {
      user.forgotPassword({
        onSuccess: (result) => {
          resolve(result)
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  async confirmPassword(auth: ConfirmPasswordAuthDto) {
    const { email, verificationCode, newPassword } = auth

    const data = {
      Username: email,
      Pool: this.userPool
    }

    const user = new CognitoUser(data)

    return new Promise((resolve, reject) => {
      user.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve({
            status: 'SUCCESS'
          })
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  //https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListUsers.html
  async users(email: string): Promise<any> {
    const params = {
      UserPoolId: this.USER_POOL_ID,
      Filter: `email = '${email}'`
    }

    return new Promise((resolve, reject) => {
      AWS.config.update({
        region: this.AWS_S3_REGION,
        accessKeyId: this.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_S3_SECRET_ACCESS_KEY
      })

      const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider()

      cognitoIdentityServiceProvider.listUsers(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}
