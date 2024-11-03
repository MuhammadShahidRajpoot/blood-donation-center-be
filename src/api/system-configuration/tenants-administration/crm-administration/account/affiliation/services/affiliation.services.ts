import { EntityManager, ILike, In, Repository } from 'typeorm';
import { Affiliation } from '../entity/affiliation.entity';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { CreateAffiliationDto } from '../dto/create-affiliation.dto';
import { User } from '../../../../user-administration/user/entity/user.entity';
import {
  GetAllAffiliationsInterface,
  UpdateAffiliationsInterface,
} from '../interface/affiliation.interface';
import { BusinessUnits } from '../../../../organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { AffiliationHistory } from '../entity/affiliationHistory.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
dotenv.config();
@Injectable()
export class AffiliationService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AffiliationHistory)
    private readonly affiliationHistoryRepository: Repository<AffiliationHistory>,

    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,

    @InjectRepository(Affiliation)
    private readonly affiliationRepository: Repository<Affiliation>,
    private readonly entityManager: EntityManager
  ) {}

  async addAffiliation(createAffiliationDto: CreateAffiliationDto) {
    const collectionOp = await this.businessUnitsRepository.find({
      where: { id: In(createAffiliationDto.collection_operation) },
    });
    if (!collectionOp) {
      throw new NotFoundException('collection Operation not found');
    }

    try {
      const newAffiliation = new Affiliation();
      newAffiliation.name = createAffiliationDto?.name;
      newAffiliation.description = createAffiliationDto?.description;
      newAffiliation.created_by = createAffiliationDto?.created_by;
      newAffiliation.is_active = createAffiliationDto.is_active;
      // newAffiliation.created_at = new Date();
      newAffiliation.collection_operation = collectionOp;
      newAffiliation.tenant_id = this.request.user?.tenant?.id;

      const savedAffiliation = await this.affiliationRepository.save(
        newAffiliation
      );
      return {
        status: 'success',
        response: 'Affiliation Created Successfully',
        status_code: 201,
        data: savedAffiliation,
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

  async getAffiliations(params: GetAllAffiliationsInterface) {
    try {
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;

      let page = params?.page ? +params?.page : 1;

      if (page < 1) {
        page = 1;
      }

      const where = {};
      if (params?.name) {
        Object.assign(where, {
          name: ILike(`%${params?.name}%`),
        });
      }

      if (params?.status) {
        Object.assign(where, {
          is_active: params?.status,
        });
      }
      if (params?.collection_operation) {
        if (params?.collection_operation) {
          const collectionOperations = params?.collection_operation
            .split(',')
            .map((op) => parseInt(op.trim()));
          let Ids = [];
          const query = this.affiliationRepository
            .createQueryBuilder('affiliation')
            .leftJoinAndSelect(
              'affiliation.collection_operation',
              'collection_operation'
            )
            .where('collection_operation.id IN (:...collectionOperations)', {
              collectionOperations,
            });
          const result = await query.getRawMany();
          Ids = result.map((row) => row.affiliation_id);
          Object.assign(where, {
            id: In(Ids),
          });
        }
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      let affiliations: any = [];
      if (params?.fetchAll) {
        affiliations = this.affiliationRepository
          .createQueryBuilder('affiliations')
          .leftJoinAndSelect(
            'affiliations.collection_operation',
            'collection_operation'
          )
          .leftJoinAndSelect('affiliations.created_by', 'created_by')
          .orderBy({ 'affiliations.id': 'DESC' })
          .where({ ...where, is_archived: false });
      } else if (params?.sortName) {
        affiliations = this.affiliationRepository
          .createQueryBuilder('affiliations')
          .leftJoinAndSelect(
            'affiliations.collection_operation',
            'collection_operation'
          )
          .leftJoinAndSelect('affiliations.created_by', 'created_by')
          .take(limit)
          .orderBy(
            params.sortName === 'collection_operation'
              ? {
                  [`collection_operation.name`]:
                    params.sortOrder === 'asc' ? 'ASC' : 'DESC' || 'ASC',
                }
              : {
                  [`affiliations.${params.sortName}`]:
                    params.sortOrder === 'asc' ? 'ASC' : 'DESC' || 'ASC',
                }
          )
          .skip((page - 1) * limit)
          .where({ ...where, is_archived: false });
      } else {
        affiliations = this.affiliationRepository
          .createQueryBuilder('affiliations')
          .leftJoinAndSelect(
            'affiliations.collection_operation',
            'collection_operation'
          )
          .leftJoinAndSelect('affiliations.created_by', 'created_by')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy({ 'affiliations.id': 'DESC' })
          .where({ ...where, is_archived: false });
      }

      const [data, count] = await affiliations.getManyAndCount();

      return {
        status: HttpStatus.OK,
        message: 'Affiliations Fetched Successfully',
        count: count,
        data: data,
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

  async getAffiliationsByCollectionOperation(
    params: GetAllAffiliationsInterface
  ) {
    try {
      // const limit: number = params?.limit
      //   ? +params?.limit
      //   : +process.env.PAGE_SIZE;

      // let page = params?.page ? +params?.page : 1;

      // if (page < 1) {
      //   page = 1;
      // }

      const where = {};
      if (params?.name) {
        Object.assign(where, {
          name: ILike(`%${params?.name}%`),
        });
      }

      if (params?.status) {
        Object.assign(where, {
          is_active: params?.status,
        });
      }
      const collection_operation = await this.getUserBusinessUnits();
      const collectionOperationIds = collection_operation.map(
        (collection) => collection.id
      );
      if (collectionOperationIds.length) {
        const query = this.affiliationRepository
          .createQueryBuilder('affiliation')
          .leftJoinAndSelect(
            'affiliation.collection_operation',
            'collection_operation'
          )
          .where('collection_operation.id IN (:...collectionOperations)', {
            collectionOperations: collectionOperationIds,
          });
        const result = await query.getRawMany();
        const Ids = result.map((row) => row.affiliation_id);
        Object.assign(where, {
          id: In(Ids),
        });
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      let affiliations: any = [];
      affiliations = this.affiliationRepository
        .createQueryBuilder('affiliations')
        .leftJoinAndSelect(
          'affiliations.collection_operation',
          'collection_operation'
        )
        .leftJoinAndSelect('affiliations.created_by', 'created_by')
        .orderBy({ 'affiliations.id': 'DESC' })
        .where({ ...where, is_archived: false });

      const [data, count] = await affiliations.getManyAndCount();

      return {
        status: HttpStatus.OK,
        message: 'Affiliations Fetched Successfully',
        count: count,
        data: data,
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

  async update(affiliationInterface: UpdateAffiliationsInterface) {
    const affiliationId = affiliationInterface?.id;

    const affiliation = await this.affiliationRepository.findOne({
      relations: ['created_by', 'tenant'],
      where: { id: affiliationId, is_archived: false },
    });

    if (!affiliation) {
      throw new NotFoundException('Affiliation not found');
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const affiliation: any = await this.affiliationRepository.findOne({
        where: {
          id: affiliationId,
        },
        relations: ['collection_operation'],
      });

      const collectionOp = await this.businessUnitsRepository.find({
        where: { id: In(affiliationInterface.collection_operation) },
      });

      affiliation.name = affiliationInterface.name;
      affiliation.description = affiliationInterface.description;
      affiliation.collection_operation = collectionOp;
      affiliation.is_active = affiliationInterface.is_active;
      affiliation.created_at = new Date();
      affiliation.created_by = this.request?.user;
      await this.affiliationRepository.save(affiliation);

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Changes Saved.',
        status_code: 204,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Affiliation update >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getSingleAffiliation(id: any) {
    const affiliation: any = await this.affiliationRepository.findOne({
      where: { id, is_archived: false },
      relations: ['collection_operation', 'created_by'],
    });
    if (!affiliation) {
      throw new NotFoundException('affiliation not found');
    }

    if (affiliation) {
      const modifiedData: any = await getModifiedDataDetails(
        this.affiliationHistoryRepository,
        id,
        this.userRepository
      );
      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      affiliation.modified_by = affiliation.created_by;
      affiliation.modified_at = affiliation.created_at;
      affiliation.created_at = modified_at
        ? modified_at
        : affiliation.created_at;
      affiliation.created_by = modified_by
        ? modified_by
        : affiliation.created_by;
    }

    return { ...affiliation };
  }

  async deleteAffilations(id: any, updated_by: any, deleteData: any) {
    const affiliation: any = await this.affiliationRepository.findOne({
      where: { id, is_archived: false },
      relations: ['created_by', 'tenant'],
    });

    if (!affiliation) {
      throw new NotFoundException('Affiliation not found');
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      affiliation.is_archived = true;
      affiliation.created_at = new Date();
      affiliation.created_by = this.request?.user;
      const archivedAffliation = await this.affiliationRepository.save(
        affiliation
      );

      await queryRunner.commitTransaction();

      delete archivedAffliation?.created_by;
      return {
        status: 'success',
        response: 'Affiliation Archived.',
        status_code: 204,
        data: archivedAffliation,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Affiliation delete >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getUserBusinessUnits() {
    try {
      const userData: any = await this.userRepository.findOne({
        where: {
          id: this.request.user?.id,
        },
        relations: [
          'role',
          'tenant',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
        ],
      });

      const where: any = { is_archived: false, is_active: true };

      let businessUnits: any = [];
      const userBusinessUnitIds = userData?.business_units?.map(
        (bu) => bu.business_unit_id.id
      );

      if (userBusinessUnitIds.length || userData?.all_hierarchy_access) {
        let parentBusinessUnits = userBusinessUnitIds;

        if (userData?.all_hierarchy_access) {
          const businessUnitData = await this.businessUnitsRepository.find({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              parent_level: null,
            },
          });
          parentBusinessUnits = businessUnitData.map(
            (businessUnit) => businessUnit.id
          );
        }

        while (!businessUnits.length) {
          const businessUnitData = await this.businessUnitsRepository.find({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              parent_level: In(parentBusinessUnits),
            },
            relations: ['parent_level', 'tenant', 'organizational_level_id'],
          });

          if (businessUnitData.length) {
            const collectionOperations = businessUnitData.map(
              (businessUnit) =>
                businessUnit.organizational_level_id.is_collection_operation
            );
            if (collectionOperations.includes(true)) {
              businessUnits = businessUnitData;
            } else {
              parentBusinessUnits = businessUnitData.map(
                (businessUnit) => businessUnit.id
              );
            }
          } else {
            const businessUnitData: any =
              await this.businessUnitsRepository.findOne({
                where: {
                  ...where,
                  tenant: { id: userData?.tenant?.id },
                  id: In(userBusinessUnitIds),
                },
                relations: [
                  'parent_level',
                  'tenant',
                  'organizational_level_id',
                ],
              });
            if (
              businessUnitData &&
              businessUnitData?.organizational_level_id?.is_collection_operation
            ) {
              businessUnits = [businessUnitData];
            }
            break;
          }
        }
      }

      return businessUnits;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
