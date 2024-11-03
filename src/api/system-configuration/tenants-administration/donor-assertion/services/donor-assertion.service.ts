import { AssertionDto } from '../dto/donor-assertion.dto';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRequest } from 'src/common/interface/request';
import { Brackets, ILike, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { UpdateAssertionDto } from '../dto/update-donor-assertion.dto';
import { Assertion } from '../entity/assertion.entity';
import { GetAllAssertionsDto } from '../dto/assertion.dto';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { AssertionHistory } from '../entity/assertion-history.entity';
import { User } from '../../user-administration/user/entity/user.entity';

@Injectable()
export class AssertionService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Assertion)
    private readonly assertionRepository: Repository<Assertion>,
    @InjectRepository(AssertionHistory)
    private readonly assertionHistoryRepository: Repository<AssertionHistory>
  ) {}

  async create(assertionDto: AssertionDto) {
    try {
      const existingAssertion = await this.assertionRepository.findOne({
        where: {
          code: assertionDto.code,
          tenant_id: this?.request?.user?.tenant?.id,
        },
      });

      const existingName = await this.assertionRepository.findOne({
        where: {
          name: assertionDto.name,
          tenant_id: this?.request?.user?.tenant?.id,
        },
      });

      if (existingName) {
        return resError(
          'Assertion Name already exists for this tenant.',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (existingAssertion) {
        return resError(
          'Assertion Code already exists for this tenant.',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }
      const assertion = new Assertion();
      assertion.tenant_id = this?.request?.user?.tenant?.id;
      assertion.bbcs_uuid = null;
      assertion.name = assertionDto.name;
      assertion.created_by = this.request?.user?.id;
      assertion.code = assertionDto.code;
      assertion.description = assertionDto.description;
      assertion.is_expired = assertionDto.is_expired;
      assertion.expiration_months = assertionDto.expiration_months;
      assertion.is_active = assertionDto.is_active;
      assertion.is_archived = assertionDto.is_archived;
      assertion.created_at = new Date();
      new Date();
      const savedAssertion = await this.assertionRepository.save(assertion);
      return resSuccess(
        'Donor Assertion Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedAssertion
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async updateAssertions(id: bigint, updateAssertionDto: UpdateAssertionDto) {
    try {
      const assertion = await this.assertionRepository.findOne({
        where: { id },
      });
      if (!assertion) {
        return resError(
          'Assertion not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const existingAssertion = await this.assertionRepository.findOne({
        where: {
          code: updateAssertionDto.code,
          tenant_id: this?.request?.user?.tenant?.id,
        },
      });
      if (
        existingAssertion &&
        updateAssertionDto.code &&
        assertion.code != updateAssertionDto.code
      ) {
        return resError(
          'Assertion Code already exists for this tenant.',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }
      assertion.name = updateAssertionDto.name;
      assertion.created_by = this.request?.user?.id;
      assertion.tenant_id = this?.request?.user?.tenant?.id;
      assertion.code = updateAssertionDto.code;
      assertion.description = updateAssertionDto.description;
      assertion.is_expired = updateAssertionDto.is_expired;
      assertion.expiration_months = updateAssertionDto.expiration_months;
      assertion.is_active = updateAssertionDto.is_active;
      assertion.is_archived = updateAssertionDto.is_archived;
      const savedAssertion = await this.assertionRepository.save(assertion);
      return resSuccess(
        'Assertion updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedAssertion
      );
    } catch (error) {
      console.log(error);
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
      const assertion: any = await this.assertionRepository.findOne({
        where: {
          id: id as any,
        },
        relations: ['created_by', 'tenant'],
      });
      if (!assertion) {
        return resError(
          'Assertion not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (assertion) {
        const modifiedData: any = await getModifiedDataDetails(
          this.assertionHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        assertion.modified_by = assertion.created_by;
        assertion.modified_at = assertion.created_at;
        assertion.created_at = modified_at ? modified_at : assertion.created_at;
        assertion.created_by = modified_by ? modified_by : assertion.created_by;
      }
      const result = {
        ...assertion,
      };

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Assertion Successfully Fetched',
        code: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAssertionCode(code: any) {
    try {
      const assertion = await this.assertionRepository.findOne({
        where: { code },
      });
      if (assertion) {
        return resError(
          'Code alreay exit',
          SuccessConstants.SUCCESS,
          HttpStatus.OK
        );
      }
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(params: GetAllAssertionsDto) {
    try {
      //await this.createDefaultCallOutcomes();

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
          order = { 'assertion.name': sortOrder };
          break;
        case 'code':
          order = { 'assertion.code': sortOrder };
          break;
        case 'is_active':
          order = { 'assertion.is_active': sortOrder };
          break;
        case 'description':
          order = { 'assertion.description': sortOrder };
          break;
        case 'is_expired':
          order = { 'assertion.is_expired': sortOrder };
          break;
        case 'expiration_months':
          order = { 'assertion.expiration_months': sortOrder };
          break;
        default:
          order = { id: 'ASC' };
          break;
      }
      const queryBuilder =
        this.assertionRepository.createQueryBuilder('assertion');
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
          'assertion.id AS id',
          'assertion.name AS name',
          'assertion.code AS code',
          'assertion.is_active AS is_active',
          'assertion.description AS description',
          'assertion.is_archived AS is_archived',
          'assertion.is_expired AS expired',
          'assertion.created_at AS created_at',
          'assertion.expiration_months AS months',
          'assertion.bbcs_uuid AS bbcs_uuid',
          'assertion.tenant_id AS tenant_id',
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
