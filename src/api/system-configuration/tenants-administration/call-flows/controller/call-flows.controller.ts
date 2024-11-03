import {
  Controller,
  Post,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Body,
  Get,
  Param,
  UseGuards,
  Put,
  Query,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { callFlowDto } from '../dto/call-flow.dto';
import { CallFlowsService } from '../services/call-flows.service';
import { CallFlowsQueryDto } from '../query/call-flows-query.dto';
import { UserRequest } from 'src/common/interface/request';
import { CallFlowPatchDto } from '../dto/call-flow-patch.dto';
@ApiTags('Call Flows')
@Controller('/call-center/call-flows')
export class CallFlowsController {
  constructor(private readonly callFlowsService: CallFlowsService) {}
  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE
  )
  create(@Body() callFlowDto: callFlowDto) {
    return this.callFlowsService.create(callFlowDto);
  }

  @Get('/')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_READ
  )
  async getAllCallFlows(@Query() CallFlowsQueryDto: CallFlowsQueryDto) {
    const result = await this.callFlowsService.getAllCallFlows(
      CallFlowsQueryDto
    );
    return result;
  }

  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_READ
  )
  async getCallFlow(@Param('id') id: string) {
    return this.callFlowsService.getCallFlow(id);
  }

  @Get('/call-job-id/:callJobId')
  @ApiParam({ name: 'callJobId', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_READ
  )
  async getCallJobCallFlowByCallJobId(@Param('callJobId') callJobId: string) {
    return await this.callFlowsService.getCallJobCallFlowByCallJobId(callJobId);
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE
  )
  @UsePipes(new ValidationPipe())
  update(@Body() callFlowDto: callFlowDto, @Param('id') id: any) {
    return this.callFlowsService.update(callFlowDto, id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE
  )
  archiveOrSetAsDefault(
    @Param('id') id: any,
    @Body() callFlowPatchDto: CallFlowPatchDto
  ) {
    return this.callFlowsService.archiveOrSetAsDefault(id, callFlowPatchDto);
  }
}
