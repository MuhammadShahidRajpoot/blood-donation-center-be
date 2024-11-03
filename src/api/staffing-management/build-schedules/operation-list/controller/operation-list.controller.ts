import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { OperationListService } from '../service/operation-list.service';
import { GetOperationsOptionalParamDto } from '../../dto/opeation-list-queryparams.dto';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { UnAssignStaffParamDto } from '../../dto/unassign-staff-requestparams.dto';
import { ReAssignStaffParamDto } from '../../dto/reassign-staff-requestparams.dto';
import { UpdateAssignStaffParamDto } from '../../dto/update-staffassigned.dto';
import { FlaggedOperationService } from '../service/flagged-operation.service';
import { UnAssignVehicleParamDto } from '../../dto/unassign-vehicle.dto';
import { UnassignDeviceParamDto } from '../../dto/unassign-device.dto';
import { ReAssignVehicleParamDto } from '../../dto/reassign-vehicle-requestparams.dto';
import { UpdateAssignVehicleParamDto } from '../../dto/update-vehicleassigned.dto';
import { UpdateAssignDeviceParamDto } from '../../dto/update-device-assigned.dto';
import { UnassignOperationParamDto } from '../../dto/unassign-operation.dto';
import { UserRequest } from 'src/common/interface/request';

@ApiTags('Staffing-Management')
@Controller('staffing-management/schedules')
export class OperationListController {
  constructor(
    private readonly operationListService: OperationListService,
    private readonly flaggedService: FlaggedOperationService
  ) {}
  @Get('/operation-list/:schedule_id')
  @ApiBearerAuth()
  @ApiParam({ name: 'schedule_id', required: true })
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getData(
    @Param('schedule_id') scheduleId: string,
    @Request() req: UserRequest,

    @Query() query: GetOperationsOptionalParamDto
  ): Promise<any> {
    query.tenant_id = req?.user?.tenant?.id;
    return await this.operationListService.getData(scheduleId, query);
  }

  @Delete('/operations/:operation_id/unassign-all-assignments')
  @ApiParam({ name: 'operation_id', required: true })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async unassignOperation(
    @Param('operation_id') operationId: any,
    @Request() req: UserRequest,

    @Query() query: UnassignOperationParamDto
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    const data = await this.operationListService.unassignOperation(
      operationId,
      query
    );
    return data;
  }

  @Get(':operation_id/:operation_type')
  @ApiBearerAuth()
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async getShiftStatuesForSingleOperation(
    @Param('operation_id') operationId: number,
    @Param('operation_type') scheduleType: string,
    @Request() req: UserRequest
  ): Promise<any> {
    const tenant_id = req?.user?.tenant?.id;
    const result =
      await this.operationListService.getShiftStatuesForSingleOperation(
        operationId,
        scheduleType,
        tenant_id
      );
    return { data: result };
  }

  @Get(
    ':operation_id/:operation_type/shifts/:shift_id/assigned-staff/:schedule_id'
  )
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiParam({ name: 'schedule_id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getStaffData(
    @Param('operation_id') operationId: any,
    @Param('shift_id') shiftId: any,
    @Param('operation_type') operationType: any,
    @Param('schedule_id') schedule_id: any,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;
    const data = await this.operationListService.getStaffData(
      operationId,
      shiftId,
      operationType,
      schedule_id,
      tenant_id
    );
    return data;
  }

  @Get(
    ':operation_id/:operation_type/shifts/:shift_id/assigned-vehicle/:schedule_status'
  )
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiParam({ name: 'schedule_status', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getVehiclesData(
    @Param('operation_id') operationId: any,
    @Param('shift_id') shiftId: any,
    @Param('operation_type') operationType: any,
    @Param('schedule_status') schedule_status: any,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;
    return await this.operationListService.getVehiclesData(
      operationId,
      shiftId,
      operationType,
      schedule_status,
      tenant_id
    );
  }

  @Delete(':schedule_id/:operation_id/shifts/:shift_id/assigned-staff')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiParam({ name: 'schedule_id', required: true })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async unassignStaff(
    @Param('operation_id') operationId: any,
    @Param('shift_id') shiftId: any,
    @Param('schedule_id') scheduleId: any,
    @Query() query: UnAssignStaffParamDto,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;
    const data = await this.operationListService.unassignStaff(
      operationId,
      shiftId,
      scheduleId,
      query,
      tenant_id
    );
    return data;
  }

  @Delete(':operation_id/shifts/:shift_id/assigned-vehicle')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async unassignVehicle(
    @Param('operation_id') operationId: any,
    @Param('shift_id') shiftId: any,
    @Body() query: UnAssignVehicleParamDto,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;
    const data = await this.operationListService.unassignVehicle(
      operationId,
      shiftId,
      query,
      tenant_id
    );
    return data;
  }

  @Get('/operation/staff/reassign_staff')
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async reassignStaff(
    @Query() query: ReAssignStaffParamDto,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;

    const data = await this.operationListService.reassignStaff(
      query,
      tenant_id
    );
    return data;
  }

  @Get('/operation/staff/reassign_vehicle')
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async reassignVehicle(
    @Query() query: ReAssignVehicleParamDto,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;

    const data = await this.operationListService.reassignVehicle(
      query,
      tenant_id
    );
    return data;
  }

  @Put('/operation/staff-assignment')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async updateAssignStaff(
    @Query() query: UpdateAssignStaffParamDto,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;

    const data = await this.operationListService.updateStaffAssignment(
      query,
      tenant_id
    );
    return data;
  }
  @Put('/operation/vehicle-assignment')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async updateAssignVehicle(
    @Query() query: UpdateAssignVehicleParamDto,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;
    const data = await this.operationListService.updateAssignVehicle(
      query,
      tenant_id
    );
    return data;
  }

  @Patch('/operation/flagged/:id/:type')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'type' })
  async flaggedSchedules(
    @Param('id') id: any,
    @Param('type') type: any,
    @Request() req: UserRequest
  ) {
    const tenant_id = req?.user?.tenant?.id;

    const data = await this.flaggedService.flaggedOperation(
      id,
      type,
      tenant_id
    );
    return data;
  }

  @Patch('/operations/split_shift/:assignment_id/:assignment_type/:schedule_id')
  @ApiParam({ name: 'assignment_id' })
  @ApiParam({ name: 'assignment_type' })
  @ApiParam({ name: 'schedule_id' })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async splitShift(
    @Param('assignment_id') assignment_id: any,
    @Param('assignment_type') assignment_type: any,
    @Param('schedule_id') schedule_id: any,
    @Request() req: UserRequest
  ) {
    const tenantId = req?.user?.tenant?.id;
    const data = await this.operationListService.splitShifts(
      assignment_id,
      assignment_type,
      schedule_id,
      tenantId
    );
    return {
      data,
      message: 'Success',
    };
  }

  @Get('/operations/data/:operation_id/:operation_type/schedule/:schedule_id')
  @ApiParam({ name: 'operation_id' })
  @ApiParam({ name: 'operation_type' })
  @ApiParam({ name: 'schedule_id' })
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async getscheduleData(
    @Param('operation_id') operation_id: any,
    @Param('operation_type') operation_type: any,
    @Param('schedule_id') schedule_id: any,
    @Request() req: UserRequest
  ) {
    const tenantId = req?.user?.tenant?.id;
    return await this.operationListService.getScheduleData(
      operation_id,
      operation_type,
      schedule_id,
      tenantId
    );
  }

  @Get('/drives/certifications/:operation_id')
  @ApiParam({ name: 'operation_id' })
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async getCertifications(
    @Param('operation_id') operation_id: any,
    @Request() req: UserRequest
  ) {
    const tenantId = req?.user?.tenant?.id;

    const data = await this.operationListService.getCertification(
      operation_id,
      tenantId
    );
    return {
      data,
      message: 'Success',
    };
  }
  //#region Device endpoints

  @Get(
    ':operation_id/:operation_type/shifts/:shift_id/assigned-device/:schedule_status'
  )
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'operation_type', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @ApiParam({ name: 'schedule_status', required: true })
  @ApiBearerAuth()
  async getDevicesData(
    @Param('operation_id') operationId: any,
    @Param('shift_id') shiftId: any,
    @Param('operation_type') operationType: any,
    @Param('schedule_status') schedule_status: any,
    @Request() req: UserRequest
  ) {
    const tenantId = req?.user?.tenant?.id;

    return await this.operationListService.getDevicesData(
      operationId,
      shiftId,
      operationType,
      schedule_status,
      tenantId
    );
  }

  @Delete(':operation_id/shifts/:shift_id/assigned-device')
  @ApiParam({ name: 'operation_id', required: true })
  @ApiParam({ name: 'shift_id', required: true })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async unassignDevice(
    @Param('operation_id') operationId: any,
    @Param('shift_id') shiftId: any,
    @Body() query: UnassignDeviceParamDto,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;

    const data = await this.operationListService.unassignDevice(
      operationId,
      shiftId,
      query
    );
    return data;
  }

  @Get('/operation/staff/reassign-device')
  @UseGuards(PermissionGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async reassignDevice(
    @Query() query: ReAssignVehicleParamDto,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;
    const data = await this.operationListService.reassignDevice(query);
    return data;
  }

  @Put('/operation/device-assignment')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async updateAssignDevice(
    @Query() query: UpdateAssignDeviceParamDto,
    @Request() req: UserRequest
  ) {
    query.tenant_id = req?.user?.tenant?.id;
    const data = await this.operationListService.updateAssignDevice(query);
    return data;
  }

  //#endregion
}
