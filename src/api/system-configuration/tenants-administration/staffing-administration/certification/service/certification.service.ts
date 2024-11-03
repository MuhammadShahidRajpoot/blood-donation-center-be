import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { CreateCertificationDto } from '../dto/create-certification.dto';
import { UpdateCertificationDto } from '../dto/update-certification.dto';
import { Certification } from '../entity/certification.entity';
import { FilterCertification } from '../interfaces/query-certification.interface';
import { resError, resSuccess } from '../../../../helpers/response';
import { SuccessConstants } from '../../../../constants/success.constants';
import { ErrorConstants } from '../../../../constants/error.constants';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from '../../../../../../common/interface/request';
import { pagination } from '../../../../../../common/utils/pagination';
import { HistoryReason } from '../../../../../../common/enums/history_reason.enum';
import { CertificationHistory } from '../entity/certification-history.entity';
import { Sort } from '../../../../../../common/interface/sort';
import { HistoryService } from 'src/api/common/services/history.service';
import { User } from '../../../user-administration/user/entity/user.entity';
import { AssociationType } from '../enums/association_type.enum';
import { customSort } from 'src/api/utils/sorting';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';

@Injectable({ scope: Scope.REQUEST })
export class CertificationService extends HistoryService<CertificationHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    @InjectRepository(CertificationHistory)
    private readonly certificationHistoryRepository: Repository<CertificationHistory>
  ) {
    super(certificationHistoryRepository);
  }

  async create(createCertificationDto: CreateCertificationDto) {
    try {
      const where = {
        tenant: { id: this.request.user?.tenant?.id },
        is_archived: false,
      };
      if (
        await this.certificationRepository.findOneBy([
          {
            name: ILike(createCertificationDto.name),
            ...where,
          },
          {
            short_name: ILike(createCertificationDto.short_name),
            ...where,
          },
        ])
      ) {
        return resError(
          'Certification already exists',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (
        createCertificationDto.expires &&
        !createCertificationDto.expiration_interval
      ) {
        return resError(
          'Expiration Interval is required if Expires is enable',
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const instance = await this.certificationRepository.save(
        this.certificationRepository.create({
          name: createCertificationDto.name,
          short_name: createCertificationDto.short_name,
          description: createCertificationDto.description,
          association_type: createCertificationDto.association_type,
          expires: createCertificationDto.expires,
          expiration_interval: createCertificationDto.expiration_interval,
          is_active: createCertificationDto.is_active,
          tenant: this.request.user?.tenant,
          created_by: this.request.user,
        })
      );

      return resSuccess(
        'Certification Created.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        instance
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async get(
    page: number,
    limit: number,
    keyword?: string,
    sortBy?: Sort,
    filters?: FilterCertification
  ) {
    try {
      const { skip, take } =
        page && limit
          ? pagination(page, limit)
          : { skip: undefined, take: undefined };
      const where = {
        name: ILike(`%${keyword}%`),
        is_active: filters.is_active,
        association_type: filters.associationType,
        tenant: { id: this.request.user?.tenant?.id },
        is_archived: false,
      };

      const query = { relations: ['created_by'], where };
      if (sortBy.sortName && sortBy.sortOrder) {
        query['order'] = {
          [sortBy.sortName]: sortBy.sortOrder,
        };
      } else {
        query['order'] = {
          name: 'ASC',
        };
      }

      const [records, count] = await Promise.all([
        this.certificationRepository.find({ ...query, skip, take }),
        this.certificationRepository.count(query),
      ]);
      records.sort((a, b) => a.name.localeCompare(b.name));

      return resSuccess(
        'Certification Records',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { count, records }
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCertificationsByAssociationType(
    type: string,
    is_active: boolean,
    user: any,
    query?: any
  ) {
    const sort = customSort(query);

    const response = await this.certificationRepository.find({
      where: {
        association_type: AssociationType[type],
        is_archived: false,
        is_active: is_active,
        tenant: { id: user?.tenant?.id },
      },
      order: sort,
    });
    return resSuccess(
      'Certifications fetched.',
      'success',
      HttpStatus.OK,
      response
    );
  }
  async getById(id: any) {
    try {
      const instance: any = await this.certificationRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by'],
      });

      if (!instance) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (instance) {
        const modifiedData: any = await getModifiedDataDetails(
          this.certificationHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        instance.modified_by = instance.created_by;
        instance.modified_at = instance.created_at;
        instance.created_at = modified_at ? modified_at : instance.created_at;
        instance.created_by = modified_by ? modified_by : instance.created_by;
      }

      return resSuccess(
        'Certification Record',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { ...instance }
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: bigint, user: any) {
    try {
      const instance: any = await this.certificationRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: ['tenant'],
      });

      if (!instance) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      // archive certification
      instance.is_archived = true;
      instance.created_at = new Date();
      instance.created_by = user;
      const archivedCertification = await this.certificationRepository.save(
        instance
      );

      Object.assign(archivedCertification, {
        tenant_id: archivedCertification?.tenant?.id,
      });

      return resSuccess(
        'Certification is archived',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async edit(id: bigint, updateAttachmentCategoryDto: UpdateCertificationDto) {
    try {
      const instance: any = await this.certificationRepository.findOne({
        where: { id, is_archived: false },
        relations: ['tenant'],
      });

      if (!instance) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (
        await this.certificationRepository.findOneBy([
          {
            name: ILike(updateAttachmentCategoryDto.name),
            id: Not(id),
            is_archived: false,
          },
          {
            short_name: ILike(updateAttachmentCategoryDto.short_name),
            id: Not(id),
            is_archived: false,
          },
        ])
      ) {
        return resError(
          'Certification already exists',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (
        updateAttachmentCategoryDto.expires &&
        !updateAttachmentCategoryDto.expiration_interval
      ) {
        return resError(
          'Expiration Interval is required if Expires is enable',
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      // update certification
      instance.name = updateAttachmentCategoryDto.name;
      instance.short_name = updateAttachmentCategoryDto.short_name;
      instance.description = updateAttachmentCategoryDto.description;
      instance.association_type = updateAttachmentCategoryDto.association_type;
      instance.expires = updateAttachmentCategoryDto.expires;
      instance.expiration_interval =
        updateAttachmentCategoryDto.expiration_interval;
      instance.is_active = updateAttachmentCategoryDto.is_active;
      instance.created_at = new Date();
      instance.created_by = this.request?.user;
      this.certificationRepository.save(instance);

      return resSuccess(
        'Changes Saved.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        instance
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
