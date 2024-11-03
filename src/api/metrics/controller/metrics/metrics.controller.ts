import { Controller, Get, Res } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(@Res({ passthrough: true }) res) {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    return metrics
  }
}
