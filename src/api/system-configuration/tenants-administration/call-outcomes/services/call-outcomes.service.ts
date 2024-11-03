import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, Brackets, Not } from 'typeorm';
import { CallOutcomes } from '../entities/call-outcomes.entity';
import {
  CreateCallOutcomeDto,
  GetAllCallOutcomesDto,
} from '../dto/call-outcomes.dto';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { CallOutcomesHistory } from '../entities/call-outcomes-history.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
//import { GetAllCallOutcomesInterface } from '../interface/call-outcomes.interface';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { HistoryService } from '../../../../common/services/history.service';
import { CallCenterSettings } from '../../call-center-settings/entities/call-center-settings.entity';
import { mockDataForDefault } from '../mock/mock-data';

@Injectable()
export class CallOutcomesService extends HistoryService<CallOutcomesHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CallOutcomes)
    private readonly callOutcomesRepository: Repository<CallOutcomes>,
    @InjectRepository(CallCenterSettings)
    private readonly callCenterSettingsRepository: Repository<CallCenterSettings>,
    @InjectRepository(CallOutcomesHistory)
    private readonly callOutcomesHistoryRepository: Repository<CallOutcomesHistory>,
    private readonly entityManager: EntityManager
  ) {
    super(callOutcomesHistoryRepository);
  }

  async create(callOutcomesDto: CreateCallOutcomeDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepository.findOneBy({
        id: callOutcomesDto?.created_by,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const existingSameNameCallOutcome =
        await this.callOutcomesRepository.findOne({
          where: {
            name: ILike(callOutcomesDto?.name),
            is_archived: false,
            tenant_id: user.tenant_id,
          },
        });

      if (existingSameNameCallOutcome) {
        return resError(
          'Call Outcome Name Must Be Unique. Please try again.',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      const existingSameCodeCallOutcome =
        await this.callOutcomesRepository.findOne({
          where: {
            code: ILike(callOutcomesDto?.code),
            is_archived: false,
            tenant_id: user.tenant_id,
          },
        });

      if (existingSameCodeCallOutcome) {
        return resError(
          'Call Outcome Code Must Be Unique. Please try again.',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      const callOutcomes = new CallOutcomes();
      callOutcomes.name = callOutcomesDto?.name;
      callOutcomes.code = callOutcomesDto?.code;
      callOutcomes.color = callOutcomesDto?.color;
      callOutcomes.next_call_interval = callOutcomesDto?.next_call_interval;
      callOutcomes.is_active = callOutcomesDto?.is_active;
      callOutcomes.is_archived = callOutcomesDto?.is_archived;
      callOutcomes.created_by = user;
      callOutcomes.tenant_id = this.request?.user?.tenant?.id;

      const savedCallOutcomes: CallOutcomes = await queryRunner.manager.save(
        callOutcomes
      );

      await queryRunner.commitTransaction();

      return resSuccess(
        'Call Outcome Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedCallOutcomes
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      if (!Number(id)) {
        return resError(
          `Invalid Id`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const callOutcome: any = await this.callOutcomesRepository.findOne({
        where: {
          id: id as any,
        },
        relations: ['created_by', 'tenant'],
      });

      if (!callOutcome) {
        return resError(
          `Call Outcome not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (callOutcome) {
        const modifiedData: any = await getModifiedDataDetails(
          this.callOutcomesHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        callOutcome.modified_by = callOutcome.created_by;
        callOutcome.modified_at = callOutcome.created_at;
        callOutcome.created_at = modified_at
          ? modified_at
          : callOutcome.created_at;
        callOutcome.created_by = modified_by
          ? modified_by
          : callOutcome.created_by;
      }
      const result = {
        ...callOutcome,
      };

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(callOutcomesDto: CreateCallOutcomeDto, id) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const callOutcomes: any = await this.callOutcomesRepository.findOne({
        where: {
          id: id,
          is_archived: false,
        },
        relations: {
          created_by: true,
          //tenant: true,
        },
      });

      if (!callOutcomes) {
        return resError(
          `Call Outcome not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      // Check if the updated code already exists for another call outcome
      const existingOutcomeWithCode = await this.callOutcomesRepository.findOne(
        {
          where: {
            code: callOutcomesDto.code,
            is_archived: false,
            tenant_id: callOutcomes.tenant_id,
            id: Not(id), // Exclude the current call outcome from the check
          },
        }
      );

      if (existingOutcomeWithCode) {
        return resError(
          `Call Outcome with code ${callOutcomesDto.code} already exists.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if the updated name already exists for another call outcome
      const existingOutcomeWithName = await this.callOutcomesRepository.findOne(
        {
          where: {
            name: callOutcomesDto.name,
            is_archived: false,
            tenant_id: callOutcomes.tenant_id,
            id: Not(id), // Exclude the current call outcome from the check
          },
        }
      );

      if (existingOutcomeWithName) {
        return resError(
          `Call Outcome with name ${callOutcomesDto.name} already exists.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      if (callOutcomesDto?.is_active === false) {
        const callJob = await this.callCenterSettingsRepository
          .createQueryBuilder('call_center_settings')
          .where('call_center_settings.busy_call_outcome = :id', { id: id })
          .orWhere('call_center_settings.no_answer_call_outcome = :id', {
            id: id,
          })
          .getOne();
        if (callJob) {
          return resError(
            'Call Outcome is associated with  Call Center Settings. Please remove the association before inactive the it.',
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }
      }

      Object.assign(callOutcomes, callOutcomesDto);
      callOutcomes.created_by = this.request?.user;
      //callOutcomes.tenant = this.request?.user?.tenant?.id;
      callOutcomes.created_at = new Date();
      await this.callOutcomesRepository.save(callOutcomes);
      return resSuccess(
        'Successfully Updated Call Outcome.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }

  async archive(id: any, callOutcomeDto: CreateCallOutcomeDto): Promise<any> {
    try {
      const callOutcome: any = await this.callOutcomesRepository.findOne({
        where: {
          id: id as any,
          is_active: true,
          is_archived: false,
          tenant_id: this.request?.user?.tenant?.id,
        },
        relations: {
          created_by: true,
          tenant: true,
        },
      });
      if (!callOutcome) {
        return resError(
          `Call Outcome not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const callJob = await this.callCenterSettingsRepository
        .createQueryBuilder('call_center_settings')
        .where('call_center_settings.busy_call_outcome = :id', { id: id })
        .orWhere('call_center_settings.no_answer_call_outcome = :id', {
          id: id,
        })
        .getOne();
      if (callJob) {
        return resError(
          'Call Outcome is associated with  Call Center Settings. Please remove the association before archiving it.',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (callOutcomeDto.is_archived) {
        callOutcome.is_archived = callOutcomeDto.is_archived;
        callOutcome.is_active = false;
        callOutcome.created_at = new Date();
        callOutcome.created_by = this.request?.user;
      }

      await this.callOutcomesRepository.save(callOutcome);

      return resSuccess(
        'Call Outcome Archived Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async createDefaultCallOutcomes() {
    try {
      const count = await this.callOutcomesRepository.count({
        where: { is_default: true },
      });

      if (count === 0) {
        const promises = mockDataForDefault.map((callOutcomesDefault) => {
          const callOutcomes = new CallOutcomes();
          Object.assign(callOutcomes, callOutcomesDefault);
          callOutcomes.created_by = this.request?.user.id;
          callOutcomes.tenant_id = this.request?.user?.tenant?.id;
          return this.callOutcomesRepository.save(callOutcomes);
        });
        await Promise.all(promises);
      }
    } catch (error) {
      return resError(
        `Error creating Default callOutComes`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll(params: GetAllCallOutcomesDto) {
    try {
      await this.createDefaultCallOutcomes();

      const { sortBy, sortOrder } = params;
      const limit = Number(params?.limit);
      const page = Number(params?.page);

      if (page <= 0) {
        return resError(
          `Page must be a positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const where = {
        is_archived: false,
        tenant_id: { id: this.request.user?.tenant?.id },
      };

      if (params.is_active) {
        Object.assign(where, {
          is_active: params.is_active,
        });
      }

      const keywordConditions = [];
      if (params?.keyword) {
        keywordConditions.push(
          { name: ILike(`%${params?.keyword}%`) },
          { code: ILike(`%${params?.keyword}%`) }
        );
      }

      let order = {};
      switch (sortBy) {
        case 'name':
          order = { 'call_outcomes.name': sortOrder };
          break;
        case 'code':
          order = { 'call_outcomes.code': sortOrder };
          break;
        case 'is_active':
          order = { 'call_outcomes.is_active': sortOrder };
          break;
        case 'color':
          order = { 'call_outcomes.color': sortOrder };
          break;
        case 'next_call_interval':
          order = { 'call_outcomes.next_call_interval': sortOrder };
          break;
        default:
          order = { id: 'ASC' };
          break;
      }
      const queryBuilder =
        this.callOutcomesRepository.createQueryBuilder('call_outcomes');
      queryBuilder
        .where(where)
        .andWhere(
          new Brackets((qb) => {
            qb.orWhere(
              new Brackets((qb) => {
                keywordConditions.forEach((condition) => {
                  qb.orWhere(condition);
                });
              })
            );
          })
        )
        .select([
          'call_outcomes.id AS id',
          'call_outcomes.name AS name',
          'call_outcomes.code AS code',
          'call_outcomes.is_active AS is_active',
          'call_outcomes.is_archived AS is_archived',
          'call_outcomes.is_default AS is_default',
          'call_outcomes.created_at AS created_at',
          'call_outcomes.color AS color',
          'call_outcomes.next_call_interval AS next_call_interval',
          'call_outcomes.tenant_id AS tenant_id',
        ])
        .orderBy(order)
        .offset((page - 1) * limit || 0)
        .limit(limit || 50);

      const records = await queryBuilder.getRawMany();
      const count = await queryBuilder.getCount();

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        total_count: count,
        data: records,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
