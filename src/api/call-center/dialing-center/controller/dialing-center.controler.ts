import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { DialingCenterCallJobsQueryDto } from '../dto/dialing-center-query.dto';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { DialingCenterService } from '../service/dialing-center-call-jobs.service';
import { DialingCenterCallJobDto } from '../dto/dialing-center-call-job.dto';
import { DialingCenterNotesDto } from '../dto/dialing-center-note.dto';

@ApiTags('Dialing Center')
@Controller('/call-center/dialing-center')
export class DialingCenterController {
  constructor(private readonly dialingCenterService: DialingCenterService) {}

  @Get('/call-jobs')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ)
  async getAllCallJobs(
    @Query() dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto
  ) {
    return await this.dialingCenterService.getAllDialingCenterCallJobs(
      dialingCenterCallJobsQueryDto
    );
  }

  @Get('/call-jobs/agent')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ)
  async getAllCallJobsByLoggedAgent(
    @Query() dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto
  ) {
    return await this.dialingCenterService.getAllDialingCenterCallJobsByLoggedAgent(
      dialingCenterCallJobsQueryDto
    );
  }

  @Get('/donors-info')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ)
  async getAllDonorsInfo(
    @Query() dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto
  ) {
    return await this.dialingCenterService.getAllDonorsInfo(
      dialingCenterCallJobsQueryDto
    );
  }

  @Post('/')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use permissions which are used on call jobs assignments
  )
  async createDialingCenterCallJob(
    @Body() dialingCenterCallJobDto: DialingCenterCallJobDto
  ) {
    return await this.dialingCenterService.create(dialingCenterCallJobDto);
  }
  @Post('/notes')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use permissions which are used on call jobs assignments
  )
  async createDailingCenterNotes(
    @Body() dialingCenterNotesDto: DialingCenterNotesDto
  ) {
    return await this.dialingCenterService.createDailingCenterNotes(
      dialingCenterNotesDto
    );
  }

  @Get('/notes/:donor_id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ)
  @ApiParam({ name: 'donor_id', required: true })
  async getAllDailingCenterNotes(@Param() donor_id: any) {
    return await this.dialingCenterService.getAllDailingCenterNotes(donor_id);
  }
  @Get('/operation-detail/:operation_id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ)
  @ApiParam({ name: 'operation_id', required: true })
  async getJobDetails(@Param() operation_id: any) {
    return await this.dialingCenterService.getJobDetails(operation_id);
  }

  @Get('/donor/:id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_DIALING_CENTER_READ)
  @ApiParam({ name: 'id', required: true })
  async getDailingCenterDonorDetails(@Param() id: any) {
    return await this.dialingCenterService.getDailingCenterDonorDetails(id);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async getSingleDialingCenterCallJobByCallJobId(@Param('id') id: any) {
    return this.dialingCenterService.getSingleDialingCenterCallJobByCallJobId(
      id
    );
  }

  @Patch('/dialing-center-call-job/:id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_WRITE)
  async updateCallJobsAgents(
    @Param('id') id: bigint,
    @Body()
    dialingCenterCallJobDto: DialingCenterCallJobDto
  ) {
    const result = await this.dialingCenterService.updateDialingCenterCallJob(
      id,
      dialingCenterCallJobDto
    );
    return result;
  }
}
