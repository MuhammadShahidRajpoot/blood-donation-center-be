import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager, Like, Between, In } from 'typeorm';
import { CreateApprovalDto } from '../dto/create-oc-approval.dto';
import { OcApprovals } from '../entities/oc-approval.entity';
import { OcApprovalsDetail } from '../entities/oc-approval-detail.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { GetOcApprovalsInterface } from '../interface/oc-approval.interface';
import { Drives } from '../../operations/drives/entities/drives.entity';
import { NonCollectionEvents } from '../../operations/non-collection-events/entities/oc-non-collection-events.entity';
import { Sessions } from '../../operations/sessions/entities/sessions.entity';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { OcApprovalsHistory } from '../entities/oc-approval-history.entity';
import { HistoryService } from 'src/api/common/services/history.service';
import { OcApprovalsDetailHistory } from '../entities/oc-approval-detail-history.entity';
import { UpdateApprovalDto } from '../dto/update-oc-approval.dto';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { RequestStatusEnum } from '../enums/oc-approval.enum';
import {
  ApprovalStatusEnum,
  DriveStatusEnum,
} from '../../operations/drives/enums';
import { ApprovalStatusEnum as NceApprovalStatus } from '../../operations/non-collection-events/enums';
import { organizationalLevelWhereString } from 'src/api/common/services/organization.service';

@Injectable()
export class OcApprovalsService extends HistoryService<OcApprovalsHistory> {
  constructor(
    @InjectRepository(OcApprovals)
    private readonly approvalsRepository: Repository<OcApprovals>,
    @InjectRepository(OcApprovalsHistory)
    private readonly approvalsHistoryRepository: Repository<OcApprovalsHistory>,
    @InjectRepository(OcApprovalsDetail)
    private readonly approvalsDetailRepository: Repository<OcApprovalsDetail>,
    @InjectRepository(OcApprovalsDetailHistory)
    private readonly approvalsDetailHistoryRepository: Repository<OcApprovalsDetailHistory>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(Sessions)
    private readonly sessionRepository: Repository<Sessions>,
    @InjectRepository(Drives)
    private readonly driveRepository: Repository<Drives>,
    @InjectRepository(NonCollectionEvents)
    private readonly nceRepository: Repository<NonCollectionEvents>,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelsRepository: Repository<OrganizationalLevels>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {
    super(approvalsHistoryRepository);
  }

  async create(user: any, createApprovalDto: CreateApprovalDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { details, ...approvalData } = createApprovalDto;
      let newlyCreatedApproval: any;

      const existingApproval = await this.approvalsRepository.findOne({
        where: {
          operationable_id: approvalData.operationable_id,
          operationable_type: approvalData.operationable_type,
          is_archived: false,
        },
        relations: ['created_by', 'details'],
      });

      if (!existingApproval) {
        const approval = new OcApprovals();
        approval.operationable_id = approvalData.operationable_id;
        approval.operationable_type = approvalData.operationable_type;
        approval.request_type = approvalData.request_type;
        approval.request_status = approvalData.request_status;
        approval.is_discussion_required =
          approvalData.is_discussion_required || false;
        approval.created_by = user;
        approval.tenant_id = user?.tenant?.id;
        approval.is_archived = false;

        newlyCreatedApproval = await queryRunner.manager.save(
          OcApprovals,
          approval
        );
      }

      const targetApproval = existingApproval || newlyCreatedApproval;
      for (const detail of details) {
        const approvalDetail = new OcApprovalsDetail();

        if (detail.shift_id) {
          const shift = await this.shiftsRepository.findOne({
            where: {
              id: detail.shift_id as any,
            },
          });
          if (!shift) {
            throw new NotFoundException(
              `Shift with ID ${detail.shift_id} not found`
            );
          }
          approvalDetail.shift = shift;
        }

        approvalDetail.approval = targetApproval;
        approvalDetail.field_name = detail.field;
        approvalDetail.field_approval_status = detail.field_approval_status;
        approvalDetail.is_override = detail.is_override;
        approvalDetail.original_data = detail.original;
        approvalDetail.requested_data = detail.requested;
        approvalDetail.created_by = user;
        await queryRunner.manager.save(OcApprovalsDetail, approvalDetail);
      }

      await queryRunner.commitTransaction();

      const approval = await this.approvalsRepository.findOne({
        where: {
          id: targetApproval?.id,
        },
        relations: ['created_by', 'details'],
      });

      return resSuccess(
        'Approval modified successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        approval
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: any, getOcApprovalsInterface: GetOcApprovalsInterface) {
    try {
      const {
        sortBy,
        sortOrder,
        request_date,
        request_status,
        operation_date,
        keyword,
        manager,
        requestor,
        operation_type,
        organizational_levels,
        request_type,
      } = getOcApprovalsInterface;

      let { page, limit } = getOcApprovalsInterface;
      page = page ? +page : 1;
      limit = limit ? +limit : +process.env.PAGE_SIZE;

      const pagination: any = {
        take: limit,
        skip: (page - 1) * limit,
      };

      if (user?.is_manager == false) {
        return {
          status: HttpStatus.OK,
          message: 'Oc Approvals Fetched successfully',
          count: 0,
          lastRecordId: null,
          data: [],
        };
      }

      const whereConditions: string[] = [];

      whereConditions.push(`approvals.is_archived = false`);
      whereConditions.push(`approvals.tenant_id = ${user.tenant.id}`);
      whereConditions.push(`
          CASE
            WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN
              sessions.tenant_id = ${user.tenant.id}
            WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN
              drives.tenant_id = ${user.tenant.id}
            WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN
              oc_non_collection_events.tenant_id = ${user.tenant.id}
            ELSE
              FALSE
          END
        `);

      if (request_date) {
        const [startDate, endDate] = request_date.split(',');

        if (startDate) {
          const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
          let endDateTime: any;

          if (endDate) {
            endDateTime = new Date(`${endDate}T23:59:59.999Z`);
          } else {
            endDateTime = new Date('9999-12-31T23:59:59.999Z');
          }

          whereConditions.push(
            `approvals.created_at BETWEEN '${startDateTime.toISOString()}' AND '${endDateTime.toISOString()}'`
          );
        }
      }

      if (operation_date) {
        const [startOperationDate, endOperationDate] =
          operation_date.split(',');

        if (startOperationDate) {
          const startOperationDateTime = new Date(
            `${startOperationDate}T00:00:00.000Z`
          );
          let endOperationDateTime: any;

          if (endOperationDate) {
            endOperationDateTime = new Date(
              `${endOperationDate}T23:59:59.999Z`
            );
          } else {
            endOperationDateTime = new Date('9999-12-31T23:59:59.999Z');
          }

          whereConditions.push(`
              CASE
                WHEN approvals.operationable_type = '${
                  PolymorphicType.OC_OPERATIONS_SESSIONS
                }' THEN
                  sessions.date BETWEEN '${startOperationDateTime.toISOString()}' AND '${endOperationDateTime.toISOString()}'
                WHEN approvals.operationable_type = '${
                  PolymorphicType.OC_OPERATIONS_DRIVES
                }' THEN
                  drives.date BETWEEN '${startOperationDateTime.toISOString()}' AND '${endOperationDateTime.toISOString()}'
                WHEN approvals.operationable_type = '${
                  PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                }' THEN
                  oc_non_collection_events.date BETWEEN '${startOperationDateTime.toISOString()}' AND '${endOperationDateTime.toISOString()}'
                ELSE
                  FALSE
              END
            `);
        }
      }

      if (organizational_levels) {
        const whereOr = [];

        // for drives operations
        const drivesWhere = organizationalLevelWhereString(
          organizational_levels,
          'accounts.collection_operation',
          'drives.recruiter_id'
        );

        if (drivesWhere)
          whereOr.push(
            `(operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND (${drivesWhere}))`
          );

        // for sessions operations
        const sessionsWhere = organizationalLevelWhereString(
          organizational_levels,
          'sessions.collection_operation_id',
          null,
          'sessions.donor_center_id'
        );

        if (sessionsWhere)
          whereOr.push(
            `(operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND (${sessionsWhere}))`
          );

        // for nce operations
        const nceWhere = organizationalLevelWhereString(
          organizational_levels,
          'nce_collection_operations.business_unit_id'
        );

        if (nceWhere)
          whereOr.push(
            `(operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND (${nceWhere}))`
          );

        whereOr.length && whereConditions.push(`(${whereOr.join(' OR ')})`);
      }

      if (request_type) {
        whereConditions.push(`request_type = '${request_type}'`);
      }

      if (operation_type) {
        whereConditions.push(`operationable_type = '${operation_type}'`);
      }

      if (requestor) {
        whereConditions.push(`approvals.created_by = ${requestor}`);
      }
      if (user?.is_manager) {
        const queryUser = `SELECT * from "user" where "user".assigned_manager = ${user?.id}`;
        const users = await this.approvalsRepository.query(queryUser);

        const managerUserIds = users.map((user: any) => {
          return user?.id;
        });

        if (managerUserIds.length) {
          whereConditions.push(`approvals.created_by In (${managerUserIds})`);
        } else {
          whereConditions.push('1=0');
        }
      }

      if (request_status) {
        whereConditions.push(`request_status = '${request_status}'`);
      }

      if (keyword) {
        whereConditions.push(`
          (
            CASE
              WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN facility.name ILIKE '%${keyword}%'
              WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN accounts.name ILIKE '%${keyword}%'
              WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN oc_non_collection_events.event_name ILIKE '%${keyword}%'
            END
          )
        `);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      const orderClause = sortBy
        ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}`
        : 'ORDER BY approvals.id DESC';

      const query = `
        SELECT
          approvals.*,
        CASE
          WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN
            sessions.date
          WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN
            drives.date
          WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN
            oc_non_collection_events.date
          ELSE
            NULL
        END AS operation_date,
        CASE
          WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN
            facility.name
          WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN
            accounts.name
          WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN
            oc_non_collection_events.event_name
          ELSE
            NULL
        END AS name,
        business_units.name AS collection_operation,
        approvals.created_at AS request_date,
        CONCAT("user".first_name, ' ', "user".last_name) AS requested_by,
        "user".id AS requestor
        FROM
          oc_approvals approvals
        LEFT JOIN
          "user" ON approvals.created_by = "user".id
        LEFT JOIN
          sessions ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND approvals.operationable_id = sessions.id
        LEFT JOIN
          drives ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND approvals.operationable_id = drives.id
        LEFT JOIN
          oc_non_collection_events ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND approvals.operationable_id = oc_non_collection_events.id
        LEFT JOIN
          nce_collection_operations ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND oc_non_collection_events.id = nce_collection_operations.nce_id
        LEFT JOIN
          accounts ON drives.account_id = accounts.id
        LEFT JOIN
          facility ON sessions.donor_center_id = facility.id
        LEFT JOIN
          business_units ON
            (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND sessions.collection_operation_id = business_units.id) OR
            (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND drives.account_id IS NOT NULL AND accounts.collection_operation = business_units.id) -- OR
              --  (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND oc_non_collection_events.collection_operation_id = business_units.id)
        ${whereClause}
        ${orderClause}
        LIMIT ${pagination.take} OFFSET ${pagination.skip};        
        `;

      const queryCount = `SELECT * FROM oc_approvals where is_archived=false ORDER BY id DESC`;

      const data = await this.approvalsRepository.query(query);
      const count = await this.approvalsRepository.query(queryCount);

      return {
        status: HttpStatus.OK,
        message: 'Oc Approvals Fetched successfully',
        count: count.length,
        lastRecordId: count?.length ? count[0]?.id : null,
        data,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any, user: any) {
    try {
      const query = `
      SELECT
        subquery.*,
        (
          SELECT JSON_BUILD_OBJECT(
            'id', left_approval.id,
            'tenant_id', approvals.tenant_id
          )
          FROM oc_approvals approvals
          LEFT JOIN oc_approvals left_approval ON approvals.id > left_approval.id
          WHERE approvals.id = ${id} AND left_approval.is_archived = false
          ORDER BY left_approval.id DESC
          LIMIT 1
        ) AS left_approval,
        (
          SELECT JSON_BUILD_OBJECT(
            'id', right_approval.id,
            'tenant_id', right_approval.tenant_id
          )
          FROM oc_approvals approvals
          LEFT JOIN oc_approvals right_approval ON approvals.id < right_approval.id
          WHERE approvals.id = ${id} AND right_approval.is_archived = false
          ORDER BY right_approval.id ASC
          LIMIT 1
        ) AS right_approval,        
        (
            SELECT JSON_AGG(details)
            FROM (
                SELECT
                    JSONB_BUILD_OBJECT(
                        'id', details.id,
                        'tenant_id', subquery.tenant_id,
                        'shift_id', details.shift_id,
                        'shift_number', shifts.shift_number,
                        'field', details.field_name,
                        'field_approval_status', details.field_approval_status,
                        'is_override', details.is_override,
                        'original', details.original_data,
                        'requested', details.requested_data
                    ) AS details
                FROM oc_approvals_details details
                LEFT JOIN shifts ON shifts.id = details.shift_id
                WHERE details.approval_id = subquery.id
            ) AS details
        ) AS details,
        (
          SELECT JSON_BUILD_OBJECT(
            'min_start_time', MIN(shifts.start_time),
            'max_end_time', MAX(shifts.end_time),
            'tenant_id', MAX(shifts.tenant_id)
          )
          FROM shifts
          WHERE shifts.shiftable_id = subquery.operationable_id
          AND shifts.shiftable_type = 
            CASE
              WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
            END
          GROUP BY subquery.operationable_id
        ) AS shifts_data,
        (
          SELECT
            CASE
              WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN NULL
              ELSE JSON_BUILD_OBJECT(
                'sum_product_yield', COALESCE(SUM(projections.product_yield), 0),
                'sum_procedure_type_qty', COALESCE(SUM(projections.procedure_type_qty), 0),
                'tenant_id', subquery.tenant_id
              )
          END AS projection
          FROM shifts
          LEFT JOIN shifts_projections_staff projections ON shifts.id = projections.shift_id
          WHERE shifts.shiftable_id = subquery.operationable_id
            AND shifts.shiftable_type = 
                CASE
                  WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                  WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
                  WHEN subquery.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
            END
        )   
      FROM (
        SELECT
            approvals.*,
            CASE
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN sessions.date
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN drives.date
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN oc_non_collection_events.date
                ELSE NULL
            END AS operation_date,
            CASE
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN facility.name
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' THEN accounts.name
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN oc_non_collection_events.event_name
                ELSE NULL
            END AS name,
            CASE
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' OR approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' THEN crm_locations.name
                ELSE NULL
            END AS location_name,
            CASE
                WHEN approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' THEN address.address2
                ELSE NULL
            END AS address_name,
            business_units.name AS collection_operation,
            approvals.created_at AS request_date,
            CONCAT("user".first_name, ' ', "user".last_name) AS requested_by,
            "user".id AS requestor
        FROM
            oc_approvals approvals
        LEFT JOIN
            "user" ON approvals.created_by = "user".id
        LEFT JOIN
            sessions ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND approvals.operationable_id = sessions.id
        LEFT JOIN
            drives ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND approvals.operationable_id = drives.id
        LEFT JOIN
            oc_non_collection_events ON approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND approvals.operationable_id = oc_non_collection_events.id
        LEFT JOIN
            accounts ON drives.account_id = accounts.id
        LEFT JOIN
            facility ON sessions.donor_center_id = facility.id
        LEFT JOIN
            business_units ON
                (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND sessions.collection_operation_id = business_units.id) OR
                (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND drives.account_id IS NOT NULL AND accounts.collection_operation = business_units.id) -- OR
              --  (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND oc_non_collection_events.collection_operation_id = business_units.id)
        LEFT JOIN
            crm_locations ON
                (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND drives.location_id = crm_locations.id) OR
                (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' AND oc_non_collection_events.location_id = crm_locations.id)
        LEFT JOIN
            address ON
                (approvals.operationable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND address.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}' AND facility.id = address.addressable_id)      
        WHERE
            approvals.id = ${id} AND approvals.is_archived = false
    ) AS subquery;
    `;
      const data = await this.approvalsRepository.query(query);
      if (!data.length) {
        throw new NotFoundException(`Approval not found`);
      }
      return {
        status: HttpStatus.OK,
        message: 'Oc Approval Fetched successfully',
        data: {
          ...data?.[0],
          left_approval: {
            id: data?.[0]?.left_approval?.id,
            tenant_id: user?.tenant?.id,
          },
        },
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, user: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ocApproval: any = await this.approvalsRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'details'],
      });

      if (!ocApproval) {
        resError(
          `Approval not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (!user.is_manager) {
        resError(
          `Only Manager can archive the approval.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (ocApproval.is_archived) {
        resError(
          `Approval is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      ocApproval.is_archived = true;
      ocApproval.created_at = new Date();
      ocApproval.created_by = user;
      const archivedApproval = await queryRunner.manager.save(
        OcApprovals,
        ocApproval
      );

      for (const detail of ocApproval.details) {
        detail.is_archived = true;
        const archivedDetail = await queryRunner.manager.save(
          OcApprovalsDetail,
          detail
        );
      }

      await queryRunner.commitTransaction();

      return resSuccess(
        'Approval archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async updateApprovalDetail(
    id: any,
    user: any,
    updateApprovalDto: UpdateApprovalDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { request_status, details, is_discussion_required }: any =
        updateApprovalDto;

      const ocApproval: any = await this.approvalsRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'details'],
      });

      if (!ocApproval) {
        resError(
          `Approval not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (!user.is_manager) {
        resError(
          `Only Manager can update the approval.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (
        request_status ||
        (is_discussion_required !== undefined &&
          is_discussion_required !== null)
      ) {
        ocApproval.request_status = request_status ?? ocApproval.request_status;
        ocApproval.is_discussion_required =
          is_discussion_required ?? ocApproval.is_discussion_required;
        ocApproval.created_at = new Date();
        ocApproval.created_by = user;
        const updatedApproval = await queryRunner.manager.save(
          OcApprovals,
          ocApproval
        );
      }

      if (details?.length) {
        for (const detail of details) {
          const ocApprovalDetail: any =
            await this.approvalsDetailRepository.findOne({
              where: { id: detail.id as any },
            });

          if (!ocApprovalDetail) {
            resError(
              `Approval Detail not found.`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }

          ocApprovalDetail.field_approval_status =
            detail.field_approval_status ??
            ocApprovalDetail.field_approval_status;
          ocApprovalDetail.is_override =
            detail.is_override ?? ocApprovalDetail.is_override;
          ocApprovalDetail.created_at = new Date();
          ocApprovalDetail.created_by = user;
          const updatedDetail = await queryRunner.manager.save(
            OcApprovalsDetail,
            ocApprovalDetail
          );
        }
      }

      await queryRunner.commitTransaction();

      return resSuccess(
        'Approval Detail updated successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      const ocApprovalAfterUpdate: any = await this.approvalsRepository.findOne(
        {
          where: { id: id },
          relations: ['created_by', 'details'],
        }
      );
      ocApprovalAfterUpdate.created_at = new Date();
      ocApprovalAfterUpdate.created_by = user;
      if (ocApprovalAfterUpdate?.details?.length) {
        const noOnePending = ocApprovalAfterUpdate?.details?.every(
          (detail: any) => detail.field_approval_status != 'Pending'
        );

        if (noOnePending) {
          ocApprovalAfterUpdate.request_status = RequestStatusEnum.resolved;
          const updatedApproval = await queryRunner.manager.save(
            OcApprovals,
            ocApprovalAfterUpdate
          );

          const allApproved = ocApprovalAfterUpdate?.details?.every(
            (detail: any) => detail.field_approval_status === 'Approved'
          );

          if (allApproved) {
            if (
              ocApprovalAfterUpdate?.operationable_type ==
              PolymorphicType.OC_OPERATIONS_SESSIONS
            ) {
              const session = await this.sessionRepository.findOne({
                where: {
                  id: ocApprovalAfterUpdate?.operationable_id,
                },
              });
              session.approval_status = ApprovalStatusEnum.APPROVED;

              await queryRunner.manager.save(Sessions, session);
            } else if (
              ocApprovalAfterUpdate?.operationable_type ==
              PolymorphicType.OC_OPERATIONS_DRIVES
            ) {
              const drive = await this.driveRepository.findOne({
                where: {
                  id: ocApprovalAfterUpdate?.operationable_id,
                },
              });

              drive.approval_status = DriveStatusEnum.APPROVED;
              await queryRunner.manager.save(Drives, drive);
            } else if (
              ocApprovalAfterUpdate?.operationable_type ==
              PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
            ) {
              const nce = await this.nceRepository.findOne({
                where: {
                  id: ocApprovalAfterUpdate?.operationable_id,
                },
              });

              nce.approval_status = NceApprovalStatus.APPROVED;
              await queryRunner.manager.save(NonCollectionEvents, nce);
            }
          }
        }
      }
      await queryRunner.release();
    }
  }
}
