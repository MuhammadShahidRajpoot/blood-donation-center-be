import { EntityManager, ILike, Repository } from 'typeorm';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import {
  CreateClassificationSettingDto,
  GetAllClassificationSettingDto,
  SearchClassificationSettingDto,
  UpdateClassificationSettingsDto,
} from '../dto/setting.dto';
import { StaffingClassificationSetting } from '../entity/setting.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { User } from '../../../user-administration/user/entity/user.entity';
import { StaffingClassification } from '../../classifications/entity/classification.entity';
import { StaffingClassificationSettingHistory } from '../entity/setting-history.entity';
import { SearchInterface } from '../interface/setting.interface';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { HistoryService } from '../../../../../common/services/history.service';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

dotenv.config();
@Injectable({ scope: Scope.REQUEST })
export class ClassificationSettingService extends HistoryService<StaffingClassificationSettingHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(StaffingClassificationSetting)
    private readonly settingRepository: Repository<StaffingClassificationSetting>,
    @InjectRepository(StaffingClassificationSettingHistory)
    private readonly staffingClassificationSettingHistory: Repository<StaffingClassificationSettingHistory>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,

    @InjectRepository(StaffingClassification)
    private readonly classificationRepository: Repository<StaffingClassification>
  ) {
    super(staffingClassificationSettingHistory);
  }

  async create(createClassificationSettingDto: CreateClassificationSettingDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createClassificationSettingDto?.created_by,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const classifications = await this.classificationRepository.findOne({
        where: { id: createClassificationSettingDto?.classification_id },
      });

      if (!classifications) {
        return resError(
          `Classification not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const newSetting = new StaffingClassificationSetting();
      newSetting.classification_id =
        createClassificationSettingDto.classification_id;
      newSetting.max_consec_days_per_week =
        createClassificationSettingDto?.max_consec_days_per_week;
      newSetting.min_days_per_week =
        createClassificationSettingDto?.min_days_per_week;
      newSetting.max_days_per_week =
        createClassificationSettingDto?.max_days_per_week;
      newSetting.max_hours_per_week =
        createClassificationSettingDto.max_days_per_week;
      newSetting.max_weekend_hours =
        createClassificationSettingDto.max_weekend_hours;
      newSetting.min_recovery_time =
        createClassificationSettingDto.min_recovery_time;
      newSetting.max_consec_weekends =
        createClassificationSettingDto.max_consec_weekends;
      newSetting.max_ot_per_week =
        createClassificationSettingDto.max_ot_per_week;
      newSetting.max_weekends_per_months =
        createClassificationSettingDto.max_weekends_per_months;
      newSetting.minimum_hours_per_week =
        createClassificationSettingDto.min_hours_per_week;
      newSetting.target_hours_per_week =
        createClassificationSettingDto.target_hours_per_week;
      newSetting.overtime_threshold =
        createClassificationSettingDto.overtime_threshold;
      newSetting.created_by = user;
      newSetting.tenant_id = this.request.user?.tenant?.id;
      const savedSetting = await this.settingRepository.save(newSetting);

      return resSuccess(
        'Classification Setting Created',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedSetting
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async geAllClassificationSettings(
    getAllClassificationSettingsInterface: GetAllClassificationSettingDto
  ) {
    try {
      const { sortOrder, sortBy } = getAllClassificationSettingsInterface;
      const limit = Number(getAllClassificationSettingsInterface?.limit);
      const page = Number(getAllClassificationSettingsInterface?.page);
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
        is_archived: false,
        classification_id: {
          status: true,
        },
      });

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      let order = {};
      if (sortBy) {
        Object.assign(order, {
          classification_id: {
            name: sortOrder,
          },
        });
      } else {
        order = { id: 'DESC' };
      }

      const [records, count] = await this.settingRepository.findAndCount({
        where,
        skip: (page - 1) * limit || 0,
        take: limit || 10,
        relations: ['classification_id'],
        order: order,
      });

      const data = records.map((item) => {
        const { classification_id, ...rest } = item;
        return {
          ...rest,
          classification: classification_id,
        };
      });

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        setting_count: count,
        data: data,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async searchClassificationSettings(searchInterface: SearchInterface) {
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
        where.classification_id = { name: ILike(`%${search}%`) };
        Object.assign(where, {
          is_archived: false,
        });
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      const [records, count] = await this.settingRepository.findAndCount({
        where,
        skip: (page - 1) * limit || 0,
        take: limit,
        relations: ['classification_id'],
      });

      const data = records.map((item) => {
        const { classification_id, ...rest } = item;
        return {
          ...rest,
          classification: classification_id,
        };
      });

      return { total_records: count, page_number: page, data: data };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getClassificationSetting(id: any) {
    try {
      if (!Number(id)) {
        return resError(
          `Invalid Id`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const classification: any = await this.settingRepository.findOne({
        where: {
          id: id as any,
          is_archived: false,
        },
        relations: ['classification_id', 'created_by'],
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
          this.staffingClassificationSettingHistory,
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
        classification: classification.classification_id,
      };
      delete data.classification_id;

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

  async getClassificationSettingByClassification(classificationId: any) {
    try {
      if (!Number(classificationId)) {
        return resError(
          `Invalid Id`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const where: any = {
        classification_id: {
          id: classificationId,
          is_archived: false,
        },
      };

      const classification: any = await this.settingRepository.findOne({
        where,
        relations: ['classification_id', 'created_by'],
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
          this.staffingClassificationSettingHistory,
          classificationId,
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
        classification: classification.classification_id,
      };
      delete data.classification_id;

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

  async update(
    id: any,
    updateClassificationSettingsDto: UpdateClassificationSettingsDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const classification = await this.settingRepository.findOne({
        where: {
          id: id,
        },
        relations: ['created_by', 'classification_id', 'tenant'],
      });

      if (!classification) {
        return resError(
          `Classification not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: updateClassificationSettingsDto.created_by,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const userId = user.id;

      const classificationUpdateObject: any = {
        classification_id: updateClassificationSettingsDto?.classification_id,
        max_consec_days_per_week:
          updateClassificationSettingsDto?.max_consec_days_per_week,
        min_days_per_week: updateClassificationSettingsDto?.min_days_per_week,
        max_days_per_week: updateClassificationSettingsDto?.max_days_per_week,
        max_hours_per_week: updateClassificationSettingsDto.max_hours_per_week,
        minimum_hours_per_week:
          updateClassificationSettingsDto.min_hours_per_week,
        target_hours_per_week:
          updateClassificationSettingsDto.target_hours_per_week,
        max_weekend_hours: updateClassificationSettingsDto.max_weekend_hours,
        min_recovery_time: updateClassificationSettingsDto.min_recovery_time,
        max_consec_weekends:
          updateClassificationSettingsDto.max_consec_weekends,
        max_ot_per_week: updateClassificationSettingsDto.max_ot_per_week,
        max_weekends_per_months:
          updateClassificationSettingsDto.max_weekends_per_months,
        overtime_threshold: updateClassificationSettingsDto?.overtime_threshold,
        tenant: classification?.tenant,
        created_at: new Date(),
        created_by: userId,
      };

      const updateClassification = await queryRunner.manager.update(
        StaffingClassificationSetting,
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

      return resSuccess(
        SuccessConstants.SUCCESS,
        'Resource updated',
        HttpStatus.NO_CONTENT,
        {}
      );
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
    const classificationC = new StaffingClassificationSettingHistory();
    classificationC.history_reason = action;
    classificationC.id = data?.id;
    classificationC.max_consec_days_per_week = data?.max_consec_days_per_week;
    classificationC.min_days_per_week = data?.min_days_per_week;
    classificationC.max_days_per_week = data?.max_days_per_week;
    classificationC.max_hours_per_week = data?.max_hours_per_week;
    classificationC.minimum_hours_per_week = data?.minimum_hours_per_week;
    classificationC.target_hours_per_week = data?.target_hours_per_week;
    classificationC.max_weekend_hours = data?.max_weekend_hours;
    classificationC.min_recovery_time = data?.min_recovery_time;
    classificationC.max_consec_weekends = data?.max_consec_weekends;
    classificationC.max_ot_per_week = data?.max_ot_per_week;
    classificationC.max_weekends_per_months = data?.max_weekends_per_months;
    classificationC.overtime_threshold = data?.overtime_threshold;
    classificationC.created_by = userId;
    classificationC.is_archived = data.is_archived;
    classificationC.classification_id = data?.classification_id?.id;
    classificationC.tenant_id = data?.tenant_id;
    await this.createHistory(classificationC);
  }

  async remove(id: any, user: any): Promise<any> {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const classificationSetting: any = await this.settingRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: ['created_by', 'classification_id', 'tenant'],
      });

      if (!classificationSetting) {
        return resError(
          `Resource not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      classificationSetting.is_archived = true;
      classificationSetting.created_at = new Date();
      classificationSetting.created_by = user;
      // Archive the Classification Setting entity
      const archiveClassificationSetting = await queryRunner.manager.save(
        classificationSetting
      );

      Object.assign(archiveClassificationSetting, {
        tenant_id: archiveClassificationSetting?.tenant?.id,
      });
      await queryRunner.commitTransaction();

      return resSuccess(
        'Classification Setting Archived',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
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
