import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class TimestampInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Assuming your authentication middleware sets the user on the request object
    const user = request?.user; // Access the logged-in user here

    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return data;
        } else
          return {
            last_permissions_updated: user?.last_permissions_updated,
            ...data,
          };
      })
    );
  }
}
