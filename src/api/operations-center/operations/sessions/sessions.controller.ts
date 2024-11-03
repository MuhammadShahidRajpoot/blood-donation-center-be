import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
  Request,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { UpsertSessionDto } from './dto/upsert-sessions.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { UserRequest } from 'src/common/interface/request';
import {
  AddShiftSlotDTO,
  GetShiftIds,
  UpdateShiftsProjectionStaff,
} from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/dto/create-blueprint.dto';
import { DrivesService } from '../drives/service/drives.service';
import { CreateDonorAppointment } from '../drives/dto/create-drive.dto';
import { DonorCenterBlueprintService } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/services/donor-center-blueprints.services';
import { updateDonorAppointmentDto } from 'src/api/crm/contacts/donor/dto/update-donors-appointment.dto';
import { GetAllDonorsInterface } from 'src/api/crm/contacts/donor/interface/donors.interface';
import { DonorsService } from 'src/api/crm/contacts/donor/services/donors.service';
import { PickupDto } from '../drives/dto/pickup.dto';
import { GetAllPickupsInterface } from '../drives/interface/get-drives-filter.interface';
import { GetEquipmentForDriveInterface } from 'src/api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/interface/equipment.interface';
import { ListChangeAuditDto } from '../drives/dto/change-audit.dto';

@ApiTags('Sessions')
@Controller('/operations/sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly drivesService: DrivesService,
    private readonly donorCenterBlueprintService: DonorCenterBlueprintService,
    private readonly donorService: DonorsService
  ) {}

  @Post('/create')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Res() res, @Body() createDto: UpsertSessionDto) {
    const data = await this.sessionsService.create(createDto);
    return res.status(data.status_code).json(data);
  }

  @Post('/create-many')
  @ApiBody({ type: [UpsertSessionDto] })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMany(@Res() res, @Body() createDtos: UpsertSessionDto[]) {
    const data = await this.sessionsService.createMany(createDtos);
    return res.status(data.status_code).json(data);
  }

  @Get('/list')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async get(@Res() res, @Query() query: QuerySessionsDto) {
    const { page, limit, sortName, sortOrder, ...filters } = query;
    const data = await this.sessionsService.get(
      page,
      limit,
      { sortName, sortOrder },
      filters
    );
    return res.status(data.status_code).json(data);
  }

  @Get('/:id/find')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async detail(@Res() res, @Param('id') id: string) {
    const data = await this.sessionsService.getOne(id);
    return res.status(data.status_code).json(data);
  }

  @Put('/:id/update')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateDto: UpsertSessionDto
  ) {
    const data = await this.sessionsService.update(id, updateDto);
    return res.status(data.status_code).json(data);
  }

  @Delete('/:id/delete')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async archive(
    @Res() res,
    @Param('id') id: string,
    @Request() req: UserRequest
  ) {
    const data = await this.sessionsService.archive(id, req.user);
    return res.status(data.status_code).json(data);
  }

  @Get('/shift/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getShiftDetails(@Param('id') id: bigint) {
    return this.sessionsService.getShiftInfo(id);
  }

  @Post('/shifts/:shiftId/projection/:procedureTypeId/slots')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  // @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.CREATED)
  async addShiftSlot(
    @Request() req: UserRequest,
    @Body() addShiftSlotDto: AddShiftSlotDTO
  ) {
    return this.sessionsService.addShiftSlot(addShiftSlotDto, req.user);
  }

  @Get('/donors')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  findAll(
    @Query() getAllInterface: GetAllDonorsInterface,
    @Request() req: UserRequest
  ) {
    getAllInterface['tenant_id'] = req.user.tenant.id;
    return this.donorService.findAllFiltered(getAllInterface);
  }

  @Post('/donors/appointments')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  async addDonorAppointments(
    @Body() createDonorAppointmentDto: CreateDonorAppointment,
    @Request() req: UserRequest
  ) {
    return this.drivesService.addDonorAppointments(
      createDonorAppointmentDto,
      req.user
    );
  }

  @Put('/donors/:donorId/appointments/:appointmentId')
  @ApiParam({ name: 'donorId', required: true })
  @ApiParam({
    name: 'appointmentId',
    required: true,
  })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  async updateDonorAppointment(
    @Param('donorId') donorId: any,
    @Param('appointmentId') appointmentId: any,
    @Body() updateDonorAppointmentDto: updateDonorAppointmentDto,
    @Request() req: UserRequest
  ) {
    return this.donorService.updateDonorAppointment(
      req.user.id,
      donorId,
      appointmentId,
      updateDonorAppointmentDto
    );
  }

  @Patch('/shifts/projection/staff')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async updateShiftProjectionStaff(
    @Request() req: UserRequest,
    @Body() updateShiftsProjectionStaff: UpdateShiftsProjectionStaff
  ) {
    return this.drivesService.updateShiftProjectionStaff(
      updateShiftsProjectionStaff
    );
  }

  @Post('/shifts/procedure-type/projection-staff')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async getShiftProjectionStaff(
    @Request() req: UserRequest,
    @Body() getShiftIds: GetShiftIds
  ) {
    return this.donorCenterBlueprintService.getShiftProjectionStaff(
      getShiftIds
    );
  }

  @Post('/shifts/procedure-type/slots')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async getProcedureTypeSlots(
    @Request() req: UserRequest,
    @Body() getShiftIds: GetShiftIds
  ) {
    return this.drivesService.getProcedureTypeSlots(getShiftIds);
  }

  @Get('/shifts/donors-schedules/:id')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  async getBluePrintDonorSchdules(
    @Request() req: UserRequest,
    @Param('id') id: any
  ) {
    return this.sessionsService.getSessionShiftDonorSchdules(req.user, id);
  }

  @Get('/marketing-equipment/equipment')
  @UsePipes(new ValidationPipe())
  findAllForDrives(@Query() params: GetEquipmentForDriveInterface) {
    return this.sessionsService.findAllEquipments(params);
  }

  @Get('/shifts/about/:id')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  async getSessionAboutData(@Request() req: UserRequest, @Param('id') id: any) {
    return this.sessionsService.getSessionAboutData(req.user, id);
  }

  @Get('/:id/change-audit')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getChangeAudit(
    @Param() id: any,
    @Query() listChangeAuditDto: ListChangeAuditDto
  ) {
    return this.sessionsService.getChangeAudit(id, listChangeAuditDto);
  }

  @Post(':session_id/pickups')
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'session_id', required: true })
  async createPickups(
    @Param('session_id') id: any,
    @Request() req: UserRequest,
    @Body() createPickupsDto: PickupDto
  ) {
    return this.sessionsService.createPickups(id, req.user, createPickupsDto);
  }

  @Get(':session_id/pickups')
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'session_id', required: true })
  @HttpCode(HttpStatus.OK)
  async getStages(
    @Param('session_id') id: any,
    @Query() getAllPickupsInterface: GetAllPickupsInterface
  ) {
    return this.sessionsService.sessionPickups(id, getAllPickupsInterface);
  }
}
