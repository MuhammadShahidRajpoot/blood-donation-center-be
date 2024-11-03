import { ContactPreferenceService } from './../../../crm/contacts/common/contact-preferences/service/contact-preference.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Between, ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DialingCenterCallJobsQueryDto } from '../dto/dialing-center-query.dto';
import { CallJobs } from '../../call-schedule/call-jobs/entities/call-jobs.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { DialingCenterCallJobs } from '../entity/dialing-center-call-jobs.entity';
import { DialingCenterCallJobDto } from '../dto/dialing-center-call-job.dto';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { DialingCenterNotes } from '../entity/dailing-center-notes';
import { DialingCenterNotesDto } from '../dto/dialing-center-note.dto';
import { CallJobsService } from '../../call-schedule/call-jobs/services/call-job.service';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DonorsService } from 'src/api/crm/contacts/donor/services/donors.service';
import { CallCenterUsersService } from '../../user/service/call-center-users.service';
@Injectable()
export class DialingCenterService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CallJobs)
    private readonly callJobsRepository: Repository<CallJobs>,
    @InjectRepository(DialingCenterCallJobs)
    private readonly dialingCenterCallJobsRepository: Repository<DialingCenterCallJobs>,
    @InjectRepository(Donors)
    private DonorsRepository: Repository<Donors>,
    @InjectRepository(DialingCenterNotes)
    private readonly dialingCenterNotesRepository: Repository<DialingCenterNotes>,
    public readonly callJobsService: CallJobsService,
    public readonly donorsService: DonorsService,
    public readonly contactPreferenceService: ContactPreferenceService,
    public readonly callCenterUsersService: CallCenterUsersService
  ) {}

  async create(dialingCenterCallJobDto: DialingCenterCallJobDto) {
    try {
      const dialingCenterCallJobsEntity = new DialingCenterCallJobs();

      Object.assign(dialingCenterCallJobsEntity, dialingCenterCallJobDto);
      dialingCenterCallJobsEntity.created_by = this.request?.user;
      dialingCenterCallJobsEntity.tenant_id = this.request?.user?.tenant?.id;
      const savedDialingCenterCallJobsEntity =
        await this.dialingCenterCallJobsRepository.save(
          dialingCenterCallJobsEntity
        );
      return resSuccess(
        'Dialing Center Call Job Created Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDialingCenterCallJobsEntity
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getSingleDialingCenterCallJobByCallJobId(callJobId) {
    try {
      const dialingCenterCallJobData =
        await this.dialingCenterCallJobsRepository.findOne({
          where: {
            call_job_id: callJobId,
            tenant_id: this.request?.user?.tenant?.id,
          },
        });

      if (!dialingCenterCallJobData) {
        return resError(
          'Dialing Center Call Job not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return resSuccess(
        'Dialing Center Call Job fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        dialingCenterCallJobData
      );
    } catch (error) {
      console.error(error);
      return resError(
        'An error occurred while fetching the Dialing Center Call Job.',
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllDialingCenterCallJobs(
    dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto
  ) {
    try {
      const { sortBy, sortOrder } = dialingCenterCallJobsQueryDto;
      const limit = Number(dialingCenterCallJobsQueryDto?.limit);
      const page = Number(dialingCenterCallJobsQueryDto?.page);
      const user_id = Number(dialingCenterCallJobsQueryDto?.user_id);

      if (page <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (user_id <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      let whereClause = `WHERE is_archived = false AND tenant_id = ${this.request.user?.tenant?.id} AND status <> 'pending'`;

      if (dialingCenterCallJobsQueryDto.status) {
        whereClause += `AND status = '${dialingCenterCallJobsQueryDto.status}'`;
      }

      if (dialingCenterCallJobsQueryDto.name) {
        whereClause += `AND name ILIKE '%${dialingCenterCallJobsQueryDto.name}%'`;
      }

      const start_date = dialingCenterCallJobsQueryDto.start_date;
      const end_date = dialingCenterCallJobsQueryDto.end_date;
      if (start_date && end_date) {
        const callJobStartDateTime = new Date(`${start_date}T00:00:00.000Z`);
        const callJobEndDateTime = new Date(`${end_date}T23:59:59.999Z`);
        whereClause += `AND (job_start_date BETWEEN '${callJobStartDateTime.toISOString()}' AND '${callJobEndDateTime.toISOString()}')`;
      }

      if (dialingCenterCallJobsQueryDto.user_id) {
        whereClause += `AND id IN (
        SELECT 
            call_job_id 
        FROM 
            call_jobs_agents 
        WHERE 
            user_id = ${dialingCenterCallJobsQueryDto.user_id}
    ) `;
      }

      const pagination: any = {
        take: limit,
        skip: (page - 1) * limit,
      };

      let orderClause = '';

      if (sortBy) {
        if (sortBy === 'status') {
          orderClause = `ORDER BY status::text ${sortOrder || 'ASC'}`;
        } else {
          orderClause = `ORDER BY ${sortBy} ${sortOrder || 'ASC'}`;
        }
      } else {
        orderClause = `ORDER BY id DESC`;
      }

      const queryCte = `WITH CTE AS(select cj.id AS id,
        cj.is_archived as is_archived,
        cj.tenant_id as tenant_id,
       CASE 
            WHEN cj.status = 'assigned' THEN 'scheduled'
            WHEN cj.status IN ('inactive', 'cancelled') THEN 'cancelled'
            WHEN (cj.end_date < CURRENT_DATE AND COALESCE(dccj.actual_calls, 0) < COALESCE(seg.total_members, 0) AND cj.status = 'in-progress') THEN 'in-complete'
            ELSE cj.status
        END AS status,
       cj.start_date AS job_start_date,
       COALESCE(d.name, f.name, once.event_name) AS operation_name,
       cj.name as name,
       COALESCE(d.date, s.date, once.date) AS operation_date,
       CASE 
          WHEN COALESCE(cjao.operationable_type::text) = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN 'Drives'
          WHEN COALESCE(cjao.operationable_type::text) = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN 'Sessions'
          ELSE 'Other'
       END AS operationable_type,
       agents.agents_list AS assignedto,
       COALESCE(seg.total_members, 0) as planned_calls,
       COALESCE(dccj.actual_calls, 0) as actual_calls,
       ROUND(
        CASE 
            WHEN COALESCE(seg.total_members, 0) = 0 THEN 0 
            ELSE (COALESCE(dccj.actual_calls, 0) * 100.0 / seg.total_members) 
        END,
        0
       ) AS job_progress,
        true AS disable_call_initiation --leads are not able to initiate a call
 

      from call_jobs cj 
      LEFT JOIN call_jobs_associated_operations cjao on cjao.call_job_id = cj.id
      LEFT JOIN drives d on d.id = cjao.operationable_id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
      LEFT JOIN sessions s on s.id = cjao.operationable_id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
      LEFT JOIN facility f on f.id = s.donor_center_id
      LEFT JOIN oc_non_collection_events once on once.id = cjao.operationable_id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
      LEFT JOIN 
      (SELECT 
         cja.call_job_id,
         STRING_AGG(DISTINCT CONCAT(u.first_name, ' ', u.last_name), ', ') AS agents_list
      FROM 
         call_jobs_agents cja 
      LEFT JOIN 
         public.user u ON u.id = cja.user_id
      GROUP BY 
         cja.call_job_id
      ) agents ON agents.call_job_id = cj.id
     LEFT JOIN (
        SELECT 
            cjcs.call_job_id,
            COALESCE(SUM(seg.total_members), 0) AS total_members
        FROM 
            call_jobs_call_segments cjcs
            LEFT JOIN segments seg ON seg.id = cjcs.segment_id
        GROUP BY 
            cjcs.call_job_id
    ) seg ON seg.call_job_id = cj.id
    LEFT JOIN (
        SELECT 
            call_job_id,
            COALESCE(actual_calls, 0) AS actual_calls
        FROM 
            dialing_center_call_jobs dccj
        GROUP BY 
            call_job_id, actual_calls
    ) dccj ON dccj.call_job_id = cj.id  
    )`;

      const countQuery = queryCte + ` SELECT COUNT(*) FROM CTE ${whereClause}`;
      const total_records = await this.callJobsRepository.query(countQuery);

      const returnDataQuery =
        queryCte +
        ` SELECT * FROM CTE ${whereClause} ${orderClause} LIMIT ${pagination.take} OFFSET ${pagination.skip}`;
      const data = await this.callJobsRepository.query(returnDataQuery);

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Call Jobs Successfully Fetched.',
        code: HttpStatus.OK,
        call_jobs_count: total_records[0].count,
        data: data,
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAllDialingCenterCallJobsByLoggedAgent(
    dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto
  ) {
    try {
      const { sortBy, sortOrder } = dialingCenterCallJobsQueryDto;
      const limit = Number(dialingCenterCallJobsQueryDto?.limit);
      const page = Number(dialingCenterCallJobsQueryDto?.page);
      const user_id = Number(dialingCenterCallJobsQueryDto?.user_id);

      if (page <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (user_id <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      let whereClause = `WHERE is_archived = false AND tenant_id = ${this.request.user?.tenant?.id} AND status <> 'pending' AND user_id = ${user_id} `;

      if (dialingCenterCallJobsQueryDto.status) {
        whereClause += `AND status = '${dialingCenterCallJobsQueryDto.status}' `;
      }

      if (dialingCenterCallJobsQueryDto.name) {
        whereClause += `AND name ILIKE '%${dialingCenterCallJobsQueryDto.name}%' `;
      }

      const start_date = dialingCenterCallJobsQueryDto.start_date;
      const end_date = dialingCenterCallJobsQueryDto.end_date;
      if (start_date && end_date) {
        const callJobStartDateTime = new Date(`${start_date}T00:00:00.000Z`);
        const callJobEndDateTime = new Date(`${end_date}T23:59:59.999Z`);
        whereClause += `AND (job_start_date BETWEEN '${callJobStartDateTime.toISOString()}' AND '${callJobEndDateTime.toISOString()}') `;
      } else {
        whereClause += `AND (job_start_date::date <= CURRENT_DATE AND job_end_date::date >= CURRENT_DATE) `;
      }

      const pagination: any = {
        take: limit,
        skip: (page - 1) * limit,
      };

      let orderClause = '';

      if (sortBy) {
        if (sortBy === 'status') {
          orderClause = `ORDER BY status::text ${sortOrder || 'ASC'}`;
        } else {
          orderClause = `ORDER BY ${sortBy} ${sortOrder || 'ASC'}`;
        }
      } else {
        orderClause = `ORDER BY id DESC`;
      }

      const queryCte = `WITH CTE AS(SELECT DISTINCT 
    cj.id AS id,
    cja.user_id as user_id,
    cj.is_archived AS is_archived,
    cj.tenant_id AS tenant_id,
	 CASE 
            WHEN cj.status = 'assigned' THEN 'scheduled'
            WHEN cj.status IN ('inactive', 'cancelled') THEN 'cancelled'
            WHEN (cj.end_date < CURRENT_DATE AND COALESCE(calls.actual_calls, 0) < COALESCE(planned_calls.planned_calls, 0) AND cj.status = 'in-progress') THEN 'in-complete'
            ELSE cj.status
        END AS status,
       cj.start_date AS job_start_date,
       cj.end_date AS job_end_date,
       COALESCE(d.name, f.name, once.event_name) AS name,
       COALESCE(d.name, f.name, once.event_name) AS operation_name,
       COALESCE(d.date, s.date, once.date) AS operation_date,
       CASE 
          WHEN COALESCE(cjao.operationable_type::text) = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN 'Drives'
          WHEN COALESCE(cjao.operationable_type::text) = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN 'Sessions'
          ELSE 'Other'
       END AS operationable_type,
    agents.agents_list AS assignedto,
    calls.actual_calls as actual_calls,
	planned_calls.planned_calls as planned_calls,
	 ROUND(
        CASE 
            WHEN COALESCE(planned_calls.planned_calls, 0) = 0 THEN 0 
            ELSE (COALESCE(calls.actual_calls, 0) * 100.0 / planned_calls.planned_calls) 
        END,
        0
       ) AS job_progress,
	CASE 
        WHEN cj.start_date::date > CURRENT_DATE THEN true
        WHEN (SELECT COUNT(*) from call_jobs_agents cja where cja.user_id = ${user_id} and cja.date::date = CURRENT_DATE and cja.call_job_id = cj.id) = 0 THEN true
        ELSE false
    END AS disable_call_initiation
FROM 
    call_jobs cj
JOIN 
    call_jobs_agents cja ON cja.call_job_id = cj.id
	 LEFT JOIN call_jobs_associated_operations cjao on cjao.call_job_id = cj.id
      LEFT JOIN drives d on d.id = cjao.operationable_id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
      LEFT JOIN sessions s on s.id = cjao.operationable_id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
      LEFT JOIN facility f on f.id = s.donor_center_id
      LEFT JOIN oc_non_collection_events once on once.id = cjao.operationable_id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
LEFT JOIN 
    public.user u ON u.id = cja.user_id
LEFT JOIN 
    (
        SELECT 
            cja.call_job_id,
            STRING_AGG(DISTINCT CONCAT(u.first_name, ' ', u.last_name), ', ') AS agents_list
        FROM 
            call_jobs_agents cja 
        LEFT JOIN 
            public.user u ON u.id = cja.user_id
        GROUP BY 
            cja.call_job_id
    ) agents ON agents.call_job_id = cj.id
LEFT JOIN 
    (
        SELECT 
            cja.call_job_id,
            CASE 
                WHEN cj.end_date::date < CURRENT_DATE THEN SUM(cja.actual_calls)
                WHEN cj.start_date::date > CURRENT_DATE THEN 0
                ELSE SUM(CASE WHEN cja.date::date = CURRENT_DATE THEN cja.actual_calls ELSE 0 END)
            END AS actual_calls
        FROM 
            call_jobs cj 
        JOIN 
            call_jobs_agents cja ON cja.call_job_id = cj.id
         JOIN 
            public.user u ON u.id = cja.user_id
		WHERE
            cja.user_id = ${user_id}
        GROUP BY 
            cja.call_job_id, cj.end_date, cj.start_date
    ) calls ON calls.call_job_id = cj.id
	LEFT JOIN 
    (
        SELECT 
            cja.call_job_id,
		 CASE 
        WHEN cj.end_date::date < CURRENT_DATE THEN SUM(cja.assigned_calls)
        WHEN cj.start_date::date > CURRENT_DATE THEN (SELECT cja.assigned_calls FROM call_jobs_agents cja WHERE cja.user_id = ${user_id} AND cja.call_job_id = cj.id ORDER BY cja.date::date ASC LIMIT 1)
     ELSE 
                    SUM(
                        CASE 
                            WHEN cja.date::date < CURRENT_DATE THEN cja.assigned_calls - cja.actual_calls 
                            when cja.date::date = CURRENT_DATE then cja.assigned_calls
						else 0
                        END
                    )
    END AS planned_calls
        FROM 
            call_jobs cj 
        JOIN 
            call_jobs_agents cja ON cja.call_job_id = cj.id
         JOIN 
            public.user u ON u.id = cja.user_id
		WHERE
            cja.user_id = ${user_id}
        GROUP BY 
            cja.call_job_id, cj.end_date, cj.start_date, cj.id 
    ) planned_calls ON planned_calls.call_job_id = cj.id)`;

      const countQuery = queryCte + ` SELECT COUNT(*) FROM CTE ${whereClause}`;
      const total_records = await this.callJobsRepository.query(countQuery);

      const returnDataQuery =
        queryCte +
        ` SELECT * FROM CTE ${whereClause} ${orderClause} LIMIT ${pagination.take} OFFSET ${pagination.skip}`;
      const data = await this.callJobsRepository.query(returnDataQuery);

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Call Jobs related to Logged Agent Successfully Fetched.',
        code: HttpStatus.OK,
        call_jobs_count: total_records[0].count,
        data: data,
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async createDailingCenterNotes(dialingCenterNotesDto: DialingCenterNotesDto) {
    try {
      const dialingCenterNotes = new DialingCenterNotes();
      dialingCenterNotes.donor_id = dialingCenterNotesDto.donor_id;
      dialingCenterNotes.text = dialingCenterNotesDto.text;
      dialingCenterNotes.created_by = this.request?.user;
      dialingCenterNotes.tenant_id = this.request?.user?.tenant?.id;
      const savedDialingCenterCallJobsEntity =
        await this.dialingCenterNotesRepository.save(dialingCenterNotes);
      return resSuccess(
        'Dialing Center Note Created Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          text: savedDialingCenterCallJobsEntity?.text,
          created_at: savedDialingCenterCallJobsEntity?.created_at,
          first_name: savedDialingCenterCallJobsEntity?.created_by?.first_name,
          last_name: savedDialingCenterCallJobsEntity?.created_by?.last_name,
          tenant_id: this.request.user?.tenant?.id,
        }
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async getJobDetails({ operation_id }) {
    const checkCallJob = await this.callJobsRepository.findOne({
      where: {
        id: operation_id,
        tenant: { id: this.request.user?.tenant?.id },
      },
    });
    if (!checkCallJob) {
      return resError(
        'Call Job Detail not found',
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    try {
      const jobOperationDetails = `WITH drive_promotions AS (
    SELECT 
        dproit.drive_id,
        JSONB_BUILD_OBJECT(
            'id', pro.ID,
            'name', pro.NAME
        ) AS promotion_item
    FROM 
        drives_promotional_items dproit
    LEFT JOIN 
        promotional_items pro ON pro.id = dproit.promotional_item_id
),
job_shifts AS (
    SELECT 
        s.shiftable_id,
        TO_CHAR(MIN(s.start_time), 'YYYY-MM-DD"T"HH24:MI:SS') AS min_start_time,
        TO_CHAR(MAX(s.end_time), 'YYYY-MM-DD"T"HH24:MI:SS') as max_end_time
    FROM 
        shifts s
    JOIN 
        call_jobs_associated_operations cjao ON s.shiftable_id = cjao.operationable_id
    WHERE
        s.is_archived = FALSE
        AND (
            (cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shiftable_type = 'drives')
            OR 
            (cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND shiftable_type = 'sessions')
            OR 
            (cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND shiftable_type = 'oc_non_collection_events')
        )
    GROUP BY 
        s.shiftable_id
)
SELECT 
    cj.id AS id, 
    d.donor_information AS donor_info,
    cj.tenant_id AS tenant_id,
    cjao.operationable_id AS operationable_id,
    JSONB_AGG(dp.promotion_item) AS drive_promotion_items,
    CASE 
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN loc_drives.name
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN loc_nce.name
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN f.name
    END AS location_name,
    MIN(js.min_start_time) AS min_start_time,
    MAX(js.max_end_time) AS max_end_time,
    CASE 
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN 
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id', session_pro.ID,
                    'name', session_pro.NAME
                )
            ) 
         WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN 
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id', dri_pro.ID,
                    'name', dri_pro.NAME
                )
            ) 
       ELSE null
    END AS promotions,
    CASE 
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN CONCAT(drive_u.first_name, ' ', drive_u.last_name)
        ELSE NULL
    END AS recruiter,
    CASE 
        WHEN COALESCE(cjao.operationable_type::text, '') = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN 'Drives'
        WHEN COALESCE(cjao.operationable_type::text, '') = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN 'Sessions'
        WHEN COALESCE(cjao.operationable_type::text, '') = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN 'Non Collection Events'
        ELSE 'Other'
    END AS job_type,
    CASE
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN TO_CHAR(d.date, 'Mon, DD YYYY')
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN TO_CHAR(ssn.date, 'Mon, DD YYYY')
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN TO_CHAR(nce.date, 'Mon, DD YYYY')
    END AS operation_date,
    CASE
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN  JSONB_BUILD_OBJECT(
                    'chip_color', drives_ops.chip_color,
                    'name', drives_ops.NAME,
                    'tenant_id', drives_ops.tenant_id
                )
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN  JSONB_BUILD_OBJECT(
                    'chip_color', session_ops.chip_color,
                    'name', session_ops.NAME,
                    'tenant_id', session_ops.tenant_id
                )
        WHEN cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN  JSONB_BUILD_OBJECT(
                    'chip_color', nce_ops.chip_color,
                    'name', nce_ops.NAME,
                    'tenant_id', nce_ops.tenant_id
                )
    END AS operation_status
FROM 
    call_jobs cj
LEFT JOIN 
    call_jobs_associated_operations cjao ON cjao.call_job_id = cj.id
LEFT JOIN 
    drives d ON cjao.operationable_id = d.id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
LEFT JOIN 
    sessions ssn ON cjao.operationable_id = ssn.id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
LEFT JOIN 
    oc_non_collection_events nce ON cjao.operationable_id = nce.id AND cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
LEFT JOIN 
    crm_locations loc_drives ON cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND d.location_id = loc_drives.id
LEFT JOIN 
    crm_locations loc_nce ON cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND nce.location_id = loc_nce.id
LEFT JOIN 
    facility f ON cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND f.ID = ssn.donor_center_id
LEFT JOIN 
    "user" drive_u ON cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND drive_u.id = d.recruiter_id
LEFT JOIN 
    promotion_entity dri_pro ON cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND d.promotion_id = dri_pro.id
LEFT JOIN 
    sessions_promotions sp ON ssn.id = sp.session_id
LEFT JOIN 
    promotion_entity session_pro ON cjao.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND session_pro.id = sp.promotion_id
LEFT JOIN 
    drive_promotions dp ON d.id = dp.drive_id
LEFT JOIN 
    job_shifts js ON cjao.operationable_id = js.shiftable_id
LEFT JOIN 
    operations_status drives_ops ON d.operation_status_id = drives_ops.id
LEFT JOIN 
    operations_status session_ops ON ssn.operation_status_id = session_ops.id
LEFT JOIN 
    operations_status nce_ops ON nce.status_id = nce_ops.id
WHERE 
    cj.id = ${operation_id} and cj.tenant_id = ${this.request.user?.tenant?.id}
GROUP BY 
    cj.id, 
    d.donor_information,
    loc_drives.name,
    loc_nce.name,
    f.name,
    drive_u.first_name,
    drive_u.last_name,
    cjao.operationable_type,
	  drives_ops.id,
	  nce_ops.id,
	  session_ops.id,
    d.date,
    cjao.operationable_id,
	  nce.date,
    cj.tenant_id,
    ssn.date;
      `;
      const jobDetails = await this.callJobsRepository.query(
        jobOperationDetails
      );
      const { script, genericAttachment }: any =
        await this.callJobsService.getCallScriptWithAttachment(operation_id);

      return resSuccess(
        'Dialing Center Call Job Details Fetched Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { ...jobDetails[0], script, genericAttachment }
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async getAllDailingCenterNotes({ donor_id }) {
    try {
      const dialingCenterNotes = await this.dialingCenterNotesRepository.find({
        where: {
          donor_id: { id: donor_id as any },
          tenant_id: { id: this.request.user?.tenant?.id },
        },
        relations: ['tenant_id', 'created_by'],
      });
      const dialingCenterNotesObj = dialingCenterNotes?.map((e) => {
        return {
          text: e?.text,
          created_at: e?.created_at,
          first_name: e?.created_by?.first_name,
          last_name: e?.created_by?.last_name,
          tenant_id: this.request.user?.tenant?.id,
        };
      });
      return resSuccess(
        'Dialing Center Notes Fetched Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        dialingCenterNotesObj
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getDailingCenterDonorDetails({ id }) {
    const donor = await this.DonorsRepository.findOne({
      where: {
        id: id,
        tenant: { id: this.request.user?.tenant?.id },
      },
    });
    if (!donor) {
      return resError(
        'Donor not found',
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    try {
      const donorQuery = this.DonorsRepository.createQueryBuilder('donor')
        .addSelect('updated_at')
        .leftJoinAndSelect(
          'blood_groups',
          'blood_groups',
          `blood_groups.id = donor.blood_group_id`
        )
        .leftJoinAndSelect(
          DonorDonations,
          'donors_donations',
          'donors_donations.donor_id = donor.id'
        )
        .leftJoinAndSelect(
          ProcedureTypes,
          'procedure_types',
          'procedure_types.id = donors_donations.donation_type'
        )
        .leftJoinAndSelect(
          (subQuery) => {
            return subQuery
              .from(DonorDonations, 'donors_donations')
              .select([
                'donors_donations.donor_id',
                'donors_donations.points as points',
                'donors_donations.donation_ltd as donation_ltd',
              ])
              .groupBy('donors_donations.donor_id')
              .addGroupBy('donors_donations.points')
              .addGroupBy('donors_donations.donation_ltd');
          },
          'donation',
          'donor.id = donation.donor_id'
        )
        .leftJoinAndSelect(
          'address',
          'address',
          'address.addressable_id = donors_donations.facility_id AND address.addressable_type = :facilityType',
          { facilityType: 'facility' }
        )
        .where({
          is_archived: false,
          ...(id ? { id } : {}),
          tenant: { id: this.request.user?.tenant?.id },
        })
        .select([
          'donor.id AS donor_id',
          'donor.external_id AS external_id',
          "concat(donor.first_name, ' ', donor.last_name) AS name",
          'donor.nick_name AS nick_name',
          'donor.contact_uuid AS contact_uuid',
          "TO_CHAR(donor.birth_date, 'MM-DD-YYYY') AS birth_date",
          'external_id',
          'blood_groups.name AS blood_group',
          "TO_CHAR(donor.last_donation_date, 'MM-DD-YYYY') AS last_donation",
          'donation.points AS points',
          'donation.donation_ltd AS donation_ltd',
          'donor.tenant_id AS tenant_id',
          'address.address1 AS donor_address',
          'procedure_types.name AS donation_type_name',
        ]);
      const donor = await donorQuery.getRawOne();
      const getEligibilities = await this.donorsService.getEligibilities(
        donor?.external_id,
        this.request
      );
      const { data } = await this.contactPreferenceService.get({
        preference_id: donor.donor_id,
        type_name: PolymorphicType.CRM_CONTACTS_DONORS,
      });
      const next_call_date = data?.next_call_date
        ? new Date(data?.next_call_date)
        : null;
      return resSuccess(
        'Donor Details Fetched Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { ...donor, eligibilities: getEligibilities, next_call_date }
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async getAllDonorsInfo(
    dialingCenterCallJobsQueryDto: DialingCenterCallJobsQueryDto
  ) {
    try {
      const { call_job_id } = dialingCenterCallJobsQueryDto;

      if (call_job_id == null) {
        return resError(
          `Call job id must be provided`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const status = { PENDING: 1, QUEUE: 3 };

      //  QUEUE
      const whereClauseQueueCte = `WHERE cjcs.call_job_id = ${call_job_id} and cjc.call_status = '${status.QUEUE}' AND (CURRENT_DATE + sc.queue_time) <= CURRENT_TIMESTAMP AND cjc.tenant_id = ${this.request.user?.tenant?.id}`;

      const queueCte = `WITH QUEUE_CTE AS (
	  select d.id,d.first_name,d.last_name,c.data as phoneNumber, sc.contact_id, sc.ds_segment_id, sc.dsid, sc.id as sc_id, cjc.no_of_retry, cjc.id as cjc_id, cao.operationable_type as type,
    cao.operationable_id as typeId, cjc.max_call_count, cjc.tenant_id

      from call_jobs_call_segments cjcs 
      join segments s on s.id = cjcs.segment_id
      join segments_contacts sc on sc.ds_segment_id = s.ds_segment_id  and cjcs.segment_type = 'include'
      join contacts c on c.id = sc.contact_id 
      join donors d on d.id = c.contactable_id 

      left join call_job_contacts cjc on cjc.segment_contact_id = sc.id and cjc.call_job_id = ${call_job_id}
      left join call_outcomes co on co.id = sc.call_outcome_id 
      left join call_jobs_associated_operations cao ON cjcs.call_job_id = cao.call_job_id
	  
	  ${whereClauseQueueCte}
	  ORDER BY 
        sc.queue_time
    LIMIT 1
	  )`;

      // PENDING
      const whereClausePendingCte = `WHERE cjcs.call_job_id = ${call_job_id} and cjc.call_status = '${status.PENDING}' and cjc.max_call_count < (SELECT max_calls_per_rolling_30_days FROM call_center_settings LIMIT 1) and cjc.tenant_id = ${this.request.user?.tenant?.id} `;
      //   AND (co IS NULL OR co.next_call_interval = 0 OR (cjc.created_at + (co.next_call_interval * interval '1 day'))::date = CURRENT_DATE) this needs to be added
      const pendingCte = `WITH PENDING_CTE AS (
	  select d.id,d.first_name,d.last_name,c.data as phoneNumber, sc.contact_id, sc.ds_segment_id, sc.dsid, sc.id as sc_id, cjc.no_of_retry, cjc.id as cjc_id, cao.operationable_type as type,
    cao.operationable_id as typeId,cjc.max_call_count,(SELECT max_calls_per_rolling_30_days FROM call_center_settings LIMIT 1) AS max_calls_limit, cjc.tenant_id

      from call_jobs_call_segments cjcs 
      join segments s on s.id = cjcs.segment_id
      join segments_contacts sc on sc.ds_segment_id = s.ds_segment_id  and cjcs.segment_type = 'include'
      join contacts c on c.id = sc.contact_id
      join donors d on d.id = c.contactable_id 
      left join call_job_contacts cjc on cjc.segment_contact_id = sc.id and cjc.call_job_id = ${call_job_id}
      left join call_outcomes co on co.id = cjc.call_outcome_id 
	    left join call_jobs_associated_operations cao ON cjcs.call_job_id = cao.call_job_id
	  
	  ${whereClausePendingCte}
    LIMIT 1
	  )`;

      const queueQuery = `${queueCte} SELECT * FROM QUEUE_CTE`;
      const queryQueueData = await this.callJobsRepository.query(queueQuery);

      const pendingQuery = `${pendingCte} SELECT * FROM PENDING_CTE`;
      const queryPendingData = await this.callJobsRepository.query(
        pendingQuery
      );

      //  NEXT QUEUE
      const whereClauseNextQueueCte = `WHERE cjcs.call_job_id = ${call_job_id} and cjc.call_status = '${status.QUEUE}' and cjc.tenant_id = ${this.request.user?.tenant?.id} `;

      const nextQueueCte = `WITH NEXT_QUEUE_CTE AS (
	  select d.id,d.first_name,d.last_name,c.data as phoneNumber, sc.contact_id, sc.queue_time, sc.ds_segment_id,
     sc.dsid, sc.id as sc_id, cjc.no_of_retry, cao.operationable_type as type,
    cao.operationable_id as typeId,cjc.max_call_count, cjc.tenant_id

      from call_jobs_call_segments cjcs 
      join segments s on s.id = cjcs.segment_id
      join segments_contacts sc on sc.ds_segment_id = s.ds_segment_id  and cjcs.segment_type = 'include'
      join contacts c on c.id = sc.contact_id 
      join donors d on d.id = c.contactable_id 
      left join call_job_contacts cjc on cjc.segment_contact_id = sc.id and cjc.call_job_id = ${call_job_id}
      left join call_outcomes co on co.id = cjc.call_outcome_id 
      left join call_jobs_associated_operations cao ON cjcs.call_job_id = cao.call_job_id
	  
	  
	  ${whereClauseNextQueueCte}
	  ORDER BY 
        sc.queue_time
    LIMIT 1
	  )`;

      const nextQueueQuery = `${nextQueueCte} SELECT * FROM NEXT_QUEUE_CTE`;
      const queryNextQueue = await this.callJobsRepository.query(
        nextQueueQuery
      );

      let result;
      if (queryQueueData[0]) {
        result = queryQueueData[0];
      } else if (queryPendingData[0]) {
        result = queryPendingData[0];
      } else if (queryNextQueue.length > 0) {
        result = {
          ...queryNextQueue[0],
          message: `Only queued contacts are left.`,
        };
      }

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Donors Contacts Successfully Fetched.',
        code: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateDialingCenterCallJob(
    id: bigint,
    dialingCenterCallJobDto: DialingCenterCallJobDto
  ) {
    try {
      const dialingCenterCallJobData: any =
        await this.dialingCenterCallJobsRepository.findOne({
          where: {
            id: id,
            tenant_id: this.request?.user?.tenant?.id,
          },
        });

      if (!dialingCenterCallJobData) {
        return resError(
          'dialingCenterCallJobData resource not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      dialingCenterCallJobData.actual_calls =
        dialingCenterCallJobDto?.actual_calls;

      const savedDialingCenterCallJob =
        await this.dialingCenterCallJobsRepository.save(
          dialingCenterCallJobData
        );

      return resSuccess(
        'Dialing Center Call Job Resource updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedDialingCenterCallJob
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
