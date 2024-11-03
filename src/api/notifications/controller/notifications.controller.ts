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
  Request,
  Query,
  Put,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { NotificationsService } from '../services/notifications.service';
import { NotificationsDto } from '../dto/notifications.dto';
import { UserRequest } from 'src/common/interface/request';
import { NotificationsInterface } from '../interface/notification.interface';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  create(@Body() notificationsDto: NotificationsDto) {
    return this.notificationsService.create(notificationsDto);
  }

  @Get('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async findAll(
    @Request() req: UserRequest,
    @Query() notificationsInterface: NotificationsInterface
  ) {
    return this.notificationsService.findAll(req, notificationsInterface);
  }

  @Put('/markAllAsRead')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async markAllAsRead(@Request() req: UserRequest) {
    return this.notificationsService.markAllAsRead(req);
  }

  @Put('/markAllAsRead/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE //need to change permission
  )
  async markSingleNotificationAsRead(
    @Param('id') id: any,
    @Request() req: UserRequest
  ) {
    return this.notificationsService.markSingleNotificationAsRead(req, id);
  }
}
