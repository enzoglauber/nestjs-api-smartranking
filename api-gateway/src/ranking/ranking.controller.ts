import { Controller, Get, Query } from '@nestjs/common'
import { Ranking } from './ranking.interface'
import { RankingService } from './ranking.service'

@Controller('api/v1/rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  all(@Query('categoryId') categoryId: string, @Query('date') date: string): Promise<Ranking[]> {
    return this.rankingService.all(categoryId, date)
  }
}
