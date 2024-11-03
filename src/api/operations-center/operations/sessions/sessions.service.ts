import {
  EntityManager,
  FindOptionsRelations,
  IsNull,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HistoryService } from 'src/api/common/services/history.service';
import { Sessions } from './entities/sessions.entity';
import { SessionsHistory } from './entities/sessions-history.entity';
import { SessionsPromotions } from './entities/sessions-promotions.entity';
import { SessionsPromotionsHistory } from './entities/sessions-promotions-history.entity';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { UpsertSessionDto } from './dto/upsert-sessions.dto';
import {
  Response,
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { Facility } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility.entity';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import { ApprovalStatusEnum } from '../drives/enums';
import { Sort } from 'src/common/interface/sort';
import { FilterSessions } from './interfaces/filter-sessions.interface';
import { pagination } from 'src/common/utils/pagination';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { HistoryReason } from 'src/common/enums/history_reason.enum';
import { ShiftsService } from 'src/api/shifts/services/shifts.service';
import { isExistMultiple, isExists } from 'src/api/common/utils/exists';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { ShiftsDto } from 'src/api/shifts/dto/shifts.dto';
import { updateCustomFields } from 'src/api/common/services/updateCustomFields.service';
import { AddShiftSlotDTO } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/dto/create-blueprint.dto';
import { Pickups } from '../drives/entities/pickups.entity';
import { PickupDto } from '../drives/dto/pickup.dto';
import { GetAllPickupsInterface } from '../drives/interface/get-drives-filter.interface';
import { EquipmentEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/entity/equipment.entity';
import { GetEquipmentForDriveInterface } from 'src/api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/interface/equipment.interface';
import _ from 'lodash';
import { ListChangeAuditDto } from '../drives/dto/change-audit.dto';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { OperationsApprovalsService } from '../drives/service/opertion-approvals.service';
import moment from 'moment';
import { ResourceSharingDto } from '../drives/dto/create-drive.dto';
import { ResourceSharings } from '../../resource-sharing/entities/resource-sharing.entity';
import { resource_share_type_enum } from '../../resource-sharing/enum/resource-sharing.enum';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';
import { OperationTypeEnum } from 'src/api/call-center/call-schedule/call-jobs/enums/operation-type.enum';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { refTypeEnum } from './enums/ref-type.enum';
import { DonorCenterBluePrints } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/entity/donor_center_blueprint';
import { userBusinessUnitHierarchy } from 'src/api/system-configuration/tenants-administration/user-administration/user/utils';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { TargetNotifications } from 'src/api/notifications/entities/target-notifications.entity';
import { UserNotifications } from 'src/api/notifications/entities/user-notifications.entity';
import { PushNotifications } from 'src/api/notifications/entities/push-notifications.entity';
import { NotificationsService } from 'src/api/notifications/services/notifications.service';
@Injectable()
export class SessionsService extends HistoryService<SessionsHistory> {
  constructor(
    @Inject(REQUEST)
    private readonly request: UserRequest,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    @InjectRepository(SessionsHistory)
    private readonly sessionsHistoryRepository: Repository<SessionsHistory>,
    @InjectRepository(SessionsPromotions)
    private readonly sessionsPromotionsRepository: Repository<SessionsPromotions>,
    @InjectRepository(SessionsPromotionsHistory)
    private readonly sessionsPromotionsHistoryRepository: Repository<SessionsPromotionsHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(CustomFieldsData)
    private readonly customFieldsDataRepository: Repository<CustomFieldsData>,
    @InjectRepository(PromotionEntity)
    private readonly promotionsRespository: Repository<PromotionEntity>,
    @InjectRepository(OperationsStatus)
    private readonly operationStatusRespository: Repository<OperationsStatus>,
    @InjectRepository(BusinessUnits)
    private readonly collectionOperationRespository: Repository<BusinessUnits>,
    @InjectRepository(UserBusinessUnits)
    private readonly userBusinessUnitsRepository: Repository<UserBusinessUnits>,
    @InjectRepository(Facility)
    private readonly donorCenterRespository: Repository<Facility>,
    @InjectRepository(DonorCenterBluePrints)
    private readonly donorCenterBluePrintRespository: Repository<DonorCenterBluePrints>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(ShiftsSlots)
    private readonly shiftsSlotRepository: Repository<ShiftsSlots>,
    @InjectRepository(Pickups)
    private readonly pickupRepository: Repository<Pickups>,
    @InjectRepository(EquipmentEntity)
    private readonly equipmentRespistory: Repository<EquipmentEntity>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRespistory: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(ChangeAudits)
    private readonly changeAuditsRepo: Repository<ChangeAudits>,
    @InjectRepository(PushNotifications)
    private readonly pushNotificationsRepository: Repository<PushNotifications>,
    @InjectRepository(UserNotifications)
    private readonly userNotificationsRepository: Repository<UserNotifications>,
    @InjectRepository(TargetNotifications)
    private readonly targetNotificationsRepository: Repository<TargetNotifications>,
    private readonly shiftsService: ShiftsService,
    private readonly sessionsApprovalsService: OperationsApprovalsService,
    private readonly entityManager: EntityManager,
    private readonly flagService: FlaggedOperationService,
    private readonly notificationService: NotificationsService
  ) {
    super(sessionsHistoryRepository);
  }

  async create(createDto: UpsertSessionDto): Promise<Response> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const [collectionOperation, operationStatus, promotions, donorCenter] =
        await Promise.all([
          isExists<BusinessUnits>(
            createDto.collection_operation_id,
            this.collectionOperationRespository,
            'Collection Operation not found'
          ),
          isExists<OperationsStatus>(
            createDto.status_id,
            this.operationStatusRespository,
            'Status not found'
          ),
          isExistMultiple<PromotionEntity>(
            createDto.promotion_ids,
            this.promotionsRespository,
            'Some Promotions are not found'
          ),
          isExists<Facility>(
            createDto.donor_center_id,
            this.donorCenterRespository,
            'Donor Center not found'
          ),
          createDto.ref_type === refTypeEnum.SESSION
            ? isExists<Sessions>(
                `${createDto.ref_id}`,
                this.sessionsRepository,
                'Referenced Session not found'
              )
            : createDto.ref_type === refTypeEnum.BLUEPRINT
            ? isExists<DonorCenterBluePrints>(
                `${createDto.ref_id}`,
                this.donorCenterBluePrintRespository,
                'Blueprint not found'
              )
            : null,
        ]);

      let approval_status = ApprovalStatusEnum.APPROVED;
      if (!this.request.user.override && operationStatus.requires_approval) {
        approval_status = ApprovalStatusEnum.REQUIRES_APPROVAL;
      }

      const { oef_products, oef_procedures } = await this.getOEFs(
        createDto.shifts
      );

      if (createDto.ref_id && createDto.ref_type) {
        const existingSessions = await this.sessionsRepository
          .createQueryBuilder('session')
          .where({
            ref_id: createDto.ref_id,
            ref_type: createDto.ref_type,
            donor_center_id: parseInt(createDto.donor_center_id),
            tenant_id: this.request.user?.tenant?.id,
            is_archived: false,
          })
          .andWhere('DATE(session.date) = :date', {
            date: createDto.date.toString().split('T')[0],
          })
          .getMany();

        if (existingSessions.length && !createDto.override) {
          return resError(
            `Session with ${
              createDto.ref_type === refTypeEnum.SESSION
                ? 'Session'
                : 'Blueprint'
            } => ${createDto.ref_id} is already exists.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }

        if (existingSessions.length && createDto.override) {
          for (const session of existingSessions) {
            session.is_archived = true;
            await queryRunner.manager.save(session);
          }
        }
      }

      // Saving session
      const session = await queryRunner.manager.save(
        this.sessionsRepository.create({
          date: createDto.date,
          collection_operation: collectionOperation,
          operation_status: operationStatus,
          donor_center: donorCenter,
          tenant: this.request.user?.tenant,
          created_by: this.request.user,
          approval_status,
          oef_products,
          oef_procedures,
          ref_id: createDto.ref_id,
          ref_type: createDto.ref_type,
        })
      );

      // Saving change audit
      await queryRunner.manager.save(
        this.changeAuditsRepo.create({
          changes_field: 'Session',
          changes_to: 'Session Created',
          changes_from: null,
          created_by: this.request.user?.id,
          tenant_id: this.request.user.tenant?.id,
          changed_when:
            this.request.user.first_name + ' ' + this.request.user.last_name,
          auditable_id: session.id,
          auditable_type: OperationTypeEnum.SESSIONS as any,
        })
      );

      // Saving custom fields
      const customFields = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        session,
        session.created_by,
        session.tenant,
        createDto,
        customFields
      );

      // Saving session promotions
      await queryRunner.manager.insert(
        SessionsPromotions,
        promotions.map((promotion) => ({
          session,
          promotion,
          created_by: this.request.user,
        }))
      );

      // Saving shifts
      await this.shiftsService.createShiftByShiftAble(
        createDto,
        queryRunner,
        createDto.shifts,
        session,
        this.request.user,
        this.request.user?.tenant?.id,
        PolymorphicType.OC_OPERATIONS_SESSIONS,
        false,
        true
      );

      // Saving resource sharing
      await this.createResourceSharing(queryRunner, createDto.resource_sharing);

      await queryRunner.commitTransaction();
      this.flagService.flaggedOperation(
        session.id,
        PolymorphicType.OC_OPERATIONS_SESSIONS,
        this.request.user.tenant?.id
      );
      return resSuccess(
        'Session Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...session, customFields, promotions }
      );
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        return resError(error.message, ErrorConstants.Error, error.getStatus());
      }
      return resError(
        'Something went wrong.',
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createMany(createDtos: UpsertSessionDto[]): Promise<Response> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      for (const dto of createDtos) {
        const [collectionOperation, operationStatus, promotions, donorCenter] =
          await Promise.all([
            isExists<BusinessUnits>(
              dto.collection_operation_id,
              this.collectionOperationRespository,
              'Collection Operation not found'
            ),
            isExists<OperationsStatus>(
              dto.status_id,
              this.operationStatusRespository,
              'Status not found'
            ),
            isExistMultiple<PromotionEntity>(
              dto.promotion_ids,
              this.promotionsRespository,
              'Some Promotions are not found'
            ),
            isExists<Facility>(
              dto.donor_center_id,
              this.donorCenterRespository,
              'Donor Center not found'
            ),
            dto.ref_type === refTypeEnum.SESSION
              ? isExists<Sessions>(
                  `${dto.ref_id}`,
                  this.sessionsRepository,
                  'Referenced Session not found'
                )
              : dto.ref_type === refTypeEnum.BLUEPRINT
              ? isExists<DonorCenterBluePrints>(
                  `${dto.ref_id}`,
                  this.donorCenterBluePrintRespository,
                  'Blueprint not found'
                )
              : null,
          ]);

        let approval_status = ApprovalStatusEnum.APPROVED;
        if (!this.request.user.override && operationStatus.requires_approval) {
          approval_status = ApprovalStatusEnum.REQUIRES_APPROVAL;
        }

        const { oef_products, oef_procedures } = await this.getOEFs(dto.shifts);
        if (dto.ref_id && dto.ref_type) {
          const existingSessions = await this.sessionsRepository
            .createQueryBuilder('session')
            .where({
              ref_id: dto.ref_id,
              ref_type: dto.ref_type,
              donor_center_id: parseInt(dto.donor_center_id),
              tenant_id: this.request.user?.tenant?.id,
              is_archived: false,
            })
            .andWhere('DATE(session.date) = :date', {
              date: dto.date.toString().split('T')[0],
            })
            .getMany();

          if (existingSessions.length && !dto.override) {
            return resError(
              `Session with ${
                dto.ref_type === refTypeEnum.SESSION ? 'Session' : 'Blueprint'
              } => ${dto.ref_id} is already exists.`,
              ErrorConstants.Error,
              HttpStatus.CONFLICT
            );
          }

          if (existingSessions.length && dto.override) {
            for (const session of existingSessions) {
              session.is_archived = true;
              await queryRunner.manager.save(session);
            }
          }
        }
        // Saving session
        const session = await queryRunner.manager.save(
          this.sessionsRepository.create({
            date: dto.date,
            collection_operation: collectionOperation,
            operation_status: operationStatus,
            donor_center: donorCenter,
            tenant: this.request.user?.tenant,
            created_by: this.request.user,
            approval_status,
            oef_products,
            oef_procedures,
            ref_id: dto.ref_id,
            ref_type: dto.ref_type,
          })
        );

        // Saving custom fields
        const customFields = [];
        await saveCustomFields(
          this.customFieldsRepository,
          queryRunner,
          session,
          session.created_by,
          session.tenant,
          dto,
          customFields
        );

        // Saving session promotions
        await queryRunner.manager.insert(
          SessionsPromotions,
          promotions.map((promotion) => ({
            session,
            promotion,
            created_by: this.request.user,
          }))
        );

        // Saving shifts
        await this.shiftsService.createShiftByShiftAble(
          dto,
          queryRunner,
          dto.shifts,
          session,
          this.request.user,
          this.request.user?.tenant?.id,
          PolymorphicType.OC_OPERATIONS_SESSIONS,
          false,
          true
        );

        // Saving resource sharing
        await this.createResourceSharing(queryRunner, dto.resource_sharing);
      }

      await queryRunner.commitTransaction();

      return resSuccess(
        'Sessions are created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED
      );
    } catch (error) {
      console.info(error);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException)
        return resError(error.message, ErrorConstants.Error, error.getStatus());
      return resError(
        'Something went wrong.',
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createResourceSharing(
    queryRunner: QueryRunner,
    resource_sharing: ResourceSharingDto[]
  ) {
    for (const item of resource_sharing) {
      const sharedResource = new ResourceSharings();
      const [fromCollectionOperation, toCollectionOperation] =
        await Promise.all([
          isExists<BusinessUnits>(
            <any>item.from_collection_operation_id,
            this.collectionOperationRespository,
            'Collection Operation not found'
          ),
          isExists<BusinessUnits>(
            <any>item.to_collection_operation_id,
            this.collectionOperationRespository,
            'Collection Operation not found'
          ),
        ]);
      sharedResource.from_collection_operation_id = fromCollectionOperation;
      sharedResource.to_collection_operation_id = toCollectionOperation;
      sharedResource.description = item.description;
      sharedResource.share_type = resource_share_type_enum.STAFF;
      sharedResource.quantity = item.quantity;
      sharedResource.start_date = item.start_date;
      sharedResource.end_date = item.end_date;
      sharedResource.is_active = true;
      sharedResource.created_by = this?.request?.user;
      sharedResource.created_at = new Date();
      sharedResource.tenant_id = this?.request?.user?.tenant;
      await queryRunner.manager.save(sharedResource);
    }
  }

  async get(
    page: number,
    limit: number,
    sortBy: Sort,
    filters: FilterSessions
  ): Promise<Response> {
    try {
      const projectionsQuery = this.shiftsProjectionsStaffRespistory
        .createQueryBuilder('sps')
        .select([
          'sps.procedure_type_qty as procedure_type_qty',
          'sps.product_yield as product_yield',
          'sps.shift_id as shift_id',
        ])
        .groupBy(
          'sps.shift_id, sps.procedure_type_id, sps.procedure_type_qty, sps.product_yield'
        )
        .where('sps.is_archived = FALSE');

      const shiftsQuery = this.shiftsRepository
        .createQueryBuilder('shifts')
        .select([
          'shifts.shiftable_id AS sessions_id',
          'MIN(DISTINCT shifts.start_time) AS start_time',
          'MAX(DISTINCT shifts.end_time) AS end_time',
          'COALESCE(SUM(sub.product_yields), 0) AS product_yields',
          `COALESCE(SUM(sub.procedure_type_qtys), 0) AS procedure_type_qtys`,
        ])
        .leftJoin(
          `(SELECT
              projections.shift_id as shift_id,
              SUM("projections"."product_yield") product_yields,
              SUM("projections"."procedure_type_qty") procedure_type_qtys
            FROM (${projectionsQuery.getQuery()}) AS projections
            GROUP BY projections.shift_id
          )`,
          'sub',
          'sub.shift_id = shifts.id'
        )
        .groupBy('shifts.shiftable_id')
        .where(
          `shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' AND shifts.is_archived = FALSE`
        );

      const promotionsQuery = this.sessionsPromotionsRepository
        .createQueryBuilder('sessions_promos')
        .select([
          'sessions_promos.session_id AS sessions_id',
          `STRING_AGG(promos.name, ', ') AS names`,
        ])
        .leftJoin(
          'promotion_entity',
          'promos',
          `promos.id = sessions_promos.promotion_id AND promos.is_archived = false`
        )
        .where('sessions_promos.is_archived = false')
        .groupBy('sessions_promos.session_id');

      const sessionsQuery = this.sessionsRepository
        .createQueryBuilder('sessions')
        .leftJoinAndSelect(
          'sessions.donor_center',
          'dc',
          'dc.is_archived = false'
        )
        .leftJoinAndSelect(
          'business_units',
          'bu',
          'dc.collection_operation = bu.id AND bu.is_archived = false'
        )
        .leftJoinAndSelect(
          'sessions.operation_status',
          'oc',
          'oc.is_archived = false'
        )
        .leftJoin(
          `(${shiftsQuery.getQuery()})`,
          'shifts',
          'shifts.sessions_id = sessions.id'
        )
        .select([
          'sessions.id AS id',
          'sessions.date AS date',
          `CONCAT(ROUND(sessions.oef_products, 2), ' / ', ROUND(sessions.oef_procedures, 2)) AS oef`,
          'dc.name AS donor_center',
          'bu.id AS collection_operation_id',
          'bu.name AS collection_operation',
          'oc.name AS status',
          'oc.chip_color AS status_chip_color',
          `promotions.names AS promotions`,
          `CONCAT(shifts.product_yields, ' / ', shifts.procedure_type_qtys) AS projection`,
          'shifts.start_time AS start_time',
          'shifts.end_time AS end_time',
        ])
        .where({
          tenant: this.request.user.tenant,
          is_archived: false,
        });

      const operationStatusOptionsQuery = this.sessionsRepository
        .createQueryBuilder('sessions')
        .leftJoinAndSelect(
          'sessions.operation_status',
          'oc',
          'oc.is_archived = false'
        )
        .where({ is_archived: false })
        .select(['oc.id AS id', 'oc.name AS name'])
        .distinctOn(['oc.id'])
        .orderBy('oc.id');

      const promotionsOptionsQuery = this.sessionsPromotionsRepository
        .createQueryBuilder('sessions_promos')
        .leftJoinAndSelect(
          'sessions_promos.session',
          'sessions',
          'sessions.is_archived = false'
        )
        .leftJoinAndSelect(
          'sessions_promos.promotion',
          'promos',
          'promos.is_archived = false'
        )
        .where({ is_archived: false })
        .select(['promos.id AS id', 'promos.name AS name'])
        .distinctOn(['promos.id'])
        .orderBy('promos.id');

      if (filters?.keyword) {
        sessionsQuery.andWhere(`dc.name ILIKE :keyword`, {
          keyword: `%${filters.keyword}%`,
        });
      }
      if (filters?.start_date) {
        sessionsQuery.andWhere(`sessions.date >= :start_date`, {
          start_date: filters.start_date,
        });
      }
      if (filters?.end_date) {
        sessionsQuery.andWhere(`sessions.date <= :end_date`, {
          end_date: filters.end_date,
        });
      }
      if (filters?.promotion_id) {
        sessionsQuery.innerJoin(
          `(${promotionsQuery
            .andWhere(`promos.id = :promotion_id`)
            .getQuery()})`,
          'promotions',
          'promotions.sessions_id = sessions.id',
          { promotion_id: filters.promotion_id }
        );
      } else {
        sessionsQuery.leftJoin(
          `(${promotionsQuery.getQuery()})`,
          'promotions',
          'promotions.sessions_id = sessions.id'
        );
      }
      if (filters?.donor_center_id) {
        sessionsQuery.andWhere(`dc.id = :donor_center_id`, {
          donor_center_id: filters.donor_center_id,
        });
      }
      if (filters?.status_id) {
        sessionsQuery.andWhere(`oc.id = :status_id`, {
          status_id: filters.status_id,
        });
      }
      if (filters?.min_projection) {
        sessionsQuery.andWhere(
          `shifts.product_yields >= :min_projection AND shifts.procedure_type_qtys >= :min_projection`,
          {
            min_projection: filters.min_projection,
          }
        );
      }
      if (filters?.max_projection) {
        sessionsQuery.andWhere(
          `shifts.product_yields <= :max_projection AND shifts.procedure_type_qtys <= :max_projection`,
          {
            max_projection: filters.max_projection,
          }
        );
      }
      if (filters?.organizational_levels) {
        sessionsQuery.andWhere(
          organizationalLevelWhere(
            filters.organizational_levels,
            'bu.id',
            null,
            'dc.id'
          )
        );
      }
      if (sortBy.sortName && sortBy.sortOrder) {
        sessionsQuery.addOrderBy(sortBy.sortName, sortBy.sortOrder);
      }

      const count = await sessionsQuery.getCount();

      if (page && limit) {
        const { skip, take } = pagination(page, limit - 1);
        sessionsQuery.limit(take).offset(skip);
      }

      const [records, operationStatus, promotions] = await Promise.all([
        sessionsQuery.getRawMany(),
        operationStatusOptionsQuery.getRawMany(),
        promotionsOptionsQuery.getRawMany(),
      ]);

      const userBusinessUnits = await userBusinessUnitHierarchy(
        this.request.user.id,
        this.userBusinessUnitsRepository,
        this.collectionOperationRespository,
        this.request.user?.role?.is_auto_created,
        this.request.user?.tenant?.id
      );

      const userBusinessUnitsIds = userBusinessUnits?.map((units) => units.id);
      const updatedRecords = records.map((record) => {
        const isWriteable =
          userBusinessUnitsIds?.includes(record?.collection_operation_id) ||
          false;
        return {
          ...record,
          writeable: isWriteable,
        };
      });
      return resSuccess(
        'Sessions records',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { count, records: updatedRecords, operationStatus, promotions }
      );
    } catch (error) {
      console.info(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getOne(id: any): Promise<Response> {
    try {
      if (isNaN(parseInt(id))) {
        resError(`Invalid data`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const [session, promotions, customFields, shifts, projections]: any =
        await Promise.all([
          isExists<Sessions>(
            id,
            this.sessionsRepository,
            undefined,
            {
              tenant_id: this.request.user.tenant.id,
            },
            {
              donor_center: {
                industry_category: true,
                industry_sub_category: true,
              },
              collection_operation: true,
              operation_status: true,
              created_by: true,
            }
          ),
          this.sessionsPromotionsRepository.find({
            where: {
              session_id: <any>id,
              is_archived: false,
            },
            relations: ['promotion'],
            order: {
              created_at: 'DESC',
            },
          }),
          this.customFieldsDataRepository.find({
            where: {
              custom_field_datable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
              custom_field_datable_id: <any>id,
            },
            relations: ['field_id', 'field_id.pick_list'],
          }),
          this.shiftsRepository
            .createQueryBuilder('shift')
            .leftJoin(
              'shifts_devices',
              'sd',
              'sd.shift_id = shift.id AND sd.is_archived = false'
            )
            .leftJoin(
              'device',
              'device',
              'device.id = sd.device_id AND device.is_archived = false'
            )
            .select([
              'shift.*',
              `ARRAY_AGG(
                JSON_BUILD_OBJECT(
                  'id', device.id, 
                  'name', device.name,
                  'retire_on', device.retire_on,
                  'is_active', device.status,
                  'device_type_id', device.device_type_id,
                  'created_at', device.created_at
                )
              ) FILTER (WHERE device.id IS NOT NULL) AS devices`,
              `(SELECT 
                ARRAY_AGG(
                  JSON_BUILD_OBJECT(
                    'id', ss.id, 
                    'shift_id', ss.shift_id,
                    'created_at', ss.created_at,
                    'procedure_type_id', ss.procedure_type_id,
                    'start_time', ss.start_time,
                    'end_time', ss.end_time
                  )
                ) 
                FROM shifts_slots AS ss
                WHERE ss.shift_id = shift.id AND ss.is_archived = false
              ) AS slots`,
            ])
            .groupBy('shift.id')
            .where({
              shiftable_id: id,
              shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
              is_archived: false,
            })
            .getRawMany(),
          this.entityManager.query(
            `
            SELECT
              sps.procedure_type_qty as procedure_type_qty,
              sps.product_yield as product_yield,
              sps.shift_id as shift_id,
              (
                  SELECT
                      JSON_BUILD_OBJECT(
                          'id', pt.id,
                          'name', pt.name,
                          'short_description', pt.short_description,
                          'description', pt.description,
                          'is_goal_type', pt.is_goal_type,
                          'is_archive', pt.is_archive,
                          'is_generate_online_appointments', pt.is_generate_online_appointments,
                          'is_active', pt.is_active,
                          'procedure_duration', pt.procedure_duration,
                          'procedure_types_products', (
                              SELECT
                                  ARRAY_AGG(
                                      JSON_BUILD_OBJECT(
                                          'id', ptp.id,
                                          'procedure_type_id', ptp.procedure_type_id,
                                          'product_id', ptp.product_id,
                                          'quantity', ptp.quantity,
                                          'products',
                                          (
                                            SELECT
                                              JSON_BUILD_OBJECT(
                                                  'id', p.id,
                                                  'name', p.name,
                                                  'short_description', p.short_description,
                                                  'description', p.description,
                                                  'is_active', p.is_active
                                              )
                                          )
                                      )
                                  )
                              FROM
                                  procedure_types_products ptp
                                  JOIN products p ON p.id = ptp.product_id
                              WHERE
                                  ptp.procedure_type_id = pt.id
                          )
                      )
                  FROM
                      procedure_types pt
                  WHERE
                      pt.id = sps.procedure_type_id
              ) AS procedure_type,
              JSON_AGG(
                  JSON_BUILD_OBJECT(
                      'id', ss.id,
                      'name', ss.name,
                      'short_name', ss.short_name,
                      'beds', ss.beds,
                      'concurrent_beds', ss.concurrent_beds,
                      'opeartion_type_id', ss.opeartion_type_id,
                      'procedure_type_id', ss.procedure_type_id,
                      'is_active', ss.is_active,
                      'is_archived', ss.is_archived,
                      'created_at', ss.created_at,
                      'created_by', ss.created_by,
                      'stagger_slots', ss.stagger_slots,
                      'shift_id', sps.shift_id,
                      'sum_staff_qty', COALESCE(sub.qty, 0)
                  )
              ) AS staff_setup
            FROM
              shifts,
              shifts_projections_staff sps
              JOIN staff_setup ss ON sps.staff_setup_id = ss.id
              AND sps.procedure_type_id = ss.procedure_type_id
              LEFT JOIN (
                  SELECT
                      sc.staff_setup_id,
                      COALESCE(
                          SUM(DISTINCT ((cr.oef_contribution * sc.qty) / 100)),
                          0
                      ) AS qty
                  FROM
                      staff_config sc
                      LEFT JOIN contacts_roles cr ON sc.contact_role_id = cr.id
                  GROUP BY
                      sc.staff_setup_id
              ) sub ON sub.staff_setup_id = ss.id
            WHERE
              sps.shift_id = shifts.id
              and shifts.shiftable_id = $1
              AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              AND shifts.is_archived = false
            GROUP BY
              sps.shift_id,
              sps.procedure_type_id,
              sps.procedure_type_qty,
              sps.product_yield
          `,
            [id]
          ),
        ]);

      // Merge Shifts and Projections
      const shiftProjections = {};
      for (const projection of projections) {
        if (!shiftProjections[projection.shift_id]) {
          shiftProjections[projection.shift_id] = [];
        }
        shiftProjections[projection.shift_id].push(projection);
      }
      for (const shift of shifts) {
        shift.projections = shiftProjections[shift.id] || [];
      }

      // const modifiedData = await this.getModifiedData(
      //   session,
      //   this.userRepository
      // );

      if (session) {
        const modifiedData: any = await getModifiedDataDetails(
          this.sessionsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        session.modified_by = session.created_by;
        session.modified_at = session.created_at;
        session.created_at = modified_at ? modified_at : session.created_at;
        session.created_by = modified_by ? modified_by : session.created_by;
      }

      const earliestShift = shifts.reduce((earliestShift, shift) => {
        if (!earliestShift) return shift;
        if (earliestShift.start_time > shift.start_time) return shift;
        return earliestShift;
      });
      const data = {
        ...session,
        // ...modifiedData,
        promotions: promotions.map((p) => p.promotion),
        customFields,
        shifts,
        earliest_shift_time: earliestShift?.start_time,
      };
      console.log('data', data?.collection_operation?.id);

      const userBusinessUnits = await userBusinessUnitHierarchy(
        this.request.user.id,
        this.userBusinessUnitsRepository,
        this.collectionOperationRespository,
        this.request.user?.role?.is_auto_created,
        this.request.user?.tenant?.id
      );

      const userBusinessUnitsIds = userBusinessUnits?.map((units) => units.id);

      const isWriteable =
        userBusinessUnitsIds?.includes(
          data?.collection_operation ? data?.collection_operation?.id : null
        ) || false;
      const updatedRecord = {
        ...data,
        writeable: isWriteable,
      };

      return resSuccess(
        'Session details fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedRecord
      );
    } catch (error) {
      console.info(error);
      if (error instanceof HttpException)
        return resError(error.message, ErrorConstants.Error, error.getStatus());
      return resError(
        'Something went wrong.',
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getOEFs(
    shifts: ShiftsDto[]
  ): Promise<{ oef_products: number; oef_procedures: number }> {
    const oef_products = shifts.reduce(
      (sumOfOEFProducts, shift) => sumOfOEFProducts + shift.oef_products,
      0
    );
    const oef_procedures = shifts.reduce(
      (sumOfOEFProducts, shift) => sumOfOEFProducts + shift.oef_procedures,
      0
    );
    return {
      oef_products: isNaN(oef_products) ? 0 : oef_products,
      oef_procedures: isNaN(oef_procedures) ? 0 : oef_procedures,
    };
  }

  async updatePromotions(
    sessionId: number,
    promotions: PromotionEntity[],
    queryRunner: QueryRunner
  ) {
    const sessionPromotions = await this.sessionsPromotionsRepository.find({
      where: {
        session_id: sessionId,
        is_archived: false,
      },
    });

    const promotionsToBeRemoved = sessionPromotions
      .filter(
        (sessionPromotion) =>
          !promotions.find(
            (promotion) => <any>promotion.id === sessionPromotion.promotion_id
          )
      )
      .map((promotion) => ({
        ...promotion,
        is_archived: true,
        created_at: new Date(),
        created_by: this.request.user,
      }));

    const promotionsToBeAdded = promotions.filter(
      (promotion) =>
        !sessionPromotions.find(
          (sessionPromotion) =>
            <any>promotion.id === sessionPromotion.promotion_id
        )
    );

    await Promise.all([
      queryRunner.manager.save(promotionsToBeRemoved),
      queryRunner.manager.save(
        this.sessionsPromotionsRepository.create(
          promotionsToBeAdded.map((promotion) => ({
            session_id: sessionId,
            promotion_id: <any>promotion.id,
            created_by: this.request.user,
            created_at: new Date(),
            is_archived: false,
          }))
        )
      ),
    ]);
  }

  async update(id, updateDto: UpsertSessionDto): Promise<Response> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      if (isNaN(parseInt(id))) {
        resError(`Invalid data`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const [
        session,
        existingSession,
        collectionOperation,
        operationStatus,
        promotions,
        donorCenter,
      ]: any = await Promise.all([
        isExists<Sessions>(
          id,
          this.sessionsRepository,
          undefined,
          {
            tenant_id: this.request.user.tenant.id,
          },
          [
            'collection_operation',
            'operation_status',
            'donor_center',
          ] as FindOptionsRelations<Sessions>
        ),
        isExists<Sessions>(
          id,
          this.sessionsRepository,
          undefined,
          {
            tenant_id: this.request.user.tenant.id,
          },
          [
            'collection_operation',
            'operation_status',
            'donor_center',
          ] as FindOptionsRelations<Sessions>
        ),
        isExists<BusinessUnits>(
          updateDto.collection_operation_id,
          this.collectionOperationRespository,
          'Collection Operation not found'
        ),
        isExists<OperationsStatus>(
          updateDto.status_id,
          this.operationStatusRespository,
          'Status not found'
        ),
        isExistMultiple<PromotionEntity>(
          updateDto.promotion_ids,
          this.promotionsRespository,
          'Some Promotions are not found'
        ),
        isExists<Facility>(
          updateDto.donor_center_id,
          this.donorCenterRespository,
          'Donor Center not found'
        ),
      ]);
      const sessionShifts = await this.shiftsRepository.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          is_archived: false,
          tenant_id: this.request.user?.tenant?.id,
          slots: {
            is_archived: false,
          },
          projections: {
            is_archived: false,
          },
        },
        relations: [
          'slots',
          'projections',
          'projections.staff_setup',
          'devices',
          'devices.device',
          'vehicles',
          'vehicles.vehicle',
        ],
      });
      const promotionsExisting = await this.sessionsPromotionsRepository.find({
        where: {
          session_id: session.id as any,
          is_archived: false,
        },
        relations: ['promotion'],
      });

      const { oef_products, oef_procedures } = await this.getOEFs(
        updateDto.shifts
      );

      await queryRunner.startTransaction();

      const generalChanges = await this.monitorGeneralChanges(
        session,
        updateDto,
        donorCenter,
        collectionOperation,
        operationStatus,
        oef_products,
        oef_procedures,
        promotionsExisting,
        promotions
      );

      let approval_status = ApprovalStatusEnum.APPROVED;
      if (!this.request.user.override && operationStatus.requires_approval) {
        approval_status = ApprovalStatusEnum.REQUIRES_APPROVAL;
      }

      // updating session
      session.date = new Date(updateDto.date);
      session.collection_operation = collectionOperation;
      session.operation_status = operationStatus;
      session.donor_center = donorCenter;
      session.tenant_id = this.request.user?.tenant?.id;
      session.created_by = this.request.user;
      session.oef_products = oef_products;
      session.oef_procedures = oef_procedures;
      session.approval_status = approval_status;
      session.created_at = new Date();
      session.created_by = this.request?.user;
      await queryRunner.manager.save(session);

      // updating custom fields
      await updateCustomFields(
        session,
        updateDto.custom_fields,
        this.customFieldsDataRepository,
        queryRunner,
        this.request.user?.id,
        this.request.user?.tenant?.id
      );

      // updating session promotions
      await this.updatePromotions(<any>session.id, promotions, queryRunner);

      const shiftsDto = updateDto.shifts;
      // updating shifts
      const { shiftChanges: changesAuditShift, shifts } =
        await this.shiftsService.editShift(
          queryRunner,
          shiftsDto,
          updateDto.slots,
          id,
          PolymorphicType.OC_OPERATIONS_SESSIONS,
          HistoryReason.C,
          this.request.user?.id,
          this.request.user.tenant?.id,
          {
            remove_shift: updateDto.remove_shifts.map((shift_id) => ({
              shift_id,
            })),
            date: updateDto?.date,
          },
          session?.date
        );

      const allChangeAuditData = [...changesAuditShift, ...generalChanges];

      for (const change of allChangeAuditData) {
        await this.changeAuditsRepo.save({
          changes_field: change?.changes_field || null,
          changes_to: change?.changes_to || null,
          changes_from: change?.changes_from || null,
          created_by: this.request.user?.id,
          created_at: new Date(),
          tenant_id: this.request.user.tenant?.id,
          changed_when:
            this.request.user.first_name + ' ' + this.request.user.last_name,
          auditable_id: id,
          auditable_type: OperationTypeEnum.SESSIONS as any,
        });
      }

      let numberOfSlotsSession = 0;

      const slots: any = Object.values(updateDto?.slots || {})?.[0];
      const numberOfSlotsDTO = slots.reduce(
        (acc, obj) => acc + obj.items.length,
        0
      );

      sessionShifts.forEach((shift) => {
        numberOfSlotsSession += shift.slots.length;
      });

      await this.sessionsApprovalsService.handleApprovals(
        queryRunner,
        updateDto,
        existingSession,
        operationStatus,
        shifts,
        numberOfSlotsDTO,
        numberOfSlotsSession,
        sessionShifts,
        [],
        PolymorphicType.OC_OPERATIONS_SESSIONS,
        null
      );

      const manager_id = this.request.user.assigned_manager?.id;
      const updateSessionNotificationDto: any = {
        title: 'Update Session',
        content: 'Session updated Successfully',
        organizational_level: [1, 2, 3],
        module: [157],
        actionable_link: 'http://example.com/action',
        user_id: this.request?.user?.id,
        target_type_id: manager_id ? manager_id : null,
        target_type: 'users',
      };

      await this.notificationService.create(updateSessionNotificationDto);
      // Saving resource sharing
      await this.createResourceSharing(queryRunner, updateDto.resource_sharing);

      await queryRunner.commitTransaction();
      this.flagService.flaggedOperation(
        id,
        PolymorphicType.OC_OPERATIONS_SESSIONS,
        this.request.user.tenant?.id
      );
      return resSuccess(
        'Session updated successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT
      );
    } catch (error) {
      console.info(error);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException)
        return resError(error.message, ErrorConstants.Error, error.getStatus());
      return resError(
        'Something went wrong.',
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async archive(id: string, user: any): Promise<Response> {
    try {
      if (isNaN(parseInt(id))) {
        return resError(
          'Invalid data',
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const session: any = await this.sessionsRepository.findOne({
        where: {
          id: <any>id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: ['tenant'],
      });

      if (!session) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      await this.changeAuditsRepo.update(
        {
          auditable_id: session.id,
          auditable_type: OperationTypeEnum.SESSIONS as any,
        },
        { is_archived: true }
      );
      // archive session
      session.is_archived = true;
      session.created_at = new Date();
      session.created_by = user;
      const archivedSession = await this.sessionsRepository.save(session);

      // Object.assign(archivedSession, {
      //   tenant_id: archivedSession?.tenant?.id,
      // });
      // // store history
      // this.createHistory({
      //   ...session,
      //   history_reason: HistoryReason.D,
      //   created_by: this.request.user?.id,
      //   tenant_id: this.request.user.tenant?.id,
      //   is_archived: false,
      // });

      return resSuccess(
        'Session Archive Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        archivedSession
      );
    } catch (error) {
      console.info(error);
      return resError(error, ErrorConstants.Error);
    }
  }

  async getShiftInfo(id: any): Promise<Response> {
    try {
      const queryCount = await this.sessionsRepository
        .createQueryBuilder('sessions')
        .select(
          `(JSON_BUILD_OBJECT('id', sessions.id, 'tenant_id', sessions.tenant_id))`,
          'sessions'
        )
        .addSelect(
          `(
            SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'start_time', shifts.start_time,
                'end_time', shifts.end_time,
                'oef_products', shifts.oef_products,
                'oef_procedures', shifts.oef_procedures,
                'reduce_slots', shifts.reduce_slots,
                'reduction_percentage', shifts.reduction_percentage,
                'break_start_time', shifts.break_start_time,
                'break_end_time', shifts.break_end_time,
                'vehicle', (
                    SELECT JSON_AGG(JSON_BUILD_OBJECT(
                        'id', vehicle.id,
                        'name', vehicle.name
                    ))
                    FROM shifts_vehicles
                    JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
                    WHERE shifts_vehicles.shift_id = shifts.id
                ),
                'device', (
                    SELECT JSON_AGG(JSON_BUILD_OBJECT(
                        'id', device.id,
                        'name', device.name
                    ))
                    FROM shifts_devices
                    JOIN device ON shifts_devices.device_id = device.id
                    WHERE shifts_devices.shift_id = shifts.id
                ),
                'staff_setup', (
                    SELECT JSON_AGG(JSON_BUILD_OBJECT(
                        'id', staff_setup.id,
                        'name', staff_setup.name
                    ))
                    FROM shifts_staff_setups
                    JOIN staff_setup ON shifts_staff_setups.staff_setup_id = staff_setup.id
                    WHERE shifts_staff_setups.shift_id = shifts.id
                ),
                'products', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                  'id', products.id,
                    'name', products.name, 
                    'product_qty',shifts_projections_staff.product_yield,
                    'procedure_type_id',shifts_projections_staff.procedure_type_id
                ) ) FROM products
                        JOIN procedure_types_products ON products.id = procedure_types_products.product_id
                        JOIN shifts_projections_staff ON procedure_types_products.procedure_type_id = shifts_projections_staff.procedure_type_id
                        JOIN shifts ON shifts_projections_staff.shift_id = shifts.id
                        WHERE shifts.shiftable_id = ${id} AND
                        shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              ),
             
              'procedure_types', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                'id', procedure_types.id,
                  'name', procedure_types.name, 
                  'procedure_type_qty',shifts_projections_staff.procedure_type_qty
              ) ) FROM procedure_types
                      JOIN shifts_projections_staff ON procedure_types.id = shifts_projections_staff.procedure_type_id
                      JOIN shifts ON shifts_projections_staff.shift_id = shifts.id
                      WHERE shifts.shiftable_id = ${id} AND
                      shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
            ),
                'shifts_projections_staff', (SELECT JSON_AGG( JSON_BUILD_OBJECT(
                  'procedure_type_qty',  shifts_projections_staff.procedure_type_qty,
                  'product_qty', shifts_projections_staff.product_yield

                  )
              )
              FROM shifts_projections_staff, shifts
                WHERE shifts.id = shifts_projections_staff.shift_id 
                AND shifts.shiftable_id = ${id} AND
                shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'

                )
            ))
            FROM shifts
            WHERE shifts.shiftable_id = sessions.id
            AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
          )`,
          'shifts'
        )
        .addSelect(['facility.name as donor_center'])
        .addSelect(['sessions.date as session_date'])
        .leftJoin(
          'facility',
          'facility',
          'sessions.donor_center_id = facility.id AND facility.donor_center IS TRUE'
        )
        .where(`sessions.is_archived = false AND sessions.id = ${id}`)
        .getQuery();

      const SampleCount = await this.sessionsRepository.query(queryCount);
      SampleCount['0'].tenant_id = SampleCount['0'].sessions.tenant_id;
      SampleCount.tenant_id = SampleCount['0'].sessions.tenant_id;

      return resSuccess(
        'Shift details fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...SampleCount }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getSessionShiftDonorSchdules(user: any, id: any): Promise<Response> {
    try {
      const findShifts = await this.shiftsRepository.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          is_archived: false,
        },
      });

      if (!findShifts || findShifts.length === 0) {
        resError(
          `Shifts not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shiftsDrawHours = await this.shiftsRepository
        .createQueryBuilder('shift')
        .select([
          'MIN(shift.start_time) AS start_time',
          'MAX(shift.end_time) AS end_time',
          'MAX(shift.tenant_id) AS tenant_id',
        ])
        .where({
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          is_archived: false,
        })
        .groupBy('shift.shiftable_id')
        .getRawOne();

      const shiftsWithSlots = await Promise.all(
        findShifts.map(async (shift) => {
          const shiftSlots = await this.shiftsSlotRepository
            .createQueryBuilder('shiftSlot')
            .leftJoinAndSelect('shiftSlot.procedure_type', 'procedureType')
            .leftJoinAndSelect(
              'shiftSlot.appointments',
              'da',
              'shiftSlot.id = da.slot_id AND shiftSlot.procedure_type_id = da.procedure_type_id'
            )
            .leftJoinAndSelect('da.donor', 'donor')
            .leftJoinAndSelect('shiftSlot.donors', 'd', 'd.id = da.donor_id')
            .where(
              `shiftSlot.shift_id = :shiftId AND shiftSlot.is_archived = false`,
              {
                shiftId: shift.id,
              }
            )
            .orderBy('shiftSlot.start_time')
            .getMany();
          const projections = await this.shiftsProjectionsStaffRespistory.find({
            where: {
              shift_id: shift?.id,
            },
          });
          if (shiftSlots?.length) {
            shiftSlots.forEach((slot: any) => {
              if (projections?.length) {
                const matchingProjection = projections.find(
                  (proj: any) =>
                    proj.shift_id == shift.id &&
                    slot.procedure_type_id == proj.procedure_type_id
                );
                if (matchingProjection) {
                  slot.procedure_type.projections = matchingProjection;
                }
              }
            });
          }
          return shiftSlots;
        })
      );

      const queryCount = await this.sessionsRepository
        .createQueryBuilder('sessions')
        .select(`(JSON_BUILD_OBJECT('id', sessions.id))`, 'sessions')
        .addSelect(['facility.name as donor_center'])
        .addSelect(['sessions.date as session_date'])
        .addSelect(['sessions.tenant_id as tenant_id'])
        .leftJoin(
          'facility',
          'facility',
          'sessions.donor_center_id = facility.id AND facility.donor_center IS TRUE'
        )
        .where(`sessions.is_archived = false AND sessions.id = ${id}`)
        .getQuery();

      const donorCenter = await this.sessionsRepository.query(queryCount);
      const flattenedShiftSlots = shiftsWithSlots.flat();
      const totalSlots = flattenedShiftSlots?.length;

      const filledSlots = flattenedShiftSlots.filter(
        (slots) => slots?.donors?.length > 0
      ).length;

      const data = await this.sessionsRepository
        .createQueryBuilder('sessions')
        .leftJoin(
          'shifts',
          'shifts',
          'shifts.shiftable_id = sessions.id AND shifts.shiftable_type = :type',
          {
            type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          }
        )
        .leftJoin(
          'shifts_projections_staff',
          'shifts_projections_staff',
          'shifts_projections_staff.shift_id = shifts.id'
        )
        .select([
          'shifts_projections_staff.is_donor_portal_enabled AS is_donor_portal_enabled',
          'shifts_projections_staff.procedure_type_qty AS procedure_type_qty',
        ])
        .where(
          'sessions.id = :id AND sessions.is_archived = false AND shifts_projections_staff.shift_id IS NOT NULL',
          { id: id }
        )

        .getRawMany();
      const totalProcedureQty = data.reduce(
        (total, shift) => total + shift.procedure_type_qty,
        0
      );

      return resSuccess(
        'Shifts and Shift Slots retrieved successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {
          shifts: findShifts,
          shift_slots: flattenedShiftSlots,
          total_slots: totalSlots,
          draw_hours: shiftsDrawHours,
          filled_slots: filledSlots,
          total_procedures: totalProcedureQty,
          donor_center: donorCenter,
          tenant_id: findShifts[0].tenant_id,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async addShiftSlot(addShiftSlotDto: AddShiftSlotDTO, user: any) {
    try {
      if (!addShiftSlotDto.slots || addShiftSlotDto.slots.length === 0) {
        resError(
          `Need data to create shift slot.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const slotData: any = [];
      for (const shiftItem of addShiftSlotDto.slots) {
        if (!shiftItem?.procedure_type_id) {
          resError(
            `Procedure Type id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        if (!shiftItem?.shift_id) {
          resError(
            `Shift id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        const saveSlots = new ShiftsSlots();
        saveSlots.shift_id = shiftItem.shift_id;
        saveSlots.procedure_type_id = shiftItem.procedure_type_id;
        saveSlots.created_by = user;
        saveSlots.start_time = shiftItem.start_time;
        saveSlots.end_time = shiftItem.end_time;
        saveSlots.tenant_id = this.request.user?.tenant?.id;
        await this.shiftsSlotRepository.save(saveSlots);
        const { created_by, ...rest } = saveSlots;
        slotData.push({
          ...rest,
          tenant_id: this.request.user?.tenant?.id,
        });
      }

      return resSuccess(
        'Shift Slots created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        slotData
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async createPickups(id: any, user: User, createPickupDto: PickupDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const session = await this.sessionsRepository.findOneBy({
        id,
        is_archived: false,
      });

      if (!session) {
        return resError(
          "Session doesn't exist.",
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const pickup: any = new Pickups();
      pickup.created_by = user;
      pickup.description = createPickupDto?.description;
      pickup.equipment_id = createPickupDto?.equipment_id;
      pickup.pickable_id = id;
      pickup.pickable_type = 'SESSION';
      pickup.start_time = createPickupDto?.start_time;
      const savedPickup: Pickups = await queryRunner.manager.save(pickup);

      await queryRunner.commitTransaction();
      const resTenant = { ...savedPickup, tenant_id: user.tenant_id };
      delete resTenant.created_by;
      return resSuccess(
        'Pickup Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        resTenant
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async sessionPickups(
    id: any,
    getAllPickupsInterface: GetAllPickupsInterface
  ) {
    try {
      const limit: number = getAllPickupsInterface?.limit
        ? +getAllPickupsInterface.limit
        : +process.env.PAGE_SIZE;

      const page = getAllPickupsInterface?.page
        ? +getAllPickupsInterface.page
        : 1;
      const where: any = {
        pickable_id: id,
        pickable_type: 'SESSION',
        is_archived: false,
      };
      const [response, count]: any = await this.pickupRepository.findAndCount({
        where: where,
        take: limit,
        skip: (page - 1) * limit,
        relations: ['created_by', 'equipment_id'],
      });
      response.forEach((item) => {
        item.tenant_id = response?.[0]?.created_by?.tenant_id;
      });
      return {
        status: HttpStatus.OK,
        response: 'Pickups Fetched.',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllEquipments(params: GetEquipmentForDriveInterface): Promise<any> {
    try {
      const queryBuilder = await this.equipmentRespistory
        .createQueryBuilder('equipments')
        .andWhere('equipments.type = :type', {
          type: params.type,
        })
        .andWhere('equipments.is_archived = :is_archived', {
          is_archived: false,
        })
        .andWhere('equipments.is_active = :is_active', {
          is_active: true,
        });

      const sortName = params.sortName;
      const sortBy = sortName && params.sortOrder === 'ASC' ? 'ASC' : 'DESC';
      const sortColumn = `equipments.${sortName || 'created_at'}`;

      if (sortName) queryBuilder.orderBy(sortColumn, sortBy);
      const response = await queryBuilder.getMany();
      return resSuccess(
        'Equipments Fetched Succesfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getSessionAboutData(user: any, id: any) {
    try {
      const findShifts = await this.shiftsRepository.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
        },
      });

      if (!findShifts || findShifts.length === 0) {
        resError(
          `Shifts not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shiftsDrawHours = await this.shiftsRepository
        .createQueryBuilder('shift')
        .select([
          'MIN(shift.start_time) AS start_time',
          'MAX(shift.end_time) AS end_time',
          'MAX(shift.tenant_id) AS tenant_id',
        ])
        .where({
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          is_archived: false,
        })
        .groupBy('shift.shiftable_id')
        .getRawOne();

      const shiftsWithSlots = await Promise.all(
        findShifts.map(async (shift) => {
          const shiftSlots = await this.shiftsSlotRepository
            .createQueryBuilder('shiftSlot')
            .leftJoinAndSelect('shiftSlot.procedure_type', 'procedureType')
            .leftJoinAndSelect(
              'shiftSlot.appointments',
              'da',
              'shiftSlot.id = da.slot_id AND shiftSlot.procedure_type_id = da.procedure_type_id'
            )
            .leftJoinAndSelect('da.donor', 'donor')
            .leftJoinAndSelect('shiftSlot.donors', 'd', 'd.id = da.donor_id')
            .where(
              `shiftSlot.shift_id = :shiftId AND shiftSlot.is_archived = false`,
              {
                shiftId: shift.id,
              }
            )
            .orderBy('shiftSlot.start_time')
            .getMany();

          return shiftSlots;
        })
      );

      const flattenedShiftSlots = shiftsWithSlots.flat();
      const totalSlots = flattenedShiftSlots?.length;

      const filledSlots = flattenedShiftSlots.filter(
        (slots) => slots?.donors?.length > 0
      ).length;

      const data = await this.sessionsRepository
        .createQueryBuilder('sessions')
        .leftJoin(
          'shifts',
          'shifts',
          'shifts.shiftable_id = sessions.id AND shifts.shiftable_type = :type',
          {
            type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          }
        )
        .leftJoin(
          'shifts_projections_staff',
          'shifts_projections_staff',
          'shifts_projections_staff.shift_id = shifts.id'
        )
        .select([
          'shifts_projections_staff.is_donor_portal_enabled AS is_donor_portal_enabled',
          'shifts_projections_staff.procedure_type_qty AS procedure_type_qty',
        ])
        .where(
          'sessions.id = :id AND sessions.is_archived = false AND shifts_projections_staff.shift_id IS NOT NULL',
          { id: id }
        )

        .getRawMany();
      const totalProcedureQty = data.reduce(
        (total, shift) => total + shift.procedure_type_qty,
        0
      );

      return resSuccess(
        'Shifts and Shift Slots retrieved successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {
          shifts: findShifts,
          shift_slots: flattenedShiftSlots,
          total_slots: totalSlots,
          draw_hours: shiftsDrawHours,
          filled_slots: filledSlots,
          total_procedures: totalProcedureQty,
          tenant_id: findShifts[0].tenant_id,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getChangeAudit(
    { id }: { id: any },
    listChangeAuditDto: ListChangeAuditDto
  ) {
    try {
      const { page, sortBy, sortOrder, limit } = listChangeAuditDto;
      const sessionData = await this.sessionsRepository.find({
        where: {
          id,
        },
      });

      if (!sessionData) {
        resError(`Session not found.`, ErrorConstants.Error, HttpStatus.GONE);
      }
      const [data, count] = await this.changeAuditsRepo.findAndCount({
        where: {
          tenant_id: this.request?.user?.tenant?.id,
          changes_field: Not(IsNull()),
          auditable_id: id,
          auditable_type: OperationTypeEnum.SESSIONS as any,
          is_archived: false,
        },
        select: [
          'changes_from',
          'changes_field',
          'changes_to',
          'created_by',
          'changed_when',
          'created_at',
          'tenant_id',
        ],
        take: limit,
        skip: (page - 1) * limit,
        order:
          sortBy && sortOrder
            ? { [sortBy]: sortOrder.toUpperCase(), created_at: 'DESC' }
            : { created_at: 'DESC' },
      });

      return {
        status: HttpStatus.OK,
        message: 'Change Audit Fetched Successfully',
        count,
        data,
      };
    } catch (error) {
      console.log({ error });
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async monitorGeneralChanges(
    sessionBeforeUpdate,
    editSessionDto,
    donorCenter,
    collectionOperation,
    operationStatus,
    oefProducts,
    oefProcedures,
    promotionsExisting,
    newPromotions
  ) {
    const changesOccured = [];

    if (
      moment(sessionBeforeUpdate.date).format('YYYY-MM-DD') !==
      moment(editSessionDto.date).format('YYYY-MM-DD')
    ) {
      changesOccured.push({
        changes_from: new Date(sessionBeforeUpdate.date),
        changes_to: new Date(editSessionDto.date),
        changes_field: `Session Date`,
      });
    }

    if (
      BigInt(sessionBeforeUpdate?.donor_center.id) !== BigInt(donorCenter?.id)
    ) {
      changesOccured.push({
        changes_from: sessionBeforeUpdate.donor_center.name,
        changes_to: donorCenter?.name,
        changes_field: `Session Donor Center`,
      });
    }

    if (
      BigInt(sessionBeforeUpdate?.collection_operation?.id) !==
      BigInt(collectionOperation?.id)
    ) {
      changesOccured.push({
        changes_from: sessionBeforeUpdate.collection_operation.name,
        changes_to: collectionOperation?.name,
        changes_field: `Session Collection Operation`,
      });
    }

    if (
      BigInt(sessionBeforeUpdate?.operation_status?.id) !==
      BigInt(operationStatus?.id)
    ) {
      changesOccured.push({
        changes_from: sessionBeforeUpdate.operation_status.name,
        changes_to: operationStatus?.name,
        changes_field: `Session Status`,
      });
    }

    if (
      !_.isEqual(
        promotionsExisting?.map((pe) => Number(pe?.promotion_id))?.sort(),
        editSessionDto?.promotion_ids.sort()
      )
    ) {
      changesOccured.push({
        changes_from: promotionsExisting
          ?.map((pe) => pe?.promotion?.name)
          .join(', '),
        changes_to: newPromotions?.map((np) => np?.name).join(', '),
        changes_field: `Session Promotion`,
      });
    }
    return changesOccured;
  }
}
