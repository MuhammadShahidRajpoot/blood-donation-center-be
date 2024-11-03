import { EntityManager, ILike, Repository } from 'typeorm';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import {
  CreateClassificationDto,
  GetAllClassificationDto,
  SearchClassificationDto,
  UpdateClassificationDto,
} from '../dto/create-classification.dto';
import { StaffingClassification } from '../entity/classification.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { StaffingClassificationHistory } from '../entity/classification-history.entity';
import { User } from '../../../../tenants-administration/user-administration/user/entity/user.entity';
import { getModifiedDataDetails } from '../../../../../../common/utils/modified_by_detail';
import { HistoryService } from '../../../../../common/services/history.service';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

dotenv.config();
@Injectable({ scope: Scope.REQUEST })
export class ClassificationService extends HistoryService<StaffingClassificationHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(StaffingClassification)
    private readonly classificationRepository: Repository<StaffingClassification>,
    @InjectRepository(StaffingClassificationHistory)
    private readonly staffingClassificationHistory: Repository<StaffingClassificationHistory>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {
    super(staffingClassificationHistory);
  }

  async create(createClassificationDto: CreateClassificationDto) {
    try {
      const ClassificationWithSameName =
        await this.classificationRepository.findOne({
          where: {
            name: ILike(`%${createClassificationDto.name.trim()}%`),
            is_archived: false,
            tenant: this.request.user?.tenant,
          },
        });

      if (ClassificationWithSameName) {
        return resError(
          `Classification already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: createClassificationDto?.created_by,
      });

      const newClassification = new StaffingClassification();
      newClassification.name = createClassificationDto?.name;
      newClassification.description = createClassificationDto?.description;
      newClassification.short_description =
        createClassificationDto?.short_description;
      newClassification.created_by = user;
      newClassification.status = createClassificationDto.status;
      newClassification.tenant_id = this.request.user?.tenant?.id;
      const savedClassification = await this.classificationRepository.save(
        newClassification
      );

      return resSuccess(
        'Classification Created',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedClassification
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async geAllClassifications(
    getAllClassificationsInterface: GetAllClassificationDto
  ) {
    try {
      const { sortBy, sortOrder } = getAllClassificationsInterface;
      const limit = Number(getAllClassificationsInterface?.limit);
      const page = Number(getAllClassificationsInterface?.page);
      const getTotalPage = (totalData: number, limit: number) => {
        return Math.ceil(totalData / limit);
      };

      if (page <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const where = {};
      Object.assign(where, {
        status: getAllClassificationsInterface.status,
        is_archived: false,
      });

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      let orderBy;
      switch (sortBy) {
        case 'name':
          orderBy = { name: sortOrder };
          break;
        case 'description':
          orderBy = { description: sortOrder };
          break;
        case 'short_description':
          orderBy = { short_description: sortOrder };
          break;
        case 'status':
          orderBy = { status: sortOrder };
          break;
        default:
          orderBy = { id: 'DESC' };
          break;
      }

      const [records, count] = await this.classificationRepository.findAndCount(
        {
          where,
          relations: ['tenant', 'staffing_classification_setting'],
          skip: (page - 1) * limit || 0,
          take: limit || 10,
          order: orderBy,
        }
      );

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        total_classifications_count: count,
        data: records,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async searchClassifications(searchInterface: SearchClassificationDto) {
    try {
      const limit: number = searchInterface?.limit
        ? +searchInterface?.limit
        : process.env.PAGE_SIZE
        ? +process.env.PAGE_SIZE
        : 10;
      const where: any = {};
      const search = searchInterface?.keyword;
      const page = searchInterface?.page ? +searchInterface?.page : 1;

      if (search != undefined) {
        where.name = ILike(`%${search}%`);
        Object.assign(where, {
          status: searchInterface.status,
          is_archived: false,
        });
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      const [records, count] = await this.classificationRepository.findAndCount(
        {
          where,
          skip: (page - 1) * limit || 0,
          take: limit,
        }
      );

      return { total_records: count, page_number: page, data: records };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getClassification(id: any) {
    try {
      if (!Number(id)) {
        return resError(
          `Invalid Id`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const classification: any = await this.classificationRepository.findOne({
        where: { id: id as any },
        relations: ['created_by', 'tenant'],
      });

      if (!classification) {
        return resError(
          `Classification not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (classification) {
        const modifiedData: any = await getModifiedDataDetails(
          this.staffingClassificationHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        classification.modified_by = classification.created_by;
        classification.modified_at = classification.created_at;
        classification.created_at = modified_at
          ? modified_at
          : classification.created_at;
        classification.created_by = modified_by
          ? modified_by
          : classification.created_by;
      }

      const data = {
        ...classification,
      };

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        data: data,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getClassificationWithoutSettings() {
    try {
      const records = await this.classificationRepository.query(`
      SELECT DISTINCT s.* , LOWER(s.name) AS lower_name
      FROM staffing_classification s
      LEFT JOIN staffing_classification_setting sc ON s.id = sc.classification_id
      WHERE (sc.classification_id IS NULL
        OR (
          sc.classification_id is not null and
          (SELECT count(*)
          FROM staffing_classification_setting sc2
          WHERE sc2.classification_id = s.id
            AND sc2.is_archived = true AND sc2.tenant_id = '${this.request.user?.tenant?.id}') = (SELECT count(*)
          FROM staffing_classification_setting sc2
          WHERE sc2.classification_id = s.id AND sc2.tenant_id = '${this.request.user?.tenant?.id}')
        ))
        AND s.is_archived is false
        AND s.status is true
        AND s.tenant_id = '${this.request.user?.tenant?.id}'
        ORDER BY lower_name ASC;
      `);

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        data: records,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateClassificationDto: UpdateClassificationDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const classification = await this.classificationRepository.findOne({
        where: {
          id: id,
        },
        relations: ['tenant'],
      });

      if (!classification) {
        return resError(
          `Classification not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: updateClassificationDto.created_by,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const userId = user.id;

      const classificationUpdateObject = {
        name: updateClassificationDto?.name,
        short_description: updateClassificationDto?.short_description,
        description: updateClassificationDto?.description,
        status: updateClassificationDto?.status,
        tenant: classification?.tenant,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      const updateClassification = await queryRunner.manager.update(
        StaffingClassification,
        { id: classification.id },
        { ...classificationUpdateObject }
      );

      if (!updateClassification.affected) {
        return resError(
          `Classification update failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await queryRunner.commitTransaction();

      const savedClassification = await this.classificationRepository.findOne({
        where: {
          id: id as any,
        },
      });
      return {
        status: SuccessConstants.SUCCESS,
        response: 'Changes Saved',
        status_code: HttpStatus.NO_CONTENT,
        savedClassification,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async updateClassificationHistory(
    userId: any,
    queryRunner,
    data: any,
    action: string
  ) {
    const classificationC = new StaffingClassificationHistory();
    classificationC.history_reason = action;
    classificationC.id = data?.id;
    classificationC.name = data?.name;
    classificationC.description = data?.description;
    classificationC.short_description = data?.short_description;
    classificationC.status = data?.status;
    classificationC.is_archived = data?.is_archived;
    classificationC.tenant_id = data?.tenant_id;
    classificationC.created_by = userId;
    classificationC.tenant_id = data?.tenant_id;
    await this.createHistory(classificationC);
  }

  async remove(id: any, user: any): Promise<any> {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const classification: any = await this.classificationRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: ['tenant'],
      });

      if (!classification) {
        return resError(
          `Classification not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      classification.is_archived = true;
      classification.created_at = new Date();
      classification.created_by = this.request?.user;

      // Archive the Classification entity
      const archiveClassification = await queryRunner.manager.save(
        classification
      );

      Object.assign(archiveClassification, {
        tenant_id: archiveClassification?.tenant?.id,
      });
      await queryRunner.commitTransaction();

      return resSuccess(
        'Classification Archived',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT,
        null
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
