import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRequest } from 'src/common/interface/request';
import { OperationDashboardService } from '../service/operation-dashboard.service';
import { KeyPerformanceIndicatorsFilter } from '../filters/filter-kpi';
import { DriveScheduleFilter } from '../filters/filter-drive-schedule';
import { PromotionsFilter } from '../filters/filter-promotions';
import { ForecastFilter } from '../filters/filter-forecast';

@Controller('operation-dashboard')
export class OperationDashboardController {
  constructor(
    private readonly operationDashboardService: OperationDashboardService
  ) {}

  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Get('/kpi')
  async fetchKPI(
    @Query() keyPerformanceIndicatorsFilter: KeyPerformanceIndicatorsFilter,
    @Request() req: UserRequest
  ) {
    return await this.operationDashboardService.fetchKeyPerformanceIndicators(
      keyPerformanceIndicatorsFilter,
      req
    );
  }

  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Get('/blood-type')
  async fetchBloodTypes(
    @Query() bloodTypesFilter: KeyPerformanceIndicatorsFilter,
    @Request() req: UserRequest
  ) {
    return await this.operationDashboardService.fetchBloodTypes(
      bloodTypesFilter,
      req
    );
  }

  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Get('/drive-schedule')
  async fetchDriveSchedule(
    @Query() driveScheduleFilter: DriveScheduleFilter,
    @Request() req: UserRequest
  ) {
    return await this.operationDashboardService.fetchDriveSchedule(
      driveScheduleFilter,
      req.user.tenant_id
    );
  }

  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Get('/promotions')
  async fetchPromotions(
    @Query() promotionsFilter: PromotionsFilter,
    @Request() req: UserRequest
  ) {
    return await this.operationDashboardService.fetchPromotions(
      promotionsFilter,
      req
    );
  }

  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Get('/forecast')
  async fetchForecast(
    @Query() forecastFilter: ForecastFilter,
    @Request() req: UserRequest
  ) {
    return await this.operationDashboardService.fetchForecast(
      forecastFilter,
      req.user
    );
  }
}
