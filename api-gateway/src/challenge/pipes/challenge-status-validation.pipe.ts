import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ChallengeStatus } from '../enum/challenge-status.enum'

export class ChallengeStatusValidationPipe implements PipeTransform {
  readonly allows = [ChallengeStatus.ACCEPT, ChallengeStatus.DENIED, ChallengeStatus.CANCELED]

  transform(value: any) {
    const status = value.status.toUpperCase()

    if (!this.allows.includes(status)) {
      throw new BadRequestException(`${status} is not valid.`)
    }

    return value
  }
}
