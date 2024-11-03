import { HttpStatus, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateQualificationDto } from '../dto/qualification.dto';
import { Qualification } from '../entities/qualification.entity';
import { GetAllQualificationInterface } from '../interface/qualification.interface';
import { HistoryService } from '../../../../common/services/history.service';
import { QualificationHistory } from '../entities/qualification-history.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import moment from 'moment';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { customSort } from 'src/api/utils/sorting';
import { CrmLocations } from '../../entities/crm-locations.entity';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';

@Injectable()
export class QualificationService extends HistoryService<QualificationHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CrmLocations)
    private readonly locationsRepo: Repository<CrmLocations>,
    @InjectRepository(Qualification)
    private readonly qualificationRepository: Repository<Qualification>,
    @InjectRepository(QualificationHistory)
    private readonly qualificationHistoryRepository: Repository<QualificationHistory>,
    private readonly entityManager: EntityManager
  ) {
    super(qualificationHistoryRepository);
  }

  /**
   * check entity exist in database
   * @param repository
   * @param query
   * @param entityName
   * @returns {object}
   */
  async entityExist<T>(
    repository: Repository<T>,
    query,
    entityName
  ): Promise<T> {
    const entityObj = await repository.findOne(query);
    if (!entityObj) {
      resError(
        `${entityName} not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    return entityObj;
  }

  async findAll(
    getAllQualificationInterface: GetAllQualificationInterface,
    user: any
  ) {
    try {
      const sort = customSort(getAllQualificationInterface);
      const limit: number = getAllQualificationInterface?.limit
        ? +getAllQualificationInterface.limit
        : +process.env.PAGE_SIZE;

      const page = getAllQualificationInterface?.page
        ? +getAllQualificationInterface.page
        : 1;
      const getOneExpiredQualification =
        await this.qualificationRepository.findOne({
          where: {
            qualification_expires: LessThan(new Date()),
            qualification_status: true,
          },
        });
      // if (getOneExpiredQualification) {
      //   getOneExpiredQualification.qualification_status = false;
      //   await this.qualificationRepository.save(getOneExpiredQualification);
      //   const qualificationHistory = new QualificationHistory();
      //   for (const key in getOneExpiredQualification) {
      //     qualificationHistory[key] = getOneExpiredQualification[key];
      //   }
      //   qualificationHistory.history_reason = 'C';
      //   qualificationHistory.qualification_status = true;
      //   qualificationHistory.created_by = user.id;
      //   await this.qualificationHistoryRepository.save(qualificationHistory);
      // }
      const [response, count] = await this.qualificationRepository.findAndCount(
        {
          where: {
            ...(getAllQualificationInterface?.location_id && {
              location_id: getAllQualificationInterface?.location_id,
            }),
            ...(getAllQualificationInterface?.qualification_status && {
              qualification_status:
                getAllQualificationInterface?.qualification_status,
            }),
          },
          order: sort,
          take: limit,
          skip: (page - 1) * limit,
          relations: ['created_by'],
        }
      );

      return {
        status: HttpStatus.OK,
        response: 'Qualification Fetched ',
        count: count,
        data: response,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Qualification findAll >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return {
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  async create(user: any, createQualificationDto: CreateQualificationDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const userId = user?.id;

      const userData = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      const createQualification = new Qualification();
      const keys = Object.keys(createQualificationDto);
      let found_key = null;
      for (const key of keys) {
        if (key === 'qualification_date') {
          found_key = key;
          createQualification[key] = moment(
            createQualificationDto?.[key]
          ).toDate();
        } else {
          createQualification[key] = createQualificationDto?.[key];
        }
      }
      createQualification.created_by = userData ?? userData;
      createQualification.tenant_id = user?.tenant?.id;
      const existingQualification = await this.qualificationRepository.findOne({
        where: {
          location_id: createQualificationDto?.location_id,
          qualification_status: true,
        },
      });
      let expireDate;
      if (existingQualification) {
        const copyExistingqulification = { ...existingQualification };
        expireDate = moment(createQualificationDto?.qualification_date)
          .subtract(1, 'days')
          .toDate();
        existingQualification.qualification_expires = expireDate;
        existingQualification.qualification_status = false;
        await queryRunner.manager.save(existingQualification);
        // const qualificationHistory = new QualificationHistory();
        // for (const key in copyExistingqulification) {
        //   qualificationHistory[key] = copyExistingqulification[key];
        // }
        // qualificationHistory.history_reason = 'C';
        // qualificationHistory.created_by = userData.id as any;

        // await queryRunner.manager.save(qualificationHistory);
      }
      const savedQualification = await queryRunner.manager.save(
        createQualification
      );
      await queryRunner.commitTransaction();
      const findAllQualifications = await this.qualificationRepository.find({
        where: {
          location_id: createQualificationDto?.location_id,
        },
      });
      const findLocation = await this.locationsRepo.findOne({
        where: {
          id: createQualificationDto?.location_id as any,
        },
      });
      if (!findLocation) {
        return resError('location not found', 'error', 400);
      }

      findLocation.qualification_status = 'Qualified';

      await this.locationsRepo.save(findLocation);
      return {
        status: 'success',
        response: 'Qualification created ',
        status_code: 201,
        data: savedQualification,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error.message,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(
    id: any,
    user,
    createQualificationDto: CreateQualificationDto
  ): Promise<any> {
    try {
      const qualification = await this.qualificationRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!qualification) {
        return resError(
          `Please enter a valid qualification id`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const deletedQualification = await this.qualificationRepository.delete(
        id
      );

      if (deletedQualification.affected) {
        const findLocation = await this.locationsRepo.findOne({
          where: {
            id: createQualificationDto?.location_id as any,
          },
        });

        if (!findLocation) {
          return resError('location not found', 'error', 400);
        }
        findLocation.qualification_status = 'Not Qualified';
        findLocation.created_at = new Date();
        findLocation.created_by = this.request?.user;
        await this.locationsRepo.save(findLocation);
      }
      return {
        status: HttpStatus.OK,
        message: 'Qualification Deleted Successfully',
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Qualification remove >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return {
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }
}
