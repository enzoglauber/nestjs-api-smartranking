import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { ProxyRMQService } from './proxyrmq/proxyrmq.service'

import * as hbs from 'handlebars'
import OPPONENT_NOTIFICATION from './shared/emails/opponent-nofitication.html'

import { Challenge } from './shared/interfaces/challenge.interface'

@Injectable()
export class AppService {
  constructor(
    private readonly proxyRMQService: ProxyRMQService,
    private readonly mailerService: MailerService
  ) {}

  private readonly adminRMQ = this.proxyRMQService.get(`admin-backend`)
  private readonly logger = new Logger(AppService.name)

  async notification(challenge: Challenge): Promise<void> {
    try {
      const [opponentId, requesterId] = challenge.players.filter(
        (player) => player !== challenge.requester
      )

      const [opponent, requester] = await Promise.all([
        lastValueFrom(this.adminRMQ.send('all-players', opponentId)),
        lastValueFrom(this.adminRMQ.send('all-players', requesterId))
      ])

      const template = hbs.compile(OPPONENT_NOTIFICATION)
      const html = template({ opponent, requester })

      this.mailerService
        .sendMail({
          to: opponent.email,
          from: `"SMART RANKING" <api.smartranking@gmail.com>`,
          subject: 'Challenge notification',
          html
        })
        .then((success) => {
          this.logger.log(success)
        })
        .catch((err) => {
          this.logger.error(err)
        })
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }
}
