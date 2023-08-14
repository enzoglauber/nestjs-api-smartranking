import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'

@Injectable()
export class AwsService {
  AWS_S3_BUCKET_NAME = this.configService.get<string>('AWS_S3_BUCKET_NAME')
  AWS_REGION = this.configService.get<string>('AWS_REGION')
  AWS_ACCESS_KEY_ID = this.configService.get<string>('AWS_ACCESS_KEY_ID')
  AWS_SECRET_ACCESS_KEY = this.configService.get<string>('AWS_SECRET_ACCESS_KEY')

  private logger = new Logger(AwsService.name)

  constructor(private configService: ConfigService) {}

  public async upload(file: any, id: string) {
    const s3 = new AWS.S3({
      region: this.AWS_REGION,
      accessKeyId: this.AWS_ACCESS_KEY_ID,
      secretAccessKey: this.AWS_SECRET_ACCESS_KEY
    })

    const extension = file.originalname.split('.')[1]
    //png
    const key = `${id}.${extension}`
    const url = `https://${this.AWS_S3_BUCKET_NAME}.s3-${this.AWS_REGION}.amazonaws.com/${key}`
    this.logger.log(`urlKey: ${key}`)
    this.logger.log(`s3: ${JSON.stringify(s3)}`)

    const params = {
      Body: file.buffer,
      Bucket: this.AWS_S3_BUCKET_NAME,
      Key: key
    }

    return s3
      .putObject(params)
      .promise()
      .then(
        () => ({ url }),
        (err) => {
          this.logger.error(err)
          return err
        }
      )
  }
}
