import { Injectable } from '@nestjs/common';
import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private requestCounter: Counter;

  private requestDurationHistogram: Histogram;

  constructor() {
    this.initializeMetrics();
    collectDefaultMetrics({ register });
  }

  async initializeMetrics() {
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status', 'statusCode', 'route'],
    });
    this.requestDurationHistogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'status', 'statusCode', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    register.registerMetric(this.requestCounter);
    register.registerMetric(this.requestDurationHistogram);
  }

  incrementRequestCounter(
    method: string,
    status: string,
    statusCode: string,
    route: string
  ) {
    return this.requestCounter.labels(method, status, statusCode, route).inc();
  }

  observeRequestDuration(
    method: string,
    status: string,
    statusCode,
    route: string,
    time: number
  ) {
    this.requestDurationHistogram
      .labels(method, status, statusCode, route) 
      .observe(time);
  }
}
