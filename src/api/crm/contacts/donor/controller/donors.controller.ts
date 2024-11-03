import {
  Controller,
  Post,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Body,
  Get,
  Query,
  Param,
  Put,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRequest } from 'src/common/interface/request';
import { DonorsService } from '../services/donors.service';
import {
  CreateDonorsDto,
  FindDonorBBCSDto,
  UpdateDonorsDto,
} from '../dto/create-donors.dto';
import {
  GetAllDonorsAppointments,
  GetAllDonorsInterface,
  GetAppointmentCreateDetailsInterface,
  GetAppointmentsCreateListingInterface,
  GetStartTimeCreateDetailsInterface,
} from '../interface/donors.interface';
import { GetAllAccountsInterface } from 'src/api/crm/accounts/interface/accounts.interface';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { CreateDonorAppointmentDto } from '../dto/create-donors-appointment.dto';
import {
  cancelDonorAppointmentDto,
  syncBBCSDto,
  updateDonorAppointmentDto,
} from '../dto/update-donors-appointment.dto';
import { CronExpression } from '@nestjs/schedule';
import { post } from 'axios';
@ApiTags('Donors')
@Controller('contact-donors')
export class DonorsController {
  constructor(private readonly service: DonorsService) {}

  @Get('generate-uuids')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async generateContactUUIDs() {
    const response = await this.service.generateUUIDsForAllContacts();
    return response;
  }

  /**
   * create entity
   * @param createDto
   * @returns
   */
  @Post('')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CRM_CONTACTS_DONOR_WRITE)
  create(@Body() createDto: CreateDonorsDto, @Request() req: UserRequest) {
    createDto.created_by = req.user.id;
    createDto.tenant_id = req.user.tenant.id;
    return this.service.create(createDto, req.user);
  }

  /**
   * archive entity
   * @param id
   * @param req
   * @returns {object}
   */
  @Patch('/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CRM_CONTACTS_DONOR_ARCHIVE)
  async archive(@Param('id') id: any, @Request() req: UserRequest) {
    const updatedBy = req?.user?.id;
    return this.service.archive(id, updatedBy);
  }

  /**
   * list of entity
   * @param getAllInterface
   * @returns {objects}
   */
  @Get('')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  findAll(
    @Query() getAllInterface: GetAllDonorsInterface,
    @Request() req: UserRequest
  ) {
    getAllInterface['tenant_id'] = req.user.tenant.id;
    return this.service.findAllFilteredNew(getAllInterface);
  }

  @Get('/find-donor-bbcs')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  findDonorBBCS(
    @Query() findDonorBBCSDto: FindDonorBBCSDto,
    @Request()
    req: UserRequest
  ) {
    return this.service.findDonorBBCS(findDonorBBCSDto, req.user);
  }

  /**
   * list of entity
   * @param getAllAppointmentsInterface
   * @returns {objects}
   */
  @Get('/donor-appointments')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  fetchDonorAppointments(
    @Query() getAllAppointmentsInterface: GetAllDonorsAppointments,
    @Request() req: UserRequest
  ) {
    getAllAppointmentsInterface['tenant_id'] = req.user.tenant.id;
    return this.service.fetchDonorAppointments(getAllAppointmentsInterface);
  }
  @Get('/upsert/seed-data')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getDonorsSeedData(
    @Request() req: UserRequest,
    @Query() queryParams: GetAllAccountsInterface
  ) {
    queryParams.tenant_id = req.user.tenant.id;
    return this.service.getDonorsSeedData(req.user, queryParams);
  }
  @Get('/donor-appointments/create-listing/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  createDonorListing(
    @Param('id') id: any,
    @Request() req: UserRequest,
    @Query()
    getAppointmentsCreateListingInterface: GetAppointmentsCreateListingInterface
  ) {
    return this.service.createDonorListing(
      id,
      getAppointmentsCreateListingInterface,
      req?.user?.tenant?.id
    );
  }

  @Get('/donor-appointments/filters/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  getDonorAppointmentFilters(
    @Param('id') id: any,
    @Request() req: UserRequest
  ) {
    return this.service.getDonorAppointmentFilters(req?.user?.tenant?.id);
  }

  @Get('/donor-appointments/create-details/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  getDonationTypeAppointmentCreateDetails(
    @Param('id') id: any,
    @Request() req: UserRequest,
    @Query()
    getAppointmentCreateDetailsInterface: GetAppointmentCreateDetailsInterface
  ) {
    return this.service.getDonationTypeAppointmentCreateDetails(
      getAppointmentCreateDetailsInterface,
      req?.user?.tenant?.id
    );
  }

  @Get('/donor-appointments/create-details/start-time/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  getStartTimeAppointmentCreateDetails(
    @Param('id') id: any,
    @Request() req: UserRequest,
    @Query()
    getStartTimeCreateDetailsInterface: GetStartTimeCreateDetailsInterface
  ) {
    return this.service.getStartTimeAppointmentCreateDetails(
      getStartTimeCreateDetailsInterface
    );
  }

  @Get('/donor-appointments/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  GetDonorAppointment(@Param('id') id: any, @Request() req: UserRequest) {
    return this.service.getDonorAppointment(id);
  }

  @Get('/appointment/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  GetSingleDonorAppointment(@Param('id') id: any, @Request() req: UserRequest) {
    return this.service.getSingleAppointment(id);
  }

  @Post('/appointments')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  async addDonorAppointment(
    @Body() createDonorAppointmentDto: CreateDonorAppointmentDto,
    @Request() req: UserRequest
  ) {
    createDonorAppointmentDto.created_by = req?.user?.id;
    return this.service.addDonorAppointment(
      createDonorAppointmentDto,
      req?.user
    );
  }

  @Put('/donors/:donorId/appointments/:appointmentId')
  @ApiParam({ name: 'donorId', required: true })
  @ApiParam({
    name: 'appointmentId',
    required: true,
  })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  async updateDonorAppointment(
    @Param('donorId') donorId: any,
    @Param('appointmentId') appointmentId: any,
    @Body() updateDonorAppointmentDto: updateDonorAppointmentDto,
    @Request() req: UserRequest
  ) {
    return this.service.updateDonorAppointment(
      req.user.id,
      donorId,
      appointmentId,
      updateDonorAppointmentDto
    );
  }

  @Put('/donors/:donorId/appointments/cancel/:appointmentId')
  @ApiParam({ name: 'donorId', required: true })
  @ApiParam({
    name: 'appointmentId',
    required: true,
  })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  async cancelDonorAppointment(
    @Param('donorId') donorId: any,
    @Param('appointmentId') appointmentId: any,
    @Body() cancelDonorAppointmentDto: cancelDonorAppointmentDto,
    @Request() req: UserRequest
  ) {
    return this.service.cancelDonorAppointment(
      req.user.id,
      donorId,
      appointmentId,
      cancelDonorAppointmentDto
    );
  }

  @Get('/donor-appointments/archive/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  // @UseGuards(PermissionGuard)
  // @Permissions(
  //   PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
  //   PermissionsEnum.CRM_CONTACTS_DONOR_READ
  // )
  archiveDonorAppointment(@Param('id') id: any, @Request() req: UserRequest) {
    return this.service.archiveDonorAppointment(id, req.user);
  }
  @Put('/reschedule-bbcs')
  @ApiBearerAuth()
  @ApiQuery({ name: 'expression', enum: CronExpression, required: true })
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  BBCSCron(@Query('expression') expression: CronExpression) {
    console.log(expression);
    return {
      success: this.service.changeBBCSSyncCronExpression(expression as any),
    };
  }
  @Post('/sync-donor-bbcs')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  bbcsSync(@Body() bbcsSync: syncBBCSDto) {
    return this.service.syncDonorWithBBCS(bbcsSync.id, bbcsSync.uuid);
  }
  @Get('/unSynced-donors')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  getUnSyncedDonors() {
    return this.service.getUnSyncedDonors();
  }

  @Get('/bbcs-get-schedule')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  BBCSCronGetTime() {
    return this.service.getBBCSSyncCronSchedule();
  }

  @Get('/blood-groups')
  @UsePipes(new ValidationPipe())
  async get() {
    return await this.service.getBloodGroups();
  }
  /**
   * view of entity
   * @param id
   * @returns {object}
   */
  @Get('/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  async findOne(@Param('id') id: any, @Request() req: UserRequest) {
    return this.service.findOne(id, req);
  }

  @Get('/eligibilities/details/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CRM_CONTACTS_DONOR_WRITE,
    PermissionsEnum.CRM_CONTACTS_DONOR_READ
  )
  async getEligibilities(@Param('id') id: any, @Request() req: UserRequest) {
    return this.service.getEligibilities(id, req);
  }
  /**
   * update entity
   * @param id
   * @param updateDto
   * @returns {object}
   */
  @Put('/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, type: Number })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CRM_CONTACTS_DONOR_WRITE)
  async update(
    @Param('id') id: any,
    @Body() updateDto: UpdateDonorsDto,
    @Request() req: UserRequest
  ) {
    updateDto.created_by = req.user.id;
    updateDto.tenant_id = req.user.tenant.id;
    return this.service.update(id, updateDto, req.user);
  }
}
