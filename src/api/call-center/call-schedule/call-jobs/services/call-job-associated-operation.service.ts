import {
  Injectable,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike } from 'typeorm';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { CallJobsAssociatedOperations } from '../entities/call-job-operation-association.entity';
import { CallJobsAssociatedOperationDto } from '../dto/call-job-associated-operation.dto';

@Injectable()
export class CallJobsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CallJobsAssociatedOperations)
    private readonly repository: Repository<CallJobsAssociatedOperations>
  ) {}

  async create(
    callJobsOperationAssociationsDto: CallJobsAssociatedOperationDto
  ) {
    try {
      const savedCallJob = await this.repository.save(
        new CallJobsAssociatedOperations(
          callJobsOperationAssociationsDto,
          this.request
        )
      );

      return resSuccess(
        'Call Job Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedCallJob
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
