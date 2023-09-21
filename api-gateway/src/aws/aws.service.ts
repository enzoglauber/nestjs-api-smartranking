import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'

@Injectable()
export class AwsService {
  readonly AWS_S3_BUCKET_NAME = this.configService.get<string>('AWS_S3_BUCKET_NAME')
  readonly AWS_S3_REGION = this.configService.get<string>('AWS_S3_REGION')
  readonly AWS_S3_ACCESS_KEY_ID = this.configService.get<string>('AWS_S3_ACCESS_KEY_ID')
  readonly AWS_S3_SECRET_ACCESS_KEY = this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY')

  private logger = new Logger(AwsService.name)

  constructor(private configService: ConfigService) {}

  async upload(file: Express.Multer.File, id: string): Promise<string> {
    const s3 = new AWS.S3({
      region: this.AWS_S3_REGION,
      accessKeyId: this.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: this.AWS_S3_SECRET_ACCESS_KEY
    })

    const extension = file.originalname.split('.')[1]
    //png
    const key = `${id}.${extension}`
    const url = `https://${this.AWS_S3_BUCKET_NAME}.s3-${this.AWS_S3_REGION}.amazonaws.com/${key}`
    this.logger.log(`urlKey: ${key}`)
    this.logger.log(`s3: ${JSON.stringify(s3)}`)

    const params = {
      Body: file.buffer,
      Bucket: this.AWS_S3_BUCKET_NAME,
      Key: key
    }

    try {
      await s3.putObject(params).promise()
      return url
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }
}
