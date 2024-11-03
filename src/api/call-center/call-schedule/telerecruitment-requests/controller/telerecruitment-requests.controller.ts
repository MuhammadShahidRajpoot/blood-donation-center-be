import {
  Controller,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { TelerecruitmentRequestsService } from '../service/telerecruitment-requests.service';
import { TelerecruitmentRequestsInterface } from '../interface/telerecruitment-requests.interface';

@ApiTags('Call Jobs')
@Controller('call-center/telerecruitment-requests')
export class TelerecruitmentRequestsController {
  constructor(
    private readonly telerecruitmentRequestsService: TelerecruitmentRequestsService
  ) {}

  @Get('/')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  findAll(
    @Query() telerecruitmentRequestsInterface: TelerecruitmentRequestsInterface
  ) {
    return this.telerecruitmentRequestsService.findAll(
      telerecruitmentRequestsInterface
    );
  }

  @Put('/accept/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async acceptRequest(@Param('id') id: bigint) {
    return this.telerecruitmentRequestsService.acceptOrDecline(id, true);
  }

  @Put('/decline/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async declineRequest(@Param('id') id: bigint) {
    return this.telerecruitmentRequestsService.acceptOrDecline(id, false);
  }
}
