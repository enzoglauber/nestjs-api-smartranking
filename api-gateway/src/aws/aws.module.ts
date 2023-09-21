import { Module } from '@nestjs/common'
import { AwsService } from './aws.service'
import { CognitoService } from './cognito/cognito.service'

@Module({
  providers: [AwsService, CognitoService],
  exports: [AwsService, CognitoService]
})
export class AwsModule {}
