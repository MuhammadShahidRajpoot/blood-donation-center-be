import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginationAndSortDto } from 'src/common/dto/pagination';
import { StaffSchedulesService } from '../../services/staff-schedules.service';
import { FilterStaffSchedulesInterface } from '../interfaces/filter-staff-schedules';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { UserRequest } from 'src/common/interface/request';
import { FilterStaffSummaryInterface } from '../interfaces/filter-staff-summary';
import { FilterAvailableStaff } from '../interfaces/filter-available-staff';
import { FilterSharedStaff } from '../interfaces/filter-shared-staff';

@ApiTags('Staff Schedules')
@Controller('view-schedules')
export class StaffSchedulesController {
  constructor(private readonly staffSchedulesService: StaffSchedulesService) {}

  @Get('staff-schedules')
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_VIEW_SCHEDULE_STAFF_SCHEDULE)
  async get(@Query() query: PaginationAndSortDto, @Request() req: UserRequest) {
    const { page, limit, sortName, sortOrder } = query;

    return await this.staffSchedulesService.get(
      page,
      limit,
      sortName,
      sortOrder,
      req?.user?.tenant?.id
    );
  }
  @Get('staff-schedules/search')
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_VIEW_SCHEDULE_STAFF_SCHEDULE)
  async search(
    @Query() query: FilterStaffSchedulesInterface,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    return await this.staffSchedulesService.search(query);
  }

  @Get('staff-schedules/summary')
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async summary(
    @Query() query: FilterStaffSummaryInterface,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;
    return await this.staffSchedulesService.summary(query);
  }

  @Get('staff-schedules/available-staff/:shiftId')
  @ApiParam({ name: 'shiftId' })
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async availableStaff(
    @Query() query: FilterAvailableStaff,
    @Request() req: UserRequest,
    @Param() shiftId
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    return await this.staffSchedulesService.getAvailableStaff(query, shiftId);
  }

  @Get('staff-schedules/shared-staff/:shiftId')
  @ApiParam({ name: 'shiftId' })
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async sharedStaff(
    @Query() query: FilterSharedStaff,
    @Request() req: UserRequest,
    @Param() shiftId
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    return await this.staffSchedulesService.getSharedStaff(query, shiftId);
  }

  @Get('staff-schedules/staff-under-minimum-hours')
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getStaffUnderMinimumHours(
    @Query() query: FilterStaffSummaryInterface,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    return await this.staffSchedulesService.getStaffUnderMinimumHours(query);
  }

  @Get('staff-schedules/status-exclusions')
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getStatusExclusions(
    @Query() query: FilterStaffSummaryInterface,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    return await this.staffSchedulesService.getStatusExclusions(query);
  }

  @Get('staff-schedules/overstaffed-drives')
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getOverStaffedDrives(
    @Query() query: FilterStaffSummaryInterface,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    return await this.staffSchedulesService.getOverStaffedDrives(query);
  }
}
