import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInteceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInteceptor.name)

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now()
    console.log(`before... `, now)
    return next.handle().pipe(tap(() => console.log(`after...`, Date.now() - now)))
  }
}
