import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'
import { Ranking } from './ranking.interface'

@Injectable()
export class RankingService {
  constructor(private readonly proxyRMQService: ProxyRMQService) {}
  private rankingRMQ: ClientProxy = this.proxyRMQService.get(`rankings`)

  async all(categoryId: string, date: string): Promise<Ranking[]> {
    if (!categoryId) {
      throw new BadRequestException('Category id is required!')
    }

    return lastValueFrom<Ranking[]>(
      this.rankingRMQ.send<Ranking[]>('all-rankings', {
        categoryId,
        date
      })
    )
  }
}
