import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, In, MoreThan } from 'typeorm';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CrmLocations } from '../entities/crm-locations.entity';
import { CrmLocationsHistory } from '../entities/crm-locations-history';
import {
  GetAllLocationInterface,
  GetDrivesHistoryQuery,
} from '../interface/locations.interface';
import { LocationsDto } from '../dto/locations.dto';
import { ErrorConstants } from '../../../system-configuration/constants/error.constants';
import { CRMVolunteer } from '../../contacts/volunteer/entities/crm-volunteer.entity';
import {
  resError,
  resSuccess,
} from '../../../system-configuration/helpers/response';
import { Address } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { AddressHistory } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/addressHistory.entity';
import { CrmLocationsSpecsHistory } from '../entities/crm-locations-specs-history.entity';
import { CrmLocationsSpecs } from '../entities/crm-locations-specs.entity';
import { CrmLocationsSpecsOptions } from '../entities/crm-locations-specs-options.entity';
import { CrmLocationsSpecsOptionsHistory } from '../entities/crm-locations-specs-options-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { RoomSize } from '../../../system-configuration/tenants-administration/crm-administration/locations/room-sizes/entity/roomsizes.entity';
import { Directions } from '../directions/entities/direction.entity';
import { addressExtractionFilter } from 'src/api/common/services/addressExtraction.service';
import { ExportService } from '../../contacts/common/exportData.service';
import moment from 'moment';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { DonationStatusEnum } from '../../contacts/donor/enum/donors.enum';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { pagination } from 'src/common/utils/pagination';
import { SiteContactAssociations } from '../../contacts/staff/staffContactAssociation/entities/site-contact-associations.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';
import { getRawCount } from 'src/api/common/utils/query';
import { GetAllAccountsInterface } from '../../accounts/interface/accounts.interface';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { CRMLocationsViewList } from '../entities/crm-locations-list-views';
dotenv.config();

@Injectable()
export class LocationsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CrmLocationsSpecs)
    private readonly crmLocationsSpecs: Repository<CrmLocationsSpecs>,
    @InjectRepository(Drives)
    private readonly drivesRepo: Repository<Drives>,
    @InjectRepository(CRMVolunteer)
    private readonly crmVolunteerRepository: Repository<CRMVolunteer>,
    @InjectRepository(CRMLocationsViewList)
    private readonly crmLocationsViewListRepository: Repository<CRMLocationsViewList>,
    @InjectRepository(RoomSize)
    private readonly roomSizeRepository: Repository<RoomSize>,
    @InjectRepository(CrmLocationsSpecsOptions)
    private readonly crmLocationsSpecsoptions: Repository<CrmLocationsSpecsOptions>,
    @InjectRepository(CrmLocationsSpecsHistory)
    private readonly crmLocationsSpecsHistory: Repository<CrmLocationsSpecsHistory>,
    @InjectRepository(CrmLocationsSpecsOptionsHistory)
    private readonly crmLocationsSpecsOptionsHistory: Repository<CrmLocationsSpecsOptionsHistory>,
    @InjectRepository(AddressHistory)
    private readonly addressHistoryRepository: Repository<AddressHistory>,
    @InjectRepository(CrmLocationsHistory)
    private readonly locationsHistoryRepository: Repository<CrmLocationsHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(CrmLocations)
    private readonly locationRepository: Repository<CrmLocations>,
    @InjectRepository(Directions)
    private readonly directionsRepository: Repository<Directions>,
    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(SiteContactAssociations)
    private readonly staffContactAssociationRepository: Repository<SiteContactAssociations>,
    private readonly flaggedOperationService: FlaggedOperationService,
    private readonly entityManager: EntityManager,
    private readonly exportService: ExportService
  ) {}

  async findAll(user: any, params: GetAllLocationInterface) {
    try {
      const {
        fetchAll,
        sortName = 'name',
        sortOrder = 'ASC',
        page,
        limit,
        keyword,
        status,
        site_type,
        qualification_status,
        city,
        state,
        country,
        organizational_levels,
        downloadType,
        exportType,
        county,
      } = params;

      const sortBy = {
        name: 'location.name',
        site_contact_id: 'volunteer.first_name',
        status: 'location.is_active',
        address: 'address.city',
      };

      const query = this.locationRepository
        .createQueryBuilder('location')
        .leftJoin(
          'crm_volunteer',
          'volunteer',
          'volunteer.id = location.site_contact_id AND volunteer.is_archived = false'
        )
        .leftJoin(
          'address',
          'address',
          `location.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'`
        )
        .leftJoin(
          'qualifications',
          'qualification',
          `qualification.location_id = location.id
          AND qualification.qualification_status = true
          AND location.is_archived = false`
        )
        .where({
          is_archived: false,
          tenant: { id: user?.tenant?.id },
        })
        .select([
          'location.*',
          "JSON_BUILD_OBJECT('addressable_type', address.addressable_type, 'address1', address.address1, 'address2', address.address2, 'zip_code', address.zip_code, 'city', address.city, 'state', address.state, 'country', address.country, 'county', address.county, 'coordinates', address.coordinates, 'tenant_id', address.tenant_id) AS address",
          "JSON_BUILD_OBJECT('first_name', volunteer.first_name, 'last_name', volunteer.last_name, 'tenant_id', volunteer.tenant_id) AS site_contact_id",
          "JSON_BUILD_OBJECT('qualification_date', qualification.qualification_date,'qualification_expires', qualification.qualification_expires, 'tenant_id', qualification.tenant_id) AS qulification_id",
        ])
        .orderBy(
          sortBy[sortName] ? sortBy[sortName] : sortName,
          sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
        );

      let exportData = [];
      if (exportType && exportType?.trim() === 'all') {
        exportData = await query.getRawMany();
      }
      if (keyword) {
        query.andWhere(
          '(location.name ILIKE :keyword OR CAST(location.becs_code AS TEXT) ILIKE :numericKeyword)',
          {
            keyword: `%${keyword}%`,
            numericKeyword: `%${keyword}%`,
          }
        );
      }
      if (status) {
        query.andWhere('location.is_active = :status', { status });
      }
      if (site_type === 'inside/outside') {
        query.andWhere("location.site_type = 'Inside / Outside'");
      } else if (site_type) {
        query.andWhere('location.site_type ILIKE :site_type', {
          site_type: site_type,
        });
      }
      if (qualification_status) {
        query.andWhere(
          'location.qualification_status ILIKE :qualification_status',
          { qualification_status }
        );
      }
      if (city) {
        const cities = city.split(',');
        query.andWhere(`address.city ILIKE ANY(:cities)`, {
          cities: cities.map((city) => `%${city.trim()}%`),
        });
      }
      if (county) {
        const counties = county.split(',');
        query.andWhere(`address.county ILIKE ANY(:counties)`, {
          counties: counties.map((county) => `%${county.trim()}%`),
        });
      }
      if (state) {
        const states = state.split(',');
        query.andWhere(`address.state ILIKE ANY(:states)`, {
          states: states.map((state) => `%${state.trim()}%`),
        });
      }
      if (country) {
        query.andWhere('address.country ILIKE :country', {
          country: `%${country}%`,
        });
      }
      if (organizational_levels) {
        query
          .leftJoin(
            'drives',
            'drive',
            'drive.location_id = location.id AND drive.is_archived = false'
          )
          .leftJoin(
            'accounts',
            'acc',
            'acc.id = drive.account_id AND acc.is_archived = false'
          )
          .addSelect(['acc.collection_operation', 'drive.recruiter_id'])
          .andWhere(
            organizationalLevelWhere(
              organizational_levels,
              'acc.collection_operation',
              'drive.recruiter_id'
            )
          );
      }
      if (exportType && exportType?.trim() !== 'all') {
        exportData = await query.getRawMany();
      }

      const count = await getRawCount(this.entityManager, query);

      if (page && limit && fetchAll?.toString() !== 'true') {
        const { skip, take } = pagination(page, limit);
        query.limit(take).offset(skip);
      }

      const result = await query.getRawMany();

      let url: string;
      if (exportType && downloadType) {
        const newArray = exportData.map((item) => {
          const address = item.address;
          const addressString = `${address.address1} ${address.address2}, ${address.city}, ${address.state}, ${address.country}`;
          const siteContact = item.site_contact_id;
          const siteContactName = `${siteContact.first_name} ${siteContact.last_name}`;
          let tenantInfo;
          if (typeof item.tenant_id === 'string') {
            tenantInfo = item.tenant_id ?? null;
          } else {
            tenantInfo = item.tenant_id?.id ?? null;
          }
          return {
            id: item.id,
            created_at: moment(item.created_at).format('MM/DD/YYYY hh:mm A'),
            is_archived: item.is_archived,
            name: item.name,
            cross_street: item.cross_street,
            floor: item.floor,
            room: item.room,
            room_phone: item.room_phone,
            becs_code: item.becs_code,
            site_type: item.site_type,
            qualification_status: item.qualification_status,
            is_active: item.is_active,
            site_contact: siteContactName,
            tenant_id: tenantInfo,
            address: addressString,
          };
        });
        const prefixName = params?.selectedOptions
          ? params?.selectedOptions.trim()
          : 'Locations';
        url = await this.exportService.exportDataToS3(
          newArray,
          params,
          prefixName,
          'Locations'
        );
      }

      result.forEach((item) => {
        let allQualicationNull = true,
          allSiteContactNull = true;
        for (const key in item.qulification_id) {
          if (
            item.qulification_id.hasOwnProperty(key) &&
            item.qulification_id[key] !== null
          ) {
            allQualicationNull = false;
            break;
          }
        }

        for (const key in item.site_contact_id) {
          if (
            item.site_contact_id.hasOwnProperty(key) &&
            item.site_contact_id[key] !== null
          ) {
            allSiteContactNull = false;
            break;
          }
        }
        if (allQualicationNull) {
          item.qulification_id = null;
        }

        if (allSiteContactNull) {
          item.site_contact_id = null;
        }
      });

      return {
        status: HttpStatus.OK,
        response: 'CrmLocations Fetched',
        count: count,
        data: result,
        url,
      };
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllNew(user: any, params: GetAllLocationInterface) {
    try {
      const {
        fetchAll,
        sortName = 'name',
        sortOrder = 'ASC',
        page,
        limit,
        keyword,
        status,
        site_type,
        qualification_status,
        city,
        state,
        country,
        organizational_levels,
        downloadType,
        exportType,
        county,
        account,
      } = params;

      const sortBy = {
        name: 'crm_locations_lists_view.name',
        site_contact_id:
          "crm_locations_lists_view.site_contact_info->>'first_name'",
        status: 'crm_locations_lists_view.is_active',
        address: "crm_locations_lists_view.address->>'city'",
      };

      const query = this.crmLocationsViewListRepository
        .createQueryBuilder('crm_locations_lists_view')
        .where({
          tenant_id: user?.tenant?.id,
        })
        .distinct(true)
        .select([
          'crm_locations_lists_view.id AS id',
          'crm_locations_lists_view.created_at AS created_at',
          'crm_locations_lists_view.is_archived AS is_archived',
          'crm_locations_lists_view.name AS name',
          'crm_locations_lists_view.cross_street AS cross_street',
          'crm_locations_lists_view.floor AS floor',
          'crm_locations_lists_view.room AS room',
          'crm_locations_lists_view.room_phone AS room_phone',
          'crm_locations_lists_view.becs_code AS becs_code',
          'crm_locations_lists_view.site_type AS site_type',
          'crm_locations_lists_view.qualification_status AS qualification_status',
          'crm_locations_lists_view.is_active AS is_active',
          'crm_locations_lists_view.created_by AS created_by',
          'crm_locations_lists_view.tenant_id AS tenant_id',
          'crm_locations_lists_view.qualification_id AS qualification_id',
          'crm_locations_lists_view.qulification_id AS qulification_id',
          'crm_locations_lists_view.address_id AS address_id',
          'crm_locations_lists_view.address AS address',
          'crm_locations_lists_view.site_contact_info AS site_contact_id',
          `(${sortBy[sortName] ? sortBy[sortName] : sortName}) AS orderColumn`,
        ])
        .orderBy(
          'orderColumn',
          sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
        );

      let exportData = [];
      if (exportType && exportType?.trim() === 'all') {
        exportData = await query.getRawMany();
      }
      if (keyword) {
        query.andWhere(
          '(crm_locations_lists_view.name ILIKE :keyword OR CAST(crm_locations_lists_view.becs_code AS TEXT) ILIKE :numericKeyword)',
          {
            keyword: `%${keyword}%`,
            numericKeyword: `%${keyword}%`,
          }
        );
      }
      if (status) {
        query.andWhere('crm_locations_lists_view.is_active = :status', {
          status,
        });
      }
      if (site_type === 'inside/outside') {
        query.andWhere(
          "crm_locations_lists_view.site_type = 'Inside / Outside'"
        );
      } else if (site_type) {
        query.andWhere('crm_locations_lists_view.site_type ILIKE :site_type', {
          site_type: site_type,
        });
      }
      if (qualification_status) {
        query.andWhere(
          'LOWER(crm_locations_lists_view.qualification_status) ILIKE :qualification_status',
          { qualification_status }
        );
      }
      if (city) {
        const cities = city.split(',');
        const conditions = cities.map(
          (city) => `address->>'city' ILIKE '%${city.trim()}%'`
        );
        query.andWhere(`(${conditions.join(' OR ')})`);
      }
      if (county) {
        const counties = county.split(',');
        const conditions = counties.map(
          (county) => `address->>'county' ILIKE '%${county.trim()}%'`
        );
        query.andWhere(`(${conditions.join(' OR ')})`);
      }

      if (state) {
        const states = state.split(',');
        const conditions = states.map(
          (state) => `address->>'state' ILIKE '%${state.trim()}%'`
        );
        query.andWhere(`(${conditions.join(' OR ')})`);
      }

      if (country) {
        const countries = country.split(',');
        const conditions = countries.map(
          (country) => `address->>'country' ILIKE '%${country.trim()}%'`
        );
        query.andWhere(`(${conditions.join(' OR ')})`);
      }

      if (account) {
        query.andWhere('crm_locations_lists_view.account_id = :accountId', {
          accountId: account,
        });
      }

      if (organizational_levels) {
        query.andWhere(
          organizationalLevelWhere(
            organizational_levels,
            'crm_locations_lists_view.collection_operation',
            'crm_locations_lists_view.recruiter'
          )
        );
      }

      if (exportType && exportType?.trim() !== 'all') {
        exportData = await query.getRawMany();
      }

      const count = await getRawCount(this.entityManager, query);

      if (page && limit && fetchAll?.toString() !== 'true') {
        const { skip, take } = pagination(page, limit);
        query.limit(take).offset(skip);
      }

      const result = await query.getRawMany();

      let url: string;
      if (exportType && downloadType) {
        const newArray = exportData.map((item) => {
          const address = item.address;
          const addressString = `${address.address1} ${address.address2}, ${address.city}, ${address.state}, ${address.country}`;
          const siteContact = item.site_contact_id;
          const siteContactName = `${siteContact?.first_name} ${siteContact?.last_name}`;
          let tenantInfo;
          if (typeof item.tenant_id === 'string') {
            tenantInfo = item.tenant_id ?? null;
          } else {
            tenantInfo = item.tenant_id?.id ?? null;
          }
          return {
            id: item.id,
            created_at: moment(item.created_at).format('MM/DD/YYYY hh:mm A'),
            is_archived: item.is_archived,
            name: item.name,
            cross_street: item.cross_street,
            floor: item.floor,
            room: item.room,
            room_phone: item.room_phone,
            becs_code: item.becs_code,
            site_type: item.site_type,
            qualification_status: item.qualification_status,
            is_active: item.is_active,
            site_contact: siteContactName,
            tenant_id: tenantInfo,
            address: addressString,
          };
        });
        const prefixName = params?.selectedOptions
          ? params?.selectedOptions.trim()
          : 'Locations';
        url = await this.exportService.exportDataToS3(
          newArray,
          params,
          prefixName,
          'Locations'
        );
      }

      result.forEach((item) => {
        let allQualicationNull = true,
          allSiteContactNull = true;
        for (const key in item.qulification_id) {
          if (
            item.qulification_id.hasOwnProperty(key) &&
            item.qulification_id[key] !== null
          ) {
            allQualicationNull = false;
            break;
          }
        }

        for (const key in item.site_contact_id) {
          if (
            item.site_contact_id.hasOwnProperty(key) &&
            item.site_contact_id[key] !== null
          ) {
            allSiteContactNull = false;
            break;
          }
        }
        if (allQualicationNull) {
          item.qulification_id = null;
        }

        if (allSiteContactNull) {
          item.site_contact_id = null;
        }
      });

      return {
        status: HttpStatus.OK,
        response: 'CrmLocations Fetched',
        count: count,
        data: result,
        url,
      };
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  /**
   * @deprecated
   */
  async findAllFilters(user: any, params: GetAllLocationInterface) {
    try {
      console.log('hello inside');
      const userId = user?.tenant?.id;
      const fetchAll =
        params?.fetchAll === true || params?.fetchAll?.toString() === 'true';
      const sortName = params?.sortName;
      const sortBy = params?.sortOrder;
      const keyword = params?.keyword;
      const downloadAll = params?.downloadType;
      if ((sortName && !sortBy) || (sortBy && !sortName)) {
        return resError(
          `When selecting sort SortBy & SortName is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const sorting = {};
      if (sortName && sortBy) {
        if (sortName === 'recruiter') {
          sorting[sortName] = {
            first_name: sortBy.toUpperCase() as 'ASC' | 'DESC',
          };
        } else if (
          sortName === 'collection_operation' ||
          sortName === 'industry_category' ||
          sortName === 'industry_subcategory'
        ) {
          sorting[sortName] = {
            name: sortBy.toUpperCase() as 'ASC' | 'DESC',
          };
        } else {
          sorting[sortName] = sortBy.toUpperCase() as 'ASC' | 'DESC';
        }
      } else {
        sorting['id'] = 'DESC';
      }
      let response: any = [];
      let count: any = 0;
      let exportData: any = [];
      const limit: number = params?.limit
        ? +params.limit
        : +process.env.PAGE_SIZE;
      const page = params?.page ? +params.page : 1;
      let sample: any = 0;

      if (fetchAll) {
        const query = `
              SELECT crm_locations.*, address.*
                  FROM crm_locations
                  INNER JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
                  LEFT JOIN crm_volunteer AS volunteer ON crm_locations.site_contact_id = volunteer.id
                  WHERE crm_locations.is_archived = false
                  AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
                  AND crm_locations.tenant_id = ${userId}
              `;
        response = await this.locationRepository.query(query);

        sample = await this.locationRepository.findAndCount({
          where: {
            is_archived: false,
          },
        });
        count = sample?.length;
      } else {
        if (sortName && sortBy && keyword) {
          const pagination = `LIMIT ${limit} 
          OFFSET ${(page - 1) * limit}`;
          let sortSite = '';
          if (sortName === 'site_contact_id') {
            sortSite = `crm_locations.site_contact_id.first_name ${sortBy}`;
          } else {
            if (sortName == 'status') {
              sortSite = `is_active ${sortBy}`;
            } else if (sortName == 'address') {
              sortSite = `address.city ${sortBy}`;
            } else {
              sortSite = `${sortName} ${sortBy}`;
            }
          }
          const query = `
              SELECT crm_locations.*, (
                SELECT JSON_BUILD_OBJECT(
                    'addressable_type', address.addressable_type,
                    'address1', address.address1,
                    'address2', address.address2,
                    'zip_code', address.zip_code,
                    'city', address.city,
                    'state', address.state,
                    'country', address.country,
                    'county', address.county,
                    'coordinates', address.coordinates
                )
                FROM address
                WHERE crm_locations.id = address.addressable_id
                AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
                LIMIT 1
            ) AS address,
            (
              SELECT JSON_BUILD_OBJECT(
                  'first_name', crm_volunteer.first_name,
                  'last_name', crm_volunteer.last_name
              )
              FROM crm_volunteer
              WHERE crm_volunteer.id = crm_locations.site_contact_id
              LIMIT 1
          ) AS site_contact_id,
          (SELECT JSON_BUILD_OBJECT(
                  'qualification_status', crm_locations.qualification_status
              )
            FROM crm_locations
          WHERE crm_locations.is_archived = false
          AND crm_locations.tenant_id = ${userId}
          ) AS qualification_statuss,
          (SELECT JSON_BUILD_OBJECT(
                  'qualification_date', qualification.qualification_date,
                  'qualification_expires', qualification.qualification_expires,
              )
            FROM crm_locations, qualifications
          WHERE qualifications.location_id = crm_locations.id
          AND qualifications.qualification_status = true
          AND crm_locations.is_archived = false
          AND crm_locations.tenant_id = ${userId}
          ) AS qualification
        `;
          const whereConditions = [
            `(
                (crm_locations.name ILIKE '%${keyword}%' OR crm_locations.room ILIKE '%${keyword}%'  OR CAST(crm_locations.becs_code AS VARCHAR) ILIKE '%${keyword}%')
                )`,
          ];
          if (params?.status) {
            whereConditions.push(`crm_locations.is_active = ${params.status}`);
          }

          if (params?.site_type) {
            whereConditions.push(
              `crm_locations.site_type ILIKE '%${params.site_type}%'`
            );
          }

          if (params?.site_type === 'inside/outside') {
            whereConditions.push(
              `crm_locations.site_type = 'Inside / Outside'`
            );
          }
          const qualificationCondition =
            this.generateQualificationStatusCondition(params);
          if (qualificationCondition) {
            whereConditions.push(qualificationCondition);
          }
          let driveSubquery = '';
          if (params.account) {
            driveSubquery = `
                    SELECT location_id
                    FROM drives
                    WHERE account_id = ${params.account}
                  `;
          }
          const whereClause =
            whereConditions.length > 0
              ? `AND (${whereConditions.join(' AND ')})
              ${
                params.account
                  ? `AND crm_locations.id IN (${driveSubquery})`
                  : ''
              }`
              : '';

          const completeQuery = `
              ${query}
              ${whereClause}
              ORDER BY ${sortSite}
              ${pagination};
            `;
          const countQuery = `
            SELECT crm_locations.*, (
              SELECT JSON_BUILD_OBJECT(
                  'addressable_type', address.addressable_type,
                  'address1', address.address1,
                  'address2', address.address2,
                  'zip_code', address.zip_code,
                  'city', address.city,
                  'state', address.state,
                  'country', address.country,
                  'county', address.county,
                  'coordinates', address.coordinates
              )
              FROM address
              WHERE crm_locations.id = address.addressable_id
              AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
              LIMIT 1
          ) AS address,
          (
            SELECT JSON_BUILD_OBJECT(
                'first_name', crm_volunteer.first_name,
                'last_name', crm_volunteer.last_name
            )
            FROM crm_volunteer
            WHERE crm_volunteer.id = crm_locations.site_contact_id
            LIMIT 1
        ) AS site_contact_id
        FROM crm_locations
        INNER JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
        WHERE crm_locations.is_archived = false
        AND crm_locations.tenant_id = ${userId}
        AND crm_locations.name ILIKE '%${keyword}%'
        OR crm_locations.room ILIKE '%${keyword}%'
        OR CAST(crm_locations.becs_code AS VARCHAR) ILIKE '%${keyword}%'
            AND crm_locations.tenant_id = ${userId}
            ORDER BY ${sortSite};
            `;
          if (downloadAll) {
            const completeQueryExport = `
              ${query}
              ${params?.exportType === 'all' ? '' : whereClause}
              ORDER BY ${sortSite};`;
            exportData = await this.locationRepository.query(
              completeQueryExport
            );
          }
          response = await this.locationRepository.query(completeQuery);
          const countQueryRecord = await this.locationRepository.query(
            countQuery
          );
          count = countQueryRecord?.length || 0;
        } else if (sortName && sortBy && !keyword) {
          const pagination = `LIMIT ${limit} 
            OFFSET ${(page - 1) * limit}`;
          let sortSite = '';
          if (sortName === 'site_contact_id') {
            sortSite = `(
          SELECT JSON_BUILD_OBJECT(
              'first_name', crm_volunteer.first_name,
              'last_name', crm_volunteer.last_name
          )
          FROM crm_volunteer
          WHERE crm_volunteer.id = crm_locations.site_contact_id
          LIMIT 1
      ) ->> 'first_name' ${sortBy}`;
          } else {
            if (sortName == 'status') {
              sortSite = `is_active ${sortBy}`;
            } else if (sortName == 'address') {
              sortSite = `address.city ${sortBy}`;
            } else {
              sortSite = `${sortName} ${sortBy}`;
            }
          }
          const query = `
            SELECT crm_locations.*,
            (
                SELECT JSON_BUILD_OBJECT(
                    'addressable_type', address.addressable_type,
                    'address1', address.address1,
                    'address2', address.address2,
                    'zip_code', address.zip_code,
                    'city', address.city,
                    'state', address.state,
                    'country', address.country,
                    'county', address.county,
                    'coordinates', address.coordinates
                )
                FROM address
                WHERE crm_locations.id = address.addressable_id
                AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
                LIMIT 1
            ) AS address,
              (
              SELECT JSON_BUILD_OBJECT(
                  'first_name', crm_volunteer.first_name,
                  'last_name', crm_volunteer.last_name
              ) 
              FROM crm_volunteer
              WHERE crm_volunteer.id = crm_locations.site_contact_id
              LIMIT 1
          ) AS site_contact_id,
          COALESCE(
            (SELECT CASE
              WHEN QUALIFICATION_EXPIRES IS NULL
              AND QUALIFICATION_DATE IS NOT NULL THEN 'Qualified'
              WHEN QUALIFICATION_EXPIRES > CURRENT_TIMESTAMP THEN 'Qualified'
              WHEN QUALIFICATION_EXPIRES < CURRENT_TIMESTAMP THEN 'Expired'
              ELSE 'Not Qualified'
              END AS QUALIFICATION_STATUSS
              FROM QUALIFICATIONS
              WHERE QUALIFICATIONS.LOCATION_ID = CRM_LOCATIONS.ID
              ORDER BY ID DESC
              LIMIT 1), 'Not Qualified') AS QUALIFICATION_STATUSS
          FROM crm_locations
          INNER JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
          WHERE crm_locations.is_archived = false
          AND crm_locations.tenant_id = ${userId}`;
          const whereConditions = [];
          if (params?.status) {
            whereConditions.push(`crm_locations.is_active = ${params.status}`);
          }

          if (params?.site_type) {
            whereConditions.push(
              `crm_locations.site_type ILIKE '%${params.site_type}%'`
            );
          }

          if (params?.site_type === 'inside/outside') {
            whereConditions.push(
              `crm_locations.site_type = 'Inside / Outside'`
            );
          }
          const qualificationCondition =
            this.generateQualificationStatusCondition(params);
          if (qualificationCondition) {
            whereConditions.push(qualificationCondition);
          }
          let driveSubquery = '';
          if (params.account) {
            driveSubquery = `
                            SELECT location_id
                            FROM drives
                            WHERE account_id = ${params.account}
                          `;
          }
          const whereClause =
            whereConditions.length > 0
              ? `AND ${whereConditions.join(' AND ')} 
                ${
                  params.account
                    ? `AND crm_locations.id IN (${driveSubquery})`
                    : ''
                }`
              : '';

          const completeQuery = `
              ${query}
              ${whereClause}
              ORDER BY ${sortSite}
              ${pagination};
            `;
          const countQuery = `
            SELECT crm_locations.*,
            (
                SELECT JSON_BUILD_OBJECT(
                    'addressable_type', address.addressable_type,
                    'address1', address.address1,
                    'address2', address.address2,
                    'zip_code', address.zip_code,
                    'city', address.city,
                    'state', address.state,
                    'country', address.country,
                    'county', address.county,
                    'coordinates', address.coordinates
                )
                FROM address
                WHERE crm_locations.id = address.addressable_id
                AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
                LIMIT 1
            ) AS address,
              (
              SELECT JSON_BUILD_OBJECT(
                  'first_name', crm_volunteer.first_name,
                  'last_name', crm_volunteer.last_name
              ) 
              FROM crm_volunteer
              WHERE crm_volunteer.id = crm_locations.site_contact_id
              LIMIT 1
          ) AS site_contact_id
          FROM crm_locations
          INNER JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
          WHERE crm_locations.is_archived = false
          AND crm_locations.tenant_id = ${userId}
          ORDER BY ${sortSite};`;
          if (downloadAll) {
            const completeQueryExport = `
          ${query}
          ${params?.exportType === 'all' ? '' : whereClause}
          ORDER BY ${sortSite};`;
            exportData = await this.locationRepository.query(
              completeQueryExport
            );
          }
          response = await this.locationRepository.query(completeQuery);

          const countQueryRecord = await this.locationRepository.query(
            countQuery
          );
          count = countQueryRecord?.length || 0;
        }
      }
      let url;
      if (params?.exportType && params.downloadType && exportData?.length > 0) {
        const newArray = exportData.map((item) => {
          const address = item.address;
          const addressString = `${address?.address1} ${address?.address2}, ${address?.city}, ${address?.state}, ${address?.country}`;
          const siteContact = item.site_contact_id;
          const siteContactName =
            `${siteContact?.first_name} ${siteContact?.last_name}` ?? '';
          return {
            name: item.name,
            cross_street: item.cross_street,
            floor: item.floor,
            room: item.room,
            room_phone: item.room_phone,
            becs_code: item.becs_code,
            site_type: item.site_type,
            qualification_status: item.qualification_statuss,
            status: item.is_active ? 'Active' : 'Inactive',
            site_contact: siteContactName,
            address: addressString,
          };
        });
        const columnsToFilter = new Set(params?.tableHeaders.split(','));
        const filteredData = newArray?.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const keys =
              key === 'site_contact_id'
                ? 'site_contact'
                : key === 'is_active'
                ? 'status'
                : key === 'qualification_statuss'
                ? 'qualification_status'
                : key;
            const value =
              typeof obj[keys] === 'string'
                ? obj[keys]?.replace(/,/g, '')
                : obj[keys];
            newObj[keys] = value;
          });

          return newObj;
        });
        const prefixName = params?.selectedOptions
          ? params?.selectedOptions.trim()
          : 'Locations';
        url = await this.exportService.exportDataToS3(
          filteredData,
          params,
          prefixName,
          'Locations'
        );
      }
      return {
        status: HttpStatus.OK,
        response: 'CrmLocations Fetched',
        count: count,
        data: response,
        url,
      };
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllWithDirections(user: any, queryParams) {
    try {
      console.log('collectionssss', queryParams);
      const response = await this.locationRepository.find({
        relations: ['directions'],
        where: {
          tenant: { id: user?.tenant?.id },
          is_archived: false,
          is_active: true,
          directions: {
            miles: MoreThan(0),
            minutes: MoreThan(0),
            collection_operation_id: {
              id: queryParams?.collection_operation_id,
            },
            is_archived: false,
            is_active: true,
          },
        },
        order: { name: 'ASC' },
      });
      return {
        status: HttpStatus.OK,
        response: 'CrmLocations Fetched',
        data: response,
      };
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async create(user: any, createLocationDto: LocationsDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const existing = await this.locationRepository.findOne({
        where: {
          name: createLocationDto?.name,
          is_archived: false,
        },
        relations: ['created_by', 'tenant'],
      });
      if (existing)
        return resError(
          'Location already available!',
          ErrorConstants.Error,
          404
        );
      const userId = user?.id;

      const userData = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      const findVolunteer = await this.crmVolunteerRepository.findOne({
        where: {
          id: createLocationDto?.site_contact_id,
        },
      });
      const location = new CrmLocations();
      location.name = createLocationDto?.name;
      location.floor = createLocationDto?.floor;
      location.room = createLocationDto?.room;
      location.room_phone = createLocationDto?.room_phone;
      location.site_contact_id = createLocationDto?.site_contact_id
        ? findVolunteer
        : null;
      location.becs_code = createLocationDto?.becs_code;
      location.site_type = createLocationDto?.site_type;
      location.is_active = createLocationDto?.is_active;
      location.is_archived = createLocationDto?.is_archived;
      location.qualification_status = 'Not Qualified';
      location.cross_street = createLocationDto?.cross_street;
      location.created_by = userData ?? userData;
      location.tenant_id = user?.tenant;
      location.is_active = createLocationDto?.is_active ?? true;
      const savedLocation: CrmLocations = await queryRunner.manager.save(
        location
      );

      if (location.site_contact_id) {
        const siteContactAssociation = new SiteContactAssociations();
        siteContactAssociation.location_id = savedLocation;
        siteContactAssociation.volunteer_id = findVolunteer;
        siteContactAssociation.created_by = userId;
        await queryRunner.manager.save(siteContactAssociation);
      }

      const locationsCustomFieds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        savedLocation,
        this.request.user?.id,
        this.request.user?.tenant,
        createLocationDto,
        locationsCustomFieds
      );
      const findRoom = await this.roomSizeRepository.findOne({
        where: {
          id: createLocationDto?.room_size_id,
        },
      });
      const locationsSpecs = new CrmLocationsSpecs();
      locationsSpecs.location_id = savedLocation;
      locationsSpecs.room_size_id = findRoom;
      locationsSpecs.elevator = createLocationDto?.elevator;
      locationsSpecs.outside_stairs = createLocationDto?.outside_stairs ?? null;
      locationsSpecs.inside_stairs = createLocationDto?.inside_stairs ?? null;
      locationsSpecs.electrical_note =
        createLocationDto?.electrical_note ?? null;
      locationsSpecs.special_instructions =
        createLocationDto?.special_instructions ?? null;
      locationsSpecs.created_by = userId;
      locationsSpecs.tenant_id = user?.tenant;
      const savedLocationsSpecs = await queryRunner.manager.save(
        locationsSpecs
      );
      let savedcrmLocationSpecOptions;

      if (
        createLocationDto?.specsData &&
        createLocationDto?.specsData?.length
      ) {
        const locationoptionsArray: any = [];
        const locationsData: any = createLocationDto?.specsData.map(
          (item, index) => {
            const LocationOptions = new CrmLocationsSpecsOptions();
            LocationOptions.location_specs_id = savedLocationsSpecs;
            for (const key in item) {
              if (item.hasOwnProperty(key)) {
                const value = item[key];
                LocationOptions.specs_key = key;
                LocationOptions.specs_value = value;
              }
            }
            LocationOptions.created_by = userId;
            LocationOptions.tenant_id = user?.tenant;
            locationoptionsArray.push(LocationOptions);

            return LocationOptions;
          }
        );
        savedcrmLocationSpecOptions = await queryRunner.manager.save(
          CrmLocationsSpecsOptions,
          locationsData
        );
      } else {
        return resError(
          'data not saved invalid specsData',
          ErrorConstants.Error,
          400
        );
      }
      const address = new Address();
      if (createLocationDto?.address?.coordinates) {
        if (
          createLocationDto?.address?.coordinates?.latitude &&
          createLocationDto?.address?.coordinates?.longitude
        ) {
          address.coordinates = `(${createLocationDto?.address?.coordinates?.latitude}, ${createLocationDto?.address?.coordinates?.longitude})`;
        } else {
          return resError('Invalid Address', ErrorConstants.Error, 400);
        }
      }
      address.city = createLocationDto?.address?.city;
      address.state = createLocationDto?.address?.state;
      address.zip_code = createLocationDto?.address?.zip_code;
      address.country = createLocationDto?.address?.country;
      address.address1 = createLocationDto?.address?.address1;
      address.address2 = createLocationDto?.address?.address2;
      address.county = createLocationDto?.address?.county;
      address.addressable_type = PolymorphicType.CRM_LOCATIONS;
      address.addressable_id = savedLocation.id;
      address.created_by = userData.id;
      address.tenant_id = user?.tenant?.id;

      const savedAddress: Address = await queryRunner.manager.save(address);

      if (
        savedAddress &&
        savedLocation &&
        savedLocationsSpecs &&
        savedcrmLocationSpecOptions
      ) {
        await queryRunner.commitTransaction();

        return resSuccess(
          'Account Created.',
          SuccessConstants.SUCCESS,
          HttpStatus.CREATED,
          {
            tenant_id: this.request.user?.tenant?.id,
          }
        );
      } else {
        return resError('data not saved', ErrorConstants.Error, 400);
      }
    } catch (error) {
      console.log({ error });
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, user: any, createLocationDto: LocationsDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const existing = await this.locationRepository.findOne({
        where: {
          id,
        },
        relations: ['site_contact_id'],
      });

      if (!existing) {
        return resError('no data against this id', ErrorConstants.Error, 400);
      }

      const userId = user?.id;

      if (
        createLocationDto.site_contact_id &&
        (!existing?.site_contact_id ||
          existing?.site_contact_id?.id.toString() !==
            createLocationDto.site_contact_id.toString())
      ) {
        const existingSiteContactAssociation =
          await this.staffContactAssociationRepository.findOne({
            where: {
              location_id: { id: id },
              closeout_date: null,
            },
            relations: ['location_id'],
          });

        if (existingSiteContactAssociation) {
          await this.staffContactAssociationRepository.update(
            { id: existingSiteContactAssociation.id },
            { closeout_date: new Date() }
          );
        }

        await this.staffContactAssociationRepository.save({
          location_id: id,
          volunteer_id: { id: createLocationDto.site_contact_id },
          start_date: new Date(),
          created_by: userId,
        });
      }

      const nameAlreadyExist: CrmLocations =
        await this.locationRepository.findOne({
          where: {
            name: createLocationDto?.name,
          },
        });

      if (nameAlreadyExist?.id && nameAlreadyExist?.id !== id) {
        return resError('name already exist', ErrorConstants.Error, 400);
      }

      const existingCrmLocation: CrmLocations =
        await this.locationRepository.findOne({
          where: {
            id,
          },
          relations: ['site_contact_id'],
        });

      const locationCustomFieds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        existingCrmLocation,
        user,
        user.tenant,
        createLocationDto,
        locationCustomFieds
      );
      await queryRunner.commitTransaction();
      const locationBeforeUpdate = { ...existingCrmLocation };
      const findVolunteer = await this.crmVolunteerRepository.findOneBy({
        id: createLocationDto?.site_contact_id,
      });
      existingCrmLocation.name =
        createLocationDto?.name ?? existingCrmLocation.name;
      existingCrmLocation.floor =
        createLocationDto?.floor ?? existingCrmLocation.floor;
      existingCrmLocation.room =
        createLocationDto?.room ?? existingCrmLocation.room;
      existingCrmLocation.room_phone =
        createLocationDto?.room_phone ?? existingCrmLocation.room_phone;
      existingCrmLocation.site_contact_id = createLocationDto?.site_contact_id
        ? findVolunteer
        : null;
      existingCrmLocation.becs_code =
        createLocationDto?.becs_code ?? existingCrmLocation.becs_code;
      existingCrmLocation.site_type =
        createLocationDto?.site_type ?? existingCrmLocation.site_type;
      existingCrmLocation.cross_street =
        createLocationDto?.cross_street ?? existingCrmLocation.cross_street;
      existingCrmLocation.is_active =
        createLocationDto?.is_active ?? existingCrmLocation.is_active;
      existingCrmLocation.is_archived =
        createLocationDto?.is_archived ?? existingCrmLocation.is_archived;
      existingCrmLocation.qualification_status =
        createLocationDto?.qualification_status ??
        existingCrmLocation.qualification_status;
      existingCrmLocation.tenant_id =
        user?.tenant?.id ?? existingCrmLocation.tenant_id;
      existingCrmLocation.is_active = createLocationDto.hasOwnProperty(
        'is_active'
      )
        ? createLocationDto?.is_active
        : existingCrmLocation?.is_active;

      const savedLocation = await this.locationRepository.update(
        { id },
        {
          ...existingCrmLocation,
          created_by: this.request?.user,
          created_at: new Date(),
        }
      );

      this.flaggedOperationService.flaggedOperationLocationChange(
        id,
        user?.tenant?.id
      );

      let existingSpecLocation: CrmLocationsSpecs =
        await this.crmLocationsSpecs.findOne({
          relations: ['location_id', 'created_by', 'room_size_id'],
          where: {
            location_id: {
              id,
            },
          },
        });

      if (!existingSpecLocation) {
        existingSpecLocation = new CrmLocationsSpecs();
        existingSpecLocation.location_id = id;
        existingSpecLocation.created_by = this.request.user?.tenant?.id;
      }

      const specLocationBeforeUpdate = { ...existingSpecLocation };
      const findRoom = await this.roomSizeRepository.findOne({
        where: {
          id: createLocationDto?.room_size_id,
        },
      });
      existingSpecLocation.room_size_id = findRoom;
      existingSpecLocation.elevator =
        createLocationDto?.elevator ?? existingSpecLocation.elevator;
      existingSpecLocation.outside_stairs =
        createLocationDto?.outside_stairs !== undefined
          ? createLocationDto.outside_stairs
          : existingSpecLocation.outside_stairs;

      existingSpecLocation.inside_stairs =
        createLocationDto?.inside_stairs !== undefined
          ? createLocationDto.inside_stairs
          : existingSpecLocation.inside_stairs;

      existingSpecLocation.electrical_note =
        createLocationDto?.electrical_note !== undefined
          ? createLocationDto.electrical_note
          : existingSpecLocation.electrical_note;

      existingSpecLocation.special_instructions =
        createLocationDto?.special_instructions !== undefined
          ? createLocationDto.special_instructions
          : existingSpecLocation.special_instructions;
      existingSpecLocation.tenant_id =
        user?.tenant ?? existingSpecLocation.tenant_id;

      let savedSpecLocation = null;
      if (existingSpecLocation.id) {
        savedSpecLocation = await this.crmLocationsSpecs.update(
          { location_id: id },
          {
            ...existingSpecLocation,
            created_by: this.request?.user,
            created_at: new Date(),
          }
        );
      } else {
        savedSpecLocation = await this.entityManager.save(existingSpecLocation);
      }

      const findExistingSpecOptionLocation: any =
        await this.crmLocationsSpecsoptions.find({
          relations: ['location_specs_id', 'created_by', 'tenant'],
          where: {
            location_specs_id: {
              id: existingSpecLocation.id,
            },
          },
        });

      if (!createLocationDto?.specsData?.length) {
        return resError(
          'Spec options cannot be empty',
          ErrorConstants.Error,
          400
        );
      }

      const specOptionIds = findExistingSpecOptionLocation.map(
        (item: any) => item.id
      );
      // const specsOptionsCreated_by = findExistingSpecOptionLocation.map(
      //   (item: any) => item.created_by
      // );
      // const specsOptionsTenant_id = findExistingSpecOptionLocation.map(
      //   (item: any) => item.tenanat_id
      // );
      const removeOldSpecOptions = await this.crmLocationsSpecsoptions.delete({
        id: In(specOptionIds),
      });
      const arrModified: any = createLocationDto?.specsData.map((obj) => {
        const key = Object.keys(obj)[0];
        const value = obj[key];

        return {
          specs_key: key,
          specs_value: value,
          created_by: findExistingSpecOptionLocation[0]?.created_by,
          location_specs_id: existingSpecLocation.id,
          created_at: findExistingSpecOptionLocation[0]?.created_at,
          tenant_id:
            findExistingSpecOptionLocation[0]?.tenant_id?.id ??
            user?.tenant?.id,
        };
      });
      let savedcrmLocationSpecOptions: any;
      for (const obj of arrModified) {
        savedcrmLocationSpecOptions = await this.crmLocationsSpecsoptions.save({
          ...obj,
          created_by: this.request?.user,
          created_at: new Date(),
        });
      }

      let existingAddress: any = await this.addressRepository.findOne({
        where: {
          addressable_type: PolymorphicType.CRM_LOCATIONS,
          addressable_id: existing.id,
        },
      });

      if (!existingAddress) {
        existingAddress = new Address();
        existingAddress.addressable_type = PolymorphicType.CRM_LOCATIONS;
        existingAddress.addressable_id = existing.id;
      }

      if (createLocationDto?.address?.coordinates) {
        existingAddress.coordinates = `(${createLocationDto?.address?.coordinates?.latitude}, ${createLocationDto?.address?.coordinates?.longitude})`;
      }
      existingAddress.city =
        createLocationDto?.address?.city ?? existingAddress.city;
      existingAddress.state =
        createLocationDto?.address?.state ?? existingAddress.state;
      existingAddress.zip_code =
        createLocationDto?.address?.zip_code ?? existingAddress.zip_code;
      existingAddress.country =
        createLocationDto?.address?.country ?? existingAddress.country;
      existingAddress.address1 =
        createLocationDto?.address?.address1 ?? existingAddress.address1;
      existingAddress.address2 =
        createLocationDto?.address?.address2 ?? existingAddress.address2;
      existingAddress.county =
        createLocationDto?.address?.county ?? existingAddress.county;
      existingAddress.addressable_type = PolymorphicType.CRM_LOCATIONS;
      existingAddress.tenant_id =
        user?.tenant?.id ?? existingAddress?.tenant_id;
      existingAddress.created_by = this.request?.user;
      existingAddress.created_at = new Date();

      const saveAddress = await this.addressRepository.save(existingAddress);

      if (
        savedLocation &&
        savedSpecLocation &&
        saveAddress &&
        savedcrmLocationSpecOptions
      ) {
        return resSuccess(
          'record updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.CREATED,
          {
            tenant_id: this.request.user?.tenant?.id,
          }
        );
      }

      return resError('Something went wrong', ErrorConstants.Error, 400);
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getItemByid(id: any, user: any) {
    try {
      const location: any = await this.locationRepository.findOne({
        where: {
          id: id,
          is_archived: false,
          tenant_id: user?.tenant.id,
        },
        relations: ['created_by', 'site_contact_id'],
      });

      if (location) {
        const address: any = await this.addressRepository.findOne({
          where: {
            addressable_id: location?.id,
            addressable_type: PolymorphicType.CRM_LOCATIONS,
          },
        });
        address.coordinates = {
          ...address.coordinates,
          tenant_id: user?.tenant?.id,
        };
        const specLocation = await this.crmLocationsSpecs.findOne({
          relations: ['location_id', 'room_size_id'],
          where: {
            location_id: {
              id: location?.id,
            },
          },
        });

        if (location) {
          const modifiedData: any = await getModifiedDataDetails(
            this.locationsHistoryRepository,
            id,
            this.userRepository
          );
          const modified_at = modifiedData?.created_at;
          const modified_by = modifiedData?.created_by;
          location.modified_by = location.created_by;
          location.modified_at = location.created_at;
          location.created_at = modified_at ? modified_at : location.created_at;
          location.created_by = modified_by ? modified_by : location.created_by;
        }
        const optionSpecLocation: any =
          await this.crmLocationsSpecsoptions.find({
            relations: ['location_specs_id'],
            where: {
              location_specs_id: {
                id: specLocation?.id,
              },
            },
          });
        delete specLocation?.id;
        const locations = { ...specLocation, ...location };
        return resSuccess(
          'Fetched Successfully',
          SuccessConstants.SUCCESS,
          HttpStatus.CREATED,
          { ...locations, address, optionSpecLocation }
        );
      } else {
        return resError(
          'No record belongs to this id',
          ErrorConstants.Error,
          400
        );
      }
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async Archive(id: any, user: any) {
    try {
      const location: any = await this.locationRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user.tenant.id,
          },
        },
        relations: ['tenant'],
      });

      if (!location) {
        return resError('Location not found', ErrorConstants.Error, 404);
      }

      location.is_archived = true;
      location.created_at = new Date();
      const archivedLocation = await this.locationRepository.save(location);
      return resSuccess(
        'record updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        null
      );
    } catch (error) {
      return resError(
        'Error archiving location',
        ErrorConstants.Error,
        400,
        error
      );
    }
  }

  async processDataWithCount(
    data,
    countData,
    userId,
    params,
    addressRepository
  ) {
    const array = data.map((res) => res.id);
    const countArray = countData.map((countData) => countData.id);

    let newData = data;
    let newCountData = countData;

    if (params.city || params.state || params.country || params.county) {
      newData = await addressExtractionFilter(
        PolymorphicType.CRM_LOCATIONS,
        array,
        newData,
        userId,
        params.city ?? null,
        params.state ?? null,
        params.country ?? null,
        addressRepository,
        params.county ?? null
      );
      newCountData = await addressExtractionFilter(
        PolymorphicType.CRM_LOCATIONS,
        countArray,
        newCountData,
        userId,
        params.city ?? null,
        params.state ?? null,
        params.country ?? null,
        addressRepository,
        params.county ?? null
      );
    } else {
      newData = await addressExtractionFilter(
        PolymorphicType.CRM_LOCATIONS,
        array,
        newData,
        userId,
        null,
        null,
        null,
        addressRepository,
        null
      );
      newCountData = await addressExtractionFilter(
        PolymorphicType.CRM_LOCATIONS,
        countArray,
        newCountData,
        userId,
        null,
        null,
        null,
        addressRepository,
        null
      );
    }

    return { newData, newCountData };
  }

  async driveHistory(id, params: GetDrivesHistoryQuery, user) {
    try {
      const { limit = parseInt(process.env.PAGE_SIZE), page = 1 } = params;

      const query = this.locationRepository
        .createQueryBuilder('locations')
        .select([
          'locations.id', // Select the account id
          `(SELECT JSON_BUILD_OBJECT(
            'id', drives.id,
            'date', drives.date,
            'oef_products', drives.oef_products,
            'oef_procedures', drives.oef_procedures,
            'operation_status', (
              SELECT JSON_BUILD_OBJECT(
                'id', os.id,
                'name', os.name,
                'description', os.description,
                'chip_color', os.chip_color
              )
              FROM operations_status os
              WHERE os.id = drives.operation_status_id
            ),
            'shifts', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'shiftable_type', shifts.shiftable_type,
                  'start_time', shifts.start_time,
                  'end_time', shifts.end_time,
                  'shift_slots', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                    'shift_id', slot.shift_id,
                    'procedure_type_id', slot.procedure_type_id,
                    'start_time', slot.start_time,
                    'end_time', slot.end_time
                  ))
                  FROM shifts_slots slot
                  WHERE slot.shift_id = shifts.id),
                  'projections', (
                    SELECT JSON_AGG(
                      JSON_BUILD_OBJECT(
                        'procedure_type_id', projections.procedure_type_id,
                        'staff_setup_id', projections.staff_setup_id,
                        'product_yield', projections.product_yield,
                        'procedure_type_qty', projections.procedure_type_qty,
                        'donor_donations', (
                          SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'id', dd.id,
                              'donation_type', dd.donation_type,
                              'donation_date', dd.donation_date,
                              'donation_status', dd.donation_status,
                              'drive_id', dd.drive_id,
                              'next_eligibility_date', dd.next_eligibility_date,
                              'donation_ytd', dd.donation_ytd,
                              'donation_ltd', dd.donation_ltd,
                              'donation_last_year', dd.donation_last_year,
                              'points', dd.points,
                              'is_archived', dd.is_archived
                            )
                          )
                          FROM donors_donations dd
                          WHERE dd.donation_type = projections.procedure_type_id AND dd.drive_id = drives.id
                        ),
                        'procedure_type', (
                          SELECT JSON_BUILD_OBJECT(
                            'id', pt.id,
                            'name', pt.name,
                            'short_description', pt.short_description,
                            'description', pt.description,
                            'is_goal_type', pt.is_goal_type,
                            'is_archive', pt.is_archive,
                            'products', (
                              SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                  'id', prod.id,
                                  'name', prod.name,
                                  'description', prod.description
                                )
                              )
                              FROM procedure_types_products ptp
                              JOIN products prod ON ptp.product_id = prod.id
                              WHERE ptp.procedure_type_id = projections.procedure_type_id
                            ),
                            'procedure_duration', pt.procedure_duration,
                            'is_generate_online_appointments', pt.is_generate_online_appointments,
                            'is_active', pt.is_active
                          )
                          FROM procedure_types pt
                          WHERE pt.id = projections.procedure_type_id
                        )
                      )
                    )
                    FROM shifts_projections_staff projections
                    WHERE projections.shift_id = shifts.id
                  )
                )
              )
              FROM shifts
              WHERE shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.shiftable_id = drives.id
            ),
            'donor_donations', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', dd.id,
                  'donation_type', dd.donation_type,
                  'donation_date', dd.donation_date,
                  'donation_status', dd.donation_status,
                  'drive_id', dd.drive_id,
                  'next_eligibility_date', dd.next_eligibility_date,
                  'donation_ytd', dd.donation_ytd,
                  'donation_ltd', dd.donation_ltd,
                  'donation_last_year', dd.donation_last_year,
                  'points', dd.points,
                  'is_archived', dd.is_archived
                )
              )
              FROM donors_donations dd
              WHERE dd.drive_id = drives.id
            ),
            'appointment_count', (
              SELECT COUNT(da.id)
              FROM donors_appointments da
              WHERE da.appointmentable_id = drives.id
              AND da.appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            ),
            'donor_appointments', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', da.id,
                  'appointmentable_id', da.appointmentable_id,
                  'appointmentable_type', da.appointmentable_type,
                  'donor_id', da.donor_id,
                  'slot_id', da.slot_id,
                  'procedure_type_id', da.procedure_type_id,
                  'status', da.status,
                  'slot', (
                    SELECT JSON_BUILD_OBJECT(
                      'shift_id', slot.shift_id,
                      'procedure_type_id', slot.procedure_type_id,
                      'start_time', slot.start_time,
                      'end_time', slot.end_time
                    )
                    FROM shifts_slots slot
                    WHERE slot.id = da.slot_id
                  )
                )
              )
              FROM donors_appointments da
              WHERE da.appointmentable_id = drives.id
              AND da.appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )
          )
          FROM drives drive WHERE drive.id = drives.id
          ) AS "drives"`, // Subquery for Drives with Shifts
        ])
        .leftJoin('locations.drives', 'drives')
        .where(`drives.is_archived = false`)
        .andWhere(`locations.id = ${id}`);

      if (params.status != '') {
        query.andWhere(`drives.operation_status.id = ${params.status}`);
      }

      if (params.start_date != '' && params.end_date != '') {
        query.andWhere(
          `drives.date BETWEEN '${moment(params.start_date).format(
            'MM-DD-YYYY'
          )}' AND '${moment(params.end_date).format('MM-DD-YYYY')}'`
        );
      }

      const queryCount = query.getQuery();
      query.offset((page - 1) * limit).limit(limit);

      const dataCount = await this.locationRepository.query(queryCount);

      const projection =
        params?.view_as === 'products' ? 'product_yield' : 'procedure_type_qty';
      const oef =
        params?.view_as === 'products' ? 'oef_products' : 'oef_procedures';
      const quertAg = this.locationRepository
        .createQueryBuilder('locations')
        .leftJoin('locations.drives', 'drives')
        .innerJoin('drives.operation_status', 'os', `os.is_archived = false`)
        .leftJoinAndSelect(
          'donors_donations',
          'dd',
          'dd.drive_id = drives.id AND (dd.is_archived = false)'
        )
        .leftJoinAndSelect(
          'donors_appointments',
          'da',
          `da.appointmentable_id = drives.id AND (appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND da.is_archived = false)`
        )
        .leftJoinAndSelect(
          'shifts',
          'shifts',
          `shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.shiftable_id = drives.id AND shifts.is_archived = false`
        )
        .leftJoinAndSelect(
          'shifts_projections_staff',
          'projections',
          `projections.shift_id = shifts.id AND (projections.is_archived = false)`
        )
        .leftJoinAndSelect(
          'shifts_slots',
          'slots',
          'slots.shift_id = shifts.id AND (slots.is_archived = false)'
        )
        .select([
          `COUNT(dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Deferred_At_Phlebotomy_020}, ${DonationStatusEnum.Deferred_Post_Defer_030})) AS deferrals`,
          `COUNT(dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Technically_Unsuable_015})) AS qns`,
          `COUNT(dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Donor_Left_012})) AS walkouts`,
          `COUNT(dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Post_Draw_Deferral_025})) AS void`,
          `SUM(DISTINCT projections.${projection}) AS projection`,
          `COUNT(DISTINCT dd.id) AS registered`,
          `COUNT(DISTINCT dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Donated_010}, ${DonationStatusEnum.Technically_Unsuable_015}, ${DonationStatusEnum.Deferred_At_Phlebotomy_020}, ${DonationStatusEnum.Deferred_Post_Defer_030}, ${DonationStatusEnum.Post_Draw_Deferral_025})) AS performed`,
          `COUNT(DISTINCT dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Donated_010}, ${DonationStatusEnum.Technically_Unsuable_015}, ${DonationStatusEnum.Post_Draw_Deferral_025})) AS actual`,
          `ROUND(((COUNT(DISTINCT dd.id) FILTER (WHERE dd.donation_status IN (${DonationStatusEnum.Donated_010}, ${DonationStatusEnum.Technically_Unsuable_015}, ${DonationStatusEnum.Post_Draw_Deferral_025}))::numeric) / (SUM(DISTINCT projections.${projection}))::numeric) * 100, 2) as pa`,
          `COUNT(DISTINCT da.id) AS appointment`,
          `drives.${oef} AS oef`,
          `COUNT(dd.id) FILTER (WHERE dd.donation_date IS NULL) AS ftd`,
          `COUNT(DISTINCT "shifts"."id") AS noOfshifts`,
          `os.name AS status`,
        ])
        .addSelect([`drives.date AS date`])
        .addSelect([`drives.id AS driveid`])
        .where(`drives.location_id =${id} AND drives.is_archived = false`)
        .groupBy('drives.id')
        .addGroupBy('os.name')
        .orderBy({ 'drives.created_at': 'DESC' });

      let sortBy = 'drives.id';
      let sortingOrder = params?.sortOrder.toUpperCase() as 'ASC' | 'DESC';
      if (params?.sortName) {
        if (params?.sortName == 'date') {
          sortBy = 'drives.date';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'appointment') {
          sortBy = 'appointment';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'projection') {
          sortBy = 'projection';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'registered') {
          sortBy = 'registered';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'performed') {
          sortBy = 'performed';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'actual') {
          sortBy = 'actual';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }
        if (params?.sortName == 'deferrals') {
          sortBy = 'deferrals';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }
        if (params?.sortName == 'qns') {
          sortBy = 'qns';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }
        if (params?.sortName == 'ftd') {
          sortBy = 'ftd';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }
        if (params?.sortName == 'walkouts') {
          sortBy = 'walkouts';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'void') {
          sortBy = 'void';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'noofshifts') {
          sortBy = 'noofshifts';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }

        if (params?.sortName == 'status') {
          sortBy = 'status';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }
        if (params?.sortName == 'pa') {
          sortBy = 'pa';
          sortingOrder.toUpperCase() as 'ASC' | 'DESC';
        }
      } else {
        sortBy = 'drives.id';
        sortingOrder = 'DESC';
      }

      if (params.status != '') {
        quertAg.andWhere(`drives.operation_status.id = ${params.status}`);
      }

      if (params.start_date != '' && params.end_date != '') {
        quertAg.andWhere(
          `drives.date BETWEEN '${moment(params.start_date).format(
            'MM-DD-YYYY'
          )}' AND '${moment(params.end_date).format('MM-DD-YYYY')}'`
        );
      }
      quertAg.offset((page - 1) * limit).limit(limit);

      quertAg.orderBy(sortBy, sortingOrder);

      const result = await this.entityManager.query(quertAg.getQuery());
      return {
        status: HttpStatus.OK,
        response: 'Drive history fetched.',
        count: dataCount?.length ? dataCount?.length : 0,
        result,
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
  async driveHistoryDetail(id, params: GetDrivesHistoryQuery, user, driveId) {
    try {
      const { limit = parseInt(process.env.PAGE_SIZE), page = 1 } = params;
      const query = this.locationRepository
        .createQueryBuilder('locations')
        .select([
          'locations.id', // Select the account id
          `(SELECT JSON_BUILD_OBJECT(
            'id', drives.id,
            'date', drives.date,
            'oef_products', drives.oef_products,
            'oef_procedures', drives.oef_procedures,
            'operation_status', (
              SELECT JSON_BUILD_OBJECT(
                'id', os.id,
                'name', os.name,
                'description', os.description,
                'chip_color', os.chip_color
              )
              FROM operations_status os
              WHERE os.id = drives.operation_status_id
            ),
            'shifts', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'shiftable_type', shifts.shiftable_type,
                  'start_time', shifts.start_time,
                  'end_time', shifts.end_time,
                  'shift_slots', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                    'shift_id', slot.shift_id,
                    'procedure_type_id', slot.procedure_type_id,
                    'start_time', slot.start_time,
                    'end_time', slot.end_time
                  ))
                  FROM shifts_slots slot
                  WHERE slot.shift_id = shifts.id),
                  'projections', (
                    SELECT JSON_AGG(
                      JSON_BUILD_OBJECT(
                        'procedure_type_id', projections.procedure_type_id,
                        'staff_setup_id', projections.staff_setup_id,
                        'product_yield', projections.product_yield,
                        'procedure_type_qty', projections.procedure_type_qty,
                        'donor_donations', (
                          SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'id', dd.id,
                              'donation_type', dd.donation_type,
                              'donation_date', dd.donation_date,
                              'donation_status', dd.donation_status,
                              'drive_id', dd.drive_id,
                              'next_eligibility_date', dd.next_eligibility_date,
                              'donation_ytd', dd.donation_ytd,
                              'donation_ltd', dd.donation_ltd,
                              'donation_last_year', dd.donation_last_year,
                              'points', dd.points,
                              'is_archived', dd.is_archived
                            )
                          )
                          FROM donors_donations dd
                          WHERE dd.donation_type = projections.procedure_type_id AND dd.drive_id = drives.id
                        ),
                        'procedure_type', (
                          SELECT JSON_BUILD_OBJECT(
                            'id', pt.id,
                            'name', pt.name,
                            'short_description', pt.short_description,
                            'description', pt.description,
                            'is_goal_type', pt.is_goal_type,
                            'is_archive', pt.is_archive,
                            'products', (
                              SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                  'id', prod.id,
                                  'name', prod.name,
                                  'description', prod.description
                                )
                              )
                              FROM procedure_types_products ptp
                              JOIN products prod ON ptp.product_id = prod.id
                              WHERE ptp.procedure_type_id = projections.procedure_type_id
                            ),
                            'procedure_duration', pt.procedure_duration,
                            'is_generate_online_appointments', pt.is_generate_online_appointments,
                            'is_active', pt.is_active
                          )
                          FROM procedure_types pt
                          WHERE pt.id = projections.procedure_type_id
                        )
                      )
                    )
                    FROM shifts_projections_staff projections
                    WHERE projections.shift_id = shifts.id
                  )
                )
              )
              FROM shifts
              WHERE shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.shiftable_id = drives.id
            ),
            'donor_donations', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', dd.id,
                  'donation_type', dd.donation_type,
                  'donation_date', dd.donation_date,
                  'donation_status', dd.donation_status,
                  'drive_id', dd.drive_id,
                  'next_eligibility_date', dd.next_eligibility_date,
                  'donation_ytd', dd.donation_ytd,
                  'donation_ltd', dd.donation_ltd,
                  'donation_last_year', dd.donation_last_year,
                  'points', dd.points,
                  'is_archived', dd.is_archived
                )
              )
              FROM donors_donations dd
              WHERE dd.drive_id = drives.id
            ),
            'appointment_count', (
              SELECT COUNT(da.id)
              FROM donors_appointments da
              WHERE da.appointmentable_id = drives.id
              AND da.appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            ),
            'donor_appointments', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', da.id,
                  'appointmentable_id', da.appointmentable_id,
                  'appointmentable_type', da.appointmentable_type,
                  'donor_id', da.donor_id,
                  'slot_id', da.slot_id,
                  'procedure_type_id', da.procedure_type_id,
                  'status', da.status,
                  'slot', (
                    SELECT JSON_BUILD_OBJECT(
                      'shift_id', slot.shift_id,
                      'procedure_type_id', slot.procedure_type_id,
                      'start_time', slot.start_time,
                      'end_time', slot.end_time
                    )
                    FROM shifts_slots slot
                    WHERE slot.id = da.slot_id
                  )
                )
              )
              FROM donors_appointments da
              WHERE da.appointmentable_id = drives.id
              AND da.appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )
          )
          FROM drives drive WHERE drive.id = drives.id
          ) AS "drives"`, // Subquery for Drives with Shifts
        ])
        .leftJoin('locations.drives', 'drives')
        .where(`drives.is_archived = false AND drives.id = ${driveId}`)
        .andWhere(`locations.id = ${id}`);

      query.offset((page - 1) * limit).limit(limit);

      const queryList = query.getQuery();

      const data = await this.locationRepository.query(queryList);

      return {
        status: HttpStatus.OK,
        response: 'Drive history fetched.',
        data,
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

  async driveHistoryKPI(id) {
    try {
      const query = this.locationRepository
        .createQueryBuilder('locations')
        .select([
          'locations.id', // Select the account id
          `(SELECT JSON_BUILD_OBJECT(
            'id', drives.id,
            'date', drives.date,
            'oef_products', drives.oef_products,
            'oef_procedures', drives.oef_procedures,
            'operation_status', (
              SELECT JSON_BUILD_OBJECT(
                'id', os.id,
                'name', os.name,
                'description', os.description,
                'chip_color', os.chip_color
              )
              FROM operations_status os
              WHERE os.id = drives.operation_status_id
            ),
            'shifts', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'shiftable_type', shifts.shiftable_type,
                  'start_time', shifts.start_time,
                  'end_time', shifts.end_time,
                  'shift_slots', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                    'shift_id', slot.shift_id,
                    'procedure_type_id', slot.procedure_type_id,
                    'start_time', slot.start_time,
                    'end_time', slot.end_time
                  ))
                  FROM shifts_slots slot
                  WHERE slot.shift_id = shifts.id),
                  'projections', (
                    SELECT JSON_AGG(
                      JSON_BUILD_OBJECT(
                        'procedure_type_id', projections.procedure_type_id,
                        'staff_setup_id', projections.staff_setup_id,
                        'product_yield', projections.product_yield,
                        'procedure_type_qty', projections.procedure_type_qty,
                        'donor_donations', (
                          SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'id', dd.id,
                              'donation_type', dd.donation_type,
                              'donation_date', dd.donation_date,
                              'donation_status', dd.donation_status,
                              'drive_id', dd.drive_id,
                              'next_eligibility_date', dd.next_eligibility_date,
                              'donation_ytd', dd.donation_ytd,
                              'donation_ltd', dd.donation_ltd,
                              'donation_last_year', dd.donation_last_year,
                              'points', dd.points,
                              'is_archived', dd.is_archived
                            )
                          )
                          FROM donors_donations dd
                          WHERE dd.donation_type = projections.procedure_type_id AND dd.drive_id = drives.id
                        ),
                        'procedure_type', (
                          SELECT JSON_BUILD_OBJECT(
                            'id', pt.id,
                            'name', pt.name,
                            'short_description', pt.short_description,
                            'description', pt.description,
                            'is_goal_type', pt.is_goal_type,
                            'is_archive', pt.is_archive,
                            'products', (
                              SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                  'id', prod.id,
                                  'name', prod.name,
                                  'description', prod.description
                                )
                              )
                              FROM procedure_types_products ptp
                              JOIN products prod ON ptp.product_id = prod.id
                              WHERE ptp.procedure_type_id = projections.procedure_type_id
                            ),
                            'procedure_duration', pt.procedure_duration,
                            'is_generate_online_appointments', pt.is_generate_online_appointments,
                            'is_active', pt.is_active
                          )
                          FROM procedure_types pt
                          WHERE pt.id = projections.procedure_type_id
                        )
                      )
                    )
                    FROM shifts_projections_staff projections
                    WHERE projections.shift_id = shifts.id
                  )
                )
              )
              FROM shifts
              WHERE shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.shiftable_id = drives.id
            ),
            'donor_donations', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', dd.id,
                  'donation_type', dd.donation_type,
                  'donation_date', dd.donation_date,
                  'donation_status', dd.donation_status,
                  'drive_id', dd.drive_id,
                  'next_eligibility_date', dd.next_eligibility_date,
                  'donation_ytd', dd.donation_ytd,
                  'donation_ltd', dd.donation_ltd,
                  'donation_last_year', dd.donation_last_year,
                  'points', dd.points,
                  'is_archived', dd.is_archived
                )
              )
              FROM donors_donations dd
              WHERE dd.drive_id = drives.id
            ),
            'appointment_count', (
              SELECT COUNT(da.id)
              FROM donors_appointments da
              WHERE da.appointmentable_id = drives.id
              AND da.appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            ),
            'donor_appointments', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', da.id,
                  'appointmentable_id', da.appointmentable_id,
                  'appointmentable_type', da.appointmentable_type,
                  'donor_id', da.donor_id,
                  'slot_id', da.slot_id,
                  'procedure_type_id', da.procedure_type_id,
                  'status', da.status,
                  'slot', (
                    SELECT JSON_BUILD_OBJECT(
                      'shift_id', slot.shift_id,
                      'procedure_type_id', slot.procedure_type_id,
                      'start_time', slot.start_time,
                      'end_time', slot.end_time
                    )
                    FROM shifts_slots slot
                    WHERE slot.id = da.slot_id
                  )
                )
              )
              FROM donors_appointments da
              WHERE da.appointmentable_id = drives.id
              AND da.appointmentable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )
          )
          FROM drives drive WHERE drive.id = drives.id
          ) AS "drives"`, // Subquery for Drives with Shifts
        ])
        .leftJoin('locations.drives', 'drives')
        .where(`drives.is_archived = false`)
        .andWhere(`locations.id = ${id}`)
        .limit(4)
        .getQuery();
      const dataKPI = await this.locationRepository.query(query);

      return {
        status: HttpStatus.OK,
        response: 'Drive history fetched.',
        dataKPI,
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
  private generateQualificationStatusCondition(params) {
    if (!params?.qualification_status) {
      return '';
    }
    const status = params.qualification_status?.trim();
    switch (status) {
      case 'qualified':
        return `
            EXISTS (
              SELECT
              FROM qualifications
              WHERE qualifications.location_id = crm_locations.id
              AND qualifications.qualification_expires > CURRENT_DATE
            )
          `;
      case 'Not Qualified':
        return `
            NOT EXISTS (
              SELECT
              FROM qualifications
              WHERE qualifications.location_id = crm_locations.id
            )
          `;
      case 'expired':
        return `
              NOT EXISTS (
                SELECT
                FROM qualifications
                WHERE qualifications.location_id = crm_locations.id
                AND qualifications.qualification_expires > CURRENT_DATE
              ) AND EXISTS (
                SELECT
                FROM qualifications
                WHERE qualifications.location_id = crm_locations.id
              )
            `;
      default:
        return '';
    }
  }

  async getAllLocationbasedDrives(id, query, req) {
    try {
      const { active } = query;
      const getlocationDrives = await this.drivesRepo
        .createQueryBuilder('drive')
        .innerJoinAndSelect('drive.account', 'account')
        .innerJoinAndSelect('account.industry_category', 'industry_category')
        .where('drive.location_id = :id', { id })
        .andWhere(
          `account.is_active = ${active} AND account.tenant_id = ${req.user.tenant.id} AND drive.is_archived = false AND drive.is_blueprint = false`
        )
        .orderBy('drive.date', 'DESC')
        .limit(1)
        .getMany();
      return resSuccess(
        'Drives details fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        getlocationDrives
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getLocationSeedData(user: any, queryParams: GetAllAccountsInterface) {
    try {
      const cities: any = await this.addressRepository
        .createQueryBuilder('address')
        .select(['address.tenant_id AS tenant_id', 'address.city AS city'])
        .where({
          addressable_type: PolymorphicType.CRM_LOCATIONS,
          tenant: { id: queryParams.tenant_id },
        })
        .distinctOn(['address.city'])
        .getRawMany();

      const states: any = await this.addressRepository
        .createQueryBuilder('address')
        .select(['address.tenant_id AS tenant_id', 'address.state AS state'])
        .where({
          addressable_type: PolymorphicType.CRM_LOCATIONS,
          tenant: { id: queryParams.tenant_id },
        })
        .distinctOn(['address.state'])
        .getRawMany();

      const counties: any = await this.addressRepository
        .createQueryBuilder('address')
        .select(['address.tenant_id AS tenant_id', 'address.county AS county'])
        .where({
          addressable_type: PolymorphicType.CRM_LOCATIONS,
          tenant: { id: queryParams.tenant_id },
        })
        .distinctOn(['address.county'])
        .getRawMany();

      return {
        status: HttpStatus.OK,
        response: 'Donors Seed Data Fetched.',
        data: {
          cities: cities || [],
          states: states || [],
          counties: counties || [],
          tenant_id: queryParams.tenant_id,
        },
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
