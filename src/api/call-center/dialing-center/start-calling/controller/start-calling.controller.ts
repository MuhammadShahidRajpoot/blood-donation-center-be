import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
  UsePipes,
  Param,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { StartCallingDto, updateCallDto } from '../dto/start-calling.dto';
import { StartCallingService } from '../service/start-calling.service';
import { StartCallingInterface } from '../interface/start-calling.interface';
import { CallStateInterface } from '../interface/call-state.interface';

@ApiTags('Call Initiation')
@Controller('/call-center/dialing-center/start-calling')
export class StartCallingController {
  constructor(private readonly startCallingService: StartCallingService) {}

  // @Post('/init')
  // @UsePipes(new ValidationPipe())
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(PermissionGuard)
  // @Permissions(
  //   PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  // )
  // async callInitiation(@Body() startCallingDto: StartCallingDto) {
  //   return await this.startCallingService.makeCallInitiation(startCallingDto);
  // }

  /*   @Post('/transfer-call')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async transferCall(@Body() startCalling: StartCallingInterface) {
    return await this.startCallingService.transferCallToAgent(startCalling);
  }
 */
  /*   @Get('/call-info')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async getCallInfo(@Query() startCallingInterface: StartCallingInterface) {
    return await this.startCallingService.getCallInfo(startCallingInterface);
  }
 */
  /*   @Get('/calls')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async getAllCallsInfo(@Query() startCallingInterface: StartCallingInterface) {
    return await this.startCallingService.getAllCallsLogs(
      startCallingInterface
    );
  } */

  @Get('/call-child')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async getChildCallByParentSid(
    @Query() startCallingInterface: StartCallingInterface
  ) {
    return await this.startCallingService.getChildCallByParentCallSid(
      startCallingInterface
    );
  }

  @Post('/token')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async voiceCallToken() {
    return await this.startCallingService.voiceCallToken();
  }

  @Post('/init')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async makeCallInitiation(@Res() res: Response, @Body() request: any) {
    return await this.startCallingService.makeCallInitiation(res, request);
  }

  @Get('/hold')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async hold(@Res() res: Response, @Query('callSid') callSid: string) {
    return await this.startCallingService.holdCall(res, callSid);
  }
  @Get('/resume')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async resume(@Res() res: Response, @Query('callSid') callSid: string) {
    return await this.startCallingService.resumeCall(res, callSid);
  }

  /*  @Get('/call-state')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async recieveCallState(@Query() callStateInterface: CallStateInterface) {
    return await this.startCallingService.getCallState(callStateInterface);
  } */

  @Put('/voice-message')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE //needs to be changed to use appropriate permissions
  )
  async playVoiceMessage(@Body() updateCallDto: updateCallDto) {
    return await this.startCallingService.playVoiceMessage(updateCallDto);
  }
}
