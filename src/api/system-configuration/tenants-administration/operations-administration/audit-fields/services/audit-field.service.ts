import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditFields } from '../entities/audit-fields.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from '../../../../../../common/interface/request';
import { customSort } from 'src/api/utils/sorting';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';

@Injectable({ scope: Scope.REQUEST })
export class AuditFieldsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(AuditFields)
    private readonly auditFieldRepository: Repository<AuditFields>
  ) {}

  async getAllAuditFields(query): Promise<any> {
    console.log('service');
    const sort = customSort(query);
    try {
      const where = {
        tenant_id: this.request.user?.tenant?.id,
      };
      const [response, count] = await this.auditFieldRepository.findAndCount({
        where,
        order: sort,
      });
      return {
        status: HttpStatus.OK,
        message: 'Products Fetched Succesfuly',
        count: count,
        data: response,
      };
    } catch (err) {
      console.error(err);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
