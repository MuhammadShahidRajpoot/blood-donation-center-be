import { Module } from '@nestjs/common';
import { MetricsController } from './controller/metrics/metrics.controller';
import { MetricsService } from './services/metrics.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
