import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Repository } from 'typeorm';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { CallJobs } from '../entities/call-jobs.entity';
import { CallJobsdDto } from '../dto/call-jobs.dto';
import { CallJobsAssociatedOperationDto } from '../dto/call-job-associated-operation.dto';
import { CallJobsAssociatedOperations } from '../entities/call-job-operation-association.entity';
import {
  CallJobsAgentsDto,
  UpdateCallJobsAgentsDto,
} from '../dto/call-jobs-agents.dto';
import { CallJobsAgents } from '../entities/call-jobs-agents.entity';
import { CallJobsCallScripts } from '../entities/call-jobs-call-scripts.entity';
import { CallJobsCallFlows } from '../entities/call-jobs-call-flows.entity';
import { CallJobsCallSegments } from '../entities/call-jobs-call-segments.entity';
import { GetAssignedAgentsInterface } from '../interface/call-jobs-agents.interface';
import { CallJobsInterface } from '../interface/call-jobs.interface';
import { CallJobStatusEnum } from '../enums/call-job-status.enum';
import { CallJobsHistory } from '../entities/call-jobs-history.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { DataSource } from 'typeorm';
import { GenericAttachmentsFiles } from 'src/api/common/entities/generic_attachment_file.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { TelerecruitmentRequestsService } from '../../telerecruitment-requests/service/telerecruitment-requests.service';
import { CallJobUpdateDto } from '../dto/call-job-update.dto';
import { DialingCenterCallJobs } from 'src/api/call-center/dialing-center/entity/dialing-center-call-jobs.entity';

@Injectable()
export class CallJobsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(CallJobs)
    private readonly callJobsRepository: Repository<CallJobs>,

    @InjectRepository(CallJobsAssociatedOperations)
    private readonly callJobsOperationAssociationsRepository: Repository<CallJobsAssociatedOperations>,

    @InjectRepository(CallJobsCallScripts)
    private readonly callJobsCallScriptsRepository: Repository<CallJobsCallScripts>,

    @InjectRepository(CallJobsCallFlows)
    private readonly callJobsCallFlowsRepository: Repository<CallJobsCallFlows>,

    @InjectRepository(CallJobsCallSegments)
    private readonly callJobsCallSegmentsRepository: Repository<CallJobsCallSegments>,

    @InjectRepository(CallJobsAgents)
    private readonly callJobsAgentsRepository: Repository<CallJobsAgents>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CallJobsHistory)
    private readonly callJobsHistoryRepository: Repository<CallJobsHistory>,
    @InjectRepository(GenericAttachmentsFiles)
    private readonly genericAttachmentFilesRepository: Repository<GenericAttachmentsFiles>,

    @InjectRepository(DialingCenterCallJobs)
    private readonly dialingCenterCallJobsRepository: Repository<DialingCenterCallJobs>,

    private readonly telerecruitmentRequestsService: TelerecruitmentRequestsService,

    private readonly entityManager: EntityManager
  ) {}

  async create(callJobsDto: CallJobsdDto) {
    try {
      //CallJobs
      const callJob = new CallJobs();
      callJob.name = callJobsDto.call_job_name;
      callJob.start_date = callJobsDto.start_date;
      callJob.end_date = callJobsDto.end_date;
      callJob.recurring_frequency = callJobsDto.recurring_frequency;
      callJob.recurring_type = callJobsDto.recurring_type;
      callJob.recurring_end_date = callJobsDto.reccurence_date;
      callJob.recurring_days = callJobsDto.recurring_days;
      callJob.status = callJobsDto.status;
      callJob.is_recurring = callJobsDto.is_recurring;
      callJob.created_by = this.request?.user?.id;
      callJob.tenant_id = this?.request?.user?.tenant?.id;
      const savedCallJob = await this.callJobsRepository.save(callJob);

      //CallJobsAssociatedOperations
      const associatedOperation = new CallJobsAssociatedOperations();
      associatedOperation.call_job_id = savedCallJob;
      associatedOperation.operationable_type = callJobsDto.associated_type;
      associatedOperation.operationable_id = callJobsDto.associated_data[0].id;
      associatedOperation.created_by = this.request?.user?.id;
      await this.callJobsOperationAssociationsRepository.save(
        associatedOperation
      );

      //CallJobsCallScripts
      const callJobsCallScripts = new CallJobsCallScripts();
      callJobsCallScripts.call_job_id = savedCallJob;
      callJobsCallScripts.call_script_id = callJobsDto.call_script.value;
      callJobsCallScripts.created_by = this.request?.user?.id;
      callJobsCallScripts.tenant_id = this?.request?.user?.tenant?.id;
      await this.callJobsCallScriptsRepository.save(callJobsCallScripts);

      //CallJobsCallFlows
      const callJobsCallFlows = new CallJobsCallFlows();
      callJobsCallFlows.call_job_id = savedCallJob;
      callJobsCallFlows.call_flow_id = callJobsDto.call_flow.value;
      callJobsCallFlows.created_by = this.request?.user?.id;
      await this.callJobsCallFlowsRepository.save(callJobsCallFlows);

      if (
        associatedOperation.operationable_type ===
        PolymorphicType.OC_OPERATIONS_DRIVES
      ) {
        this.telerecruitmentRequestsService.assignCallJobToRequest(
          callJobsDto.associated_data[0].id,
          savedCallJob.id
        );
      }

      //CallJobsCallSegments
      const callJobCallSegments = [];
      if (
        callJobsDto.include_segments &&
        callJobsDto.include_segments.length > 0
      ) {
        const includeSegments = callJobsDto.include_segments.map(
          (segment) =>
            new CallJobsCallSegments(
              {
                call_job_id: savedCallJob.id,
                segment_id: segment.id,
                segment_type: 'include',
              },
              this.request
            )
        );
        callJobCallSegments.push(...includeSegments);
      }
      if (
        callJobsDto.include_segments &&
        callJobsDto.include_segments.length > 0
      ) {
        const excludeSegments = callJobsDto.exclude_segments.map(
          (segment) =>
            new CallJobsCallSegments(
              {
                call_job_id: savedCallJob.id,
                segment_id: segment.id,
                segment_type: 'exclude',
              },
              this.request
            )
        );
        callJobCallSegments.push(...excludeSegments);
      }

      await this.callJobsCallSegmentsRepository.save(callJobCallSegments);

      await this.updateCallJobsContacts(savedCallJob.id);
      return resSuccess(
        'Call Job Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedCallJob
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async associateOperation(
    callJobsAssociatedOperationDto: CallJobsAssociatedOperationDto
  ) {
    try {
      const savedCallJobOperationAssociation =
        await this.callJobsOperationAssociationsRepository.save(
          new CallJobsAssociatedOperations(
            callJobsAssociatedOperationDto,
            this.request
          )
        );

      return resSuccess(
        'Call Job Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedCallJobOperationAssociation
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllCallJobs(callJobsInterface) {
    try {
      const {
        status,
        start_date,
        end_date,
        job_type,
        collection_operation_id,
        is_assigned,
        page,
        limit,
        is_active,
        sort_by,
        sort_order,
        search,
      }: CallJobsInterface = callJobsInterface;

      let filterQuery = `and cj.tenant_id = ${this?.request?.user?.tenant?.id} and cj.is_archived = false`;

      if (status) {
        filterQuery += ` AND cj.status = '${status}'`;
      }
      if (start_date && end_date) {
        filterQuery += ` AND ((cj.start_date >= '${start_date}' AND cj.start_date <= '${end_date}') OR (cj.end_date >= '${start_date}' AND cj.end_date <= '${end_date}') OR ('${start_date}' >= cj.start_date AND '${start_date}' <= cj.end_date) OR ('${end_date}' >= cj.start_date AND '${end_date}' <= cj.end_date))`;
      }

      if (job_type) {
        filterQuery += ` AND cjap.operationable_type = '${job_type}'`;
      }

      if (collection_operation_id) {
        filterQuery += ` AND (
        CJAP.OPERATIONABLE_TYPE = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
        AND acc.collection_operation in (${collection_operation_id})
        OR CJAP.OPERATIONABLE_TYPE = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
        AND SSN.collection_operation_id in (${collection_operation_id})
        OR CJAP.OPERATIONABLE_TYPE = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
        AND nco.business_unit_id in (${collection_operation_id})
    )`;
      }

      if (is_assigned === 'assigned') {
        filterQuery += ` 
                        AND (
                            COALESCE(agents.agents_list, 'Unassigned') != 'Unassigned'
                        )`;
      } else if (is_assigned === 'pending') {
        filterQuery += ` 
                        AND (
                            COALESCE(agents.agents_list, 'Unassigned') = 'Unassigned'
                        )`;
      }

      if (is_active) {
        filterQuery += ` AND cj.is_active = ${is_active}`;
      }
      if (search) {
        filterQuery += ` AND (cj.name ILIKE '%${search}%' OR CONCAT(usr.first_name, ' ', usr.last_name) ILIKE '%${search}%' OR cjap.operationable_type::text ILIKE '%${search}%' OR cj.status::text ILIKE '%${search}%' OR  CAST((COALESCE(included_segments.included_segments, 0) - COALESCE(excluded_segments.excluded_segments, 0)) AS TEXT)
      ILIKE '%${search}%')`;
      }

      const withQueryPart = `    WITH included_segments AS (
        SELECT
            COALESCE(SUM(s.total_members), 0) AS included_segments,
            cj.id AS call_job_id
        FROM
            call_jobs cj
        JOIN
            call_jobs_call_segments cjcs ON cj.id = cjcs.call_job_id AND cjcs.segment_type = 'include'
        JOIN
            segments s ON s.id = cjcs.segment_id
        where cj.tenant_id = ${this?.request?.user?.tenant?.id} and cjcs.is_archived = false
        GROUP BY
            cj.id
        ),
       excluded_segments AS (
        SELECT
            COALESCE(SUM(s.total_members), 0) AS excluded_segments,
            cj.id AS call_job_id
        FROM
            call_jobs cj
        JOIN
            call_jobs_call_segments cjcs ON cj.id = cjcs.call_job_id AND cjcs.segment_type = 'exclude'
        JOIN
            segments s ON s.id = cjcs.segment_id
       where cj.tenant_id = ${this?.request?.user?.tenant?.id} and cjcs.is_archived = false
        GROUP BY
            cj.id
         )`;

      const pagingPart = `GROUP BY
      cj.id, cj.name, agents.agents_list, operation_date, cj.start_date, cj.status, operationable_type, cj.is_archived, cj.is_active, cj.is_assigned, t.id, included_segments.included_segments, excluded_segments.excluded_segments
  ORDER BY
      ${sort_by} ${sort_order}
            OFFSET ${(page - 1) * limit}
         LIMIT ${limit}`;

      const queryColumns = `      SELECT
      cj.id AS id,
      TO_CHAR(cj.start_date, 'Mon, DD YYYY') AS job_start_date,
      TO_CHAR(cj.end_date, 'Mon, DD YYYY') AS job_end_date,
      cj.status,
      CASE
          WHEN COALESCE(cjap.operationable_type::text) = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN 'Drive'
          WHEN COALESCE(cjap.operationable_type::text) = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN 'Session'
          ELSE 'Other'
      END AS operationable_type,
      cj.is_archived,
      cj.is_active,
      cj.is_assigned,
      t.id AS tenant_id,
      cj.name as name,
      COALESCE(agents.agents_list, 'Unassigned') AS assigned_tos,
      (COALESCE(included_segments.included_segments, 0) - COALESCE(excluded_segments.excluded_segments, 0)) AS job_size,
      CASE
          WHEN cjap.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN  TO_CHAR(d.date, 'Mon, DD YYYY')
          WHEN cjap.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN  TO_CHAR(ssn.date, 'Mon, DD YYYY')
          WHEN cjap.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN  TO_CHAR(nce.date, 'Mon, DD YYYY')
      END AS operation_date`;

      const rootQuery = `
     
      FROM
          call_jobs cj
      JOIN
          tenant t ON cj.tenant_id = t.id
      JOIN
          "user" u ON cj.created_by = u.id
      LEFT JOIN
          call_jobs_agents cja ON cj.id = cja.call_job_id
      LEFT JOIN
          call_jobs_call_segments cjs ON cj.id = cjs.call_job_id
      LEFT JOIN
          call_jobs_associated_operations cjap ON cj.id = cjap.call_job_id
      LEFT JOIN
          segments s ON cjs.segment_id = s.id
      LEFT JOIN
          public.user usr ON cja.user_id = usr.id
      LEFT JOIN
          drives d ON cjap.operationable_id = d.id AND cjap.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
      LEFT JOIN
          sessions ssn ON cjap.operationable_id = ssn.id AND cjap.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
      LEFT JOIN
          oc_non_collection_events nce ON cjap.operationable_id = nce.id AND cjap.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
      left join
       accounts acc on d.account_id = acc.id
      left join
       nce_collection_operations nco on nce.id = nco.nce_id
      LEFT JOIN
          included_segments ON cj.id = included_segments.call_job_id
      LEFT JOIN
          excluded_segments ON cj.id = excluded_segments.call_job_id
           LEFT JOIN
      (SELECT
         cja.call_job_id,
         STRING_AGG(CONCAT(u.first_name, ' ', u.last_name), ', ') AS agents_list
      FROM
         call_jobs_agents cja
      LEFT JOIN
         public.user u ON u.id = cja.user_id
      where cja.is_archived = false
      GROUP BY
         cja.call_job_id
      ) agents ON agents.call_job_id = cj.id
      WHERE
          1=1 ${filterQuery}
    `;

      const dataQuery = `${withQueryPart} ${queryColumns} ${rootQuery} ${pagingPart}`;
      const countQuery = `${withQueryPart} ${'SELECT COUNT(*) from ('} ${queryColumns} ${rootQuery} ${'GROUP BY cj.id, cj.name, agents.agents_list, operation_date, cj.start_date, cj.status, operationable_type, cj.is_archived, cj.is_active, cj.is_assigned, t.id, included_segments.included_segments, excluded_segments.excluded_segments ) t'}`;

      const callJobs = await this.callJobsRepository.query(dataQuery);
      const totalCount = await this.callJobsRepository.query(countQuery);
      const count = parseInt(totalCount[0].count);
      return resSuccess(
        'Call Jobs Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        callJobs,
        count
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getSingleCallJob(callJobId) {
    try {
      // Fetch the main call job by its ID
      const callJob = await this.callJobsRepository.findOne({
        where: {
          id: callJobId,
          tenant_id: this?.request?.user?.tenant?.id,
          is_archived: false,
        },
        relations: {
          created_by: true,
          tenant: true,
        },
      });

      if (!callJob) {
        return resError(
          'Call Job not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const callJobInstance = new CallJobs();
      callJobInstance.id = callJobId;

      const associatedOperations =
        await this.callJobsOperationAssociationsRepository.find({
          where: { call_job_id: callJobInstance },
        });
      let driveDate = [];
      if (
        associatedOperations[0]?.operationable_type ===
        PolymorphicType.OC_OPERATIONS_DRIVES
      ) {
        const driveQuery = `SELECT
        d.id,
        TO_CHAR(d.date, 'Mon, DD YYYY') as date
        from drives d 
        WHERE d.id=${associatedOperations[0].operationable_id}`;
        driveDate = await this.dataSource.query(driveQuery);
      } else if (
        associatedOperations[0]?.operationable_type ===
        PolymorphicType.OC_OPERATIONS_SESSIONS
      ) {
        const sessionDate = `SELECT
        s.id,
        TO_CHAR(s.date, 'Mon, DD YYYY') as date
        from sessions s 
        WHERE s.id=${associatedOperations[0].operationable_id}`;
        driveDate = await this.dataSource.query(sessionDate);
      } else if (
        associatedOperations[0]?.operationable_type ===
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      ) {
        const nceDate = `SELECT
        nce.id,
        TO_CHAR(nce.date, 'Mon, DD YYYY') as date
        from oc_non_collection_events nce 
        WHERE nce.id=${associatedOperations[0].operationable_id}`;
        driveDate = await this.dataSource.query(nceDate);
      }

      let donorLocations = [];
      if (
        associatedOperations[0]?.operationable_type ===
        PolymorphicType.OC_OPERATIONS_DRIVES
      ) {
        const operationLocation = `
      SELECT s.name as location_name
      FROM DRIVES D
      LEFT JOIN CRM_LOCATIONS S ON S.ID = D.LOCATION_ID
      WHERE D.ID = ${associatedOperations[0].operationable_id} and d.tenant_id = ${this?.request?.user?.tenant?.id}
      `;
        donorLocations = await this.dataSource.query(operationLocation);
      } else if (
        associatedOperations[0]?.operationable_type ===
        PolymorphicType.OC_OPERATIONS_SESSIONS
      ) {
        const sessionName = `
      SELECT f.name as location_name
      FROM sessions s
      LEFT JOIN facility f ON f.ID = s.donor_center_id 
      WHERE s.ID = ${associatedOperations[0].operationable_id} and s.tenant_id = ${this?.request?.user?.tenant?.id}
      `;
        donorLocations = await this.dataSource.query(sessionName);
      } else if (
        associatedOperations[0]?.operationable_type ===
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      ) {
        const nceName = `
          SELECT bu.name as location_name
          FROM oc_non_collection_events nce
          LEFT JOIN nce_collection_operations nceo ON nceo.nce_id = nce.id
          left Join business_units bu on nceo.business_unit_id = bu.id
          WHERE nce.id = ${associatedOperations[0].operationable_id} and nce.tenant_id = ${this?.request?.user?.tenant?.id}
          `;
        donorLocations = await this.dataSource.query(nceName);
      }
      const { script, genericAttachment }: any =
        await this.getCallScriptWithAttachment(callJobId);
      const callFlows = await this.callJobsCallFlowsRepository.find({
        where: {
          call_job_id: callJobInstance,
          is_archived: false,
        },
        relations: ['call_flow'],
      });
      const { jobSize, callSegments } = await this.getAndCalculateSegments(
        callJobInstance.id
      );

      const query = `
        SELECT cja.id,
        cja.is_archived,
        cja.created_at,
        cja.created_by,
        cja.call_job_id,
        cja.user_id,
        cja.assigned_calls,
        cja.is_calling,
        cja.date,
        CONCAT(u.first_name, ' ', u.last_name) AS staff_name,
        SUM(cjaTotal.assigned_calls) AS total_calls

          FROM call_jobs_agents cja
          JOIN public.user u ON u.id = cja.user_id
          LEFT JOIN call_jobs_agents cjaTotal ON cjaTotal.user_id = cja.user_id
          AND cjaTotal.date = cja.date
          WHERE cja.call_job_id = ${callJobInstance.id} AND cja.is_archived = false

        GROUP BY cja.id,
          cja.is_archived,
          cja.created_at,
          cja.created_by,
          cja.call_job_id,
          cja.user_id,
          cja.assigned_calls,
          cja.is_calling,
          cja.date,
          u.first_name,
          u.last_name
      `;

      const callAgents = await this.callJobsAgentsRepository.query(query);

      const modifiedData = await getModifiedDataDetails(
        this.callJobsHistoryRepository,
        callJobId,
        this.userRepository
      );
      const modified_by = modifiedData['modified_by'];
      const modified_at = modifiedData['modified_at'];
      const callJobData = {
        ...callJob,
        tenant_id: callJob.tenant.id,
        associatedOperations: {
          ...associatedOperations[0],
          date: driveDate[0]?.date,
          tenant_id: this.request?.user?.tenant?.id,
        },
        callScripts: {
          call_script: script,
          tenant_id: this.request?.user?.tenant?.id,
          attachment_file: genericAttachment,
        },
        callFlows,
        callSegments,
        callAgents,
        donorLocations,
        jobSize,
        modified_at,
        modified_by,
      };
      return resSuccess(
        'Call Job fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        callJobData
      );
    } catch (error) {
      console.error(error);
      return resError(
        'An error occurred while fetching the Call Job.',
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateCallJob(callJobId, callJobsDto: CallJobsdDto) {
    try {
      const callJob = await this.callJobsRepository.findOne({
        where: { id: callJobId },
      });
      if (!callJob) {
        return resError(
          'Call Job not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      // Update fields of CallJobs
      callJob.name = callJobsDto.call_job_name;
      callJob.start_date = callJobsDto.start_date;
      callJob.end_date = callJobsDto.end_date;
      callJob.recurring_frequency = callJobsDto.recurring_frequency;
      callJob.recurring_type = callJobsDto.recurring_type;
      callJob.recurring_end_date = callJobsDto.reccurence_date;
      callJob.recurring_days = callJobsDto.recurring_days;
      callJob.status = callJobsDto.status;
      callJob.is_recurring = callJobsDto.is_recurring;
      callJob.created_by = this.request?.user?.id;
      callJob.tenant_id = this?.request?.user?.tenant?.id;
      const newCallJob = await this.callJobsRepository.save(callJob);

      const updatedCallJob = new CallJobs();
      updatedCallJob.id = newCallJob.id;

      await this.callJobsOperationAssociationsRepository.delete({
        call_job_id: updatedCallJob,
      });
      const associatedOperation = new CallJobsAssociatedOperations();
      associatedOperation.call_job_id = updatedCallJob;
      associatedOperation.operationable_type = callJobsDto.associated_type;
      associatedOperation.operationable_id = callJobsDto.associated_data[0].id;
      associatedOperation.created_by = this.request?.user?.id;
      await this.callJobsOperationAssociationsRepository.save(
        associatedOperation
      );

      await this.callJobsCallScriptsRepository.delete({
        call_job_id: updatedCallJob,
      });
      const callJobsCallScripts = new CallJobsCallScripts();
      callJobsCallScripts.call_job_id = updatedCallJob;
      callJobsCallScripts.call_script_id = callJobsDto.call_script.value;
      callJobsCallScripts.created_by = this.request?.user?.id;
      callJobsCallScripts.tenant_id = this?.request?.user?.tenant?.id;
      await this.callJobsCallScriptsRepository.save(callJobsCallScripts);

      await this.callJobsCallFlowsRepository.delete({
        call_job_id: updatedCallJob,
      });
      const callJobsCallFlows = new CallJobsCallFlows();
      callJobsCallFlows.call_job_id = updatedCallJob;
      callJobsCallFlows.call_flow_id = callJobsDto.call_flow.value;
      callJobsCallFlows.created_by = this.request?.user?.id;
      await this.callJobsCallFlowsRepository.save(callJobsCallFlows);

      await this.callJobsCallSegmentsRepository.delete({
        call_job_id: updatedCallJob,
      });
      const callJobCallSegments = [];
      if (
        callJobsDto.include_segments &&
        callJobsDto.include_segments.length > 0
      ) {
        const includeSegments = callJobsDto.include_segments.map(
          (segment) =>
            new CallJobsCallSegments(
              {
                call_job_id: updatedCallJob.id,
                segment_id: segment.id,
                segment_type: 'include',
              },
              this.request
            )
        );
        callJobCallSegments.push(...includeSegments);
      }
      if (
        callJobsDto.include_segments &&
        callJobsDto.include_segments.length > 0
      ) {
        const excludeSegments = callJobsDto.exclude_segments.map(
          (segment) =>
            new CallJobsCallSegments(
              {
                call_job_id: updatedCallJob.id,
                segment_id: segment.id,
                segment_type: 'exclude',
              },
              this.request
            )
        );
        callJobCallSegments.push(...excludeSegments);
      }
      await this.callJobsCallSegmentsRepository.save(callJobCallSegments);

      await this.updateCallJobsContacts(updatedCallJob.id);

      return resSuccess(
        'Call Job Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedCallJob
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async assginAgents(callJobsAgentsDto: CallJobsAgentsDto[], callJobId) {
    try {
      if (!callJobsAgentsDto.length) {
        this.updateUnAssignStatus(callJobId);
      }

      await this.callJobsAgentsRepository.delete({
        call_job_id: callJobId,
      });

      const callJobAgents = callJobsAgentsDto.map(
        (item) => new CallJobsAgents(item, this.request)
      );

      await this.callJobsAgentsRepository.save(callJobAgents);
      const callAgents = await this.callJobsAgentsRepository.find({
        where: {
          call_job_id: callJobId,
          is_archived: false,
        },
        relations: {
          user: true,
        },
      });
      if (callJobsAgentsDto.length > 0) {
        this.callJobsRepository.update(
          { id: callJobId },
          {
            status: CallJobStatusEnum.ASSIGNED,
            is_assigned: true,
          }
        );
      }

      const exising = await this.dialingCenterCallJobsRepository.count({
        where: {
          call_job_id: callJobId,
        },
      });

      if (exising === 0) {
        const dialingCenterCallJobsEntity = new DialingCenterCallJobs();

        dialingCenterCallJobsEntity.call_job_id = callJobId;
        dialingCenterCallJobsEntity.actual_calls = 0;
        dialingCenterCallJobsEntity.is_start_calling = false;
        dialingCenterCallJobsEntity.created_by = this.request?.user;
        dialingCenterCallJobsEntity.tenant_id = this.request?.user?.tenant?.id;

        await this.dialingCenterCallJobsRepository.save(
          dialingCenterCallJobsEntity
        );
      }

      return resSuccess(
        'Agents assigned to Call Job.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        callAgents
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateUnAssignStatus(CallJobId) {
    const callJob: any = await this.callJobsRepository.findOne({
      where: { id: CallJobId },
    });

    if (!callJob) {
      return resError(
        'call Job not found',
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    callJob.status = CallJobStatusEnum.IN_ACTIVE;
    callJob.is_assigned = false;
    await this.callJobsRepository.save(callJob);
  }

  async unAssignAgents(AgentId, CallJobId) {
    try {
      const agent = await this.callJobsAgentsRepository.findOne({
        where: { id: AgentId, is_archived: false, call_job_id: CallJobId },
      });
      if (!agent) {
        return resError(
          'Agent not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      agent.is_archived = true;
      await this.callJobsAgentsRepository.save(agent);
      const callAgents = await this.callJobsAgentsRepository.find({
        where: {
          call_job_id: CallJobId,
          is_archived: false,
        },
        relations: {
          user: true,
        },
      });

      this.updateUnAssignStatus(CallJobId);

      return resSuccess(
        'Agent unassigned from Call Job.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        callAgents
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async removeSegment(SegmentId, CallJobId) {
    try {
      const segment = await this.callJobsCallSegmentsRepository.findOne({
        where: {
          id: SegmentId,
          is_archived: false,
          call_job_id: { id: CallJobId },
        },
      });
      if (!segment) {
        return resError(
          'Segment not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      segment.is_archived = true;
      await this.callJobsCallSegmentsRepository.save(segment);
      const { jobSize, callSegments } = await this.getAndCalculateSegments(
        CallJobId
      );
      const segmentData = {
        callSegments,
        jobSize,
      };
      return resSuccess(
        'Segment removed from Call Job.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        segmentData
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findAssignedAgents(
    getAssignedAgentsInterface: GetAssignedAgentsInterface
  ): Promise<any> {
    try {
      const agentsResponse = await this.callJobsAgentsRepository.find({
        where: {
          call_job_id: getAssignedAgentsInterface.callJobId,
          is_archived: false,
        },
        relations: ['call_job', 'staff'],
      });

      const { jobSize } = await this.getAndCalculateSegments(
        getAssignedAgentsInterface.callJobId
      );

      const response: any = agentsResponse;

      response.totalCount = jobSize;
      response.remainingTotal = jobSize - agentsResponse.length;

      if (!agentsResponse) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please enter a valid Call Job id',
          data: agentsResponse,
        };
      }

      return {
        status: HttpStatus.OK,
        message: 'Call Job Associated Agents Fetched Succesfuly',
        data: response,
      };
    } catch {
      resError(
        'Error fetching Call Job Associated Agents',
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async deactivateCallJob(callJobId: number) {
    const agentArchivePromise = [];

    const callJob = await this.callJobsRepository.findOne({
      where: {
        id: BigInt(callJobId),
      },
    });

    if (!callJob) {
      return resError('Call Job not found', ErrorConstants.Error);
    }
    const createUpdateHistory = async (status: string) => {
      const callJobHistoryData = await this.callJobsHistoryRepository.findOne({
        where: {
          id: BigInt(callJobId),
        },
      });
      if (callJobHistoryData) {
        callJobHistoryData.status = status;
        agentArchivePromise.push(
          this.callJobsHistoryRepository.save(callJobHistoryData)
        );
      } else {
        try {
          //CallJobsHistory
          const callJobHistory: any = new CallJobsHistory();
          callJobHistory.history_reason = 'C';
          callJobHistory.id = BigInt(callJobId);
          callJobHistory.start_date = callJob.start_date;
          callJobHistory.end_date = callJob.end_date;
          callJobHistory.status = status;
          callJobHistory.tenant_id = this?.request?.user?.tenant?.id;
          callJobHistory.recurring_frequency = callJob.recurring_frequency;
          callJobHistory.recurring_days = callJob.recurring_days;
          callJobHistory.recurring_end_date = callJob.recurring_end_date;
          callJobHistory.recurring_type = callJob.recurring_type;
          callJobHistory.is_active = true;
          callJobHistory.is_assigned = false;
          callJobHistory.is_archived = false;
          // callJobHistory.created_at = callJob.created_at;
          callJobHistory.created_by = this.request?.user?.id;
          agentArchivePromise.push(
            this.callJobsHistoryRepository.save(callJobHistory)
          );
        } catch (error) {
          return resError(error.message, ErrorConstants.Error, error.status);
        }
      }
    };
    try {
      createUpdateHistory(callJob.status);

      switch (callJob.status) {
        case CallJobStatusEnum.ASSIGNED:
        case CallJobStatusEnum.IN_PROGRESS:
        case CallJobStatusEnum.SCHEDULED:
          // Handle ongoing calls associated with the job
          // Options to end ongoing calls or mark them as incomplete
          // Deactivate the call job
          callJob.status = CallJobStatusEnum.CANCELLED;
          break;

        case CallJobStatusEnum.PENDING:
          callJob.status = CallJobStatusEnum.IN_ACTIVE;
          break;
        case CallJobStatusEnum.CANCELLED:
        case CallJobStatusEnum.IN_ACTIVE:
          return resError(
            'Call Job status is already deactivated',
            ErrorConstants.Error
          );

        default:
          return resError('Call Job status not match', ErrorConstants.Error);
      }

      agentArchivePromise.push(this.callJobsRepository.save(callJob));

      if (callJob.is_assigned) {
        const callJobAgentsData = await this.callJobsAgentsRepository.find({
          where: {
            call_job_id: BigInt(callJobId) as any,
          },
        });
        if (callJobAgentsData && callJobAgentsData.length > 0) {
          callJobAgentsData.map((agent, i) => {
            this.unAssignAgents(agent.id, callJobId);
            agent.is_archived = true;
            agentArchivePromise.push(this.callJobsAgentsRepository.save(agent));
          });
        }
      }

      await Promise.all(agentArchivePromise);

      return resSuccess(
        'Call Job has been Deactivated',
        SuccessConstants.SUCCESS,
        204
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findCallJob(id: bigint): Promise<any> {
    try {
      const response = await this.callJobsRepository.findOne({
        where: { id: id },
      });
      if (!response) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please enter a valid Call Job id',
          data: response,
        };
      }

      return {
        status: HttpStatus.OK,
        message: 'Call Job Fetched Succesfuly',
        data: response,
      };
    } catch {
      resError(
        'Error fetching Call Job',
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async addSegmentsToCallJobs(callJobId, segments) {
    try {
      const callJob = await this.callJobsRepository.findOne({
        where: {
          id: callJobId,
          is_archived: false,
        },
      });
      if (!callJob) {
        return resError(
          'Call Job not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const callJobCallSegments = [];
      if (segments.include_segments && segments.include_segments.length > 0) {
        const includeSegments = segments.include_segments.map(
          (segment) =>
            new CallJobsCallSegments(
              {
                call_job_id: callJobId,
                segment_id: segment.id,
                segment_type: 'include',
              },
              this.request
            )
        );
        callJobCallSegments.push(...includeSegments);
      }
      if (segments?.exclude_segments && segments?.exclude_segments.length > 0) {
        const excludeSegments = segments.exclude_segments.map(
          (segment) =>
            new CallJobsCallSegments(
              {
                call_job_id: callJobId,
                segment_id: segment.id,
                segment_type: 'exclude',
              },
              this.request
            )
        );
        callJobCallSegments.push(...excludeSegments);
      }

      await this.callJobsCallSegmentsRepository.save(callJobCallSegments);
      const { jobSize, callSegments } = await this.getAndCalculateSegments(
        callJob.id
      );
      return resSuccess(
        'Segments added to Call Job.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { jobSize, callSegments }
      );
    } catch (error) {
      resError(
        'Error adding segments to Call Job',
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
  }
  private async getAndCalculateSegments(callJobId) {
    const callSegments = await this.callJobsCallSegmentsRepository.find({
      where: {
        call_job_id: { id: callJobId },
        is_archived: false,
      },
      relations: ['segment'],
    });

    const includeSegments = callSegments.reduce((acc, segment) => {
      if (segment.segment_type === 'include') {
        return segment.segment.total_members + acc;
      }
      return acc;
    }, 0);
    const excludeSegments = callSegments.reduce((acc, segment) => {
      if (segment.segment_type === 'exclude') {
        return segment.segment.total_members + acc;
      }
      return acc;
    }, 0);
    const jobSize = includeSegments - excludeSegments;
    return { jobSize, callSegments };
  }
  public async getCallScriptWithAttachment(callJobId) {
    try {
      const callScripts = await this.callJobsCallScriptsRepository.find({
        where: {
          call_job_id: { id: callJobId },
          tenant_id: this?.request?.user?.tenant?.id,
        },
        relations: ['call_script'],
      });
      let genericAttachment = null;
      if (callScripts[0]?.call_script?.is_voice_recording) {
        genericAttachment = await this.genericAttachmentFilesRepository.findOne(
          {
            where: {
              attachment_id: callScripts[0]?.call_script?.id,
            },
          }
        );
      }
      return {
        script: {
          ...callScripts[0]?.call_script,
          tenant_id: this?.request?.user?.tenant?.id,
        },
        genericAttachment: genericAttachment
          ? { ...genericAttachment, tenant_id: this?.request?.user?.tenant?.id }
          : null,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  private async updateCallJobsContacts(callJobId) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.query(`
        DELETE FROM call_job_contacts where call_job_id = ${callJobId};
        WITH include_contacts AS (
          SELECT cjcs.call_job_id,s.id as in_segment_id,sc.id as segment_contact_id, sc.contact_id as in_contact_id 
            FROM call_jobs_call_segments cjcs
              JOIN segments s ON cjcs.segment_id = s.id
            JOIN segments_contacts sc ON sc.ds_segment_id = s.ds_segment_id AND cjcs.segment_type = 'include' AND cjcs.call_job_id = ${callJobId}
          ),
          exclude_contacts AS (
          SELECT s.id as ex_segment_id, sc.contact_id as ex_contact_id 
            FROM call_jobs_call_segments cjcs
              JOIN segments s ON cjcs.segment_id = s.id
            JOIN segments_contacts sc ON sc.ds_segment_id = s.ds_segment_id AND cjcs.segment_type = 'exclude' AND cjcs.call_job_id = ${callJobId}
          )
          INSERT INTO public.call_job_contacts(created_by, call_job_id, segment_contact_id, no_of_retry, call_status, tenant_id)
          
          SELECT
           ${this.request?.user?.id} AS created_by, --iz requesta
                      ic.call_job_id AS call_job_id, --
               ic.segment_contact_id AS segment_contact_id,
                                   0 AS no_of_retry,
                                 '1' AS call_status,
   ${this.request?.user?.tenant?.id} AS tenant_id  --iz requesta tenant_id
          
          from include_contacts ic
              LEFT JOIN exclude_contacts ec on ic.in_contact_id = ec.ex_contact_id
          WHERE ec.ex_contact_id IS NULL
      `);

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async updateCallJobStatus(id: bigint, callJobUpdateDto: CallJobUpdateDto) {
    try {
      const callJob: any = await this.callJobsRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!callJob) {
        return resError(
          'Call Job resource not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      callJob.status = callJobUpdateDto?.status;

      const savedCallJob = await this.callJobsRepository.save(callJob);

      return resSuccess(
        'Call Job  Resource updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedCallJob
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCallJobAgentByLoggedAgentAndCallJobId(callJobId: bigint) {
    try {
      const todayDate = new Date();
      const callJobAgent: any = await this.callJobsAgentsRepository.findOne({
        where: {
          call_job_id: callJobId,
          user_id: this.request?.user?.id,
          tenant_id: this.request?.user?.tenant?.id,
          date: Between(
            new Date(
              todayDate.getFullYear(),
              todayDate.getMonth(),
              todayDate.getDate(),
              0,
              0,
              0
            ),
            new Date(
              todayDate.getFullYear(),
              todayDate.getMonth(),
              todayDate.getDate(),
              23,
              59,
              59
            )
          ),
        },
      });

      if (!callJobAgent) {
        return resError(
          'Call Job Agent resource not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return resSuccess(
        'Call Job Agent Fetched Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        callJobAgent
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateCallJobsAgents(
    id: bigint,
    updateCallJobsAgentsDto: UpdateCallJobsAgentsDto
  ) {
    try {
      const callJobAgent: any = await this.callJobsAgentsRepository.findOne({
        where: {
          id: id,
          tenant_id: this.request?.user?.tenant?.id,
        },
      });

      if (!callJobAgent) {
        return resError(
          'callJobAgent resource not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      callJobAgent.actual_calls = updateCallJobsAgentsDto?.actual_calls;

      const savedCallJobAgent = await this.callJobsAgentsRepository.save(
        callJobAgent
      );

      return resSuccess(
        'Call Job Agent Resource updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedCallJobAgent
      );
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
