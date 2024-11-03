import {
  Controller,
  Post,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Body,
  UseGuards,
  Get,
  Query,
  Put,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { CallJobsService } from '../services/call-job.service';
import { CallJobsdDto } from '../dto/call-jobs.dto';
import { CallJobsAssociatedOperationDto } from '../dto/call-job-associated-operation.dto';
import {
  CallJobsAgentsDto,
  UpdateCallJobsAgentsDto,
} from '../dto/call-jobs-agents.dto';
import { CallJobsInterface } from '../interface/call-jobs.interface';
import { GetAssignedAgentsInterface } from '../interface/call-jobs-agents.interface';
import { CallJobUpdateDto } from '../dto/call-job-update.dto';

@ApiTags('Call Jobs')
@Controller('call-center/call-jobs')
export class CallJobsController {
  constructor(private readonly callJobService: CallJobsService) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  create(@Body() callJobsDto: CallJobsdDto) {
    return this.callJobService.create(callJobsDto);
  }

  @Post('/associate-operation')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  associateOperation(
    @Body() callJobsAssociatedOperationDto: CallJobsAssociatedOperationDto
  ) {
    return this.callJobService.associateOperation(
      callJobsAssociatedOperationDto
    );
  }

  @Get('/')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  findAllCallJobs(@Query() callJobsInterface: CallJobsInterface) {
    return this.callJobService.findAllCallJobs(callJobsInterface);
  }

  @Get('/agent/:callJobId')
  @ApiParam({ name: 'callJobId', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async getCallJobAgentByLoggedAgentAndCallJobId(@Param('callJobId') id: any) {
    return this.callJobService.getCallJobAgentByLoggedAgentAndCallJobId(id);
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
  async get(@Param('id') id: any) {
    return this.callJobService.getSingleCallJob(id);
  }

  @Put('/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async updateCallJob(
    @Param('id') id: number,
    @Body() callJobsDto: CallJobsdDto
  ) {
    return this.callJobService.updateCallJob(id, callJobsDto);
  }

  @Post('/assign-agents/:callJobId')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  assignAgents(
    @Body() callJobsAgentsDto: CallJobsAgentsDto[],
    @Param('callJobId') callJobId: number
  ) {
    return this.callJobService.assginAgents(callJobsAgentsDto, callJobId);
  }

  @Get('/assign-agents/:callJobId')
  @ApiParam({ name: 'callJobId' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  findfindAssignedAgents(
    @Param() getAssignedAgentsInterface: GetAssignedAgentsInterface
  ) {
    return this.callJobService.findAssignedAgents(getAssignedAgentsInterface);
  }

  @Put('/unassign/:CallJobId/:AgentId')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions()
  //need to add permission
  async unAssignAgents(
    @Param('CallJobId') CallJobId: number,
    @Param('AgentId') AgentId: number
  ) {
    return this.callJobService.unAssignAgents(AgentId, CallJobId);
  }
  @Put('/remove-segment/:CallJobId/:CallSegmentId')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions()
  //need to add permission
  async removeSegment(
    @Param('CallJobId') CallJobId: number,
    @Param('CallSegmentId') CallSegmentId: number
  ) {
    return this.callJobService.removeSegment(CallSegmentId, CallJobId);
  }

  @Post('/add-segments/:CallJobId')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions()
  //need to add permission
  async addSegmentsToCallJobs(
    @Param('CallJobId') CallJobId: number,
    @Body() segments: any
  ) {
    return this.callJobService.addSegmentsToCallJobs(CallJobId, segments);
  }

  @Put('call-schedule/deactivate/:CallJobId')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions()
  //need to add permission
  async update(@Param('CallJobId') CallJobId: number) {
    return this.callJobService.deactivateCallJob(CallJobId);
  }

  @Patch('call-job-status/:CallJobId')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions()
  //need to add permission
  async updateCallJobStatus(
    @Param('CallJobId') CallJobId: bigint,
    @Body() callJobUpdateDto: CallJobUpdateDto
  ) {
    return await this.callJobService.updateCallJobStatus(
      CallJobId,
      callJobUpdateDto
    );
  }

  @Patch('/call-jobs-agents/:id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SEGMENTS_WRITE)
  async updateCallJobsAgents(
    @Param('id') id: bigint,
    @Body()
    updateCallJobsAgentsDto: UpdateCallJobsAgentsDto
  ) {
    const result = await this.callJobService.updateCallJobsAgents(
      id,
      updateCallJobsAgentsDto
    );
    return result;
  }
}
