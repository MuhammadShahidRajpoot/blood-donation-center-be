import {
  Controller,
  Post,
  Body,
  Request,
  UsePipes,
  ValidationPipe,
  Query,
  Get,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { OcApprovalsService } from '../service/oc-approvals.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateApprovalDto } from '../dto/create-oc-approval.dto';
import { UpdateApprovalDto } from '../dto/update-oc-approval.dto';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { UserRequest } from 'src/common/interface/request';
import { GetOcApprovalsInterface } from '../interface/oc-approval.interface';

@ApiTags('OC Approvals')
@Controller('operations/approvals')
export class OcApprovalsController {
  constructor(private readonly approvalsService: OcApprovalsService) {}

  @Post('')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  create(
    @Request() req: UserRequest,
    @Body() createApprovalDto: CreateApprovalDto
  ) {
    return this.approvalsService.create(req.user, createApprovalDto);
  }

  @Get('')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  findAll(
    @Query() getOcApprovalsInterface: GetOcApprovalsInterface,
    @Request() req: UserRequest
  ) {
    return this.approvalsService.findAll(req.user, getOcApprovalsInterface);
  }

  @Get('/:id/details')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  findOne(@Param('id') id: any, @Request() req: UserRequest) {
    return this.approvalsService.findOne(+id, req.user);
  }

  @Put('/:id/approval-details')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  updateApprovalDetail(
    @Param('id') id: any,
    @Request() req: UserRequest,
    @Body() updateApprovalDto: UpdateApprovalDto
  ) {
    return this.approvalsService.updateApprovalDetail(
      +id,
      req.user,
      updateApprovalDto
    );
  }

  @Patch('/archive/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  archive(@Param('id') id: any, @Request() req: UserRequest) {
    return this.approvalsService.archive(+id, req.user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.approvalsService.remove(+id);
  // }
}
