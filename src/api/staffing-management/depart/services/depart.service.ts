import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { OrderByConstants } from 'src/api/system-configuration/constants/order-by.constants';
import { GetAllDepartFilteredInterface } from '../interface/depart.interface';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ExportService } from '../../common/exportData.service';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { CommonFunction } from 'src/api/crm/contacts/common/common-functions';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ScheduleStatusEnum } from '../../build-schedules/entities/schedules.entity';
import moment from 'moment';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';

@Injectable()
export class DepartService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(ContactsRoles)
    private contactsRolesRepository: Repository<ContactsRoles>,
    @InjectRepository(StaffAssignments)
    private staffAssignmentsRepository: Repository<StaffAssignments>,
    @InjectRepository(Shifts)
    private shiftsRepository: Repository<Shifts>,

    private readonly commonFunction: CommonFunction,
    private readonly exportService: ExportService
  ) {}

  /**
   * get all filtered records
   * @param getAllInterface
   * @returns {objects}
   */
  async findAllFiltered(getAllInterface: GetAllDepartFilteredInterface) {
    try {
      let response = await this.fetchDepartData({
        ...getAllInterface,
        is_published: 'false',
      });

      if (getAllInterface?.is_published == 'true') {
        response = response.concat(await this.fetchDepartData(getAllInterface));
      }

      const formattedArray = [];

      response.forEach((item) => {
        if (
          !formattedArray.some(
            (x) =>
              x.operation_id == item.operation_id &&
              x.operation_type == item.operation_type &&
              x.shift_id == item.shift_id
          )
        ) {
          formattedArray.push(item);
        }
      });

      return {
        status: 'success',
        response: '',
        code: HttpStatus.OK,
        records_count: formattedArray.length,
        data: formattedArray,
      };
    } catch (error) {
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchDepartData(getAllInterface: GetAllDepartFilteredInterface) {
    const {
      name = getAllInterface['keyword'],
      limit = getAllInterface.limit,
      page = getAllInterface.page,
      sortBy = 'id',
      sortOrder = OrderByConstants.DESC,
    } = getAllInterface;

    const contactsRolesQuery = this.contactsRolesRepository
      .createQueryBuilder('cr')
      .innerJoinAndSelect(
        getAllInterface?.is_published == 'false'
          ? 'staff_assignments'
          : 'staff_assignments_drafts',
        'sa',
        'sa.role_id = cr.id'
      )
      .innerJoinAndSelect('staff', 's', 'sa.staff_id = s.id')
      .innerJoinAndSelect('shifts', 'sh', 'sa.shift_id = sh.id')
      .select([
        `STRING_AGG(DISTINCT (cr.short_name || ' - ' || s.first_name || ' ' || s.last_name), ', ') AS staff_names_with_roles`,
        `STRING_AGG(DISTINCT (cr.name), ',
        ') as role_name`,
        'sa.operation_id as operation_id',
        'sh.id as role_shift_id',
      ])
      .groupBy('sa.operation_id, sh.id');

    const vehiclesQuery = this.shiftsRepository
      .createQueryBuilder('sh')
      .leftJoinAndSelect(
        'vehicles_assignments',
        'va',
        'va.shift_id = sh.id AND (sh.is_archived = false)'
      )
      .leftJoinAndSelect(
        'vehicles_assignments_drafts',
        'vad',
        'vad.shift_id = sh.id AND (sh.is_archived = false)'
      )
      .innerJoinAndSelect(
        'vehicle',
        'v',
        'va.assigned_vehicle_id = v.id or vad.assigned_vehicle_id = v.id'
      )
      .select([`STRING_AGG(v.name, ', ') AS vehicles`, 'sh.id AS shift_id '])
      .groupBy('sh.id, v.name');

    let staffQuery = this.staffRepository
      .createQueryBuilder('s')
      .innerJoinAndSelect(
        getAllInterface?.is_published == 'false'
          ? 'staff_assignments'
          : 'staff_assignments_drafts',
        'sa',
        `sa.staff_id = s.id`
      )
      .innerJoinAndSelect('shifts', 'sh', `sa.shift_id = sh.id`)
      .innerJoinAndSelect('booking_rules', 'br', `br.tenant_id = sh.tenant_id`)
      .leftJoinAndSelect(
        'shifts_projections_staff',
        'sps',
        `sps.shift_id = sh.id`
      )
      .leftJoinAndSelect(
        'staff_config',
        'sc',
        `sc.staff_setup_id = sps.staff_setup_id`
      )
      .leftJoinAndSelect(
        'sessions',
        'se',
        `se.id = sa.operation_id AND sa.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
      )
      .leftJoinAndSelect('facility', 'f', `f.id = se.donor_center_id`)
      .leftJoinAndSelect(
        'drives',
        'd',
        `d.id = sa.operation_id AND sa.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
      )
      .leftJoinAndSelect('accounts', 'acc', `acc.id = d.account_id`)
      .leftJoinAndSelect(
        'oc_non_collection_events',
        'once',
        `once.id = sa.operation_id AND sa.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
      )
      .innerJoinAndSelect(
        'crm_locations',
        'cl',
        `(cl.id = once.location_id) OR (cl.id = d.location_id)`
      )
      .innerJoinAndSelect(
        'address',
        'ad',
        `(ad.addressable_id = f.id AND ad.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}') OR (ad.addressable_id = cl.id AND ad.addressable_type = '${PolymorphicType.CRM_LOCATIONS}')`
      )
      .leftJoinAndSelect(
        `(${vehiclesQuery.getQuery()})`,
        'v',
        `v.shift_id = sh.id`
      )
      .leftJoinAndSelect(
        `(${contactsRolesQuery.getQuery()})`,
        'cr',
        `cr.operation_id = sa.operation_id and cr.role_shift_id = sh.id`
      )
      .select([
        'sa.operation_id as id',
        'sh.id as shift_id',
        `COALESCE(f.name, acc.name, once.event_name) AS account_name`,
        `COALESCE(d.id, se.id, once.id) AS operation_id`,
        `sa.operation_type as operation_type`,
        `cl.name AS location_name`,
        `(ad.city ||', ' || ad.state) AS location_address`,
        `sps.procedure_type_qty AS sum_of_procedure_shifts`,
        `sps.product_yield AS sum_of_product_shifts`,
        `TO_CHAR(COALESCE(se.date, d.date, once.date), 'MM-DD-YYYY') AS date`,
        `sh.start_time AS shift_start_time`,
        `sh.end_time AS shift_end_time`,
        `STRING_AGG(DISTINCT v.vehicles, ', ') AS vehicles`,
        `TO_CHAR(sh.start_time  + (sa.lead_time ||' minutes')::interval, 'HH12:MI AM') AS depart_time`,
        `TO_CHAR(sh.end_time + (sa.breakdown_time ||' minutes')::interval, 'HH12:MI AM') AS return_time`,
        `sc.qty AS staff_requested`,
        `(SELECT count(id) FROM staff_assignments sat WHERE sat.shift_id = sh.id ) + (SELECT count(id) FROM staff_assignments_drafts sats WHERE sats.shift_id = sh.id ) AS staff_assigned`,
        `CASE
            WHEN br.oef_block_on_product = true THEN sh.oef_products
            ELSE sh.oef_procedures
           END AS oef `,
        `cr.staff_names_with_roles AS staff_names_with_roles`,
        `cr.role_name AS staff_with_roles`,
        `TO_CHAR(sa.created_at, 'MM-DD-YYYY') AS created_at`,
        `sa.created_by AS created_by`,
        's.tenant_id AS tenant_id',
      ])
      .where(`s.tenant_id = :tenant_id`, {
        tenant_id: getAllInterface['tenant_id'],
      })
      .groupBy(
        'cr.staff_names_with_roles, cr.role_name, s.tenant_id, sa.operation_id, sh.id, f.name, acc.name, once.event_name, d.id, se.id, once.id, sa.operation_type, cl.name, sps.procedure_type_qty, sps.product_yield, se.date, d.date, once.date, sh.start_time, sh.end_time, sa.lead_time, sa.breakdown_time, sc.qty, br.oef_block_on_product, sh.oef_products, sh.oef_procedures, sa.created_at, sa.created_by, ad.city, ad.state'
      );

    if (getAllInterface?.is_published == 'true') {
      staffQuery.andWhere(`sa.is_notify = false`);
    }

    // const exportData;
    if (name) {
      staffQuery = staffQuery.andWhere(
        `COALESCE(se.account_name, d.account_name, once.account_name) ILIKE :name`,
        {
          name: `%${name}%`,
        }
      );
    }
    if (getAllInterface?.staff_id)
      staffQuery = staffQuery.andWhere(`sa.staff_id = :staff_id`, {
        staff_id: getAllInterface.staff_id,
      });
    if (getAllInterface?.team_id)
      staffQuery = staffQuery
        .innerJoin('team_staff', 'ts', 'ts.staff_id = sa.staff_id')
        .andWhere(`ts.team_id = :team_id`, {
          team_id: getAllInterface.team_id,
        });
    if (getAllInterface?.donor_id)
      staffQuery = staffQuery
        .innerJoin(
          'staff_donor_centers_mapping',
          'sdcm',
          'sdcm.staff_id = sa.staff_id'
        )
        .andWhere(`sdcm.id = :donor_id`, {
          donor_id: getAllInterface.donor_id,
        });
    if (getAllInterface?.collection_operation_id)
      staffQuery = staffQuery.andWhere(
        `s.collection_operation_id = :collection_operation_id`,
        {
          collection_operation_id: getAllInterface.collection_operation_id,
        }
      );
    if (getAllInterface?.shift_id)
      staffQuery = staffQuery.andWhere(`sh.id = :shift_id`, {
        shift_id: getAllInterface.shift_id,
      });
    if (getAllInterface?.schedule_start_date) {
      const { startDate, endDate } = this.getWeekStartEndDates(
        getAllInterface?.schedule_start_date
      );
      staffQuery = staffQuery.andWhere(
        `COALESCE(se.date, d.date, once.date) BETWEEN Date('${startDate}') AND Date('${endDate}')`
      );
    } else if (
      getAllInterface?.operation_id &&
      getAllInterface?.operation_type
    ) {
      staffQuery = staffQuery.andWhere(
        `sa.operation_id = ${getAllInterface?.operation_id} AND sa.operation_type = '${getAllInterface.operation_type}'`
      );
    } else if (getAllInterface?.export_all_data == 'false') {
      const { startDate, endDate } = this.getWeekStartEndDates(
        new Date(),
        false
      );
      staffQuery = staffQuery.andWhere(
        `COALESCE(se.date, d.date, once.date) BETWEEN Date('${startDate}') AND Date('${endDate}')`
      );
    }
    if (getAllInterface?.schedule_status_id) {
      const enumValue =
        Object.values(ScheduleStatusEnum)[getAllInterface?.schedule_status_id];
      staffQuery = staffQuery
        .innerJoin(
          'schedule',
          'sche',
          'sche.collection_operation_id = s.collection_operation_id'
        )
        .andWhere(`sche.schedule_status = '${enumValue}'`);
    }

    if (sortBy && sortOrder)
      staffQuery = staffQuery.orderBy({
        [sortBy]: sortOrder === 'DESC' ? 'DESC' : 'ASC',
      });

    const exportData = await staffQuery.getRawMany();

    if (page && limit) {
      const { skip, take } = this.commonFunction.pagination(limit, page);
      staffQuery = staffQuery.limit(take).offset(skip);
    }

    const records = await staffQuery.getRawMany();

    //Do we need this or can it be removed?
    let url;
    if (getAllInterface?.exportType && getAllInterface.downloadType) {
      const prefixName = getAllInterface?.selectedOptions
        ? getAllInterface?.selectedOptions.trim()
        : 'Depart';
      url = await this.exportService.exportDataToS3(
        exportData,
        getAllInterface,
        prefixName,
        'Depart'
      );
    }

    return records;
  }

  getWeekStartEndDates(date, withFilter = true) {
    if (date) {
      date = new Date(date);

      const today = date.getDay();
      const dayInMonth = date.getDate();

      const daysUntilSunday = today === 0 ? 0 : 7 - today;

      const sundayDate = new Date(date);
      sundayDate.setDate(dayInMonth + daysUntilSunday);

      if (!withFilter) {
        date.setDate(dayInMonth - (today === 0 ? 6 : today - 1));
      }

      // Format the dates as YYYY-MM-DD
      const startDate = date.toISOString().split('T')[0];
      const endDate = sundayDate.toISOString().split('T')[0];

      return { startDate, endDate };
    } else return;
  }
}
