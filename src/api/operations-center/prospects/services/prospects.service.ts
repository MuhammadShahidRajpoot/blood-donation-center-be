import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import * as dotenv from 'dotenv';
import {
  CreateProspectDto,
  GetAllProspects,
  ListProspectsDto,
  UpdateProspectDto,
} from '../dto/prospects.dto';
import { Drives } from '../../operations/drives/entities/drives.entity';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { Prospects } from '../entities/prospects.entity';
import { ProspectsCommunications } from '../entities/prospects-communications.entity';
import { ProspectsBlueprints } from '../entities/prospects-blueprints.entity';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ProspectsFilters } from '../entities/prospects-filters.entity';
import { FavoriteLocationTypeEnum } from '../../manage-favorites/enum/manage-favorites.enum';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import {
  convertStringToObject,
  removeTimeFromDate,
} from 'src/common/utils/misc';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { CRMVolunteer } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer.entity';
import { pagination } from 'src/common/utils/pagination';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactTypeEnum } from 'src/api/crm/contacts/common/enums';
import {
  addContactToSegment,
  addSegmentToCampaign,
  createOrUpdateEmail,
  createOrUpdateSegment,
  deleteScheduleEmail,
  getTenantData,
  scheduleEmail,
} from 'src/api/common/services/dailyStory.service';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import moment from 'moment';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { ProspectsHistory } from '../entities/prospects-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { ProspectsCommunicationsHistory } from '../entities/prospects-communications-history.entity';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';

dotenv.config();
@Injectable()
export class ProspectsService {
  private readonly apiUrl = process.env.DAILY_STORY_COMMUNICATION_URL;

  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Prospects)
    private readonly prospectsRepository: Repository<Prospects>,
    @InjectRepository(ProspectsHistory)
    private readonly prospectHistory: Repository<ProspectsHistory>,
    @InjectRepository(ProspectsCommunications)
    private readonly prospectsCommunicationsRepository: Repository<ProspectsCommunications>,
    @InjectRepository(ProspectsCommunicationsHistory)
    private readonly ProspectsCommunicationsHistoryRepository: Repository<ProspectsCommunicationsHistory>,
    @InjectRepository(ProspectsFilters)
    private readonly prospectsFiltersRepository: Repository<ProspectsFilters>,
    @InjectRepository(ProspectsBlueprints)
    private readonly prospectsBlueprintsRepository: Repository<ProspectsBlueprints>,
    @InjectRepository(BookingRules)
    private readonly bookingRulesRepository: Repository<BookingRules>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BusinessUnits)
    private businessUnitsRepository: Repository<BusinessUnits>,
    private readonly entityManager: EntityManager,
    private readonly httpService: HttpService
  ) {}

  async create(createProspectDto: CreateProspectDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      // let segment_id: any = 20488;
      // const tenantData = await getTenantData(
      //   this.request.user?.tenant?.id,
      //   this.tenantRepository
      // );
      // const campaignId = tenantData?.data?.dailystory_campaign_id;
      // const token = tenantData?.data?.dailystory_token;
      // const tenantUserEmail = tenantData?.data?.email;
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const allBlueprints = await this.verifyDriveIds(
        createProspectDto?.blueprints_ids
      );
      const newProspect = new Prospects();
      newProspect.name = createProspectDto?.name;
      newProspect.description = createProspectDto?.description;
      newProspect.created_by = this.request?.user?.id;
      newProspect.is_active = createProspectDto.status;
      newProspect.tenant_id = this.request.user?.tenant.id;
      newProspect.is_archived = false;

      const savedProspect = await this.prospectsRepository.save(newProspect);

      const newProspectCommunication = new ProspectsCommunications();
      newProspectCommunication.message = createProspectDto?.message;
      newProspectCommunication.message_type = 'email';
      newProspectCommunication.prospect_id = savedProspect;
      newProspectCommunication.created_by = this.request?.user;
      newProspectCommunication.tenant_id = this.request.user?.tenant.id;
      newProspectCommunication.template_id = createProspectDto?.template_id;
      newProspectCommunication.is_archived = false;
      newProspectCommunication.schedule_date = createProspectDto?.schedule_date;

      const savedProspectCommunication =
        await this.prospectsCommunicationsRepository.save(
          newProspectCommunication
        );

      const newProspectFilters = new ProspectsFilters();
      newProspectFilters.start_date = new Date(createProspectDto?.start_date);
      newProspectFilters.end_date = new Date(createProspectDto?.end_date);
      newProspectFilters.prospect_id = savedProspect;
      newProspectFilters.created_by = this.request?.user;
      newProspectFilters.min_projection = createProspectDto?.min_projection;
      newProspectFilters.max_projection = createProspectDto?.max_projection;
      newProspectFilters.eligibility = createProspectDto?.eligibility;
      newProspectFilters.distance = createProspectDto?.distance;
      newProspectFilters.location_type = createProspectDto?.location_type;
      newProspectFilters.organizational_level_id =
        createProspectDto?.organizational_level_id;

      const savedProspectFilter = await this.prospectsFiltersRepository.save(
        newProspectFilters
      );

      const getBlueprintsDetails = await this.listProspects(
        { getByIds: createProspectDto.blueprints_ids },
        this.request.user?.tenant?.id
      );
      const promises = [];
      for (const blueprint of allBlueprints) {
        const prospectsBlueprints = new ProspectsBlueprints();
        prospectsBlueprints.blueprint_id = blueprint as Drives;
        prospectsBlueprints.prospect_id = savedProspect;
        prospectsBlueprints.created_by = this.request?.user;
        prospectsBlueprints.tenant_id = this.request.user?.tenant;
        promises.push(
          this.prospectsBlueprintsRepository.save(prospectsBlueprints)
        );
      }
      await Promise.all(promises);

      if (getBlueprintsDetails instanceof HttpException) throw HttpException;
      // we wont' format email and we won't replace varialbes, DS will handle this
      // const allFormattedEmails = [];
      const drive_date = getBlueprintsDetails?.data[0]?.drive_date ?? '';
      const prospect_location =
        getBlueprintsDetails?.data[0]?.location_name ?? '';
      // for (const singleBlueprint of getBlueprintsDetails.data) {
      //   const resEmail = await this.addVariables(
      //     createProspectDto.message,
      //     singleBlueprint
      //   );
      //   allFormattedEmails.push(resEmail);
      // }

      // for (const singleEmail of allFormattedEmails) {
      //   await this.sendEmail(
      //     createProspectDto.template_id,
      //     singleEmail?.cp_email,
      //     { emailContent: singleEmail.message },
      //     createProspectDto.schedule_date,
      //     singleEmail.driveDate,
      //     singleEmail.locationName
      //   );
      // }
      // commenting this for now
      // const segment = await createOrUpdateSegment(
      //   `Blood Donation Drive ${Date.now()}`,
      //   0,
      //   token
      // );
      // segment_id = segment.Response.id;
      // current logic is wrong check here:
      // https://cooperativecomputing.atlassian.net/wiki/spaces/DE/pages/1520828997/Operation+Centers+Prospects+-+Solution#Sync-prospects(contacts)-with-DailyStory
      // const prospect_id = savedProspect.id;
      // const query = this.prospectsBlueprintsRepository
      //   .createQueryBuilder('prospects_blueprints')
      //   .select([
      //     'prospects_blueprints.prospect_id',
      //     'cv.contact_uuid AS contact_uuid',
      //   ])
      //   .where(`prospect_id = :id`, { id: prospect_id })
      //   .leftJoin(Drives, 'd', 'prospects_blueprints.blueprint_id = d.id')
      //   .leftJoin(Accounts, 'a', 'd.account_id = a.id')
      //   .leftJoin(AccountContacts, 'ac', 'a.id = ac.contactable_id', {
      //     type: 'account',
      //   })
      //   .leftJoin(CRMVolunteer, 'cv', 'ac.record_id = cv.id');
      // const records: any = await query.getRawMany();

      // const uuids = (records || [])
      //   .map((x) => x?.dsid)
      //   .filter((uuid) => uuid !== undefined);

      // todo: need to contact dsid from contacts table
      // commenting this for now
      // await addContactToSegment([], segment_id, token);
      // await addSegmentToCampaign(segment_id, campaignId, token);

      // todo: need to create  email
      // const createEmailPayload = {
      //   from: tenantUserEmail,
      //   campaignId: campaignId,
      //   isOpenTrackingEnabled: true,
      //   isClickTrackingEnabled: true,
      //   name: createProspectDto?.name,
      //   emailId: createProspectDto.template_id,
      //   subject: `Blood Donation Drive ${drive_date} , ${prospect_location}`,
      //   body: createProspectDto?.message,
      // };

      // const createEmailRes = await createOrUpdateEmail(
      //   createEmailPayload,
      //   0,
      //   token
      // );
      // and then schedule it with segment id
      // await scheduleEmail(
      //   {
      //     contactMethod: 'SendEmail',
      //     campaignId: campaignId,
      //     messageId: createEmailRes?.Response?.id,
      //     dateScheduled: moment(createProspectDto.schedule_date).format(
      //       'MM/DD/YYYY hh:mma'
      //     ),
      //     segment: [20488],
      //   },
      //   token
      // );
      // const prospect = await this.prospectsRepository.findOne({
      //   where: {
      //     id: savedProspect?.id,
      //     is_archived: false,
      //   },
      // });

      // if (prospect) {
      //   const updateProspect = {
      //     segment_id: segment_id,
      //   };

      //   await this.prospectsRepository.update(
      //     { id: savedProspect?.id },
      //     updateProspect
      //   );
      // }

      // const prospectsCommunications =
      //   await this.prospectsCommunicationsRepository.findOne({
      //     where: {
      //       id: savedProspectCommunication?.id,
      //       is_archived: false,
      //     },
      //   });

      // if (prospectsCommunications) {
      //   const updateProspect = {
      //     email_id: createEmailRes?.Response?.id,
      //   };

      //   await this.prospectsCommunicationsRepository.update(
      //     { id: savedProspectCommunication?.id },
      //     updateProspect
      //   );
      // }
      await queryRunner.commitTransaction();
      const {
        created_by: createdByFilter,
        ...savedProspectFilterWithoutCreatedBy
      } = savedProspectFilter;
      const savedProspectFilterWithTenantId = {
        ...savedProspectFilterWithoutCreatedBy,
        tenant_id: this.request.user.tenant.id,
      };
      const {
        created_by: createdByCommunication,
        ...savedProspectCommunicationWithoutCreatedBy
      } = savedProspectCommunication;
      return {
        status: 'success',
        response: 'Prospect Created Successfully',
        status_code: 201,
        data: {
          savedProspect,
          savedProspectCommunication:
            savedProspectCommunicationWithoutCreatedBy,
          savedProspectFilter: savedProspectFilterWithTenantId,
          tenant_id: this.request.user.tenant.id,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateProspect(id: any, updatedData: UpdateProspectDto) {
    const prospect = await this.prospectsRepository.findOne({
      where: {
        id,
        is_archived: false,
      },
    });
    const prospectsCommunications =
      await this.prospectsCommunicationsRepository.findOne({
        where: {
          prospect_id: { id: id },
          is_archived: false,
        },
      });
    if (
      removeTimeFromDate(new Date(prospectsCommunications.schedule_date)) <
      removeTimeFromDate(new Date())
    ) {
      return resError('Prospect is already expired', ErrorConstants.Error, 404);
    }
    if (!prospect) {
      return resError('Prospect not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const updateProspect = {
        name: updatedData?.name,
        description: updatedData?.description,
        is_active: updatedData?.status,
        updated_at: new Date(),
        created_at: new Date(),
        created_by: this.request?.user,
      };

      await this.prospectsRepository.update({ id }, updateProspect);
      const { created_by, ...updateProspectWithoutCreatedBy } = updateProspect;
      await queryRunner.commitTransaction();

      return resSuccess(
        'Prospect Updated Successfully',
        'success',
        HttpStatus.OK,
        {
          ...updateProspectWithoutCreatedBy,
          tenant_id: prospectsCommunications?.tenant_id,
        }
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateProspectCommunication(id: any, updatedData: CreateProspectDto) {
    // const tenantData = await getTenantData(
    //   this.request.user?.tenant?.id,
    //   this.tenantRepository
    // );
    // const token = tenantData?.data?.dailystory_token;
    const prospectsCommunication =
      await this.prospectsCommunicationsRepository.findOne({
        where: {
          prospect_id: { id: id },
          is_archived: false,
        },
      });
    const prospect = await this.prospectsRepository.findOne({
      where: {
        id,
        is_archived: false,
      },
    });

    if (!prospect) {
      return resError('Prospect not found', ErrorConstants.Error, 404);
    }
    if (!prospectsCommunication) {
      return resError(
        'Prospect Communication not found',
        ErrorConstants.Error,
        404
      );
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const updateProspectCommunications: any = {
        message: updatedData?.message,
        template_id: updatedData?.template_id,
        schedule_date: new Date(updatedData?.schedule_date),
        created_at: new Date(),
        created_by: this.request?.user,
      };
      const updateProspect = {
        updated_at: new Date(),
        created_at: new Date(),
        created_by: this.request?.user,
      };
      await this.prospectsRepository.update({ id }, updateProspect);
      // const createEmailPayload = {
      //   body: updatedData?.message,
      //  emailId: updatedData?.template_id,
      // };

      // const createEmailRes = await createOrUpdateEmail(
      //   createEmailPayload,
      //   prospect?.email_id,
      //   token
      // );
      await this.prospectsCommunicationsRepository.update(
        { id },
        updateProspectCommunications
      );

      await queryRunner.commitTransaction();
      const { created_by, ...updateProspectCommunicationsWithoutCreatedBy } =
        updateProspectCommunications;
      return resSuccess(
        'Prospect Updated Successfully',
        'success',
        HttpStatus.OK,
        {
          ...updateProspectCommunicationsWithoutCreatedBy,
          tenant_id: prospectsCommunication?.tenant_id,
        }
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(params: GetAllProspects) {
    try {
      const fetchAll = params?.fetchAll;
      const startDate: any = params?.start_date;
      const endDate: any = params?.end_date;

      const limit: number = params?.limit ? params?.limit : 10;
      let page = params?.page ? params?.page : 1;
      if (page < 1) {
        page = 1;
      }

      let orderObject = {};
      if (params?.sortName && params.sortName !== 'contacts') {
        const sortKey = params.sortName;
        const sortOrder = params.sortOrder ?? 'DESC';
        orderObject = {
          [sortKey === 'status' ? 'is_active' : sortKey]: sortOrder,
        };
        orderObject = convertStringToObject(orderObject);
      } else {
        orderObject = { id: 'DESC' };
      }

      const where = {};

      if (params?.is_active) {
        Object.assign(where, {
          is_active: params?.is_active,
        });
      }

      if (params?.name) {
        Object.assign(where, {
          name: ILike(`%${params?.name}%`),
        });
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      if (startDate !== undefined || endDate !== undefined) {
        if (startDate && endDate) {
          Object.assign(where, {
            communications: {
              schedule_date: Between(
                moment(startDate).format('MM-DD-YYYY'),
                moment(endDate).format('MM-DD-YYYY')
              ),
            },
          });
        } else if (startDate) {
          Object.assign(where, {
            communications: {
              schedule_date: MoreThanOrEqual(
                moment(startDate).format('MM-DD-YYYY')
              ),
            },
          });
        } else if (endDate) {
          Object.assign(where, {
            communications: {
              schedule_date: LessThanOrEqual(
                moment(endDate).format('MM-DD-YYYY')
              ),
            },
          });
        }
      }
      let response: any;
      let count: any;

      if (fetchAll !== 'true') {
        [response, count] = await this.prospectsRepository.findAndCount({
          relations: ['communications', 'tenant'],
          where: {
            ...where,
            is_archived: false,
          },
          take: limit,
          skip: (page - 1) * limit,
          order: { ...orderObject },
        });
      } else {
        [response, count] = await this.prospectsRepository.findAndCount({
          relations: ['communications', 'tenant'],
          where: {
            ...where,
            is_archived: false,
          },
          order: { ...orderObject },
        });
      }

      const prospectIds = response.map((prospect: any) => prospect.id);

      const contactCounts = await Promise.all(
        prospectIds.map(async (prospectId: any) => {
          const query = this.prospectsBlueprintsRepository
            .createQueryBuilder('prospects_blueprints')
            .select([
              'prospects_blueprints.prospect_id',
              'a.name AS account_name',
              'cv.first_name AS chairperson_name',
              'cv.contact_uuid AS contact_uuid',
              // 'cv.updated_at AS updated_at',
              'cv.id AS chairperson_id',
            ])
            .where('prospect_id = :prospectId', {
              prospectId,
            })
            .leftJoin(Drives, 'd', 'prospects_blueprints.blueprint_id = d.id')
            .leftJoin(Accounts, 'a', 'd.account_id = a.id')
            .leftJoin(
              AccountContacts,
              'ac',
              'a.id = ac.contactable_id AND ac.is_archived = false',
              {
                type: 'account',
              }
            )
            .leftJoin(
              CRMVolunteer,
              'cv',
              'ac.record_id = cv.id AND ac.is_archived = false'
            )
            .distinct(true);

          const temp = await query.getRawMany();
          const contactsCount = temp.length;
          return { prospectId, contactsCount };
        })
      );

      const prospectsWithContactCount = response.map((prospect: any) => {
        const contactCountObj = contactCounts.find(
          (countObj: any) => countObj.prospectId === prospect.id
        );
        const contactsCount = contactCountObj
          ? contactCountObj.contactsCount
          : 0;

        return {
          ...prospect,
          contactsCount,
        };
      });
      if (params.sortName === 'contacts') {
        prospectsWithContactCount.sort((a: any, b: any) => {
          if (params.sortOrder && params.sortOrder.toUpperCase() === 'ASC') {
            return a.contactsCount - b.contactsCount;
          } else {
            return b.contactsCount - a.contactsCount;
          }
        });
      }

      return resSuccess(
        'Prospects Fetched Successfully',
        'success',
        HttpStatus.OK,
        prospectsWithContactCount,
        count
      );
    } catch (e) {
      console.log(e);
      return resError('Internal Server Error', ErrorConstants.Error, e.status);
    }
  }

  async getSingleProspect(id: any) {
    try {
      const prospect: any = await this.prospectsRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: { id: this.request.user?.tenant?.id },
        },
        relations: ['created_by', 'communications', 'filters', 'tenant'],
      });

      const filters: any = prospect.filters;
      const OrganizationLevels = await this.businessUnitsRepository.find({
        where: {
          id: In(filters.organizational_level_id),
        },
      });

      filters.organizationLevels = OrganizationLevels;
      filters.tenant_id = this.request.user.tenant.id;
      if (!prospect) {
        return resError('Prospect not found', ErrorConstants.Error, 404);
      }
      if (prospect) {
        const modifiedData: any = await getModifiedDataDetails(
          this.prospectHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        prospect.modified_by = prospect.created_by;
        prospect.modified_at = prospect.created_at;
        prospect.created_at = modified_at ? modified_at : prospect.created_at;
        prospect.created_by = modified_by ? modified_by : prospect.created_by;
      }
      return resSuccess(
        'Prospect Fetched Successfully',
        'success',
        HttpStatus.OK,
        {
          ...prospect,
        }
      );
    } catch (error) {
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async getSingleProspectCommunication(id: any) {
    try {
      const prospect: any =
        await this.prospectsCommunicationsRepository.findOne({
          where: {
            prospect_id: { id: id },
            is_archived: false,
          },
        });
      if (!prospect) {
        return resError(
          'Prospect Communication not found',
          ErrorConstants.Error,
          404
        );
      }
      if (prospect) {
        const modifiedData: any = await getModifiedDataDetails(
          this.ProspectsCommunicationsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        prospect.modified_by = prospect.created_by;
        prospect.modified_at = prospect.created_at;
        prospect.created_at = modified_at ? modified_at : prospect.created_at;
        prospect.created_by = modified_by ? modified_by : prospect.created_by;
      }
      return resSuccess(
        'Prospect Communication Fetched Successfully',
        'success',
        HttpStatus.OK,
        {
          ...prospect,
        }
      );
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error in getSingleProspectCommunication:', error);

      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        500 // Internal Server Error
      );
    }
  }

  async getSingleProspectFilters(id: any) {
    try {
      const prospectFilters: any =
        await this.prospectsFiltersRepository.findOne({
          where: {
            prospect_id: { id: id },
            is_archived: false,
          },
        });
      if (!prospectFilters) {
        return resError('Prospect Filter not found', ErrorConstants.Error, 404);
      }
      const OrganizationLevels = await this.businessUnitsRepository.find({
        where: {
          id: In(prospectFilters.organizational_level_id),
        },
      });

      prospectFilters.organizationLevels = OrganizationLevels;
      prospectFilters.tenant_id = this.request.user.tenant.id;
      return resSuccess(
        'Prospect Filters Fetched Successfully',
        'success',
        HttpStatus.OK,
        {
          ...prospectFilters,
        }
      );
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error in getSingleProspectCommunication:', error);

      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        500 // Internal Server Error
      );
    }
  }

  async getProspectBluePrints(id: any, params?: any) {
    try {
      let query = this.prospectsBlueprintsRepository
        .createQueryBuilder('prospects_blueprints')
        .select([
          'prospects_blueprints.prospect_id',
          'a.name AS account_name',
          'cv.first_name AS chairperson_name',
          'cv.contact_uuid AS contact_uuid',
          // 'cv.updated_at AS updated_at',
          'cv.id AS chairperson_id',
          'prospects_blueprints.tenant_id AS tenant_id',
        ])
        .where(`prospect_id = :id`, { id })
        .leftJoin(Drives, 'd', 'prospects_blueprints.blueprint_id = d.id')
        .leftJoin(Accounts, 'a', 'd.account_id = a.id')
        .leftJoin(
          AccountContacts,
          'ac',
          'a.id = ac.contactable_id AND ac.is_archived = false',
          {
            type: 'account',
          }
        )
        .leftJoin(
          CRMVolunteer,
          'cv',
          'ac.record_id = cv.id AND ac.is_archived = false'
        )
        .distinct(true);

      //Conditionally add keyword search if the keyword is not empty
      if (params.keywords && params.keywords.trim() !== '') {
        query.andWhere('LOWER(cv.first_name) LIKE LOWER(:keywords)', {
          keywords: `%${params.keywords}%`,
        });
      }

      if (params.sortName === 'contact_name') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          query = query.addOrderBy('chairperson_name', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          query = query.addOrderBy('chairperson_name', 'DESC');
        }
      }

      if (params.sortName === 'account') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          query = query.addOrderBy('account_name', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          query = query.addOrderBy('account_name', 'DESC');
        }
      }
      if (params.sortName === 'date') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          query = query.addOrderBy('updated_at', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          query = query.addOrderBy('updated_at', 'DESC');
        }
      }

      const prospect = await query.getRawMany();
      // .addSelect('blueprints', 'account_id');

      if (!prospect) {
        return resError('Prospect not found', ErrorConstants.Error, 404);
      }

      return resSuccess(
        'Prospect Fetched Successfully',
        'success',
        HttpStatus.OK,
        prospect
      );
    } catch (error) {
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async deleteProspect(id: any, user: any) {
    const prospect: any = await this.prospectsRepository.findOne({
      where: {
        id,
        is_archived: false,
        tenant: {
          id: user?.tenant?.id,
        },
      },
      relations: ['tenant'],
    });
    //  const tenantData = await getTenantData(
    //       this.request.user?.tenant?.id,
    //       this.tenantRepository
    //     );
    // const token = tenantData?.data?.dailystory_token;
    if (!prospect) {
      return resError('Prospect not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      prospect.is_archived = true;
      prospect.created_at = new Date();
      prospect.created_by = user;
      const archivedProspect = await this.prospectsRepository.save(prospect);
      await queryRunner.commitTransaction();
      const { created_by: archivedCreated_By, prospectWithoutCreatedBy } =
        archivedProspect;
      // await deleteScheduleEmail("123", token)
      return resSuccess(
        'Prospect Deleted Successfully',
        'success',
        204,
        prospectWithoutCreatedBy
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError('Internal Server Error', ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async listProspects(params: ListProspectsDto, tenant_id: number) {
    try {
      const startDate: any = params?.start_date;
      const endDate: any = params?.end_date;
      const limit: number = params?.limit ?? 10;

      const bookingRule = await this.bookingRulesRepository.findOne({
        where: { tenant_id: tenant_id },
        select: [
          'oef_block_on_product',
          'oef_block_on_procedures',
          'tenant_id',
        ],
      });

      const page = params?.page ?? 1;

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
      if (params?.getByIds)
        Object.assign(where, {
          id: In(params.getByIds),
        });

      let drives = this.drivesRepository
        .createQueryBuilder('drives')
        .leftJoin('drives.account', 'account')
        .leftJoin('drives.location', 'location')
        .leftJoin('drives.recuriter', 'user')
        // .leftJoin('location.directions', 'directions')
        .leftJoin('account.collection_operation', 'collection_operation')
        .leftJoin('account.recruiter', 'recruiter')
        .leftJoin(
          'shifts',
          'shifts',
          `shifts.shiftable_id = drives.id AND shifts.is_archived = false`
        )
        .leftJoin(
          'shifts_projections_staff',
          'projections',
          `projections.shift_id = shifts.id AND (projections.is_archived = false)`
        )
        .addSelect('drives.tenant_id', 'tenant_id')
        .addSelect('drives.id', 'id')
        .addSelect(
          `(SELECT TO_CHAR((drives.date), 'MM-DD-YYYY'))`,
          'drive_date'
        )
        // .addSelect('shifts', 'shifts') // heres
        // .addSelect('directions', 'directions') // here
        // .addSelect('directions.miles', 'miles') // here
        .addSelect('collection_operation.id', 'collection_operation_id') // here
        // .addSelect('recruiter', 'recruiter') // here
        // .addSelect('projections', 'projections') // here

        .addSelect('account.name', 'account_name')
        .addSelect('user.first_name', 'user_first_name')
        .addSelect('user.last_name', 'user_last_name')
        .addSelect('location.name', 'location_name')
        .addSelect(
          `(SELECT TO_CHAR(MAX(d.date), 'MM-DD-YYYY')
            FROM drives d
            WHERE d.account_id = drives.account_id
              AND d.location_id = drives.location_id
              AND d.is_blueprint = false
              AND d.id != drives.id
              AND DATE_TRUNC('day', d.date) >= drives.date
            ) as next_drive`
        )
        .addSelect(
          `

          (SELECT  
            (SELECT MAX(d.date) FROM drives d WHERE d.account_id = drives.account_id
                AND d.location_id = drives.location_id
                AND d.is_blueprint = false
                AND d.id != drives.id
                AND DATE_TRUNC('day', d.date) >= drives.date
            )
          - INTERVAL '${params.eligibility || 0} days')  AS last_eligibility

        `
        )
        .addSelect(
          `(SELECT TO_CHAR(MIN(d.date), 'MM-DD-YYYY')
              FROM drives d
              WHERE d.account_id = drives.account_id
                AND d.location_id = drives.location_id
                AND d.is_blueprint = false
                AND d.id != drives.id
                AND DATE_TRUNC('day', d.date) <= DATE_TRUNC('day', drives.date)
            ) as last_drive`
        )
        .addSelect(
          `(SELECT CAST(SUM(sps.procedure_type_qty) AS INTEGER) || ' / ' || CAST(SUM(sps.product_yield) AS INTEGER)
            FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
            WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' GROUP BY shifts.shiftable_id
            LIMIT 1) as projection`
        )
        .addSelect(
          `(SELECT CAST(SUM(sps.product_yield) AS INTEGER)
            FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
            WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' GROUP BY shifts.shiftable_id
            LIMIT 1) as product_yield`
        )
        .addSelect(
          `(SELECT CAST(SUM(sps.procedure_type_qty) AS INTEGER)
            FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
            WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' GROUP BY shifts.shiftable_id
            LIMIT 1) as procedure_type_qty`
        )

        .addSelect(
          `(SELECT MAX(ac.created_at)
            FROM account_contacts ac
            WHERE ac.contactable_id = drives.account_id
            AND ac.contactable_type = '${PolymorphicType.CRM_ACCOUNTS}'
            ) as latest_contact_created_at`
        )
        .addSelect(
          `(SELECT v.first_name || ' ' || v.last_name
          FROM crm_volunteer v
          WHERE v.id = (SELECT ac.record_id
                        FROM account_contacts ac
                        JOIN drives_contacts dc ON dc.accounts_contacts_id = ac.id
                        JOIN drives d ON d.id = dc.drive_id
                        WHERE d.id = drives.id
                        LIMIT 1)) as cp_name`
        )
        .addSelect(
          `(SELECT v.first_name
          FROM crm_volunteer v
          WHERE v.id = (SELECT ac.record_id
                        FROM account_contacts ac
                        JOIN drives_contacts dc ON dc.accounts_contacts_id = ac.id
                        JOIN drives d ON d.id = dc.drive_id
                        WHERE d.id = drives.id
                        LIMIT 1)) as cp_first`
        )
        .addSelect(
          `(SELECT v.last_name
          FROM crm_volunteer v
          WHERE v.id = (SELECT ac.record_id
                        FROM account_contacts ac
                        JOIN drives_contacts dc ON dc.accounts_contacts_id = ac.id
                        JOIN drives d ON d.id = dc.drive_id
                        WHERE d.id = drives.id
                        LIMIT 1)) as cp_last`
        )
        .addSelect(
          `(SELECT v.id
               FROM crm_volunteer v
               WHERE v.id = (SELECT ac.record_id
                FROM account_contacts ac
                WHERE ac.contactable_id = drives.account_id
                AND ac.contactable_type = '${PolymorphicType.CRM_ACCOUNTS}'
                AND ac.role_id IN (SELECT cr.id
                    FROM contacts_roles cr
                    WHERE cr.name ILIKE 'chairperson')
                ORDER BY ac.created_at DESC LIMIT 1)
            ) as volunteer_id`
        )
        .addSelect(
          `(SELECT v.title
               FROM crm_volunteer v
               WHERE v.id = (SELECT ac.record_id
                FROM account_contacts ac
                WHERE ac.contactable_id = drives.account_id
                AND ac.contactable_type = '${PolymorphicType.CRM_ACCOUNTS}'
                AND ac.role_id IN (SELECT cr.id
                    FROM contacts_roles cr
                    WHERE cr.name ILIKE 'chairperson')
                ORDER BY ac.created_at DESC LIMIT 1)
            ) as cp_title`
        )
        .addSelect(
          `(SELECT
              (
                  SELECT c.data
                  FROM contacts c
                  JOIN account_contacts ac ON c.contactable_id = ac.record_id
                  WHERE c.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                  AND c.is_primary = true
                  AND (
                      (
                        c.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND
                        c.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND c.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                      OR
                      (
                        c.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND
                        c.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND c.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                  )
                  AND ac.id = dc.accounts_contacts_id
                  AND c.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND c.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}'
                  LIMIT 1
              ) AS cp_email
          FROM drives d
          JOIN drives_contacts dc ON d.id = dc.drive_id
          WHERE d.id = drives.id
          LIMIT 1)`
        )
        .addSelect(
          `(SELECT
            (
                SELECT c.data AS cp_mobile
                FROM contacts c
                JOIN account_contacts ac ON c.contactable_id = ac.record_id
                WHERE c.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                AND c.is_primary = true
                AND c.contact_type >= '${ContactTypeEnum.WORK_PHONE}'
                AND c.contact_type <= '${ContactTypeEnum.OTHER_PHONE}'
                AND ac.id = dc.accounts_contacts_id
                LIMIT 1
            ) AS cp_mobile
        FROM drives d
        JOIN drives_contacts dc ON d.id = dc.drive_id
        WHERE d.id = drives.id
        LIMIT 1
        )`
        )
        .groupBy(
          ' shifts.id, drives.id, account.name, location.name, user.first_name, user.last_name, collection_operation.id, recruiter.id , location.site_type'
        )
        .andWhere({ ...where, is_archived: false, is_blueprint: true })
        .distinct(true);

      if (params?.location_type) {
        drives.andWhere('location.site_type = :selectedType', {
          selectedType: params?.location_type,
        });
      }

      if (params?.distance) {
        drives.andWhere(
          '(SELECT miles From location_directions where location_id=location.id and is_archived = false limit 1) <= :miles',
          {
            miles: Number(params.distance),
          }
        );
      }

      if (params?.start_date || params?.end_date) {
        const adjustedStartDate = params.start_date
          ? new Date(params.start_date)
          : null;
        const adjustedEndDate = params.end_date
          ? new Date(params.end_date)
          : null;

        if (adjustedStartDate) {
          if (adjustedEndDate) {
            drives.andWhere(`drives.date BETWEEN :start_date AND :end_date`, {
              start_date: adjustedStartDate,
              end_date: adjustedEndDate,
            });
          } else {
            drives.andWhere(`drives.date >= :start_date`, {
              start_date: adjustedStartDate,
            });
          }
        }

        if (adjustedEndDate && !adjustedStartDate) {
          drives.andWhere(`drives.date <= :end_date`, {
            end_date: adjustedEndDate,
          });
        }
      }

      if (params?.eligibility) {
        drives.andWhere(
          `NOT ( 
            SELECT 
              EXTRACT(day FROM AGE(CAST(next_drive AS DATE), CAST(drives.date AS DATE))) < :eligibility
              OR 
              EXTRACT(day FROM AGE(CAST(drives.date AS DATE), CAST(last_drive AS DATE))) < :eligibility
            FROM (
              SELECT 
                TO_CHAR(MAX(d.date), 'MM-DD-YYYY') AS next_drive
              FROM drives d
              WHERE d.account_id = drives.account_id
                AND d.location_id = drives.location_id
                AND d.is_blueprint = false
                AND d.id != drives.id
                AND DATE_TRUNC('day', d.date) >= DATE_TRUNC('day', drives.date)
            ) next_drive_subquery,
            (
              SELECT 
                TO_CHAR(MIN(d.date), 'MM-DD-YYYY') AS last_drive
              FROM drives d
              WHERE d.account_id = drives.account_id
                AND d.location_id = drives.location_id
                AND d.is_blueprint = false
                AND d.id != drives.id
                AND DATE_TRUNC('day', d.date) <= DATE_TRUNC('day', drives.date)
            ) last_drive_subquery
          )`,
          { eligibility: params?.eligibility }
        );
      }

      if (params.sortBy === 'account_name') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('account_name', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('account_name', 'DESC');
        }
      }

      if (params.sortBy === 'location_name') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('location_name', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('location_name', 'DESC');
        }
      }
      if (params.sortBy === 'last_drive') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('last_drive', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('last_drive', 'DESC');
        }
      }
      if (params.sortBy === 'next_drive') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('next_drive', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('next_drive', 'DESC');
        }
      }
      if (params.sortBy === 'cp_name') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('cp_name', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('cp_name', 'DESC');
        }
      }

      if (params.sortBy === 'cp_email') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('cp_email', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('cp_email', 'DESC');
        }
      }

      if (params.sortBy === 'cp_mobile') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('cp_mobile', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('cp_mobile', 'DESC');
        }
      }
      if (params.sortBy === 'last_eligibility') {
        if (params.sortOrder.toUpperCase() === 'ASC') {
          drives = drives.addOrderBy('last_eligibility', 'ASC');
        } else if (params.sortOrder.toUpperCase() === 'DESC') {
          drives = drives.addOrderBy('last_eligibility', 'DESC');
        }
      }

      // Min Projection & Max Projection

      if (params?.min_projection && bookingRule.oef_block_on_procedures) {
        drives.andWhere(
          `(
            SELECT CAST(SUM(sps.procedure_type_qty) AS INTEGER) as procedure_type_qty
            FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
            WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' 
            GROUP BY shifts.shiftable_id
            LIMIT 1 
          ) >= :min_projection`,
          { min_projection: params?.min_projection }
        );
      }

      if (params?.max_projection && bookingRule.oef_block_on_procedures) {
        drives.andWhere(
          `(
             SELECT CAST(SUM(sps.procedure_type_qty) AS INTEGER) as procedure_type_qty
             FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
             WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' 
             GROUP BY shifts.shiftable_id
             LIMIT 1 
           ) <= :max_projection`,
          { max_projection: params?.max_projection }
        );
      }
      if (params?.min_projection && bookingRule.oef_block_on_product) {
        drives.andWhere(
          `(
            SELECT CAST(SUM(sps.product_yield) AS INTEGER) as product_yield
            FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
            WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' GROUP BY shifts.shiftable_id
            LIMIT 1
           ) >= :min_projection`,
          { min_projection: params?.min_projection }
        );
      }

      if (params?.max_projection && bookingRule.oef_block_on_product) {
        drives.andWhere(
          `(
            SELECT CAST(SUM(sps.product_yield) AS INTEGER) as product_yield
            FROM shifts_projections_staff sps JOIN shifts s ON sps.shift_id = s.id
            WHERE s.shiftable_id = drives.id AND s.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' GROUP BY shifts.shiftable_id
            LIMIT 1
           ) <= :max_projection`,
          { max_projection: params?.max_projection }
        );
      }

      if (params?.organizational_levels) {
        const collection_operations = JSON.parse(params.organizational_levels);
        let olWhere = '';
        const payload = {};
        Object.entries(collection_operations).forEach(
          ([co_id, value], index) => {
            olWhere += olWhere ? ' OR ' : '';
            olWhere += `(collection_operation.id = :co_id${index}`;
            payload[`co_id${index}`] = co_id;
            const { recruiters } = <any>value;
            if (recruiters?.length) {
              olWhere += ` AND recruiter.id IN (:...recruiters${index})`;
              payload[`recruiters${index}`] = recruiters;
            }
            olWhere += ')';
          }
        );
        drives.andWhere(`(${olWhere})`, payload);
      }
      // if (!params?.getByIds) {
      //   drives.take(limit).skip((page - 1) * limit);
      // }

      const count = await drives.getCount();
      // const data = await drives.getRawMany();

      if (page && limit) {
        const { skip, take } = pagination(page, limit - 1);
        drives = drives.limit(take).offset(skip);
      }

      const records = await drives.getRawMany();

      return {
        status: HttpStatus.OK,
        message: 'Build Segments Fetched Successfully',
        count: count,
        data: records,
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

  async addVariables(inputData: any, dataBlueprint: any) {
    const createRegexPattern = (placeholder: string) => {
      const escapedPlaceholder = placeholder.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        '\\$&'
      );
      const regexPattern = `<${escapedPlaceholder}>`;
      return new RegExp(regexPattern, 'g');
    };

    const replacePlaceholders = (
      inputString: string,
      replacements: { [key: string]: string }
    ) => {
      const keys = Object.keys(replacements);
      const patterns = keys.map(createRegexPattern);

      let replacedString = inputString;
      keys.forEach((key, index) => {
        replacedString = replacedString.replace(
          patterns[index],
          replacements[key]
        );
      });

      return replacedString;
    };
    const replacedData = replacePlaceholders(inputData, {
      next_drive_date: dataBlueprint.next_drive,
      last_eligible_date: dataBlueprint.last_drive,
      account_name: dataBlueprint.account_name,
      cp_last: dataBlueprint.cp_last,
      cp_first: dataBlueprint.cp_first,
      cp_title: dataBlueprint.cp_title,
      recruiter:
        dataBlueprint.user_first_name.trim() +
        ' ' +
        dataBlueprint.user_last_name.trim(),
    });
    return {
      message: replacedData,
      cp_email: dataBlueprint.cp_email,
      driveDate: dataBlueprint.drive_date,
      locationName: dataBlueprint.location_name,
    };
  }
  async sendEmail(
    templateId: any,
    email: any,
    data: any,
    schedule_date: any,
    drive_date: any,
    location: any
  ) {
    try {
      const tenantData = await getTenantData(
        this.request.user?.tenant?.id,
        this.tenantRepository
      );

      const campaignId = tenantData?.data?.dailystory_campaign_id;
      const token = decryptSecretKey(tenantData?.data?.dailystory_token);

      if (!campaignId || !token)
        return resError(
          'DS Tenant config not found',
          ErrorConstants.Error,
          500
        );
      const url = `${this.apiUrl}/email/send/${templateId}?email=${email}`;
      // const token = process.env.DAILY_STORY_API_TOKEN;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response: AxiosResponse<any> = await this.httpService
        .post(
          url,
          {
            messageType: 'email',
            subject: `Blood Donation Drive ${drive_date} , ${location}`,
            OperationType: 'Schedule',
            OperationDate: schedule_date,
            body: data?.emailContent,
          },
          { headers }
        )
        .toPromise();

      // SCHEDULE PART NEEDED TO BE DISCUSSED BY DAILYSTORY

      // const response: AxiosResponse<any> = await this.httpService
      // .post(
      //   url,
      //   {
      //     contactMethod: 'SendEmail',
      //     messageType: 'email',
      //     subject: `Blood Donation Drive ${drive_date} , ${location}`,
      //     dateSchedule: new Date(schedule_date),
      //     message_text: data?.emailContent,
      //     segment: [0],
      //     campaignId: process.env.DAILY_STORY_CAMPAIGN_ID,
      //     messageId: templateId,
      //     excludes: [20426],
      //     send_window_hours: null,
      //   },
      //   { headers }
      // )
      // .toPromise();

      return response?.data;
    } catch (error) {
      console.log(error);

      if (!error.response?.data?.Status) {
        return resError(
          error.response.data?.Message,
          ErrorConstants.Error,
          error.status
        );
      }
    }
  }

  async verifyDriveIds(blueprintIds: bigint[]): Promise<any> {
    const blueprints = [];

    for (const id of blueprintIds) {
      const bluePrint = await this.drivesRepository.findOne({
        where: {
          id,
          tenant: { id: this.request?.user?.tenant?.id },
          is_blueprint: true,
        },
      });
      if (!bluePrint) {
        throw new BadRequestException(
          `Drive blueprint with id ${id} not found`
        );
      } else blueprints.push(bluePrint);
    }
    return blueprints;
  }
}
