import { DonorGroupCodes } from '../../entities/donor-group-codes.entity';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, Sort } from 'typeorm';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { UserRequest } from 'src/common/interface/request';
import { HistoryService } from 'src/api/common/services/history.service';
import { CreateDonorGroupCodeDto } from '../dto/create-donor-group.dto';
import { DonorGroupCodesHistory } from '../../entities/donor-group-codes-history.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CommonFunction } from '../../../common/common-functions';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class DonorGroupCodesService extends HistoryService<DonorGroupCodesHistory> {
  private message = 'Donor Group Codes';

  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(DonorGroupCodes)
    private entityRepository: Repository<DonorGroupCodes>,
    @InjectRepository(DonorGroupCodesHistory)
    private readonly entityHistoryRepository: Repository<DonorGroupCodesHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly commonFunction: CommonFunction
  ) {
    super(entityHistoryRepository);
  }

  async create(createdDto: CreateDonorGroupCodeDto, req: UserRequest) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const create = new DonorGroupCodes();
      const keys = Object.keys(createdDto);
      //set values in create obj
      for (const key of keys) {
        create[key] = createdDto?.[key];
      }

      create.created_by = req.user.id;
      create.tenant_id = req.user.tenant.id;

      // Save entity
      const saveObj = await queryRunner.manager.save(create);
      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.CREATED,
        message: `Donor Group Code Created Successfully`,
        data: saveObj,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllDonorGroupCodes(id: any, sortName: string, sortOrder = 'ASC') {
    try {
      const groupCodes = await this.entityManager
        .createQueryBuilder(DonorGroupCodes, 'dgc')
        .innerJoinAndSelect('dgc.donor_id', 'donor')
        .innerJoinAndSelect('dgc.group_code_id', 'account')
        .innerJoinAndSelect('dgc.created_by', 'created_by')
        .where('dgc.is_archived = :is_archived', { is_archived: false })
        .andWhere('dgc.donor_id = :donor_id', { donor_id: id })
        .select([
          'dgc.id as id',
          'dgc.donor_id as donor_id',
          'dgc.group_code_id as group_code_id',
          'account.becs_code as code',
          'account.name as name',
          'dgc.start_date as start_date',
          "CONCAT(created_by.first_name,' ', created_by.last_name) as applied_by",
          'dgc.is_archived as is_archived',
          'dgc.created_at as created_at',
          'dgc.created_by as created_by',
          'dgc.tenant_id as tenant_id',
        ]);

      if (sortName && sortOrder) {
        groupCodes.orderBy(`account.${sortName}`, sortOrder as 'ASC' | 'DESC');
      }

      const groupCodesArray = await groupCodes.getRawMany();
      return {
        status: HttpStatus.OK,
        response: 'Donor Group Codes Fetched ',
        data: groupCodesArray,
      };
    } catch (e) {
      console.log(e);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async archive(id: any, updatedBy: any) {
    try {
      const user = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: updatedBy } },
        'User'
      );
      const query = {
        relations: ['created_by', 'tenant'],
        where: {
          id,
          is_archived: false,
        },
      };
      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        query,
        this.message
      );
      // const saveHistory = new DonorGroupCodesHistory();
      // Object.assign(saveHistory, entity);
      // saveHistory.id = entity.id;
      // saveHistory.created_by = user.id;
      // saveHistory.tenant_id = entity.tenant.id;
      // saveHistory.history_reason = 'D';
      // delete saveHistory?.created_at;
      // await this.createHistory(saveHistory);
      entity['is_archived'] = !entity.is_archived;
      entity.created_at = new Date();
      entity.created_by = this.request?.user;
      await this.entityRepository.save(entity);
      return {
        status: HttpStatus.NO_CONTENT,
        message: `${this.message} Archive Successfully`,
        data: null,
      };
    } catch (error) {
      return resError(error, ErrorConstants.Error, error.status);
    }
  }

  async findAll(req: UserRequest) {
    try {
      const groupCodes = await this.entityManager
        .createQueryBuilder(DonorGroupCodes, 'dgc')
        .innerJoinAndSelect('dgc.donor_id', 'donor')
        .innerJoinAndSelect('dgc.group_code_id', 'account')
        .innerJoinAndSelect('dgc.created_by', 'user')
        .where('dgc.is_archived = :is_archived', { is_archived: false })
        .andWhere('account.tenant_id = :tenant_id', {
          tenant_id: req.user.tenant.id,
        })
        .select([
          'dgc.id as id',
          'dgc.donor_id as donor_id',
          'dgc.group_code_id as group_code_id',
          'account.becs_code as code',
          'account.name as name',
          'dgc.start_date as start_date',
          "CONCAT(user.first_name,' ', user.last_name) as applied_by",
          'dgc.is_archived as is_archived',
          'dgc.created_at as created_at',
          'dgc.created_by as created_by',
          'dcc.tenant_id as tenant_id',
        ])
        .getRawMany();

      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully`,
        data: groupCodes,
      };
    } catch (error) {
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
