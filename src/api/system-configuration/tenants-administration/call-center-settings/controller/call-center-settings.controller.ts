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
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CallCenterSettingsDto } from '../dto/call-center-settings.dto';
import { CallCenterSettingsService } from '../services/call-center-settings.service';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';

@ApiTags('Call Center Settings')
@Controller('call-center-administrations/call-center-settings')
export class CallCenterSettingsController {
  constructor(
    private readonly callCenterSettingsService: CallCenterSettingsService
  ) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE
  )
  create(@Body() createCallCenterSettingsDto: CallCenterSettingsDto) {
    return this.callCenterSettingsService.create(createCallCenterSettingsDto);
  }

  @Get('')
  @ApiParam({ name: 'id', required: false })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_READ
  )
  @UsePipes(new ValidationPipe())
  findOne() {
    return this.callCenterSettingsService.findOne();
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: false })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE
  )
  @UsePipes(new ValidationPipe())
  update(
    @Body() updateCallCenterSettingsDto: CallCenterSettingsDto,
    @Param('id') id: any
  ) {
    return this.callCenterSettingsService.update(
      updateCallCenterSettingsDto,
      id
    );
  }
}
