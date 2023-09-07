import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { Observable } from 'rxjs'
import { ProxyRMQService } from 'src/proxyrmq/proxyrmq.service'

@Controller('api/v1/rankings')
export class RankingController {
  private readonly rankingRMQ = this.proxyRMQService.get(`rankings`)

  constructor(private readonly proxyRMQService: ProxyRMQService) {}

  @Get()
  all(@Query('categoryId') categoryId: string, @Query('date') date: string): Observable<any> {
    if (!categoryId) {
      throw new BadRequestException('Category id is required!')
    }

    return this.rankingRMQ.send('all-rankings', {
      categoryId,
      date
    })
  }
}
