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
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { CallFlowsEntity } from '../entity/call-flows.entity';
import { callFlowDto } from '../dto/call-flow.dto';
import { CallFlowsQueryDto } from '../query/call-flows-query.dto';
import { CallFlowPatchDto } from '../dto/call-flow-patch.dto';
import { CallFlowsEntityHistory } from '../entity/call-flows.entity-history';
import { CallJobsCallFlows } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-call-flows.entity';
@Injectable()
export class CallFlowsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CallFlowsEntity)
    private readonly callFlowsRepository: Repository<CallFlowsEntity>,
    @InjectRepository(CallJobsCallFlows)
    private readonly callJobsCallFlowsRepository: Repository<CallJobsCallFlows>,
    @InjectRepository(CallFlowsEntityHistory)
    private readonly callFlowsEntityHistoryRepository: Repository<CallFlowsEntityHistory>,
    @InjectRepository(User)
    private readonly entityManager: EntityManager
  ) {}
  async create(callFlowDto: callFlowDto) {
    try {
      if (!callFlowDto.is_active && callFlowDto.is_default) {
        resError(
          `Inactive Call Flow cannot be default`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (callFlowDto.is_default) {
        await this.findExistingDefaultCallFlow();
      }
      const callFlowsEntity = new CallFlowsEntity();

      Object.assign(callFlowsEntity, callFlowDto);
      callFlowsEntity.created_by = this.request?.user;
      callFlowsEntity.tenant_id = this.request?.user?.tenant?.id;
      const savedCallFlow = await this.callFlowsRepository.save(
        callFlowsEntity
      );
      return resSuccess(
        'Call Flow Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedCallFlow
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(callFlowDto: callFlowDto, id) {
    try {
      const callFlow: any = await this.callFlowsRepository.findOne({
        where: {
          id: id,
          is_archived: false,
        },
        relations: {
          created_by: true,
          tenant: true,
        },
      });
      if (!callFlow) {
        resError(
          `Call Flow not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (!callFlowDto.is_active && callFlowDto.is_default) {
        resError(
          `Inactive Call Flow cannot be default`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (callFlowDto.is_default) {
        await this.findExistingDefaultCallFlow();
      }

      Object.assign(callFlow, callFlowDto);
      callFlow.created_by = this.request?.user;
      callFlow.tenant_id = this.request?.user?.tenant?.id;
      callFlow.created_at = new Date();
      await this.callFlowsRepository.save(callFlow);
      return resSuccess(
        'Successfully Updated the Call Flow Details.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }

  async getAllCallFlows(CallFlowsQueryDto: CallFlowsQueryDto) {
    try {
      const { sortBy, sortOrder } = CallFlowsQueryDto;
      const limit = Number(CallFlowsQueryDto?.limit);
      const page = Number(CallFlowsQueryDto?.page);

      if (page <= 0) {
        resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const where: any = {
        is_archived: false,
        tenant_id: this.request.user?.tenant?.id,
      };

      if (CallFlowsQueryDto.status) {
        where.is_active = CallFlowsQueryDto.status;
      }

      if (CallFlowsQueryDto?.name) {
        where.name = ILike(`%${CallFlowsQueryDto.name}%`);
      }
      let order = {};
      switch (sortBy) {
        case 'name':
          order = { name: sortOrder };
          break;
        case 'date':
          order = { date: sortOrder };
          break;
        case 'status':
          order = { status: sortOrder };
          break;
        default:
          order = { id: 'DESC' };
          break;
      }
      const queryBuilder =
        this.callFlowsRepository.createQueryBuilder('call_flows');
      queryBuilder
        .select([
          'call_flows.id AS id',
          'call_flows.name AS name',
          'call_flows.is_active AS status',
          'call_flows.is_default AS default',
          'COALESCE(history.created_at, call_flows.created_at) AS date',
          'call_flows.tenant_id AS tenant_id',
        ])
        .leftJoin('tenant', 'tenant', 'tenant.id = call_flows.tenant_id')
        .leftJoin(
          'call_flows_history',
          'history',
          'history.id = call_flows.id AND history.created_at = (SELECT MAX(created_at) FROM call_flows_history WHERE id = call_flows.id)'
        )
        .where(where)
        .orderBy(order)
        .offset((page - 1) * limit)
        .limit(limit);
      const data = await queryBuilder.getRawMany();
      const count = await queryBuilder.getCount();

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Call Flows Successfully Fetched.',
        code: HttpStatus.OK,
        call_flows_count: count,
        data: data,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCallFlow(id: any) {
    try {
      if (!Number(id)) {
        resError(`Invalid Id`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const callFlow = await this.callFlowsRepository.findOne({
        where: {
          id: id as any,
          is_archived: false,
          tenant_id: this.request?.user?.tenant?.id,
        },
        relations: {
          tenant: true,
          created_by: true,
        },
      });

      if (!callFlow) {
        resError(
          `Call Flow not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        data: callFlow,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCallJobCallFlowByCallJobId(id: any) {
    try {
      if (!Number(id)) {
        resError(`Invalid Id`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const callJobCallFlow = await this.callJobsCallFlowsRepository.findOne({
        where: {
          call_job_id: { id },
          is_archived: false,
        },
        relations: {
          created_by: true,
        },
      });
      if (!callJobCallFlow) {
        resError(
          `Call Job Call Flow not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return await this.getCallFlow(callJobCallFlow.call_flow_id);
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archiveOrSetAsDefault(
    id: any,
    callFlowPatchDto: CallFlowPatchDto
  ): Promise<any> {
    try {
      const callFlow: any = await this.callFlowsRepository.findOne({
        where: {
          id: id as any,
          is_archived: false,
          tenant_id: this.request?.user?.tenant?.id,
        },
        relations: {
          created_by: true,
        },
      });

      if (!callFlow) {
        resError(
          `Call Flow not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (!callFlow.is_active && callFlowPatchDto.is_default) {
        resError(
          `Inactive Call Flow cannot be default.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (callFlowPatchDto.is_archived) {
        const callJobsCheck = await this.entityManager.query(
          `SELECT 1 FROM call_jobs_call_flows cjcf 
          JOIN call_jobs cj ON cj.id = cjcf.call_job_id 
          WHERE cj.is_active = 'true' AND cjcf.call_flow_id = $1`,
          [id]
        );

        if (callJobsCheck.length > 0) {
          resError(
            `Call Flow in use. It cannot be archived.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        callFlow.is_archived = callFlowPatchDto.is_archived;
        callFlow.is_active = false;
        callFlow.created_at = new Date();
        callFlow.created_by = this.request?.user;
      } else if (callFlowPatchDto.is_default) {
        await this.findExistingDefaultCallFlow();
        callFlow.is_default = callFlowPatchDto.is_default;
        callFlow.created_at = new Date();
        callFlow.created_by = this.request?.user;
      }

      await this.callFlowsRepository.save(callFlow);

      return resSuccess(
        callFlowPatchDto.is_archived
          ? 'Call Flow Archived Successfully.'
          : 'Call Flow Successfully Set as Default.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findExistingDefaultCallFlow() {
    const callFlow = await this.callFlowsRepository.findOne({
      where: {
        is_default: true,
        tenant_id: this.request?.user?.tenant?.id,
      },
    });
    if (callFlow) {
      callFlow.is_default = false;
      await this.callFlowsRepository.save(callFlow);
    }
  }
}
