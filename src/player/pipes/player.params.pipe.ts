import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common'

export class PlayerParamsPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(value, metadata)
    if (value) {
      return value
    } else {
      throw new BadRequestException(`The value of paramter ${metadata.data} must to be declare.`)
    }
  }
}
