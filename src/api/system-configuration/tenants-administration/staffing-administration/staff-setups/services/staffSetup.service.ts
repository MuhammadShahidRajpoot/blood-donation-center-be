import {
  Injectable,
  HttpStatus,
  NotFoundException,
  Inject,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, In, Not } from 'typeorm';
import * as dotenv from 'dotenv';
/* StaffSetup */
import {
  CreateStaffSetupDto,
  UpdateStaffSetupDto,
} from '../dto/create-staffSetup.dto';
import {
  CreateStaffConfigDto,
  UpdateStaffConfigDto,
} from '../dto/create-staffConfig.dto';
import { StaffSetup } from '../entity/staffSetup.entity';
import { StaffSetupHistory } from '../entity/staffSetupHistory.entity';
import { StaffConfig } from '../entity/StaffConfig.entity';
import { StaffConfigHistory } from '../entity/StaffConfigHistory.entity';
import {
  GetStaffSetupsBluePrintParamsInterface,
  GetStaffSetupsByIdsInterface,
  GetStaffSetupsDriveParamsInterface,
  GetStaffSetupsParamsInterface,
  GetStaffSetupsSessionsInterface,
  GetStaffSetupsUtilizationDriveInterface,
  GetStaffSetupsUtilizationSessionInterface,
} from '../interface/StaffSetupsParams';
/* others */
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { User } from '../../../user-administration/user/entity/user.entity';
import { ProcedureTypes } from '../../../organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { HistoryService } from 'src/api/common/services/history.service';
import { getModifiedDataDetails } from '../../../../../../common/utils/modified_by_detail';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { ContactsRoles } from '../../../crm-administration/contacts/role/entities/contacts-role.entity';
import { DailyCapacity } from '../../../operations-administration/booking-drives/daily-capacity/entities/daily-capacity.entity';
import moment from 'moment';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { min } from 'lodash';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

dotenv.config();
@Injectable({ scope: Scope.REQUEST })
export class StaffSetupService extends HistoryService<StaffSetupHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    /* staff-setup */
    @InjectRepository(StaffSetup)
    private readonly staffSetupRepository: Repository<StaffSetup>,
    @InjectRepository(StaffSetupHistory)
    private readonly staffSetupHistoryRepository: Repository<StaffSetupHistory>,
    @InjectRepository(StaffConfig)
    private readonly staffConfigRepository: Repository<StaffConfig>,
    @InjectRepository(StaffConfigHistory)
    private readonly staffConfigHistoryRepository: Repository<StaffConfigHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ContactsRoles)
    private readonly contactRoleRepository: Repository<ContactsRoles>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureRepository: Repository<ProcedureTypes>,
    @InjectRepository(DailyCapacity)
    private readonly dailyCapacityRepo: Repository<DailyCapacity>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    @InjectRepository(Shifts)
    private readonly shiftsRepo: Repository<Shifts>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionStaffRepo: Repository<ShiftsProjectionsStaff>,
    private readonly entityManager: EntityManager
  ) {
    super(staffSetupHistoryRepository);
  }
  /* create-staff-config */
  async createStaffConfig(
    createStaffConfigDto: CreateStaffConfigDto[],
    id: any
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const staffConfig = [];
      for (const config in createStaffConfigDto) {
        const temp_config = new StaffConfig();
        const configData = createStaffConfigDto[config] as CreateStaffConfigDto;
        temp_config.qty = configData?.qty;
        temp_config.lead_time = configData?.lead_time;
        temp_config.setup_time = configData?.setup_time;
        temp_config.breakdown_time = configData?.breakdown_time;
        temp_config.wrapup_time = configData?.wrapup_time;
        temp_config.contact_role_id = configData?.role_id;
        temp_config.staff_setup_id = id;
        temp_config.tenant_id = this.request.user?.tenant?.id;
        staffConfig.push(temp_config);
      }
      if (staffConfig?.length > 0) {
        const response = await this.staffConfigRepository.save(staffConfig);
        return { response };
      } else {
        await queryRunner.rollbackTransaction();
        return resError(
          'Could not add staff configuration',
          ErrorConstants.Error,
          400
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
  /* create staff-setup */
  async create(createStaffSetupDto: CreateStaffSetupDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      /* user */
      const user = await this.userRepository.findOneBy({
        id: createStaffSetupDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      /* procedure */
      const procedure = await this.procedureRepository.findOneBy({
        id: createStaffSetupDto?.staff?.procedure_type_id,
      });
      if (!procedure) {
        return resError(
          `Procedure Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      /* roles */
      const roleIds = createStaffSetupDto?.staff_configuration?.map(
        (item) => item?.role_id
      );
      const role = await this.contactRoleRepository.findBy({
        id: In(roleIds),
      });
      if (role?.length < 1) {
        return resError(
          `Some Contact Roles not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      /* create staff setup */
      const staffSetup: any = new StaffSetup();
      staffSetup.is_active = createStaffSetupDto?.is_active;
      staffSetup.created_by = createStaffSetupDto?.created_by;
      staffSetup.name = createStaffSetupDto?.staff?.name;
      staffSetup.short_name = createStaffSetupDto?.staff?.short_name;
      staffSetup.beds = createStaffSetupDto?.staff?.beds;
      staffSetup.concurrent_beds = createStaffSetupDto?.staff?.concurrent_beds;
      staffSetup.stagger_slots = createStaffSetupDto?.staff?.stagger_slots;
      staffSetup.procedure_type_id =
        createStaffSetupDto?.staff?.procedure_type_id;
      staffSetup.opeartion_type_id =
        createStaffSetupDto?.staff?.opeartion_type_id;
      staffSetup.location_type_id =
        createStaffSetupDto?.staff?.location_type_id;
      staffSetup.tenant_id = this.request.user?.tenant?.id;

      const response = await this.staffSetupRepository.save(staffSetup);
      const resp = await this.createStaffConfig(
        createStaffSetupDto?.staff_configuration,
        response?.id
      );
      const modifyResp = {
        id: response?.id,
        staff: {
          name: response?.name,
          short_name: response?.short_name,
          beds: response?.beds,
          concurrent_beds: response?.concurrent_beds,
          stagger_slots: response?.stagger_slots,
          procedure_type_id: response?.procedure_type_id,
          opeartion_type_id: response?.opeartion_type_id,
          location_type_id: response?.location_type_id,
          tenant_id: this.request.user?.tenant?.id,
        },
        staff_configuration: resp?.response,
        status: response?.is_active,
        is_archived: response?.is_archived,
        created_by: response?.created_by,
        created_at: response?.created_at,
        tenant_id: this.request.user?.tenant?.id,
      };

      return resSuccess(
        'Staff Setup Created Successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        modifyResp
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return { error };
    } finally {
      await queryRunner.release();
    }
  }
  /* get all staff setups */
  async getAllStaffetups(queryParams: GetStaffSetupsParamsInterface) {
    try {
      const limit = Number(queryParams?.limit);
      const page = Number(queryParams?.page);
      const name = queryParams?.name;
      const getTotalPage = (totalData: number, limit: number) => {
        return Math.ceil(totalData / limit);
      };
      if (page <= 0) {
        return resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const where: any = {};

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      where.is_archived = false;
      if (name !== undefined) {
        where.name = ILike(`%${name}%`);
      }
      if (queryParams?.status !== undefined) {
        where.is_active = queryParams?.status.toLocaleLowerCase();
      }
      if (queryParams?.operation_type !== undefined) {
        where.opeartion_type_id = queryParams?.operation_type;
      }
      if (queryParams?.location_type !== undefined) {
        where.location_type_id = queryParams?.location_type;
      }
      const sorting: { [key: string]: 'ASC' | 'DESC' } = {};
      if (queryParams?.sortName && queryParams?.sortOrder) {
        if (queryParams?.sortName !== 'procedure_type_id')
          sorting[queryParams?.sortName] =
            queryParams?.sortOrder.toUpperCase() as 'ASC' | 'DESC';
      } else {
        sorting['id'] = 'DESC';
      }
      const [records, count] = await this.staffSetupRepository.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        relations: ['procedure_type_id', 'created_by', 'tenant'],
        order: sorting,
      });
      if (queryParams?.sortName === 'procedure_type_id') {
        records.sort((a, b) => {
          const nameA = a.procedure_type_id.name.toUpperCase();
          const nameB = b.procedure_type_id.name.toUpperCase();

          let comparison = 0;

          if (nameA < nameB) {
            comparison = -1;
          } else if (nameA > nameB) {
            comparison = 1;
          }

          return queryParams?.sortOrder === 'ASC' ? comparison : -comparison; // Reverse the comparison for DESC
        });
      }
      return {
        total_records: count,
        page_number: page,
        totalPage: getTotalPage(count, limit),
        data: records,
      };
    } catch (error) {
      return [];
    }
  }

  /* get all staff setups for drives */
  async getAllStaffSetupForDrive(
    queryParams: GetStaffSetupsDriveParamsInterface,
    req
  ) {
    try {
      const minStaff = +queryParams?.minStaff;
      if (
        queryParams?.operation_type &&
        queryParams?.location_type &&
        queryParams?.procedure_type_id &&
        queryParams?.collectionOperation &&
        queryParams?.drive_date
      ) {
        const driveDate = moment(queryParams.drive_date);
        // console.log({ driveDate });
        const daily_capacities = await this.dailyCapacityRepo
          .createQueryBuilder('daily_capacity')
          .innerJoinAndSelect(
            'daily_capacity.collection_operation',
            'business_units'
          )
          .where('business_units.id = :businessUnitId', {
            businessUnitId: queryParams.collectionOperation,
          })
          .andWhere('daily_capacity.is_archived = false')
          .andWhere(
            `
            (('${driveDate.format(
              'YYYY-MM-DD'
            )}' Between daily_capacity.effective_date AND daily_capacity.end_date)
            OR (daily_capacity.effective_date <= '${driveDate.format(
              'YYYY-MM-DD'
            )}' AND daily_capacity.end_date is null)
            )
          `
          )
          .getOne();
        // console.log({ daily_capacities });

        if (!daily_capacities) {
          return resError(
            `Daily Capacity not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }
        const dayName = driveDate.format('dddd');
        const abbreviations = {
          Sunday: 'sun',
          Monday: 'mon',
          Tuesday: 'tue',
          Wednesday: 'wed',
          Thursday: 'thur',
          Friday: 'fri',
          Saturday: 'sat',
        };
        const driveDay = abbreviations[dayName];
        const maxDrives = daily_capacities[`${driveDay}_max_drives`];
        const maxStaff = daily_capacities[`${driveDay}_max_staff`];

        const drivesOnDriveDate = await this.drivesRepository.find({
          select: ['id', 'tenant_id'],
          relations: ['account'],
          where: {
            date: new Date(moment(driveDate).format('YYYY-MM-DD')),
            tenant_id: this.request.user?.tenant?.id,
            account: {
              collection_operation: {
                id: queryParams.collectionOperation,
                is_archived: false,
                is_active: true,
                tenant_id: this.request.user?.tenant?.id,
              },
              is_archived: false,
              is_active: true,
              tenant_id: this.request.user?.tenant?.id,
            },
          },
        });

        const driveIds = drivesOnDriveDate?.map((item) => item.id);
        // console.log({ driveIds });
        const driveStaffSetupDetails: any = await this.shiftsRepo.find({
          where: {
            shiftable_id: In(driveIds),
            shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
            is_archived: false,
            tenant_id: req.user.tenant.id,
          },
          relations: [
            'staff_setups',
            'staff_setups.staff_setup_id',
            'staff_setups.staff_setup_id.staff_configuration',
            'staff_setups.staff_setup_id.staff_configuration.contact_role_id',
          ],
        });

        let utilizedStaff = 0;
        for (const drive of driveStaffSetupDetails) {
          const driveStaffSetups = drive.staff_setups;
          for (const staffSetupItem of driveStaffSetups) {
            for (const staffConfig of staffSetupItem.staff_setup_id
              .staff_configuration) {
              const qty = staffConfig.qty;
              const oef = staffConfig.contact_role_id.oef_contribution;
              utilizedStaff += (parseInt(qty) * parseFloat(oef)) / 100;
            }
          }
        }
        let availableStaff = 0;
        if (utilizedStaff < maxStaff) {
          availableStaff = maxStaff - utilizedStaff;
        }
        console.log({ driveDay, maxDrives, maxStaff });

        console.log({
          availableStaff,
          utilizedStaff,
          reqMinStaff: minStaff,
        });
        let queryAdditionalStaffSetups;
        console.log(`Override user : ${this?.request?.user?.override}`);

        if (availableStaff >= minStaff) {
          const query = `
            SELECT
              staff_setup.*,
              SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) AS sumStaffQty
            FROM
              staff_setup
            LEFT JOIN
              staff_config ON staff_setup.id = staff_config.staff_setup_id
            LEFT JOIN
              contacts_roles ON staff_config.contact_role_id = contacts_roles.id
            WHERE staff_setup.opeartion_type_id = '${
              queryParams?.operation_type
            }' 
            AND staff_setup.procedure_type_id = ${
              queryParams?.procedure_type_id
            }
            AND staff_setup.location_type_id = '${
              queryParams?.location_type == 'Inside / Outside'
                ? 'COMBINATION'
                : queryParams?.location_type?.toUpperCase()
            }'
            AND staff_setup.tenant_id = ${this.request.user?.tenant?.id}
            AND staff_setup.is_active = ${true}
            AND staff_setup.is_archived = ${false}
            GROUP BY
              staff_setup.id
            HAVING
              SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) > 0 AND
              SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) BETWEEN ${minStaff} AND ${
            queryParams.maxStaff
          }
          `;

          const result = await this.entityManager.query(query);
          const allowedIds = result?.map((item) => item.id);

          if (allowedIds.length) {
            queryAdditionalStaffSetups = `
            SELECT
              staff_setup.*,
              SUM(contacts_roles.oef_contribution * staff_config.qty / 100) AS sumStaffQty
            FROM
              staff_setup
            LEFT JOIN
              staff_config ON staff_setup.id = staff_config.staff_setup_id
            LEFT JOIN
              contacts_roles ON staff_config.contact_role_id = contacts_roles.id
            WHERE staff_setup.opeartion_type_id = '${
              queryParams?.operation_type
            }' 
            AND staff_setup.location_type_id = '${queryParams?.location_type?.toUpperCase()}'
            AND staff_setup.procedure_type_id = ${
              queryParams?.procedure_type_id
            }
            AND staff_setup.tenant_id = ${this.request.user?.tenant?.id}
            AND staff_setup.is_active = ${true}
            AND staff_setup.is_archived = ${false}
            AND staff_setup.id Not In (${allowedIds.join(',')})
            GROUP BY
            staff_setup.id
          `;
          } else {
            queryAdditionalStaffSetups = `
              SELECT
                staff_setup.*,
                SUM(contacts_roles.oef_contribution * staff_config.qty / 100) AS sumStaffQty
              FROM
                staff_setup
              LEFT JOIN
                staff_config ON staff_setup.id = staff_config.staff_setup_id
              LEFT JOIN
                contacts_roles ON staff_config.contact_role_id = contacts_roles.id
              WHERE staff_setup.opeartion_type_id = '${
                queryParams?.operation_type
              }' 
              AND staff_setup.location_type_id = '${queryParams?.location_type?.toUpperCase()}'
              AND staff_setup.procedure_type_id = ${
                queryParams?.procedure_type_id
              }
              AND staff_setup.tenant_id = ${this.request.user?.tenant?.id}
              AND staff_setup.is_active = ${true}
              AND staff_setup.is_archived = ${false}
              GROUP BY
              staff_setup.id
            `;
          }

          let additionalStaffSetups = [];
          if (this?.request?.user?.override) {
            additionalStaffSetups = await this.entityManager.query(
              queryAdditionalStaffSetups
            );
          }
          return {
            data: result,
            additionalStaffSetups,
          };
        } else {
          queryAdditionalStaffSetups = `
            SELECT
              staff_setup.*,
              SUM(contacts_roles.oef_contribution * staff_config.qty / 100) AS sumStaffQty
            FROM
              staff_setup
            LEFT JOIN
              staff_config ON staff_setup.id = staff_config.staff_setup_id
            LEFT JOIN
              contacts_roles ON staff_config.contact_role_id = contacts_roles.id
            WHERE staff_setup.opeartion_type_id = '${
              queryParams?.operation_type
            }' 
            AND staff_setup.location_type_id = '${queryParams?.location_type?.toUpperCase()}'
            AND staff_setup.procedure_type_id = ${
              queryParams?.procedure_type_id
            }
            AND staff_setup.tenant_id = ${this.request.user?.tenant?.id}
            AND staff_setup.is_active = ${true}
            AND staff_setup.is_archived = ${false}
            GROUP BY
            staff_setup.id
          `;
        }

        let additionalStaffSetups = [];
        if (this?.request?.user?.override) {
          additionalStaffSetups = await this.entityManager.query(
            queryAdditionalStaffSetups
          );
        }
        return {
          data: [],
          additionalStaffSetups,
        };
      }
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getUtilizedStaffSetupForDrive(
    queryParams: GetStaffSetupsUtilizationDriveInterface
  ) {
    try {
      const driveDate = moment(queryParams.drive_date);
      const drivesOnDriveDate = await this.drivesRepository.find({
        select: ['id', 'tenant_id'],
        relations: ['account'],
        where: {
          tenant_id: this.request.user?.tenant?.id,
          date: new Date(moment(driveDate).format('YYYY-MM-DD')),
          account: {
            collection_operation: {
              id: queryParams.collectionOperation,
              tenant_id: this.request.user?.tenant?.id,
              is_archived: false,
              is_active: true,
            },
          },
        },
      });

      const driveIds = drivesOnDriveDate?.map((item) => item.id);
      // console.log({ driveIds });
      const driveStaffSetupDetails: any = await this.shiftsRepo.find({
        where: {
          shiftable_id: In(driveIds),
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          is_archived: false,
          tenant_id: this.request.user?.tenant?.id,
        },
        relations: [
          'staff_setups',
          'staff_setups.staff_setup_id',
          'staff_setups.staff_setup_id.staff_configuration',
          'staff_setups.staff_setup_id.staff_configuration.contact_role_id',
        ],
      });

      let utilizedStaff = 0;
      for (const drive of driveStaffSetupDetails) {
        const driveStaffSetups = drive.staff_setups;
        for (const staffSetupItem of driveStaffSetups) {
          for (const staffConfig of staffSetupItem.staff_setup_id
            .staff_configuration) {
            const qty = staffConfig.qty;
            const oef = staffConfig.contact_role_id.oef_contribution;
            utilizedStaff += (parseInt(qty) * parseFloat(oef)) / 100;
          }
        }
      }
      return resSuccess(
        'Staff Setup Utilization fetched Successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          count: utilizedStaff,
          tenant_id: this.request.user.tenant.id,
        }
      );
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  /* get all staff setups for blue print donor center */
  async getAllStaffSetupForDonorCenterBluePrint(
    queryParams: GetStaffSetupsBluePrintParamsInterface
  ) {
    try {
      if (queryParams?.operation_type && queryParams?.procedure_type_id) {
        const query = `
        SELECT
          staff_setup.*,
          SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) AS sumStaffQty
        FROM
          staff_setup
        LEFT JOIN
          staff_config ON staff_setup.id = staff_config.staff_setup_id
        LEFT JOIN
          contacts_roles ON staff_config.contact_role_id = contacts_roles.id
        WHERE staff_setup.opeartion_type_id = '${queryParams?.operation_type}' 
        AND staff_setup.procedure_type_id = ${queryParams?.procedure_type_id}
        AND staff_setup.tenant_id = ${this.request.user?.tenant?.id}
        AND staff_setup.is_active = ${true}
        AND staff_setup.is_archived = ${false}
        GROUP BY
          staff_setup.id
        HAVING
          SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) > 0 AND
          SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) BETWEEN ${
            queryParams.minStaff
          } AND ${queryParams.maxStaff}
      `;

        const result = await this.entityManager.query(query);
        return {
          data: result,
        };
      } else {
        return {
          data: [],
          additionalStaffSetups: [],
        };
      }
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getUtilizedStaff(
    shiftable_ids: bigint[],
    shiftable_type: PolymorphicType
  ): Promise<number> {
    const shifts = await this.shiftsRepo.find({
      where: {
        shiftable_id: In(shiftable_ids),
        shiftable_type: shiftable_type,
        is_archived: false,
      },
      select: ['id', 'tenant_id'],
    });
    const shiftIds = shifts?.map((shift) => shift.id);

    const projections = await this.shiftsProjectionStaffRepo.find({
      where: {
        shift_id: In(shiftIds),
        is_archived: false,
        staff_setup: {
          is_archived: false,
        },
      },
      relations: {
        staff_setup: {
          staff_configuration: {
            contact_role_id: true,
          },
        },
      },
    });
    const staffSetups = projections.map((projection) => projection.staff_setup);

    let utilizedStaff = 0;
    for (const staffSetup of staffSetups) {
      for (const staffConfig of staffSetup.staff_configuration) {
        const qty = staffConfig.qty;
        const oef = staffConfig?.['contact_role_id']?.['oef_contribution'];
        utilizedStaff += (qty * parseFloat(oef)) / 100;
      }
    }

    return utilizedStaff;
  }

  /* get all staff setups for sessions */
  async getAllStaffSetupForSessions(params: GetStaffSetupsSessionsInterface) {
    try {
      const {
        operation_type,
        procedure_type_id,
        collection_operation_id,
        sessions_date,
        min_staff,
        max_staff,
        sessions_id,
      } = params;

      const daily_capacities = await this.dailyCapacityRepo.findOne({
        where: {
          collection_operation: {
            id: collection_operation_id,
            is_archived: false,
          },
          is_archived: false,
        },
        relations: ['collection_operation'],
      });

      if (!daily_capacities) {
        return resError(
          `Daily Capacity not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const sessionDate = moment(new Date(sessions_date));
      sessionDate.hours(0);
      sessionDate.minute(0);
      sessionDate.millisecond(0);
      const dayName = sessionDate.format('dddd');

      const abbreviations = {
        Sunday: 'sun',
        Monday: 'mon',
        Tuesday: 'tue',
        Wednesday: 'wed',
        Thursday: 'thur',
        Friday: 'fri',
        Saturday: 'sat',
      };
      const sessionsDay = abbreviations[dayName];
      const maxDailyCapcityStaff = daily_capacities[`${sessionsDay}_max_staff`];

      const sessions = await this.sessionsRepository.find({
        select: ['id', 'tenant_id'],
        where: {
          ...(sessions_id && { id: Not(<any>sessions_id) }),
          date: new Date(sessionDate.format('YYYY-MM-DD')),
          collection_operation_id: <any>collection_operation_id,
          is_archived: false,
        },
      });
      const sessionIds = sessions?.map((item) => item.id);
      const utilizedStaff = await this.getUtilizedStaff(
        sessionIds,
        PolymorphicType.OC_OPERATIONS_SESSIONS
      );

      const availableStaff =
        utilizedStaff < maxDailyCapcityStaff
          ? maxDailyCapcityStaff - utilizedStaff
          : 0;

      if (availableStaff >= min_staff) {
        const query = this.staffSetupRepository
          .createQueryBuilder('staff_setup')
          .leftJoinAndSelect(
            'staff_config',
            'staff_config',
            'staff_setup.id = staff_config.staff_setup_id'
          )
          .leftJoinAndSelect(
            'contacts_roles',
            'contacts_roles',
            'staff_config.contact_role_id = contacts_roles.id'
          )
          .select([
            'staff_setup.*',
            'SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) AS sum_staff_qty',
          ])
          .where('staff_setup.opeartion_type_id = :operation_type', {
            operation_type,
          })
          .andWhere('staff_setup.procedure_type_id = :procedure_type_id', {
            procedure_type_id,
          })
          .andWhere('staff_setup.tenant_id = :tenant_id', {
            tenant_id: this.request.user?.tenant?.id,
          })
          .andWhere('staff_setup.is_active = :is_active', {
            is_active: true,
          })
          .andWhere('staff_setup.is_archived = :is_archived', {
            is_archived: false,
          })
          .having(
            `SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) > 0`
          )
          .groupBy('staff_setup.id');

        const additionalQuery = query.clone();

        const result = await query
          .andHaving(
            `SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) <= ${availableStaff}
            AND SUM((contacts_roles.oef_contribution * staff_config.qty) / 100) BETWEEN ${min_staff} AND ${max_staff}`
          )
          .getRawMany();

        const allowedIds = result?.map((item) => item.id);
        let additionalRecords = [];
        if (this?.request?.user?.override) {
          if (allowedIds.length)
            additionalQuery.andWhere(
              `staff_setup.id Not In (${allowedIds.join(',')})`,
              {
                allowedIds,
              }
            );
          additionalRecords = await additionalQuery.getRawMany();
        }

        return resSuccess(
          "Staff's setups found successfully",
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          {
            records: result,
            additionalRecords,
            tenant_id: this.request.user?.tenant?.id,
          }
        );
      } else {
        return resSuccess(
          availableStaff <= 0
            ? "Staff's capacity is full"
            : "Staff's capacity not found in this oef range",
          SuccessConstants.SUCCESS,
          HttpStatus.NOT_FOUND,
          {
            records: [],
            additionalRecords: [],
            tenant_id: this.request.user?.tenant?.id,
          }
        );
      }
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /* get utilized staff setups for sessions */
  async getUtilizedStaffSetupForSessions(
    params: GetStaffSetupsUtilizationSessionInterface
  ) {
    const { sessions_date, collection_operation_id, sessions_id } = params;
    try {
      const sessionDate = moment(new Date(sessions_date));
      sessionDate.hours(0);
      sessionDate.minute(0);
      sessionDate.millisecond(0);

      const sessions = await this.sessionsRepository.find({
        select: ['id', 'tenant_id'],
        where: {
          ...(sessions_id && { id: Not(<any>sessions_id) }),
          date: new Date(sessionDate.format('YYYY-MM-DD')),
          collection_operation_id: <any>collection_operation_id,
          is_archived: false,
        },
      });
      const sessionIds = sessions?.map((item) => item.id);
      const utilizedStaff = await this.getUtilizedStaff(
        sessionIds,
        PolymorphicType.OC_OPERATIONS_SESSIONS
      );

      return resSuccess(
        'Staff Setup Utilization fetched Successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          count: utilizedStaff,
          tenant_id: this.request.user?.tenant?.id,
        }
      );
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /* get by id */
  async getStaffSetup(id: any) {
    const StaffSetup: any = await this.staffSetupRepository.findOne({
      where: { id, is_archived: false },
      relations: {
        created_by: true,
        procedure_type_id: true,
        staff_configuration: {
          contact_role_id: true,
        },
      },
    });

    if (!StaffSetup) {
      throw new NotFoundException('StaffSetup not found');
    }

    if (StaffSetup) {
      const modifiedData: any = await getModifiedDataDetails(
        this.staffSetupHistoryRepository,
        id,
        this.userRepository
      );
      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      StaffSetup.modified_by = StaffSetup.created_by;
      StaffSetup.modified_at = StaffSetup.created_at;
      StaffSetup.created_at = modified_at ? modified_at : StaffSetup.created_at;
      StaffSetup.created_by = modified_by ? modified_by : StaffSetup.created_by;
    }
    return {
      id: StaffSetup?.id,
      staff: {
        name: StaffSetup?.name,
        short_name: StaffSetup?.short_name,
        beds: StaffSetup?.beds,
        concurrent_beds: StaffSetup?.concurrent_beds,
        stagger_slots: StaffSetup?.stagger_slots,
        opeartion_type_id: StaffSetup?.opeartion_type_id,
        location_type_id: StaffSetup?.location_type_id,
        procedure_type_id: StaffSetup?.procedure_type_id,
        tenant_id: StaffSetup?.tenant_id,
      },
      staff_configuration: StaffSetup?.staff_configuration,
      status: StaffSetup?.is_active,
      is_archived: StaffSetup?.is_archived,
      created_at: StaffSetup?.created_at,
      created_by: StaffSetup?.created_by,
      modified_by: StaffSetup.modified_by,
      modified_at: StaffSetup.modified_at,
    };
  }

  // get many by ids
  async getStaffSetupsById(params: GetStaffSetupsByIdsInterface) {
    const ids = Array.from(params.ids.split(','));
    const parsedIds = ids?.map((item) => parseInt(item));
    const StaffSetup = await this.staffSetupRepository.find({
      where: {
        id: In(parsedIds),
        is_archived: false,
      },
      relations: {
        staff_configuration: {
          contact_role_id: true,
        },
      },
    });

    if (StaffSetup.length !== parsedIds.length) {
      return resError(
        `Some StaffSetups not found`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }

    return resSuccess(
      'Staff setups found successfulyy',
      'success',
      200,
      StaffSetup
    );
  }
  /* archive staff :id */
  async arhiveStaffSetup(id: any, user: any) {
    const staffSetup: any = await this.staffSetupRepository.findOne({
      where: {
        id,
        is_archived: false,
        tenant: {
          id: user.tenant.id,
        },
      },
      relations: ['created_by', 'tenant'],
    });

    if (!staffSetup) {
      throw new NotFoundException('Staff Setup not found');
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const archivedStaffSetup = await this.staffSetupRepository.save({
        ...staffSetup,
        is_archived: true,
        created_at: new Date(),
        created_by: this.request?.user,
      });

      Object.assign(archivedStaffSetup, {
        tenant_id: archivedStaffSetup?.tenant?.id,
      });

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'StaffSetup Archived.',
        status_code: 204,
        data: archivedStaffSetup,
      };
    } catch (error) {
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
  /* update staff config */
  async updateStaffConfig(
    createStaffConfigDto: UpdateStaffConfigDto[],
    staff_id: any
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      const old_data = await this.staffConfigRepository.delete({
        staff_setup_id: staff_id,
      });
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const staffConfig = [];
      let historyConfig = createStaffConfigDto.map((obj) => ({ ...obj }));
      historyConfig = historyConfig.filter((item) => item.id != null);
      for (const config in createStaffConfigDto) {
        const temp_config: any = new StaffConfig();
        const configData = createStaffConfigDto[config] as UpdateStaffConfigDto;
        temp_config.qty = configData?.qty;
        temp_config.lead_time = configData?.lead_time;
        temp_config.setup_time = configData?.setup_time;
        temp_config.breakdown_time = configData?.breakdown_time;
        temp_config.wrapup_time = configData?.wrapup_time;
        temp_config.contact_role_id = configData?.role_id;
        temp_config.tenant_id = this.request.user?.tenant?.id;
        temp_config.staff_setup_id = staff_id;
        temp_config.tenant_id = this.request.user?.tenant?.id;
        temp_config.created_at = new Date();
        temp_config.created_by = this.request?.user;
        if (configData?.id) {
          temp_config.id = configData?.id;
        }
        staffConfig.push(temp_config);
      }
      if (staffConfig?.length > 0) {
        const response = await this.staffConfigRepository.save(staffConfig);
        return { response };
      } else {
        await queryRunner.rollbackTransaction();
        return resError(
          'Could not add staff configuration',
          ErrorConstants.Error,
          400
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
  /* update staff :id */
  async updateStaffFetup(id: any, body: UpdateStaffSetupDto) {
    const staffSetup = await this.staffSetupRepository.findOne({
      where: { id, is_archived: false },
      relations: ['staff_configuration', 'tenant'],
    });

    if (!staffSetup) {
      throw new NotFoundException('Staff Setup not found');
    }
    /* user */
    const user = await this.userRepository.findOneBy({
      id: body?.created_by,
    });
    if (!user) {
      return resError(
        `User not found`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    /* procedure */
    const procedure = await this.procedureRepository.findOneBy({
      id: body?.staff?.procedure_type_id,
    });
    if (!procedure) {
      return resError(
        `Procedure Type not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    /* roles */
    const roleIds = body?.staff_configuration?.map((item) => item?.role_id);
    const role = await this.contactRoleRepository.findBy({
      id: In(roleIds),
    });
    if (role?.length < 1) {
      return resError(
        `Contact Roles not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      /* update staff setup */
      const dataToUpdate = {
        is_active: body?.is_active,
        name: body?.staff?.name,
        short_name: body?.staff?.short_name,
        beds: body?.staff?.beds,
        concurrent_beds: body?.staff?.concurrent_beds,
        stagger_slots: body?.staff?.stagger_slots,
        procedure_type_id: body?.staff?.procedure_type_id,
        opeartion_type_id: body?.staff?.opeartion_type_id,
        location_type_id: body?.staff?.location_type_id,
        created_at: new Date(),
        created_by: this.request?.user,
      };
      await this.staffSetupRepository.update({ id: id }, dataToUpdate as any);

      await this.updateStaffConfig(body.staff_configuration, id);
      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'StaffSetup Updated.',
        status_code: 204,
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
}
