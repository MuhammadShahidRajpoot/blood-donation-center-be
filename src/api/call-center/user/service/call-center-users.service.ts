import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { CallCenterUserDto } from '../dto/call-center-user.dto';
import { CallCenterUsers } from '../entity/call-center-users.entity';
@Injectable()
export class CallCenterUsersService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CallCenterUsers)
    private readonly callCenterUsersRepository: Repository<CallCenterUsers>
  ) {}

  async getCallCenterAgents() {
    try {
      const query = `SELECT u.id as user_id, 
      CONCAT(u.first_name,' ',u.last_name) as name ,
      u.tenant_id as tenant_id
      from public.user u join roles r on r.id = u.role where r.cc_role_name = 'agent'`;

      const data = await this.callCenterUsersRepository.query(query);

      return resSuccess(
        'Call Center Agents Fetched Successfully',
        'success',
        HttpStatus.OK,
        data
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
