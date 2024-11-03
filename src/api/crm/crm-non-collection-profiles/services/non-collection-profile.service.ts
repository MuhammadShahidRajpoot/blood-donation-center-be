import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { BusinessUnits } from '../../../system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from '../../../system-configuration/helpers/response';
import { SuccessConstants } from '../../../system-configuration/constants/success.constants';
import { ErrorConstants } from '../../../system-configuration/constants/error.constants';
import { Tenant } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { CreateNonCollectionProfileDto } from '../dto/non-collection-profile.dto';
import { Category } from 'src/api/system-configuration/tenants-administration/crm-administration/common/entity/category.entity';
import { CategoryHistory } from 'src/api/system-configuration/tenants-administration/crm-administration/common/entity/categoryhistory.entity';
import { CrmNonCollectionProfiles } from '../entities/crm-non-collection-profiles.entity';
import { UpdateNonCollectionProfileDto } from '../dto/update-non-collection-profile.dto';
import { CrmNonCollectionProfilesHistory } from '../entities/crm-non-collection-profile-history.entity';
import { HistoryService } from '../../../common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { NonCollectionProfileInterface } from '../interface/non-collection-profile.interface';
import moment from 'moment';
import { NonCollectionProfileEventHistoryInterface } from '../interface/non-collection-profile-history.interface';
import { appliesToEnum } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/enums/operation-status.enum';

import { ExportService } from '../../contacts/common/exportData.service';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
@Injectable()
export class NonCollectionProfileService extends HistoryService<CrmNonCollectionProfilesHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly nceCategoryRepository: Repository<Category>,
    @InjectRepository(CrmNonCollectionProfiles)
    private readonly nonCollectionProfilesRepository: Repository<CrmNonCollectionProfiles>,
    @InjectRepository(CrmNonCollectionProfilesHistory)
    private readonly nonCollectionProfilesHistoryRepository: Repository<CrmNonCollectionProfilesHistory>,
    private readonly exportService: ExportService
  ) {
    super(nonCollectionProfilesHistoryRepository);
  }

  async create(
    createNonCollectionProfileDto: CreateNonCollectionProfileDto,
    user: any
  ) {
    try {
      const {
        profile_name,
        alternate_name,
        event_category_id,
        event_subcategory_id,
        collection_operation_id,
        owner_id,
        is_active,
      } = createNonCollectionProfileDto;
      const owner = await this.userRepository.findOneBy({
        id: owner_id,
      });
      if (!owner) {
        resError(
          `Owner not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const businessUnits = await this.businessUnitsRepository.find({
        where: {
          id: In(collection_operation_id),
        },
      });
      if (!businessUnits) {
        resError(
          `Collection operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const nonCollectionProfile = new CrmNonCollectionProfiles();
      nonCollectionProfile.created_by = user;
      nonCollectionProfile.tenant_id = user.tenant;
      nonCollectionProfile.profile_name = profile_name;
      nonCollectionProfile.alternate_name = alternate_name;
      nonCollectionProfile.event_category_id = event_category_id;
      nonCollectionProfile.event_subcategory_id = event_subcategory_id || null;
      nonCollectionProfile.is_archived = false;
      nonCollectionProfile.is_active = is_active;
      nonCollectionProfile.collection_operation_id = businessUnits;
      nonCollectionProfile.owner_id = owner;

      const savedNonCollectionProfile =
        await this.nonCollectionProfilesRepository.save(nonCollectionProfile);

      delete savedNonCollectionProfile.created_by.password;
      delete savedNonCollectionProfile.owner_id.password;
      delete savedNonCollectionProfile.created_by.tenant;
      return resSuccess(
        'Non-Collection profile created successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...savedNonCollectionProfile, tenant_id: user?.tenant_id }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const nonCollectionProfile: any =
        await this.nonCollectionProfilesRepository.findOne({
          where: { id: id, is_archived: false },
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'tenant',
            'event_subcategory_id',
            'event_category_id',
          ],
        });

      if (!nonCollectionProfile) {
        resError(
          `Non-Collection profile not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (nonCollectionProfile) {
        const modifiedData: any = await getModifiedDataDetails(
          this.nonCollectionProfilesHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        nonCollectionProfile.modified_by = nonCollectionProfile.created_by;
        nonCollectionProfile.modified_at = nonCollectionProfile.created_at;
        nonCollectionProfile.created_at = modified_at
          ? modified_at
          : nonCollectionProfile.created_at;
        nonCollectionProfile.created_by = modified_by
          ? modified_by
          : nonCollectionProfile.created_by;
      }
      return resSuccess(
        'Non-Collection profile fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {
          ...nonCollectionProfile,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getEventHistory(id, params: NonCollectionProfileEventHistoryInterface) {
    try {
      const CrmNonCollectionProfilesData =
        await this.nonCollectionProfilesRepository.find({
          where: {
            id: id,
          },
        });
      if (!CrmNonCollectionProfilesData) {
        resError(
          `Crm non collection profile not found.`,
          ErrorConstants.Error,
          HttpStatus.GONE
        );
      }
      let { page, limit } = params;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;

      const events = this.nonCollectionProfilesRepository
        .createQueryBuilder('crm_non_collection_profiles')
        .innerJoinAndSelect(
          'oc_non_collection_events',
          'oc_non_collection_events',
          `oc_non_collection_events.non_collection_profile_id = ${id}`
        )
        .innerJoinAndSelect(
          'crm_locations',
          'crm_locations',
          'crm_locations.id = oc_non_collection_events.location_id'
        )
        .innerJoinAndSelect(
          'operations_status',
          'operations_status',
          `operations_status.id = oc_non_collection_events.status_id`
        )
        .where({
          is_archived: false,
          id: id,
        })
        .select([
          'crm_non_collection_profiles.id as ID',
          'crm_non_collection_profiles.tenant_id as tenant_id',
          'crm_non_collection_profiles.is_archived as is_archived',
          'oc_non_collection_events.event_name AS event_name',
          'oc_non_collection_events.date AS Date',
          'oc_non_collection_events.tenant_id AS tenant_id',
          'oc_non_collection_events.id AS eventid',
          'crm_locations.name AS location',
          'operations_status.name AS event_status',
        ])
        .limit(limit)
        .offset((page - 1) * limit);

      const eventCounts = this.nonCollectionProfilesRepository
        .createQueryBuilder('crm_non_collection_profiles')
        .innerJoinAndSelect(
          'oc_non_collection_events',
          'oc_non_collection_events',
          `oc_non_collection_events.non_collection_profile_id = ${id}`
        )
        .innerJoinAndSelect(
          'crm_locations',
          'crm_locations',
          'crm_locations.id = oc_non_collection_events.location_id'
        )
        .innerJoinAndSelect(
          'operations_status',
          'operations_status',
          `operations_status.id = oc_non_collection_events.status_id`
        )
        .where({
          is_archived: false,
          id: id,
        })
        .select([
          'crm_non_collection_profiles.id as ID',
          'crm_non_collection_profiles.is_archived as is_archived',
          'oc_non_collection_events.event_name AS event_name',
          'oc_non_collection_events.date AS Date',
          'oc_non_collection_events.id AS eventid',
          'oc_non_collection_events.tenant_id AS tenant_id',
          'crm_locations.name AS location',
          'operations_status.name AS event_status',
        ]);
      // events.andWhere('operations_status.applies_to = :applies_to', {
      //   applies_to: In[appliesToEnum.sessions],
      // });
      if (params?.selected_date) {
        const selected_date = params.selected_date?.split(',');
        const startDate = moment(selected_date[0]).startOf('day');
        const endDate = moment(selected_date[1]).endOf('day');

        events.andWhere(
          'oc_non_collection_events.date Between :startDate AND :endDate',
          { startDate, endDate }
        );
        eventCounts.andWhere(
          'oc_non_collection_events.date Between :startDate AND :endDate',
          { startDate, endDate }
        );
      }
      if (params?.status) {
        events.andWhere('operations_status.name = :name', {
          name: params?.status,
        });

        eventCounts.andWhere('operations_status.name = :name', {
          name: params?.status,
        });
      }
      if (params?.keyword) {
        events.andWhere(
          `oc_non_collection_events.event_name ILike :eventName`,
          {
            eventName: `%${params?.keyword}%`,
          }
        );

        eventCounts.andWhere(
          `oc_non_collection_events.event_name ILike :eventName`,
          {
            eventName: `%${params?.keyword}%`,
          }
        );
      }
      if (params.sortBy) {
        const orderDirection: any = params.sortOrder || 'DESC';
        if (params.sortBy == 'status') {
          events.addOrderBy('operations_status.name', orderDirection);
        } else if (params.sortBy == 'location') {
          events.addOrderBy('crm_locations.name', orderDirection);
        } else if (params.sortBy == 'event_name') {
          events.addOrderBy(
            'oc_non_collection_events.event_name',
            orderDirection
          );
        } else if (params.sortBy == 'date') {
          events.addOrderBy('oc_non_collection_events.date', orderDirection);
        } else {
          const orderBy = params.sortBy;
          events.addOrderBy(orderBy, orderDirection);
        }
      }
      const data = await events.getRawMany();
      const total_records = await eventCounts.getRawMany();
      return {
        status: SuccessConstants.SUCCESS,
        message: 'Non collection events fetched successfully',
        status_code: HttpStatus.CREATED,
        total_records: total_records?.length,
        data: data,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Non Collection Profile History  findAll >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: any,
    updateNonCollectionProfileDto: UpdateNonCollectionProfileDto,
    req
  ) {
    try {
      const {
        profile_name,
        alternate_name,
        event_category_id,
        event_subcategory_id,
        collection_operation_id,
        owner_id,
        is_active,
      } = updateNonCollectionProfileDto;

      const nonCollectionProfile: any =
        await this.nonCollectionProfilesRepository.findOne({
          where: { id: id },
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'tenant',
            'event_subcategory_id',
            'event_category_id',
          ],
        });

      if (!nonCollectionProfile) {
        resError(
          `Non-Collection profile not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (nonCollectionProfile?.is_archived) {
        resError(
          `Non-Collection profile is archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (event_category_id == BigInt(0)) {
        resError(
          `Invalid event category Id`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (owner_id == BigInt(0)) {
        resError(
          `Invalid owner Id`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (event_category_id) {
        const category = await this.nceCategoryRepository.findOneBy({
          id: event_category_id,
        });

        if (!category) {
          resError(
            `Event category does not exist!`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }
      }

      if (event_subcategory_id) {
        const subCategory = await this.nceCategoryRepository.findOne({
          where: { id: event_subcategory_id },
          relations: ['parent_id'],
        });

        if (!subCategory || (subCategory && !subCategory?.parent_id)) {
          resError(
            `Event subcategory does not exist!`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }

      const businessUnits = await this.businessUnitsRepository.find({
        where: {
          id: In(collection_operation_id),
        },
      });
      if (!businessUnits) {
        resError(
          `Collection operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      nonCollectionProfile.profile_name =
        profile_name ?? nonCollectionProfile.profile_name;
      nonCollectionProfile.alternate_name =
        alternate_name ?? nonCollectionProfile.alternate_name;
      nonCollectionProfile.event_category_id =
        event_category_id ?? nonCollectionProfile?.event_category_id?.id;
      nonCollectionProfile.event_subcategory_id = event_subcategory_id || null;
      nonCollectionProfile.collection_operation_id = businessUnits;
      nonCollectionProfile.owner_id =
        owner_id ?? nonCollectionProfile.owner_id?.id;
      nonCollectionProfile.is_active =
        is_active ?? nonCollectionProfile?.is_active;
      nonCollectionProfile.created_at = new Date();
      nonCollectionProfile.created_by = this?.request?.user;
      const updatedNCP = await this.nonCollectionProfilesRepository.save(
        nonCollectionProfile
      );

      const ncpData = await this.nonCollectionProfilesRepository.findOne({
        where: { id },
        relations: [
          'created_by',
          'collection_operation_id',
          'owner_id',
          'tenant',
          'event_subcategory_id',
          'event_category_id',
        ],
      });

      return resSuccess(
        'Non-Collection profile Updated successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        ncpData
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, req: any) {
    try {
      const nonCollectionProfile: any =
        await this.nonCollectionProfilesRepository.findOne({
          where: { id: id },
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'tenant',
            'event_subcategory_id',
            'event_category_id',
          ],
        });

      if (!nonCollectionProfile) {
        resError(
          `Non-Collection operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (nonCollectionProfile.is_archived) {
        resError(
          `Non-Collection profile is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      nonCollectionProfile.is_archived = true;
      nonCollectionProfile.created_at = new Date();
      nonCollectionProfile.created_by = this?.request?.user;
      const archivedNonCollectionProfile =
        await this.nonCollectionProfilesRepository.save(nonCollectionProfile);

      delete archivedNonCollectionProfile?.created_by;
      return resSuccess(
        'Non-Collection profile archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(nonCollectionProfileInterface: NonCollectionProfileInterface) {
    try {
      const {
        keyword,
        event_subcategory_id,
        event_category_id,
        organizational_levels,
        tenant_id,
        sortBy,
        sortOrder,
        is_active,
        collection_operation_id,
        downloadType,
        exportType,
        tableHeaders,
        selectedOptions,
      } = nonCollectionProfileInterface;
      let { page, limit } = nonCollectionProfileInterface;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;

      let where: any = { is_archived: false, tenant: { id: tenant_id } };

      if (keyword) {
        const trimmedKeyword = keyword.trim();
        where = {
          ...where,
          profile_name: ILike(`%${trimmedKeyword}%`),
        };
      }

      if (event_category_id) {
        where = {
          ...where,
          event_category_id: {
            id: event_category_id,
          },
        };
      }

      if (event_subcategory_id) {
        where = {
          ...where,
          event_subcategory_id: {
            id: event_subcategory_id,
          },
        };
      }

      if (collection_operation_id) {
        const collectionOperationValues = collection_operation_id
          .split(',')
          .map((item) => item.trim());
        if (collectionOperationValues.length > 0) {
          const query = this.nonCollectionProfilesRepository
            .createQueryBuilder('CrmNonCollectionProfiles')
            .leftJoinAndSelect(
              'CrmNonCollectionProfiles.collection_operation_id',
              'collection_operation_id'
            )
            .where(
              'collection_operation_id.id IN (:...collectionOperationValues)',
              {
                collectionOperationValues,
              }
            );
          const result = await query.getRawMany();
          const Ids = result.map((row) => row.CrmNonCollectionProfiles_id);
          where = {
            ...where,
            id: In(Ids),
          };
        }
      }

      if (
        is_active !== undefined &&
        is_active !== '' &&
        is_active !== 'undefined' &&
        is_active.trim()
      ) {
        where = {
          ...where,
          is_active: is_active,
        };
      }

      if (organizational_levels) {
        const { collection_operations, recruiters } = JSON.parse(
          organizational_levels
        );
        const users = await this.userRepository.find({
          where: {
            id: In(recruiters),
            is_active: true,
            is_archived: false,
          },
          relations: ['business_units', 'business_units.business_unit_id'],
        });
        const coIds = [
          // add all the collection operations given in input.
          ...Object.keys(collection_operations),
          // add all the collection operations queried against each recruiter.
          ...[
            ...new Set(
              users.reduce(
                (acc, user) =>
                  acc.concat(
                    user.business_units.map((bu) => bu.business_unit_id?.['id'])
                  ),
                []
              )
            ),
          ],
        ];
        const whereArr = coIds.map((co_id) => ({
          ...where,
          collection_operation_id: { id: co_id },
        }));
        where = whereArr;
      }

      let order: any = { id: 'DESC' };
      const orderDirection = sortOrder || 'DESC';
      if (sortBy == 'event_category_id') {
        order = { event_category_id: { name: orderDirection } };
      } else if (sortBy == 'event_subcategory_id') {
        order = { event_subcategory_id: { name: orderDirection } };
      } else if (sortBy == 'collection_operation_id') {
        order = { collection_operation_id: { name: orderDirection } };
      } else if (sortBy == 'owner_id') {
        order = { owner_id: { first_name: orderDirection } };
      } else {
        const orderBy = sortBy;
        order = { [orderBy]: orderDirection };
      }

      const [response, count] =
        await this.nonCollectionProfilesRepository.findAndCount({
          where,
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'tenant',
            'event_subcategory_id',
            'event_category_id',
          ],
          take: limit,
          skip: (page - 1) * limit,
          order,
        });
      let url: string;
      if (downloadType && exportType) {
        const exportData = await this.nonCollectionProfilesRepository.find({
          ...(exportType.trim() === 'filtered'
            ? { where }
            : {
                where: {
                  is_archived: false,
                  tenant: { id: tenant_id },
                },
              }),
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'tenant',
            'event_subcategory_id',
            'event_category_id',
          ],
          ...(exportType.trim() === 'filtered' && {
            take: limit,
            skip: (page - 1) * limit,
          }),
          order,
        });
        const columnsToFilter = new Set(tableHeaders.split(','));
        const mapDataForExport = (data) => {
          return data.map((item) => ({
            profile_name: item.profile_name || '',
            alternate_name: item.alternate_name || '',
            event_category_id: item.event_category_id?.name || '',
            event_subcategory_id: item.event_subcategory_id?.name || '',
            collection_operation_id:
              item.collection_operation_id
                ?.map((name) => name.name)
                .join(' | ') || '',
            owner_id:
              item.owner_id?.first_name + ' ' + item.owner_id?.last_name || '',
            is_active: item.is_active ? 'Active' : 'Inactive',
          }));
        };
        const filteredData = mapDataForExport(exportData).map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const nameKey =
              key === 'is_active'
                ? 'status'
                : key === 'event_category_id'
                ? 'event_category'
                : key === 'event_subcategory_id'
                ? 'event_subcategory'
                : key === 'collection_operation_id'
                ? 'collection_operation'
                : key === 'owner_id'
                ? 'owner'
                : key;
            const value = obj[key];
            newObj[nameKey] = value;
          });
          return newObj;
        });
        const prefixName = selectedOptions
          ? selectedOptions.trim()
          : 'Non-Collection profile';
        url = await this.exportService.exportDataToS3(
          filteredData,
          nonCollectionProfileInterface,
          prefixName,
          'Non-Collection profile'
        );
      }
      return {
        status: HttpStatus.OK,
        message: 'Non-Collection profile Fetched successfully',
        count: count,
        data: response,
        url,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAll(user: any) {
    try {
      const response = await this.nonCollectionProfilesRepository.find({
        where: {
          is_archived: false,
          tenant: { id: user.tenant.id },
        },
        relations: [
          'created_by',
          'collection_operation_id',
          'owner_id',
          'tenant',
          'event_subcategory_id',
          'event_category_id',
        ],
      });

      return {
        status: HttpStatus.OK,
        message: 'Non-Collection profile Fetched successfully',
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
