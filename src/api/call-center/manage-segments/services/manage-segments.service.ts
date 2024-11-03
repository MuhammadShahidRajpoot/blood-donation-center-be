import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Repository } from 'typeorm';
import { Segments } from '../entities/segments.entity';
import {
  CreateSegmentsDto,
  GetAllSegmentsDto,
  GetDonorsInformationDto,
} from '../dto/segments.dto';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from '../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../system-configuration/constants/error.constants';
import { SuccessConstants } from '../../../system-configuration/constants/success.constants';
import { Tenant } from '../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

import moment from 'moment';
import {
  getAllSegmentsContactsFromDailyStory,
  getAllSegmentsFromDailyStory,
  getTenantData,
} from 'src/api/common/services/dailyStory.service';
import { SegmentsContacts } from '../entities/segments-contacts.entity';
import {
  CreateSegmentsContactsDto,
  UpdateCallJobsSegmentsContactsDto,
  UpdateSegmentsContactsDto,
} from '../dto/segment-contacts.dto';
import { call_status } from 'src/api/common/enums/call-center.enums';
import { SegmentsHistory } from '../entities/segments-history.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { CallJobContacts } from '../entities/call-job-contacts.entity';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class ManageSegmentsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Segments)
    private readonly manageSegmentRepository: Repository<Segments>,
    @InjectRepository(SegmentsContacts)
    private readonly manageSegmentContactsRepository: Repository<SegmentsContacts>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SegmentsHistory)
    private readonly segmentsHistoryRepository: Repository<SegmentsHistory>,
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    @InjectRepository(SegmentsContacts)
    private readonly segmentsContactRepository: Repository<SegmentsContacts>,
    @InjectRepository(CallJobContacts)
    private readonly callJobContactsRepository: Repository<CallJobContacts>,
    @InjectRepository(Donors)
    private readonly donorsRepo: Repository<Donors>
  ) {}

  async create(createSegmentsDto: CreateSegmentsDto, reqUser: any) {
    try {
      const user = await this.userRepository.findOneBy({
        id: reqUser?.id,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const {
        tenant_id,
        ds_segment_id,
        name,
        segment_type,
        total_members,
        ds_date_created,
        ds_date_last_modified,
      } = createSegmentsDto;

      const { tenant } = reqUser;

      const segment: any = new Segments();
      segment.tenant_id = tenant_id ? tenant_id : tenant?.id;
      segment.ds_segment_id = ds_segment_id;
      segment.name = name;
      segment.segment_type = segment_type;
      segment.total_members = total_members;
      segment.ds_date_created = ds_date_created;
      segment.ds_date_last_modified = ds_date_last_modified;
      segment.created_at = new Date();
      segment.created_by = user.id;

      // Save the Segments entity
      const savedSegment = await this.manageSegmentRepository.save(segment);

      return resSuccess(
        'Segment Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedSegment
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async createSegmentContact(
    createSegmentsContactDto: CreateSegmentsContactsDto,
    userId: any
  ) {
    try {
      const user = await this.userRepository.findOneBy({
        id: userId,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const { ds_segment_id, contact_id, is_archived } =
        createSegmentsContactDto;
      const contact = await this.contactsRepository.findOneBy({
        id: contact_id,
      });
      const segmentContact: any = new SegmentsContacts();
      segmentContact.ds_segment_id = ds_segment_id;
      segmentContact.contact_id = contact_id;
      segmentContact.dsid = contact?.dsid ? contact?.dsid : null; //from contacts table (if contacts table have dsid)
      segmentContact.call_outcome_id = null; // id from call_outcomes table
      segmentContact.call_status = call_status.PENDING; // 1: Pending',   2: 'Completed',  3: 'Queue'
      segmentContact.queue_time = null;
      segmentContact.is_archived = is_archived;
      segmentContact.created_at = new Date();
      segmentContact.created_by = userId;
      // Save the Segments Contacts entity
      const savedSegmentContact =
        await this.manageSegmentContactsRepository.save(segmentContact);

      return resSuccess(
        'Segment Contact Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedSegmentContact
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAllSrgments(getAllSegmentsInterface: GetAllSegmentsDto) {
    try {
      const { sortBy, sortOrder } = getAllSegmentsInterface;
      const limit = Number(getAllSegmentsInterface?.limit);
      const page = Number(getAllSegmentsInterface?.page);

      if (page <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const where = { tenant_id: this.request?.user?.tenant?.id };

      if (getAllSegmentsInterface?.keyword) {
        Object.assign(where, {
          name: ILike(`%${getAllSegmentsInterface?.keyword}%`),
        });
      }
      if (
        getAllSegmentsInterface?.start_date &&
        getAllSegmentsInterface?.end_date
      ) {
        const startDate = moment(
          getAllSegmentsInterface.start_date,
          'MM-DD-YYYY'
        ).format('YYYY-MM-DDTHH:mm:ss');
        const endDate = moment(getAllSegmentsInterface.end_date, 'MM-DD-YYYY')
          .endOf('day')
          .format('YYYY-MM-DDTHH:mm:ss');

        Object.assign(where, {
          ds_date_last_modified: Between(
            new Date(startDate),
            new Date(endDate)
          ),
        });
      }

      let order = {};
      switch (sortBy) {
        case 'name':
          order = { 'segments.name': sortOrder };
          break;
        case 'ds_segment_type':
          order = { 'segments.segment_type': sortOrder };
          break;
        case 'total_members':
          order = { 'segments.total_members': sortOrder };
          break;
        case 'ds_date_last_modified':
          order = { 'segments.ds_date_last_modified': sortOrder };
          break;
        default:
          order = { 'segments.id': 'DESC' };
          break;
      }
      const queryBuilder =
        this.manageSegmentRepository.createQueryBuilder('segments');
      queryBuilder
        .where(where)
        .select([
          'segments.tenant_id AS tenant_id',
          'segments.id AS id',
          'segments.ds_segment_id AS ds_segment_id',
          'segments.name AS name',
          'segments.segment_type AS ds_segment_type',
          'segments.total_members AS total_members',
          'segments.ds_date_created AS ds_date_created',
          'segments.ds_date_last_modified AS ds_date_last_modified',
          'segments.created_at AS created_at',
          'segments.created_by AS created_by',
        ])
        .orderBy(order)
        .offset((page - 1) * limit || 0)
        .limit(limit || 10);

      const records = await queryBuilder.getRawMany();
      const count = await queryBuilder.getCount();
      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        record_count: count,
        data: records,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateSegmentsFromDailyStory(reqUser?: any) {
    const tenantData = await getTenantData(
      reqUser?.tenant_id,
      this.tenantRepository
    );
    const secretToken = tenantData?.data?.dailystory_token;

    if (!secretToken)
      return resError('DS Tenant config not found', ErrorConstants.Error, 500);
    const dailyStoryApiToken = decryptSecretKey(secretToken);

    // const dailyStoryApiToken = process.env.DAILY_STORY_API_TOKEN;
    const dailyStorySegmentsData = await getAllSegmentsFromDailyStory(
      dailyStoryApiToken
    );

    if (
      (dailyStorySegmentsData.status &&
        dailyStorySegmentsData.status === 'error') ||
      (dailyStorySegmentsData.status_code &&
        dailyStorySegmentsData.status_code === 500)
    ) {
      return resError(
        dailyStorySegmentsData.response,
        dailyStorySegmentsData.status,
        dailyStorySegmentsData.status_code
      );
    }

    const dailyStorySegments = dailyStorySegmentsData?.Response?.segments || [];

    if (dailyStorySegments.length === 0) {
      return resSuccess(
        'Segments from daily story not found',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { tenant_id: reqUser.tenant_id }
      );
    }

    const user = await this.userRepository.find({ take: 1 }); //need to change when we will get created_by from Daily Story
    const promises = [];
    const queryBuilder =
      this.manageSegmentRepository.createQueryBuilder('segments');
    queryBuilder.select('segments.*');

    const records = await queryBuilder.getRawMany();
    const recordsIds = records.map((record) => record.ds_segment_id);

    const getTenantIdFromDb = async (dailystory_tenant_id: string) => {
      const tenant = await this.tenantRepository.findOne({
        where: { dailystory_tenant_id },
      });
      return tenant?.id;
    };

    for (const item of dailyStorySegments) {
      if (recordsIds.includes(String(item?.id))) {
        const record = records.find((record) => {
          return record.ds_segment_id === String(item?.id);
        });

        const parsedDate1 = moment(record.ds_date_last_modified);
        const parsedDate2 = moment(item.date_last_modified);
        const datesAreEqual = parsedDate1.isSame(parsedDate2);

        if (!datesAreEqual) {
          const previousSegmentsRecord = records.find((record) => {
            return record.ds_segment_id === String(item?.id);
          });

          const segmentsHistory: any = new SegmentsHistory();
          segmentsHistory.history_reason = 'C';
          segmentsHistory.id = previousSegmentsRecord.id;
          segmentsHistory.tenant_id = previousSegmentsRecord.tenant_id;
          segmentsHistory.ds_segment_id = previousSegmentsRecord.ds_segment_id;
          segmentsHistory.name = previousSegmentsRecord.name;
          segmentsHistory.segment_type = previousSegmentsRecord.segment_type;
          segmentsHistory.total_members = previousSegmentsRecord.total_members;
          segmentsHistory.ds_date_created =
            previousSegmentsRecord.ds_date_created;
          segmentsHistory.ds_date_last_modified =
            previousSegmentsRecord.ds_date_last_modified;
          segmentsHistory.created_at = new Date();
          segmentsHistory.created_by = reqUser?.id ? reqUser.id : user[0].id; //need to update for CRON
          const savedSegment =
            this.segmentsHistoryRepository.save(segmentsHistory);
          promises.push(savedSegment);
          const dbTenantId = await getTenantIdFromDb(item.tenantid);

          const updateResult = this.manageSegmentRepository
            .createQueryBuilder()
            .update('segments')
            .set({
              name: item?.name,
              segment_type: item?.segmentType,
              total_members: item?.total_members,
              ds_date_last_modified: item?.date_last_modified,
              tenant_id: dbTenantId,
            })
            .where('ds_segment_id = :dsSegmentId', { dsSegmentId: item?.id })
            .execute();

          promises.push(updateResult);
        }
      } else {
        const tenantIdPromise = getTenantIdFromDb(item.tenantid);
        promises.push(
          tenantIdPromise
            .then((tenantId) => {
              if (tenantId) {
                const segment: any = new Segments();
                segment.tenant_id = tenantId;
                segment.ds_segment_id = item?.id;
                segment.name = item?.name;
                segment.segment_type = item?.segmentType;
                segment.total_members = item?.total_members;
                segment.ds_date_created = item?.date_created;
                segment.ds_date_last_modified = item?.date_last_modified;
                segment.created_at = new Date();
                segment.created_by = reqUser?.id ? reqUser.id : user[0].id; //need to update for CRON

                return this.manageSegmentRepository.save(segment);
              } else {
                return null; // need to update
              }
            })
            .catch((error) => {
              console.error('Error fetching tenantId:', error);
              return null;
            })
        );
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    return resSuccess(
      'Segments updated from Daily Story',
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      { tenant_id: reqUser && reqUser.tenant_id ? reqUser.tenant_id : '' }
    );
  }

  async updateSegmentsContactsFromDailyStory(
    segmentId: number,
    getDonorsInformationDto: GetDonorsInformationDto,
    reqUser: any
  ) {
    const tenantData = await getTenantData(
      reqUser?.tenant_id,
      this.tenantRepository
    );
    const secretToken = tenantData?.data?.dailystory_token;

    if (!secretToken)
      return resError('DS Tenant config not found', ErrorConstants.Error, 500);
    const dailyStoryApiToken = decryptSecretKey(secretToken);
    // const dailyStoryApiToken = process.env.DAILY_STORY_API_TOKEN;
    const { keyword } = getDonorsInformationDto;
    const limit = Number(getDonorsInformationDto?.limit);
    const page = Number(getDonorsInformationDto?.page);

    const segmentsConstactsDailyStoryData =
      await getAllSegmentsContactsFromDailyStory(
        dailyStoryApiToken,
        segmentId.toString()
      );

    if (
      (segmentsConstactsDailyStoryData.status &&
        segmentsConstactsDailyStoryData.status === 'error') ||
      (segmentsConstactsDailyStoryData.status_code &&
        segmentsConstactsDailyStoryData.status_code === 500)
    ) {
      return resError(
        segmentsConstactsDailyStoryData.response,
        segmentsConstactsDailyStoryData.status,
        segmentsConstactsDailyStoryData.status_code
      );
    }

    const dailySegmentContactDsIds =
      segmentsConstactsDailyStoryData?.Response?.contacts ?? [];

    if (dailySegmentContactDsIds.length === 0) {
      return {
        status: SuccessConstants.SUCCESS,
        response: 'Donners from daily story not found',
        code: HttpStatus.OK,
        record_count: 0,
        data: [],
      };
    }
    const donorsData = await this.donorsRepo.find({
      select: ['id', 'dsid'],
      where: {
        dsid: In(dailySegmentContactDsIds),
      },
    });

    const segmentContactsPromises = [];

    const query =
      this.manageSegmentContactsRepository.createQueryBuilder(
        'segments_contacts'
      );
    query.select('*');
    const segmentsContactsExsistingRecords = await query.getRawMany();

    const segmentsContactsExistingRecordsIds =
      segmentsContactsExsistingRecords.map((record) => record.dsid);

    for (const donor of donorsData || []) {
      const contactsQuery = `select id from contacts where contactable_type = '${PolymorphicType.CRM_CONTACTS_DONORS}' and contactable_id = ${donor.id} AND is_primary = true AND contact_type IN (1,2,3)
order by contact_type asc
LIMIT 1`;
      const contactData = await this.contactsRepository.query(contactsQuery);
      if (contactData.length)
        if (segmentsContactsExistingRecordsIds.includes(String(donor.dsid))) {
          const updateResult = this.manageSegmentContactsRepository
            .createQueryBuilder()
            .update('segments_contacts')
            .set({
              // need to update later if needed
              dsid: donor.dsid,
            })
            .where('dsid = :dsid', { dsid: donor.dsid })
            .execute();

          segmentContactsPromises.push(updateResult);
        } else {
          const segmentContact: any = new SegmentsContacts();
          segmentContact.ds_segment_id = BigInt(segmentId);
          segmentContact.contact_id = contactData[0]?.id || '';
          segmentContact.dsid = donor.dsid;
          segmentContact.call_outcome_id = null; //need to Update
          segmentContact.call_status = call_status.PENDING; //need to Update
          segmentContact.queue_time = null; //need to Update
          segmentContact.is_archived = false;
          segmentContact.created_by = reqUser.id;
          segmentContact.created_at = new Date();
          segmentContactsPromises.push(
            this.manageSegmentContactsRepository.save(segmentContact)
          );
        }
    }

    if (segmentContactsPromises.length > 0) {
      await Promise.all(segmentContactsPromises);
    }

    try {
      const queryBuilder =
        this.manageSegmentRepository.createQueryBuilder('segments');
      queryBuilder
        .select(
          ` distinct                                                                                                                                                                 
            segments.id AS segment_id,
            segments.tenant_id AS tenant_id,
            sc.created_at AS segment_contact_created_at,
            sc.is_archived AS is_archived,
            CONCAT(d.first_name, ' ', d.last_name) AS donor_name,
            c.id AS contact_id,
            co.name AS last_outcome,
            CONCAT(cs.first_name, ' ', cs.last_name) AS agent_name
          `
        )
        .innerJoin(
          'segments_contacts',
          'sc',
          'segments.ds_segment_id = sc.ds_segment_id'
        )
        .innerJoin(
          'contacts',
          'c',
          `c.id = sc.contact_id AND c.contactable_type = '${PolymorphicType.CRM_CONTACTS_DONORS}' AND c.is_primary = true AND c.contact_type IN (1,2,3)`
        )
        .innerJoin('donors', 'd', 'd.id = c.contactable_id')
        .leftJoin('call_outcomes', 'co', 'co.id = sc.call_outcome_id')
        .innerJoin(
          'call_jobs_call_segments',
          'cjcs',
          'cjcs.segment_id = segments.id'
        )
        .innerJoin(
          'call_jobs_agents',
          'cja',
          'cja.call_job_id = cjcs.call_job_id'
        )
        .leftJoin('user', 'cs', 'cs.id = cja.user_id')
        .where('segments.ds_segment_id = :segmentId', { segmentId })
        .offset((page - 1) * limit || 0)
        .limit(limit || 10);

      const count = await queryBuilder.getCount();
      const records = await queryBuilder.getRawMany();

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        record_count: count,
        data: records,
      };
    } catch {
      return resError(
        `Error getting Donors Please try again`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateSegmentsContacts(
    id: bigint,
    updateSegmentContactsDto: UpdateSegmentsContactsDto
  ) {
    try {
      const segmentContact: any = await this.segmentsContactRepository.findOne({
        where: { id },
      });

      if (!segmentContact) {
        return resError(
          'Resource not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      segmentContact.call_status = updateSegmentContactsDto?.call_status;
      segmentContact.queue_time = updateSegmentContactsDto?.queue_time;
      segmentContact.call_outcome_id =
        updateSegmentContactsDto?.call_outcome_id;
      segmentContact.no_of_retry = updateSegmentContactsDto?.no_of_retry;

      const savedSegmentContact = await this.segmentsContactRepository.save(
        segmentContact
      );

      return resSuccess(
        'Resource updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedSegmentContact
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateCallJobsSegmentsContacts(
    id: bigint,
    updateCallJobsSegmentsContactsDto: UpdateCallJobsSegmentsContactsDto
  ) {
    try {
      const callJobSegmentContact: any =
        await this.callJobContactsRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!callJobSegmentContact) {
        return resError(
          'callJobSegmentContact resource not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      callJobSegmentContact.call_status =
        updateCallJobsSegmentsContactsDto?.call_status;
      callJobSegmentContact.call_outcome_id =
        updateCallJobsSegmentsContactsDto?.call_outcome_id;
      callJobSegmentContact.no_of_retry =
        updateCallJobsSegmentsContactsDto?.no_of_retry;
      callJobSegmentContact.max_call_count =
        updateCallJobsSegmentsContactsDto?.max_call_count;

      const savedCallJobSegmentContact =
        await this.callJobContactsRepository.save(callJobSegmentContact);

      return resSuccess(
        'Call Job Segment Contact Resource updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedCallJobSegmentContact
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
