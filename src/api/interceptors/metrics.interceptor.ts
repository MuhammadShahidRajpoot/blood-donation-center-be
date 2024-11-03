import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, map } from 'rxjs';
  import { MetricsService } from '../metrics/services/metrics.service';
  import { Request, Response } from 'express';
  
  enum Status {
    ok = 'ok',
    error = 'error',
  }
  
  @Injectable()
  export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
      const req: Request = context.switchToHttp().getRequest();
      const res: Response = context.switchToHttp().getResponse();
      const route: string = req.route.path;
      const method = req.method;
      let statusCode: string = '';
      let status: Status | null = null;
  
      const startTime = Date.now();
  
      return next.handle().pipe(
        map((data) => {
          if (route.startsWith('/metrics')) return data;
  
          const dataStatusCode: string = data?.status_code?.toString();
          const resStatusCode: string = res?.statusCode?.toString();
          statusCode = (
            dataStatusCode && dataStatusCode?.startsWith('2') === false
              ? dataStatusCode
              : resStatusCode && resStatusCode?.startsWith('2') === false
              ? resStatusCode
              : dataStatusCode ?? resStatusCode ?? 500
          ).toString();
          status = statusCode.startsWith('2') ? Status.ok : Status.error;
  
          this.metricsService.incrementRequestCounter(
            method,
            status,
            statusCode,
            route
          );
  
          const endTime = Date.now();
          const duration = endTime - startTime;
          const durationInSeconds = duration / 1000;
          this.metricsService.observeRequestDuration(
            req.method,
            status,
            statusCode,
            route,
            durationInSeconds
          );
          return data;
        })
      );
    }
  }
  