import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, timeout } from 'rxjs'

@Injectable()
export class TimeoutInteceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInteceptor.name)

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(timeout(10000))
  }
}
