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
  Request,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateSegmentsDto,
  GetAllSegmentsDto,
  GetDonorsInformationDto,
} from '../dto/segments.dto';
import { ManageSegmentsService } from '../services/manage-segments.service';
import { UserRequest } from 'src/common/interface/request';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import {
  CreateSegmentsContactsDto,
  UpdateCallJobsSegmentsContactsDto,
  UpdateSegmentsContactsDto,
} from '../dto/segment-contacts.dto';

@ApiTags('Manage Segments')
@Controller('/call-center')
export class ManageSegmentsController {
  constructor(private readonly manageSegmentsService: ManageSegmentsService) {}

  @Post('segments')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_WRITE)
  async createSegments(
    @Body() createSegmentsDto: CreateSegmentsDto,
    @Request() req: UserRequest
  ) {
    return this.manageSegmentsService.create(createSegmentsDto, req.user);
  }

  @Post('manage-segments/contacts')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_WRITE)
  async createSegmentContact(
    @Body() createSegmentsContactDto: CreateSegmentsContactsDto,
    @Request() req: UserRequest
  ) {
    return this.manageSegmentsService.createSegmentContact(
      createSegmentsContactDto,
      req.user?.id
    );
  }

  @Get('/segments')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_READ)
  async getAllSegments(@Query() getAllSegmentsInterface: GetAllSegmentsDto) {
    const result = await this.manageSegmentsService.getAllSrgments(
      getAllSegmentsInterface
    );
    return result;
  }

  @Get('/segments/:segmentId/donor-information')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_READ)
  async getSegmentsDonors(
    @Param('segmentId') segmentId: number,
    @Query() getDonorsInformationDto: GetDonorsInformationDto,
    @Request() req: UserRequest
  ) {
    const result =
      await this.manageSegmentsService.updateSegmentsContactsFromDailyStory(
        segmentId,
        getDonorsInformationDto,
        req.user
      );
    return result;
  }

  @Get('segments-update')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_READ)
  async updateSegmentsDatafromDS(@Request() req: UserRequest) {
    return this.manageSegmentsService.updateSegmentsFromDailyStory(req.user);
  }

  @Patch('/segments-contacts/:id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_WRITE)
  async updateSegmentsContacts(
    @Param('id') id: bigint,
    @Body() updateSegmentContactsDto: UpdateSegmentsContactsDto
  ) {
    const result = await this.manageSegmentsService.updateSegmentsContacts(
      id,
      updateSegmentContactsDto
    );
    return result;
  }

  @Patch('/call-jobs-segments-contacts/:id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_WRITE)
  async updateCallJobsSegmentsContacts(
    @Param('id') id: bigint,
    @Body() updateCallJobsSegmentsContactsDto: UpdateCallJobsSegmentsContactsDto
  ) {
    const result =
      await this.manageSegmentsService.updateCallJobsSegmentsContacts(
        id,
        updateCallJobsSegmentsContactsDto
      );
    return result;
  }
}
