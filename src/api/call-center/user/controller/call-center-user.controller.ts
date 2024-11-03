import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CallCenterUsersService } from '../service/call-center-users.service';
import { CallCenterUserDto } from '../dto/call-center-user.dto';

@ApiTags('Call Center Users')
@Controller('/call-center')
export class CallCenterUsersController {
  constructor(
    private readonly callCenterUsersService: CallCenterUsersService
  ) {}

  @Get('/agents')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getCallCenterAgents() {
    return await this.callCenterUsersService.getCallCenterAgents();
  }
}
