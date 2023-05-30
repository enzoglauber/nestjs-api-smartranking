import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common'

export class PlayerParamsPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value) {
      return value
    } else {
      throw new BadRequestException(`The value of parameter ${metadata.data} must to be declare.`)
    }
  }
}
