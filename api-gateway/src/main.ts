import { NestFactory } from '@nestjs/core'
import * as momentTimezone from 'moment-timezone'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/filters/http.exception.filter'
import { LoggingInteceptor } from './shared/interceptions/logging.inteception'
import { TimeoutInteceptor } from './shared/interceptions/timeout.inteception'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(new LoggingInteceptor(), new TimeoutInteceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  Date.prototype.toJSON = (): string => {
    return momentTimezone(this).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss.SSS')
  }

  await app.listen(8080)
}
bootstrap()
