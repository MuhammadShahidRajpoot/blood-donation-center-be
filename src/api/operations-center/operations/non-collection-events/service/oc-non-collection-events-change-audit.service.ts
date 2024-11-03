import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { resError } from 'src/api/system-configuration/helpers/response';
import { NonCollectionEvents } from '../entities/oc-non-collection-events.entity';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { GetNonCollectionEventsChangeAuditInterface } from '../interface/get-non-collection-events.interface';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { OperationTypeEnum } from 'src/api/call-center/call-schedule/call-jobs/enums/operation-type.enum';

dotenv.config();

@Injectable()
export class OcNonCollectionEventsChangeAuditService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(NonCollectionEvents)
    private readonly nonCollectionEventsRepository: Repository<NonCollectionEvents>,
    @InjectRepository(ChangeAudits)
    private readonly changeAuditsRepository: Repository<ChangeAudits>
  ) {}

  async getChangeAudit(id, params: GetNonCollectionEventsChangeAuditInterface) {
    try {
      const { page, sortBy, sortOrder, limit } = params;
      const nonCollectionEventData =
        await this.nonCollectionEventsRepository.find({
          relations: [],
          where: {
            id: id,
            tenant: { id: this.request?.user?.tenant?.id } as any,
          },
        });

      if (!nonCollectionEventData) {
        resError(
          `Non collection event not found`,
          ErrorConstants.Error,
          HttpStatus.GONE
        );
      }
      const [data, count] = await this.changeAuditsRepository.findAndCount({
        where: {
          tenant_id: this.request?.user?.tenant?.id,
          changes_field: Not(IsNull()),
          auditable_id: id,
          auditable_type: OperationTypeEnum.NON_COLLECTION_EVENTS as any,
          is_archived: false,
        },
        select: [
          'changes_from',
          'changes_field',
          'changes_to',
          'created_by',
          'changed_when',
          'created_at',
          'tenant_id',
        ],
        take: limit,
        skip: (page - 1) * limit,
        order:
          sortBy && sortOrder
            ? { [sortBy]: sortOrder.toUpperCase(), created_at: 'DESC' }
            : { created_at: 'DESC' },
      });

      return {
        status: HttpStatus.OK,
        message: 'Change Audit Fetched Successfully',
        count: count,
        data: data,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Non Collection events change audit >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
