import {
  Controller,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Get,
  Query,
  Request,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRequest } from 'src/common/interface/request';
import { DepartService } from '../services/depart.service';

import { GetAllDepartFilteredInterface } from '../interface/depart.interface';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';

@ApiTags('Staffing management depart')
@Controller('/view-schedules/departure-schedules')
export class DepartController {
  constructor(private readonly service: DepartService) {}

  /**
   * list of entity
   * @param getAllDepartFilteredInterface
   * @returns {objects}
   */
  @Get('/search')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.STAFFING_MANAGEMENT_VIEW_SCHEDULE_DEPART_SCHEDULE
  )
  findAllFiltered(
    @Query() getAllInterface: GetAllDepartFilteredInterface,
    @Request() req: UserRequest
  ) {
    getAllInterface['tenant_id'] = req.user.tenant.id;
    return this.service.findAllFiltered(getAllInterface);
  }
}
