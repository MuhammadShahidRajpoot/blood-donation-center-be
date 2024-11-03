import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateScheduleDto } from '../dto/build-schedules.dto';
import { BuildSchedulesService } from '../services/build-schedules.service';
import { UserRequest } from 'src/common/interface/request';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { GetSchedulesOptionalParamDto } from '../dto/query-params.dto';
import { GetRtdDto } from '../dto/get-rtd.dto';
import { GetDataForShiftInformationAboutTab } from '../dto/get-data-for-shift-information-about-tab';
import { UpdateDataRtdIndividualDto } from '../dto/update-data-rtd-individual-dto';
import { GetAvailableDevicesParamsDto } from '../dto/get-available-devices';
import { PublishDto } from '../dto/publish-schedule.dto';
import { UpdateHomeBaseDto } from '../dto/update-home-base-dto';
import { GetAvailableVehiclesParamsDto } from '../dto/get-available-vehicles';
import { AddDeviceAssignmentParamsDto } from '../dto/add-device-assignment';
import { AddVehicleAssignmentParamsDto } from '../dto/add-vehicle-assignment';
import { CreateStaffAssignmentDto } from '../dto/create-staff-assignment.dto';
import { NotifyStaffDto } from '../dto/notify-staff.dto';

@ApiTags('Staffing-Management')
@Controller('staffing-management/schedules')
export class BuildSchedulesController {
  constructor(private readonly buildScheduledService: BuildSchedulesService) {}
  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  @UsePipes(new ValidationPipe())
  async createSchedules(
    @Request() req: UserRequest,
    @Body() createSchedulesDto: CreateScheduleDto
  ) {
    const result = await this.buildScheduledService.createSchedule(
      createSchedulesDto,
      req.user
    );

    return {
      message: 'Schedule created successfully',
      result,
    };
  }

  @Get('/check-schedule/:start_date/:end_date/:collection_operation_id')
  @ApiParam({ name: 'start_date' })
  @ApiParam({ name: 'end_date' })
  @ApiParam({ name: 'collection_operation_id' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async checkSchedules(
    @Param('start_date') start_date: any,
    @Param('end_date') end_date: any,
    @Param('collection_operation_id') collection_operation_id: any,
    @Request() req: UserRequest
  ) {
    const result = await this.buildScheduledService.checkScheduleExists(
      start_date,
      end_date,
      collection_operation_id,
      req.user
    );
    return {
      message:
        'Schedule overlaps with another schedule, Try changing the dates',
      data: result,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  @UsePipes(new ValidationPipe())
  async getAllSchedules(
    @Query() query: GetSchedulesOptionalParamDto,
    @Request() req: UserRequest
  ) {
    return this.buildScheduledService.getAllSchedules(query, req.user);
  }

  @Patch(':schedule_id/:user_id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'schedule_id', required: true })
  @ApiParam({ name: 'user_id', required: true })
  async editSchedule(
    @Param('schedule_id') schedule_id: any,
    @Param('user_id') user_id: any
  ) {
    return this.buildScheduledService.editSchedule(schedule_id, user_id);
  }

  @Patch('archive/:user_id/:id')
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'user_id', required: true })
  @ApiParam({ name: 'id', required: true })
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_ARCHIVE)
  async archiveSchedule(@Param('user_id') user_id: any, @Param('id') id: any) {
    this.buildScheduledService.archiveSchedule(user_id, id);
  }

  @Get('collection_operations/list/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getUserCollectionOperations(
    @Request() req: UserRequest,
    @Param('id') id: any,
    @Query('isFilter') isFilter: any
  ) {
    return this.buildScheduledService.getUserCollectionOperations(
      req.user,
      id,
      isFilter
    );
  }

  @Patch('publish/schedule/:schedule_id')
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'schedule_id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async publishSchedule(
    @Param('schedule_id') id: any,
    @Request() req: UserRequest,
    @Body() publishScheduleDto: PublishDto
  ) {
    return this.buildScheduledService.publishSchedule(
      id,
      req.user,
      publishScheduleDto
    );
  }

  @Patch(':action/schedule/:schedule_id/:operation_id')
  @ApiParam({ name: 'action', required: true })
  @ApiParam({ name: 'schedule_id', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  async stopPauseSchedule(
    @Param('action') action: any,
    @Param('schedule_id') id: any,
    @Param('operation_id') operation_id: any,

    @Request() req: UserRequest
  ) {
    if (action === 'stop' || action === 'pause') {
      return this.buildScheduledService.stopPauseSchedule(
        action,
        id,
        operation_id,
        req.user
      );
    }
  }

  @Get('shifts/roles_times/all')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getRolesTimes(@Query() rtdDto: GetRtdDto, @Request() req: UserRequest) {
    return this.buildScheduledService.getRoleTimes(rtdDto, req.user);
  }

  /**
   * list of entity
   * @param getDataForShiftInformationAboutTab
   * @returns {objects}
   */
  @Get('/create/details/about')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  getDataForShiftInformationAboutTab(
    @Query() getAllData: GetDataForShiftInformationAboutTab,
    @Request() req: UserRequest
  ) {
    return this.buildScheduledService.getDataForShiftInformationAboutTab(
      getAllData,
      req.user
    );
  }

  /**
   * list of entity
   * @param getDataForShiftInformtionModifyRtd
   * @returns {objects}
   */
  @Get(
    '/details/rtd/:operation_id/:operation_type/shifts/:shift_id/modify-rtd/:schedule_status'
  )
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiParam({ name: 'schedule_status', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getDataForShiftInformtionModifyRtd(
    @Param('operation_id') operation_id: any,
    @Param('operation_type') operation_type: any,
    @Param('shift_id') shift_id: any,
    @Param('schedule_status') schedule_status: any,
    @Request() req: UserRequest
  ) {
    return this.buildScheduledService.getDataForShiftInformtionModifyRtd(
      operation_id,
      operation_type,
      shift_id,
      schedule_status,
      req.user.tenant_id
    );
  }

  /**
   * list of entity
   * @param modifyShiftInformtionRtd
   * @returns {objects}
   */
  @Patch('/operations/shifts/modify-rtd')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  async modifyShiftInformtionRtd(
    @Body() updateDtos: UpdateDataRtdIndividualDto[]
  ) {
    return this.buildScheduledService.modifyShiftInformtionRtd(updateDtos);
  }

  /**
   * Get available devices.
   * @param getAvailableDevicesParams
   * @returns {objects}
   */
  @Get('/available-devices')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getAvailableDevices(
    @Query() getAvailableDevicesParams: GetAvailableDevicesParamsDto,
    @Request() req: UserRequest
  ) {
    return this.buildScheduledService.getAvailableDevices(
      getAvailableDevicesParams,
      req.user
    );
  }

  /**
   * Get shared devices.
   * @param getAvailableDevicesParams
   * @returns {objects}
   */
  @Get('/shared-devices')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getSharedDevices(
    @Query() getAvailableDevicesParams: GetAvailableDevicesParamsDto
  ) {
    return this.buildScheduledService.getSharedDevices(
      getAvailableDevicesParams
    );
  }

  /**
   * Get available vehicles.
   * @param getAvailableVehiclesParams
   * @returns {objects}
   */
  @Get('/available-vehicles')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getAvailableVehicles(
    @Query() getAvailableVehiclesParams: GetAvailableVehiclesParamsDto
  ) {
    return this.buildScheduledService.getAvailableVehicles(
      getAvailableVehiclesParams
    );
  }

  /**
   * Get shared vehicles.
   * @param getAvailableVehiclesParams
   * @returns {objects}
   */
  @Get('/shared-vehicles')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getSharedVehicles(
    @Query() getAvailableVehiclesParams: GetAvailableVehiclesParamsDto
  ) {
    return this.buildScheduledService.getSharedVehicles(
      getAvailableVehiclesParams
    );
  }

  /**
   * list of entity
   * @param getDataForShiftInformtionModifyRtd
   * @returns {objects}
   */
  @Get(
    '/operations/:operation_id/:operation_type/shifts/:shift_id/update-home-base/:schedule_status'
  )
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiParam({ name: 'schedule_status', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ)
  async getDataForUpdateHomeBase(
    @Param('operation_id') operation_id: any,
    @Param('operation_type') operation_type: any,
    @Param('shift_id') shift_id: any,
    @Param('schedule_status') schedule_status: any,
    @Request() req: UserRequest
  ) {
    return this.buildScheduledService.getDataForUpdateHomeBase(
      operation_id,
      operation_type,
      shift_id,
      schedule_status,
      req.user
    );
  }

  /**
   * list of entity
   * @param modifyShiftInformtionRtd
   * @returns {objects}
   */
  @Patch(
    '/operations/:operation_id/:operation_type/shifts/:shift_id/update-home-base'
  )
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  async staffRequestedUpdateHomeBase(
    @Param('operation_id') operation_id: any,
    @Param('operation_type') operation_type: any,
    @Param('shift_id') shift_id: any,
    @Body() updateDtos: UpdateHomeBaseDto[]
  ) {
    return this.buildScheduledService.staffRequestedUpdateHomeBase(
      operation_id,
      operation_type,
      shift_id,
      updateDtos
    );
  }

  @Get('/operations/:operation_id/:operation_type/change_summary')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getChangeSummaryData(
    @Param('operation_id') operation_id: any,
    @Param('operation_type') operation_type: any
  ) {
    return this.buildScheduledService.flagOperationAndGetChangeSummaryData(
      +operation_id,
      operation_type
    );
  }

  @Post('/operations/:operation_id/shifts/:shift_id/staff-assignments')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  @UsePipes(new ValidationPipe())
  async createStaffAssignments(
    @Param('operation_id') operation_id: bigint,
    @Param('shift_id') shift_id: bigint,
    @Request() req: UserRequest,
    @Body() createStaffAssignmentDto: CreateStaffAssignmentDto
  ) {
    createStaffAssignmentDto.created_by = req?.user?.id;
    createStaffAssignmentDto.tenant_id = req?.user?.tenant?.id;
    createStaffAssignmentDto.operation_id = operation_id;
    createStaffAssignmentDto.shift_id = shift_id;

    const result = await this.buildScheduledService.createStaffAssignment(
      createStaffAssignmentDto,
      createStaffAssignmentDto.is_published,
      shift_id
    );

    return {
      message: 'Staff Assignment created successfully',
      result,
    };
  }

  /**
   * Add assignment for device.
   * @param getAvailableVehiclesParams
   * @returns {objects}
   */
  @Post('/operations/:operation_id/shifts/:shift_id/devices-assignments')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  async addDeviceAssignment(
    @Request() req: UserRequest,
    @Param('operation_id') operation_id: any,
    @Param('shift_id') shift_id: any,
    @Body() addDeviceAssignmentParams: AddDeviceAssignmentParamsDto
  ) {
    addDeviceAssignmentParams.operation_id = operation_id;
    addDeviceAssignmentParams.shift_id = shift_id;
    addDeviceAssignmentParams.tenant_id = req?.user?.tenant?.id;

    return this.buildScheduledService.addDeviceAssignment(
      addDeviceAssignmentParams,
      req?.user?.id
    );
  }

  /**
   * Add assignment for vehicle.
   * @param getAvailableVehiclesParams
   * @returns {objects}
   */
  @Post('/operations/:operation_id/shifts/:shift_id/vehicles-assignments')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  async addVehicleAssignment(
    @Request() req: UserRequest,
    @Param('operation_id') operation_id: any,
    @Param('shift_id') shift_id: any,
    @Body() addVehicleAssignmentParams: AddVehicleAssignmentParamsDto
  ) {
    addVehicleAssignmentParams.operation_id = operation_id;
    addVehicleAssignmentParams.shift_id = shift_id;
    addVehicleAssignmentParams.tenant_id = req?.user?.tenant?.id;

    return this.buildScheduledService.addVehicleAssignment(
      addVehicleAssignmentParams,
      req?.user?.id
    );
  }

  /**
   * Notify Staff
   * @param notifyStaff
   * @returns {objects}
   */
  @Post('/operations/notify/staff')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  async notifyStaff(@Body() notifyStaffDto: NotifyStaffDto) {
    return this.buildScheduledService.notifyStaff(notifyStaffDto);
  }

  @Put('/operations/:operation_id/:operation_type/sync')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE)
  @UsePipes(new ValidationPipe())
  async synchronizeOperation(
    @Param('operation_id') operation_id: bigint,
    @Param('operation_type') operation_type: string,
    @Request() req: UserRequest,
  ) {
    const result = await this.buildScheduledService.synchronizeOperation(
      operation_id,
      operation_type
    );

    return {
      message: 'Operation synchronized successfully',
      data: result,
    };
  }
}
