import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { EntityManager, ILike, In, Not, Repository } from 'typeorm';
import * as _ from 'lodash';
import * as dotenv from 'dotenv';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  CreateManageFavoritesDto,
  ListManageFavoritesDto,
  MakeDefaultDto,
} from '../dto/manage-favorites.dto';
import { Favorites } from '../entities/favorites.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Products } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { FavoriteCalendarPreviewTypeEnum } from '../enum/manage-favorites.enum';
import { FavoritesHistory } from '../entities/favorites-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { FavoritesOrganizationalLevels } from '../entities/favorites-org-levels.entity';
import { FavoritesRecruiters } from '../entities/favorites-recruiters';
import { FavoritesOrganizationalLevelsHistory } from '../entities/favorites-org-levels-history.entity';
import { FavoritesRecruitersHistory } from '../entities/favorites-recruiters-history';
dotenv.config();

@Injectable()
export class ManageFavoritesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    @InjectRepository(OperationsStatus)
    private readonly operationsStatusRepository: Repository<OperationsStatus>,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelsRepository: Repository<OrganizationalLevels>,
    @InjectRepository(Favorites)
    private readonly favoritesRepository: Repository<Favorites>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(FavoritesOrganizationalLevels)
    private readonly favoritesOrganizationalLevelsRepository: Repository<FavoritesOrganizationalLevels>,
    @InjectRepository(FavoritesRecruiters)
    private readonly favoritesRecruitersRepository: Repository<FavoritesRecruiters>,
    @InjectRepository(FavoritesHistory)
    private readonly favoritesHistoryRepository: Repository<FavoritesHistory>,
    @InjectRepository(FavoritesOrganizationalLevelsHistory)
    private readonly favoritesOrganizationalLevelsHistoryRepository: Repository<FavoritesOrganizationalLevelsHistory>,
    @InjectRepository(FavoritesRecruitersHistory)
    private readonly favoritesRecruitersHistoryRepository: Repository<FavoritesRecruitersHistory>,
    private readonly entityManager: EntityManager
  ) {}

  async create(createManageFavoritesDto: CreateManageFavoritesDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { user, tenant } = await this.checkExistancesAuth({
        created_by: createManageFavoritesDto.created_by,
        tenant_id: createManageFavoritesDto.tenant_id,
      });

      const existingSameNameFavorite = await this.favoritesRepository.findOne({
        where: {
          tenant: { id: tenant.id },
          name: ILike(createManageFavoritesDto.name),
          is_archived: false,
        },
      });

      if (existingSameNameFavorite) {
        resError(
          `Name already exists.`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      const { product, procedureTypeExist, operationsStatus } =
        await this.checkExistancesValues({
          product_id: createManageFavoritesDto.product_id,
          procedure_type_id: createManageFavoritesDto.procedure_type_id,
          operations_status_id: createManageFavoritesDto.operations_status_id,
        });
      if (!user || !tenant) {
        resError(
          `Data not found user || tenant || organizational level`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (createManageFavoritesDto.is_default) {
        const existingDefaultFavorite = await this.favoritesRepository.findOne({
          where: {
            tenant: { id: tenant.id },
            is_default: true,
            is_archived: false,
          },
          relations: [
            'product_id',
            'procedure_type_id',
            'operations_status_id',
          ],
        });
        if (existingDefaultFavorite) {
          // await this.createHistory(
          //   existingDefaultFavorite,
          //   existingDefaultFavorite.id,
          //   user.id,
          //   tenant.id,
          //   'C'
          // );
          existingDefaultFavorite.is_default = false;
          await this.favoritesRepository.save(existingDefaultFavorite);
        }
      }
      const newFavorite: any = new Favorites();

      newFavorite.name = createManageFavoritesDto.name;
      if (createManageFavoritesDto?.alternate_name)
        newFavorite.alternate_name = createManageFavoritesDto.alternate_name;
      newFavorite.tenant_id = tenant?.id;
      newFavorite.preview_in_calendar =
        createManageFavoritesDto?.preview_in_calendar ??
        FavoriteCalendarPreviewTypeEnum.Month;
      if (createManageFavoritesDto?.operation_type)
        newFavorite.operation_type = createManageFavoritesDto.operation_type;
      if (createManageFavoritesDto?.location_type)
        newFavorite.location_type = createManageFavoritesDto.location_type;
      newFavorite.status = createManageFavoritesDto.is_active;
      newFavorite.created_at = new Date();
      newFavorite.is_archived = false;
      newFavorite.is_open_in_new_tab =
        createManageFavoritesDto.is_open_in_new_tab;
      newFavorite.created_by = user;
      if (product) newFavorite.product_id = product;
      if (procedureTypeExist)
        newFavorite.procedure_type_id = procedureTypeExist;
      newFavorite.is_default = createManageFavoritesDto.is_default ?? false;
      newFavorite.bu_metadata =
        createManageFavoritesDto.organization_level_id || '';
      newFavorite.operations_status_id = operationsStatus;

      const savedFavorite = await queryRunner.manager.save(newFavorite);

      if (createManageFavoritesDto.organization_level_id) {
        const organization_level_data: any = JSON.parse(
          createManageFavoritesDto.organization_level_id
        );

        const rootBusinessUnitIds = organization_level_data.map(
          (item) => item.id
        );
        const businessUnitRootNodes = organization_level_data
          .filter((item) => !rootBusinessUnitIds.includes(item.parent_id))
          .map((item) => item.id);
        if (businessUnitRootNodes.length > 0) {
          const organizational_level_list: any =
            await this.businessUnitsRepository.find({
              where: {
                id: In(businessUnitRootNodes),
              },
              relations: ['organizational_level_id'],
            });
          const organizationLevelIds: any =
            organizational_level_list.length > 0
              ? _.uniq(
                  organizational_level_list.map(
                    (item: any) => +item.organizational_level_id.id
                  )
                )
              : [];

          const promises = [];
          for (const organizationLevelId of organizationLevelIds) {
            const favOrgLevel: any = new FavoritesOrganizationalLevels();
            favOrgLevel.favorite_id = savedFavorite.id;
            favOrgLevel.organization_level_id = organizationLevelId;
            favOrgLevel.created_by = user;
            favOrgLevel.tenant_id = tenant.id;
            promises.push(queryRunner.manager.save(favOrgLevel));
          }
          await Promise.all(promises);
        }

        let recruiterIds = organization_level_data
          .filter((record) => record.is_recruiter)
          .map((record) => record.id);

        recruiterIds = _.uniq(recruiterIds);
        if (recruiterIds.length > 0) {
          const promises = [];
          for (const recruiterId of recruiterIds) {
            const favoritesRecruiter: any = new FavoritesRecruiters();
            favoritesRecruiter.favorite_id = savedFavorite.id;
            favoritesRecruiter.recruiter_id = recruiterId;
            favoritesRecruiter.created_by = user;
            favoritesRecruiter.tenant_id = tenant.id;
            promises.push(queryRunner.manager.save(favoritesRecruiter));
          }
          await Promise.all(promises);
        }
      }

      await queryRunner.commitTransaction();

      return resSuccess(
        'Favorite Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedFavorite
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async listFavorites(params: ListManageFavoritesDto, tenant_id: number) {
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
          status: params?.status,
        });
      }

      Object.assign(where, {
        tenant: { id: tenant_id },
      });

      let favorites: any = [];
      if (params?.fetchAll) {
        favorites = this.favoritesRepository
          .createQueryBuilder('favorites')
          .leftJoinAndSelect(
            'favorites.organizational_levels',
            'organizational_levels',
            'organizational_levels.is_archived is false'
          )
          .leftJoinAndSelect(
            'organizational_levels.organization_level_id',
            'organization_level_id'
          )
          .leftJoinAndSelect('favorites.procedure_type_id', 'procedure_type_id')
          .leftJoinAndSelect('favorites.product_id', 'product_id')
          .leftJoinAndSelect(
            'favorites.operations_status_id',
            'operations_status_id'
          )
          .orderBy({ 'favorites.id': 'DESC' })
          .where({ ...where, is_archived: false });
      } else if (params?.sortName) {
        favorites = this.favoritesRepository
          .createQueryBuilder('favorites')
          .leftJoinAndSelect(
            'favorites.organizational_levels',
            'organizational_levels',
            'organizational_levels.is_archived is false'
          )
          .leftJoinAndSelect(
            'organizational_levels.organization_level_id',
            'organization_level_id'
          )
          .leftJoinAndSelect('favorites.procedure_type_id', 'procedure_type_id')
          .leftJoinAndSelect('favorites.product_id', 'product_id')
          .leftJoinAndSelect(
            'favorites.operations_status_id',
            'operations_status_id'
          )
          .take(limit)
          .orderBy(
            params.sortName === 'product_id'
              ? {
                  [`product_id.name`]:
                    params.sortOrder === 'ASC' ? 'ASC' : 'DESC' || 'ASC',
                }
              : params.sortName === 'procedure_type_id'
              ? {
                  [`procedure_type_id.name`]:
                    params.sortOrder === 'ASC' ? 'ASC' : 'DESC' || 'ASC',
                }
              : params.sortName === 'operations_status_id'
              ? {
                  [`operations_status_id.name`]:
                    params.sortOrder === 'ASC' ? 'ASC' : 'DESC' || 'ASC',
                }
              : params.sortName === 'organization_level_names'
              ? {
                  ['organization_level_id.name']:
                    params.sortOrder === 'ASC' ? 'ASC' : 'DESC' || 'ASC',
                }
              : {
                  [`favorites.${params.sortName}`]:
                    params.sortOrder === 'ASC' ? 'ASC' : 'DESC' || 'ASC',
                }
          )
          .skip((page - 1) * limit)
          .where({ ...where, is_archived: false, is_default: false });
      } else {
        favorites = this.favoritesRepository
          .createQueryBuilder('favorites')
          .leftJoinAndSelect('favorites.procedure_type_id', 'procedure_type_id')
          .leftJoinAndSelect('favorites.product_id', 'product_id')
          .leftJoinAndSelect(
            'favorites.operations_status_id',
            'operations_status_id'
          )
          .leftJoinAndSelect(
            'favorites.organizational_levels',
            'organizational_levels',
            'organizational_levels.is_archived is false'
          )
          .leftJoinAndSelect(
            'organizational_levels.organization_level_id',
            'organization_level_id'
          )
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy({ 'favorites.id': 'DESC' })
          .where({ ...where, is_archived: false, is_default: false });
      }

      const [data, count] = await favorites.getManyAndCount();

      const result = data.map((favorite) => ({
        ...favorite,
        ...(favorite?.location_type === 'InsideOutside' && {
          location_type: 'Inside/Outside',
        }),
        ...(favorite?.is_default && {
          verticalLabel: 'Default',
        }),
        procedure_type_id: favorite?.procedure_type_id?.name,
        product_id: favorite?.product_id?.name,
        operations_status_id: favorite?.operations_status_id?.name,
        procedure_type_idd: favorite?.procedure_type_id?.id,
        product_idd: favorite?.product_id?.id,
        operations_status_idd: favorite?.operations_status_id?.id,
      }));
      return {
        status: HttpStatus.OK,
        message: 'favorites Fetched Successfully',
        count: count,
        data: result,
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
  async getSingleFavorite(id: any, tenant) {
    const favorite: any = await this.favoritesRepository.findOne({
      where: { id: id, tenant_id: tenant, is_archived: false },
      relations: [
        'created_by',
        'product_id',
        'procedure_type_id',
        'operations_status_id',
      ],
    });
    if (!favorite?.id) {
      return resError(
        `Favorite not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    if (favorite) {
      const modifiedData: any = await getModifiedDataDetails(
        this.favoritesHistoryRepository,
        id,
        this.userRepository
      );
      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      favorite.modified_by = favorite.created_by;
      favorite.modified_at = favorite.created_at;
      favorite.created_at = modified_at ? modified_at : favorite.created_at;
      favorite.created_by = modified_by ? modified_by : favorite.created_by;
    }
    const organizational_levels =
      await this.favoritesOrganizationalLevelsRepository.find({
        where: { favorite_id: { id }, is_archived: false, is_active: true },
        relations: ['favorite_id', 'organization_level_id'],
      });
    const recruiters: any = await this.favoritesRecruitersRepository.find({
      where: { favorite_id: { id }, is_archived: false, is_active: true },
      relations: ['favorite_id', 'recruiter_id'],
    });
    return resSuccess(
      'Favorite fetched successfully.',
      SuccessConstants.SUCCESS,
      HttpStatus.CREATED,
      {
        ...favorite,
        recruiters,
        organizational_levels,
      }
    );
  }

  async getDefault(tenant) {
    const favorite: any = await this.favoritesRepository.findOne({
      where: { is_default: true, tenant_id: tenant, is_archived: false },
      relations: ['product_id', 'procedure_type_id', 'operations_status_id'],
    });
    if (!favorite?.id) {
      return resError(
        `Favorite not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    const organizational_levels =
      await this.favoritesOrganizationalLevelsRepository.find({
        where: {
          favorite_id: { id: favorite.id },
          is_archived: false,
          is_active: true,
        },
        relations: ['favorite_id', 'organization_level_id'],
      });
    return resSuccess(
      'Favorite fetched successfully.',
      SuccessConstants.SUCCESS,
      HttpStatus.CREATED,
      {
        ...favorite,
        organizational_levels,
        verticalLabel: 'Default',
      }
    );
  }
  async update(
    id: any,
    updatedData: CreateManageFavoritesDto,
    updated_by: any
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { user, tenant } = await this.checkExistancesAuth({
        created_by: updated_by?.id,
        tenant_id: updated_by?.tenant?.id,
      });
      const existingSameNameFavorite = await this.favoritesRepository.findOne({
        where: {
          tenant: { id: tenant.id },
          name: ILike(updatedData.name),
          id: Not(id),
          is_archived: false,
        },
      });

      if (existingSameNameFavorite) {
        resError(
          `Name already exists.`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }
      const { product, procedureTypeExist, operationsStatus } =
        await this.checkExistancesValues({
          product_id: updatedData.product_id,
          procedure_type_id: updatedData.procedure_type_id,
          operations_status_id: updatedData.operations_status_id,
        });

      if (!user || !tenant) {
        resError(`Data not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const existingFavorite: any = await this.favoritesRepository.findOne({
        where: {
          tenant: { id: tenant.id },
          id,
          is_archived: false,
        },
        relations: ['product_id', 'procedure_type_id', 'operations_status_id'],
      });

      if (updatedData.is_default) {
        const existingDefaultFavorite: any =
          await this.favoritesRepository.findOne({
            where: {
              tenant: { id: tenant.id },
              is_default: true,
              is_archived: false,
            },
            relations: [
              'product_id',
              'procedure_type_id',
              'operations_status_id',
            ],
          });
        if (existingDefaultFavorite) {
          existingDefaultFavorite.is_default = false;
          existingDefaultFavorite.created_at = new Date();
          existingDefaultFavorite.created_by = user;
          await this.favoritesRepository.save(existingDefaultFavorite);
        }
      }
      existingFavorite.name = updatedData.name;
      existingFavorite.alternate_name = updatedData.alternate_name;
      existingFavorite.tenant_id = tenant?.id;
      existingFavorite.preview_in_calendar =
        updatedData?.preview_in_calendar ??
        FavoriteCalendarPreviewTypeEnum.Month;
      existingFavorite.operation_type = updatedData.operation_type ?? null;
      existingFavorite.location_type = updatedData.location_type ?? null;
      existingFavorite.status = updatedData.is_active;
      existingFavorite.is_archived = false;
      existingFavorite.is_open_in_new_tab = updatedData.is_open_in_new_tab;
      existingFavorite.created_by = user;
      existingFavorite.product_id = product ?? null;
      existingFavorite.procedure_type_id = procedureTypeExist ?? null;
      existingFavorite.is_default = updatedData.is_default ?? false;
      existingFavorite.bu_metadata = updatedData.organization_level_id || '';
      existingFavorite.operations_status_id = operationsStatus ?? null;
      existingFavorite.created_at = new Date();
      const updatedFavorite = await this.favoritesRepository.save(
        existingFavorite
      );
      const recruiterIds = [];
      let organizationLevelIds = [];
      if (updatedData.organization_level_id) {
        const organization_level_data: any = JSON.parse(
          updatedData.organization_level_id
        );

        const rootBusinessUnitIds = organization_level_data.map(
          (item) => item.id
        );
        const businessUnitRootNodes = organization_level_data
          .filter((item) => !rootBusinessUnitIds.includes(item.parent_id))
          .map((item) => item.id);

        if (businessUnitRootNodes.length > 0) {
          const organizational_level_list: any =
            await this.businessUnitsRepository.find({
              where: {
                id: In(businessUnitRootNodes),
              },
              relations: ['organizational_level_id'],
            });
          organizationLevelIds =
            organizational_level_list.length > 0
              ? _.uniq(
                  organizational_level_list.map(
                    (item: any) => +item.organizational_level_id.id
                  )
                )
              : [];

          const promises = [];
          for (const organizationLevelId of organizationLevelIds) {
            const existingOrgLevel =
              await this.favoritesOrganizationalLevelsRepository.findOne({
                where: {
                  favorite_id: {
                    id: id,
                  },
                  organization_level_id: { id: organizationLevelId },
                  is_active: true,
                  is_archived: false,
                },
                relations: ['organization_level_id', 'favorite_id'],
              });
            if (!existingOrgLevel) {
              const favOrgLevel: any = new FavoritesOrganizationalLevels();
              favOrgLevel.favorite_id = updatedFavorite.id;
              favOrgLevel.organization_level_id = organizationLevelId;
              favOrgLevel.created_by = user;
              favOrgLevel.tenant_id = tenant.id;
              promises.push(queryRunner.manager.save(favOrgLevel));
            }
          }
          await Promise.all(promises);
        }

        let recruiterIds = organization_level_data
          .filter((record) => record.is_recruiter)
          .map((record) => record.id);

        recruiterIds = _.uniq(recruiterIds);
        if (recruiterIds.length > 0) {
          const promises = [];
          for (const recruiterId of recruiterIds) {
            const existingRecruiter =
              await this.favoritesRecruitersRepository.findOne({
                where: {
                  favorite_id: { id },
                  recruiter_id: { id: recruiterId },
                  is_active: true,
                  is_archived: false,
                },
                relations: ['favorite_id', 'recruiter_id'],
              });
            if (!existingRecruiter) {
              const favRecruiters: any = new FavoritesRecruiters();
              favRecruiters.favorite_id = id;
              favRecruiters.recruiter_id = recruiterId;
              favRecruiters.created_by = user;
              favRecruiters.tenant_id = tenant.id;
              promises.push(queryRunner.manager.save(favRecruiters));
            }
          }
          await Promise.all(promises);
        }
      }

      const allExistingOrgLevel: any =
        await this.favoritesOrganizationalLevelsRepository.find({
          where: {
            favorite_id: {
              id: id,
            },
            is_active: true,
            is_archived: false,
          },
          relations: ['organization_level_id', 'favorite_id'],
        });
      if (allExistingOrgLevel.length > 0) {
        for (const i of allExistingOrgLevel) {
          const findBusinessUnit = organizationLevelIds.find(
            (item) => +item === +i.organization_level_id.id
          );
          if (findBusinessUnit === undefined) {
            i.is_archived = true;
            i.created_at = new Date();
            i.created_by = user;
            await this.favoritesOrganizationalLevelsRepository.save(i);
          } else {
            continue;
          }
        }
      }
      const allExistingRecruiters: any =
        await this.favoritesRecruitersRepository.find({
          where: {
            favorite_id: { id },
            is_active: true,
            is_archived: false,
          },
          relations: ['favorite_id', 'recruiter_id'],
        });
      if (allExistingRecruiters.length > 0) {
        for (const j of allExistingRecruiters) {
          const findRecruiter = recruiterIds.find(
            (item) => +item === +j.recruiter_id.id
          );
          if (findRecruiter === undefined) {
            j.is_archived = true;
            j.created_at = new Date();
            j.created_by = user;
            await this.favoritesRecruitersRepository.save(j);
          } else {
            continue;
          }
        }
      }
      await queryRunner.commitTransaction();

      return {
        status: 'success',
        response: 'Changes Saved',
        status_code: 204,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async archive(id: any, userData: any) {
    const favorite: any = await this.favoritesRepository.findOne({
      where: {
        id,
        is_archived: false,
        tenant: {
          id: userData?.tenant?.id,
        },
      },
      relations: [
        'product_id',
        'procedure_type_id',
        'operations_status_id',
        'tenant',
      ],
    });

    if (!favorite) {
      resError(
        `Favorite not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    const { user, tenant } = await this.checkExistancesAuth({
      created_by: userData?.id,
      tenant_id: userData?.tenant?.id,
    });
    if (!user || !tenant) {
      resError(`Data not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      favorite.is_archived = true;
      favorite.created_at = new Date();
      favorite.created_by = user;
      const archivedFavorite = await this.favoritesRepository.save(favorite);

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Favorite Archived.',
        status_code: 204,
        data: null,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async setDefaultFavorite(
    fav_id: any,
    tenant_id: any,
    user_id: any,
    makeDefaultDto: MakeDefaultDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { user, tenant } = await this.checkExistancesAuth({
        created_by: user_id,
        tenant_id,
      });
      if (!tenant || !user) {
        resError(
          `Tenant or User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const existingDefaultFavorite: any =
        await this.favoritesRepository.findOne({
          where: {
            tenant: { id: tenant.id },
            is_default: true,
            is_archived: false,
          },
          relations: [
            'product_id',
            'procedure_type_id',
            'operations_status_id',
          ],
        });
      if (existingDefaultFavorite) {
        existingDefaultFavorite.is_default = false;
        existingDefaultFavorite.created_at = new Date();
        existingDefaultFavorite.created_by = user;
        await this.favoritesRepository.save(existingDefaultFavorite);
      }
      const favorite: any = await this.favoritesRepository.findOne({
        where: {
          id: fav_id,
          is_archived: false,
        },
        relations: ['product_id', 'procedure_type_id', 'operations_status_id'],
      });

      if (!favorite) {
        resError(
          `Favorite not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      favorite.is_default = true;
      favorite.created_at = new Date();
      favorite.created_by = user;
      await this.favoritesRepository.save(favorite);
      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Resource Set as Default',
        status_code: 200,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  async checkExistancesAuth(idsData: any) {
    const user = await this.userRepository.findOne({
      where: {
        id: idsData?.created_by,
        is_archived: false,
      },
    });
    const tenant = await this.tenantRepository.findOne({
      where: {
        id: idsData?.tenant_id,
      },
    });

    return {
      user,
      tenant,
    };
  }
  async checkExistancesValues(idsData: any) {
    let product, procedureTypeExist, operationsStatus;
    if (idsData?.product_id) {
      product = await this.productsRepository.findOne({
        where: {
          id: idsData?.product_id,
          is_archived: false,
        },
      });
      if (!product)
        resError(
          `Product not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
    }
    if (idsData?.procedure_type_id) {
      procedureTypeExist = await this.procedureTypesRepository.findOne({
        where: {
          id: idsData?.procedure_type_id,
          is_archive: false,
        },
      });
      if (!procedureTypeExist)
        resError(
          `Procedure type not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
    }
    if (idsData?.operations_status_id) {
      operationsStatus = await this.operationsStatusRepository.findOne({
        where: {
          id: idsData?.operations_status_id,
          is_archived: false,
        },
      });
      if (!operationsStatus)
        resError(
          `Operation Status not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
    }
    return {
      product,
      procedureTypeExist,
      operationsStatus,
    };
  }
  async createHistory(
    existingFavorite: Favorites,
    id: any,
    user_id: any,
    tenant_id: any,
    history_reason: string
  ) {
    const {
      name,
      alternate_name,
      is_default,
      location_type,
      operation_type,
      procedure_type_id,
      product_id,
      status,
      is_open_in_new_tab,
      operations_status_id,
      preview_in_calendar,
      bu_metadata,
    } = existingFavorite;
    const favHist = new FavoritesHistory();
    favHist.name = name;
    favHist.alternate_name = alternate_name;
    favHist.is_default = is_default;
    favHist.location_type = location_type;
    favHist.operation_type = operation_type;
    favHist.is_open_in_new_tab = is_open_in_new_tab;
    favHist.procedure_type_id = procedure_type_id?.id;
    favHist.product_id = product_id?.id;
    favHist.operations_status_id = operations_status_id?.id;
    favHist.status = status;
    favHist.preview_in_calendar = preview_in_calendar;
    favHist.bu_metadata = bu_metadata;
    favHist.id = id;
    favHist.status = status;
    favHist.is_default = is_default;
    favHist.history_reason = history_reason;
    favHist.created_by = user_id;
    favHist.tenant_id = tenant_id;

    try {
      await this.favoritesHistoryRepository.save(favHist);
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getProductsProcedureTypes(id: bigint) {
    try {
      const procedureType = await this.procedureTypesRepository.findOne({
        where: { id },
        relations: ['products'],
        order: { name: 'ASC' },
      });

      return {
        status: HttpStatus.OK,
        message: 'Products Fetched Successfully',
        data: procedureType?.products,
      };
    } catch (error) {
      console.log('favorite product errorr---------------', error);

      return resError(error?.message, ErrorConstants.Error, error);
    }
  }
}
