import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonFunction } from 'src/api/crm/contacts/common/common-functions';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { Between, In, Repository } from 'typeorm';
import { FilterStaffSchedulesInterface } from '../staff-schedule/interfaces/filter-staff-schedules';
import { SelectQueryBuilder } from 'typeorm/browser';
import { StaffScheduleInfoDto } from '../staff-schedule/dto/staff-schedules.dto';
import {
  Schedule,
  ScheduleStatusEnum,
} from '../build-schedules/entities/schedules.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { FilterStaffSummaryInterface } from '../staff-schedule/interfaces/filter-staff-summary';
import { StaffScheduleSummaryDto } from '../staff-schedule/dto/staff-schedule-summary.dto';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { StaffConfig } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { StaffClassification } from 'src/api/crm/contacts/staff/staffClassification/entity/staff-classification.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { IndustryCategories } from 'src/api/system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { FilterAvailableStaff } from '../staff-schedule/interfaces/filter-available-staff';
import { StaffAvailabilityDto } from '../staff-schedule/dto/staff-availability.dto';
import { FilterSharedStaff } from '../staff-schedule/interfaces/filter-shared-staff';
import { ResourceSharings } from 'src/api/operations-center/resource-sharing/entities/resource-sharing.entity';
import { SharedStaffDto } from '../staff-schedule/dto/shared-staff.dto';
import { SortOrder } from '../../../common/enums/sort';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { StaffAssignmentsDrafts } from '../build-schedules/entities/staff-assignments-drafts';
import { StatusExclusionsDto } from '../staff-schedule/dto/status-exclusions.dto';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactsRoles } from '../../system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';

@Injectable()
export class StaffSchedulesService {
  private readonly message = 'Staff Schedule';

  constructor(
    private readonly commonFunction: CommonFunction,
    @InjectRepository(StaffAssignments)
    private readonly staffAssignmentsRepository: Repository<StaffAssignments>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    @InjectRepository(NonCollectionEvents)
    private readonly nonCollectionEventsRepository: Repository<NonCollectionEvents>,
    @InjectRepository(ShiftsStaffSetups)
    private readonly shiftStaffSetupsRepository: Repository<ShiftsStaffSetups>,
    @InjectRepository(StaffConfig)
    private readonly staffConfigRepository: Repository<StaffConfig>,
    @InjectRepository(StaffClassification)
    private readonly staffClassificationRepository: Repository<StaffClassification>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRepository: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(IndustryCategories)
    private readonly industryCategoriesRepository: Repository<IndustryCategories>,
    @InjectRepository(ResourceSharings)
    private readonly resourceSharingsRepository: Repository<ResourceSharings>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(StaffAssignmentsDrafts)
    private readonly staffAssignmentsDraftsRepository: Repository<StaffAssignmentsDrafts>,
    @InjectRepository(ContactsRoles)
    private readonly contactsRolesRepository: Repository<ContactsRoles>
  ) {}

  /**
   * Gets the base query used to fetch staff schedule list data
   *
   * The staff_assignments table is at the root of the query, it has relationships through:
   * - staff_id to join with staff table - staff_id, staff_name
   * - role_id to join with contacts_roles table - role_name
   * - shift_id to join with shifts table - shift_start_time, shift_end_time, return_time, depart_time
   *
   * Here we join the three operation type tables(sessions, drives, oc_non_collection_events) using a left join.
   *
   * Now we can COALESCE and return the data based on type of table, there we get the following values:
   *
   * date, account_name, is_on_leave
   *
   * @param page The current page in a pagination list.
   * @param limit The limit of returned data.
   * @param sortName Column name to sort by results.
   * @param sortOrder Order to sort results by.
   * @returns The base query without any filtering added.
   */
  getBaseQuery(
    page: number,
    limit: number,
    sortName: string,
    sortOrder: SortOrder,
    tenantId: any,
    isPublished = 'false'
  ): SelectQueryBuilder<StaffAssignments | StaffAssignmentsDrafts> {
    let query = this.getStaffAssignmentsRepository(isPublished)
      .createQueryBuilder('staff_assignments')
      .innerJoin('staff', 'staff', 'staff_assignments.staff_id = staff.id')
      .innerJoin(
        'contacts_roles',
        'contact_role',
        'staff_assignments.role_id = contact_role.id'
      )
      .innerJoin('shifts', 'shift', 'staff_assignments.shift_id = shift.id')
      .leftJoin(
        'sessions',
        'session',
        `staff_assignments.operation_id = session.id AND staff_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
      )
      .leftJoin(
        'drives',
        'drive',
        `staff_assignments.operation_id = drive.id AND staff_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `staff_assignments.operation_id = oc_non_collection_event.id AND staff_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
      )
      .leftJoin('accounts', 'account', 'drive.account_id = account.id')
      .leftJoin(
        'facility',
        'facility',
        'session.donor_center_id = facility.id AND facility.donor_center IS TRUE'
      )
      .leftJoin(
        'vehicles_assignments',
        'vehicles_assignment',
        'staff_assignments.operation_id = vehicles_assignment.operation_id AND staff_assignments.operation_type = vehicles_assignment.operation_type'
      )
      .leftJoin(
        'vehicle',
        'vehicle',
        'vehicles_assignment.assigned_vehicle_id = vehicle.id'
      )
      .leftJoin(
        'crm_locations',
        'crm_location',
        'crm_location.id IN (drive.location_id, oc_non_collection_event.location_id)'
      )
      .leftJoin(
        'address',
        'address',
        `address.addressable_id IN(crm_location.id, facility.id) AND ((address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}' AND crm_location.id IS NOT NULL) OR (address.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}' AND facility.id IS NOT NULL))`
      )
      .select([
        '(CAST(staff.id as int)) as staff_id',
        '(CAST(staff_assignments.operation_id as int)) as operation_id',
        'staff_assignments.operation_type as operation_type',
        `(staff.first_name || ' ' || staff.last_name) as staff_name`,
        '(contact_role.name) as role_name',
        'CAST(ROUND(staff_assignments.total_hours,2) as float) as total_hours',
        '(shift.start_time) as shift_start_time',
        '(shift.end_time) as shift_end_time',
        `(shift.start_time + (staff_assignments.lead_time || ' MINUTES')::interval) as return_time`,
        `(shift.end_time + (staff_assignments.breakdown_time || ' MINUTES')::interval) as depart_time`,
        'COALESCE(drive.date, session.date, oc_non_collection_event.date) as date',
        'COALESCE(account.name, facility.name, oc_non_collection_event.event_name) as account_name',
        `(address.city || ', ' || address.state) as location_address`,
        '(vehicle.name) as vehicle_name',
        `CASE
          WHEN EXISTS (SELECT 1 FROM staff_leave sl WHERE sl.staff_id = staff.id AND sl.is_archived = false AND (COALESCE(drive.date, session.date, oc_non_collection_event.date) BETWEEN sl.begin_date AND sl.end_date)) THEN TRUE
          ELSE FALSE
          END AS is_on_leave`,
        'staff_assignments.tenant_id as tenant_id',
      ])
      .where('staff_assignments.is_archived = false');

    if (tenantId) {
      query.andWhere(`staff_assignments.tenant_id = ${tenantId}`);
    }

    if (page && limit) {
      const { skip, take } = this.commonFunction.pagination(limit, page);

      query = query.limit(take).offset(skip);
    }
    if (sortName && sortOrder) {
      query.orderBy(sortName, sortOrder);
    }
    return query;
  }

  getStaffAvailabilityBaseQuery(
    filter: FilterAvailableStaff,
    isShared: boolean
  ) {
    let query: any;

    query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoin(
        'staff_assignments',
        'staff_assignments',
        `staff_assignments.staff_id = staff.id`
      )
      .leftJoin(
        'staff_assignments_drafts',
        'staff_assignments_drafts',
        `staff_assignments_drafts.staff_id = staff.id AND staff_assignments_drafts.is_notify=false AND staff_assignments_drafts.is_archived = ${false}`
      )
      .leftJoin(
        'staff_roles_mapping',
        'staff_roles_mapping',
        `staff_roles_mapping.staff_id = staff.id AND staff_roles_mapping.is_archived = ${false}`
      )
      .leftJoin(
        'contacts_roles',
        'contacts_roles',
        `contacts_roles.id = staff_roles_mapping.role_id AND contacts_roles.is_archived = ${false}`
      )
      .leftJoin('staff_leave', 'staff_leave', 'staff.id = staff_leave.staff_id')
      .leftJoin(
        'staff_certification',
        'staff_certification',
        `staff.id = staff_certification.staff_id AND staff_certification.is_archived = ${false}`
      )
      .leftJoin(
        'certification',
        'certification',
        `staff_certification.certificate_id = certification.id AND certification.is_archived = ${false}`
      )
      .leftJoin(
        'staffing_classification_setting',
        'classification_setting',
        `staff.classification_id = classification_setting.classification_id AND classification_setting.is_archived = ${false}`
      )
      .leftJoin(
        'staff_classification',
        'staff_classification',
        `staff.id = staff_classification.staff_id AND staff_classification.is_archived = ${false}`
      )
      .leftJoin(
        'account_preferences',
        'account_preference',
        'staff.id = account_preference.staff_id'
      )
      .leftJoin('team_staff', 'team_staff', 'staff.id = team_staff.staff_id')
      .leftJoin(
        'sessions',
        'session',
        `staff_assignments.operation_id = session.id AND staff_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}' OR staff_assignments_drafts.operation_id = session.id AND staff_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
      )
      .leftJoin(
        'drives',
        'drive',
        `staff_assignments.operation_id = drive.id AND staff_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' OR staff_assignments_drafts.operation_id = drive.id AND staff_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `staff_assignments.operation_id = oc_non_collection_event.id AND staff_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}' OR staff_assignments_drafts.operation_id = oc_non_collection_event.id AND staff_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
      )
      .select([
        'staff_assignments.shift_id as shift_id',
        'staff_assignments_drafts.shift_id as draft_shift_id',

        'staff_assignments.id as staff_assignment_id',
        'staff_assignments_drafts.reason as reason',

        'CAST(staff_assignments.shift_end_time AS TIME) as shift_end_time',
        'CAST(staff_assignments.shift_start_time AS TIME) as shift_start_time',

        'CAST(staff_assignments_drafts.shift_end_time AS TIME) as draft_shift_end_time',
        'CAST(staff_assignments_drafts.shift_start_time AS TIME) as draft_shift_start_time',

        'staff_assignments.split_shift as split_shift',
        'staff_assignments_drafts.split_shift as draft_split_shift',

        'staff_assignments.travel_to_time as travel_to_time',
        'staff_assignments_drafts.travel_to_time as draft_travel_to_time',

        'staff_assignments.travel_from_time as travel_from_time',
        'staff_assignments_drafts.travel_from_time as draft_travel_from_time  ',

        'staff.id as id',
        'staff.collection_operation_id as collection_operation_id',
        `staff.first_name as first_name`,
        `staff.last_name as last_name`,
        `COALESCE(drive.date, session.date, oc_non_collection_event.date) as schedule_dates`,
        `COALESCE(drive.date, session.date, oc_non_collection_event.date) = :operationDate as already_scheduled`,
        `COALESCE(COALESCE(drive.date, session.date, oc_non_collection_event.date) NOT BETWEEN staff_leave.begin_date AND staff_leave.end_date, true) as is_available`,
        `team_staff.team_id as teams`,
        `account_preference.preference as is_preferred`,
        'staff.tenant_id as tenant_id',

        'certification.id as certificate_id',
        'certification.expires as expires',
        `(staff_certification.certificate_start_date + (certification.expiration_interval || ' months')::interval) as expiration_date`,
        `COALESCE(
          CASE WHEN staff_classification IS NOT NULL THEN json_build_object('staff_classification', staff_classification.*) ELSE NULL END,
          json_build_object('staff_classification', classification_setting.*)
        ) as staff_classification`,
      ])
      .where(`staff.is_archived = ${false}`)
      .orderBy('staff.id')
      .setParameter('operationDate', filter.date);
    if (filter?.is_active) {
      query.andWhere(`staff.is_active = ${filter?.is_active}`);
    }

    if (filter?.role_id) {
      query.andWhere(`contacts_roles.id = ${filter?.role_id}`);
    }

    if (filter?.collection_operation_id && !isShared) {
      query.andWhere(
        `staff.collection_operation_id = ${filter.collection_operation_id} `
      );
    }

    if (filter?.tenant_id) {
      query.andWhere(`staff.tenant_id = ${filter?.tenant_id}`);
    }

    if (filter.page && filter.limit) {
      const { skip, take } = this.commonFunction.pagination(
        filter.limit,
        filter.page
      );

      query = query.limit(take).offset(skip);
    }
    return query;
  }

  /**
   * Gets all of the staff schedule data
   *
   * @param page The current page in a pagination list.
   * @param limit The limit of returned data.
   * @param sortName Column name to sort by results.
   * @param sortOrder Order to sort results by.
   * @returns An array of staff schedules.
   */
  async get(
    page: number,
    limit: number,
    sortName: string,
    sortOrder: SortOrder,
    tenantId: any
  ) {
    try {
      //Fetch draft assignments
      let response = await this.getBaseQuery(
        page,
        limit,
        sortName,
        sortOrder,
        tenantId,
        'true'
      ).getRawMany();

      //Fetch published assignments
      response = response.concat(
        await this.getBaseQuery(
          page,
          limit,
          sortName,
          sortOrder,
          tenantId,
          'false'
        ).getRawMany()
      );

      response = this.sort(response, sortName, sortOrder);

      return resSuccess(
        `${this.message} fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  /**
   * Gets all of the filtered staff schedule data
   *
   * @param filter The filter for the staff schedule data.
   * @returns An array of staff schedules.
   */
  async search(filter: FilterStaffSchedulesInterface) {
    try {
      let response = await this.fetchSearchData({
        ...filter,
        is_published: 'false',
      });

      if (filter?.is_published == 'true') {
        response = response.concat(await this.fetchSearchData(filter));

        response = this.sort(response, filter.sortName, filter.sortOrder);
      }

      return resSuccess(
        `${this.message} fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async fetchSearchData(filter: FilterStaffSchedulesInterface) {
    const query = this.getBaseQuery(
      filter?.page,
      filter?.limit,
      filter?.sortName,
      filter?.sortOrder,
      filter?.tenant_id,
      filter?.is_published
    );

    if (filter?.keyword) {
      query.andWhere(
        `(staff.first_name || ' ' || staff.last_name) ILIKE '%${filter.keyword}%'`
      );
      query.orWhere(
        `(address.city || ', ' || address.state) ILIKE '%${filter.keyword}%'`
      );
    }
    if (filter?.staff_id) {
      query.andWhere(`staff.id = ${filter.staff_id}`);
    }

    if (filter?.team_id) {
      query
        .leftJoin('team_staff', 'team_staff', 'staff.id = team_staff.staff_id')
        .andWhere(`team_staff.team_id = ${filter.team_id}`);
    }

    if (filter?.collection_operation_id) {
      query.andWhere(
        `staff.collection_operation_id = ${filter.collection_operation_id} `
      );
    }

    if (filter?.donor_id) {
      query
        .leftJoin(
          'staff_donor_centers_mapping',
          'staff_donor_center',
          'staff.id = staff_donor_center.staff_id'
        )
        .andWhere(`staff_donor_center.donor_center_id = ${filter.donor_id}`);
    }

    if (filter?.schedule_status_id || filter?.schedule_status_id == 0) {
      const enumValue =
        Object.values(ScheduleStatusEnum)[filter?.schedule_status_id];
      query
        .leftJoin(
          'schedule',
          'schedule',
          'staff.collection_operation_id = schedule.collection_operation_id'
        )
        .andWhere(`schedule.schedule_status = '${enumValue}'`);
    }

    if (filter?.schedule_start_date) {
      const { startDate, endDate } = this.getWeekStartEndDates(
        filter?.schedule_start_date
      );
      query.andWhere(
        `COALESCE(drive.date, session.date, oc_non_collection_event.date) BETWEEN Date('${startDate}') AND Date('${endDate}')`
      );
    } else if (filter?.operation_id && filter?.operation_type) {
      query.andWhere(
        `staff_assignments.operation_id = ${BigInt(
          filter.operation_id
        )} AND staff_assignments.operation_type = '${filter.operation_type}'`
      );
    } else {
      const { startDate, endDate } = this.getWeekStartEndDates(
        new Date(),
        false
      );
      query.andWhere(
        `COALESCE(drive.date, session.date, oc_non_collection_event.date) BETWEEN Date('${startDate}') AND Date('${endDate}')`
      );
    }

    if (filter?.is_published == 'true') {
      query.andWhere(`staff_assignments.is_notify = false`);
    }

    return await query.getRawMany<StaffScheduleInfoDto>();
  }

  async getAssignedStaff(shiftsIds, is_published = 'false', tenant_id) {
    return await this.getStaffAssignmentsRepository(is_published)
      .createQueryBuilder('staff_assignments')
      .where({
        is_archived: false,
        shift_id: In(shiftsIds),
        tenant_id: tenant_id,
      })
      .leftJoin('staff', 'staff', 'staff_assignments.staff_id = staff.id')
      .select([
        'staff_assignments.shift_id as shift_id',
        'staff_id as staff_id',
        'total_hours as total_hours',
        'travel_from_time as travel_from_time',
        'travel_to_time as travel_to_time',
      ])
      .getRawMany();
  }

  //todo: refactor the whole method
  async summary(filter: FilterStaffSummaryInterface) {
    try {
      const { operations, shifts } = (await this.getScheduleOperations(
        filter
      )) as {
        shifts: Shifts[];
        operations: any;
      };

      const shiftsIds = shifts.map((x) => x.id);

      const total_operations =
        operations[PolymorphicType.OC_OPERATIONS_DRIVES].length +
        operations[PolymorphicType.OC_OPERATIONS_SESSIONS].length +
        operations[PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS].length;

      //todo refactor these unecessary calls
      const status_exclutions = (await this.getStatusExclusions(filter))
        .record_count;

      let assignedStaff = await this.getAssignedStaff(
        shiftsIds,
        'false',
        filter.tenant_id
      );

      const under_minimum_hours = (await this.getStaffUnderMinimumHours(filter))
        .record_count;

      if (filter.is_published) {
        assignedStaff = assignedStaff.concat(
          await this.getAssignedStaff(shiftsIds, 'true', filter.tenant_id)
        );
      }

      const shiftStaffSetups = await this.shiftStaffSetupsRepository.find({
        where: {
          is_archived: false,
          shift_id: In(shiftsIds),
        },
      });

      const staffSetupIds = shiftStaffSetups.map((x) => x.staff_setup_id);

      const staffConfigs = await this.staffConfigRepository
        .createQueryBuilder('staff_config')
        .where({
          staff_setup_id: In(staffSetupIds),
          tenant_id: filter.tenant_id,
        })
        .leftJoin(
          'shifts_staff_setups',
          'shift_staff_setup',
          'staff_config.staff_setup_id = shift_staff_setup.staff_setup_id'
        )
        .select([
          'staff_config.qty as qty',
          'shift_staff_setup.shift_id as shift_id',
        ])
        .getRawMany();

      //Grouping the aggregate values by shift (shift_id)
      const shiftsSummary = shifts.map((x) => {
        const staffCount =
          assignedStaff.filter((y) => y.shift_id == x.id)?.length ?? 0;
        const staffRequested =
          staffConfigs.find((z) => z.shift_id == x.id)?.qty ?? 0;

        return {
          ...x,
          available_staff: staffCount,
          staff_requested: staffRequested,
        };
      });

      let fully_staffed = 0,
        overstaffed = 0,
        staff_in_overtime = 0,
        average_overtime = 0;

      //todo:refactor this unecessary getOverStaffedDrives call and fix line 554
      overstaffed = (await this.getOverStaffedDrives(filter)).record_count;

      shiftsSummary.forEach((shift) => {
        if (shift.available_staff == shift.staff_requested) fully_staffed++;
        //else if (shift.available_staff > shift.staff_requested) overstaffed++;
      });

      const staffAssignmentStaffIds = assignedStaff.map((x) => x.staff_id);

      const uniqueMap = new Map();
      const staffIds = staffAssignmentStaffIds.filter(
        (obj) => !uniqueMap.has(obj) && uniqueMap.set(obj, true)
      );

      const staffClassifications = await this.staffClassificationRepository
        .createQueryBuilder('staff_classification')
        .where({
          is_archived: false,
          staff_id: In(staffIds),
          tenant_id: filter.tenant_id,
        })
        .getRawMany();

      //Sum total hours for each staff member
      const totalHoursByStaff = new Map();
      const totalHoursByShift = new Map();
      const totalHoursByStaffIncludingTravelTime = new Map();

      assignedStaff.reduce((acc, obj) => {
        const id = obj.staff_id;
        const currentSum = acc.get(id) || 0;
        const currentTravelTime =
          totalHoursByStaffIncludingTravelTime.get(obj?.shift_id) || 0;
        const currentTime = totalHoursByShift.get(obj?.shift_id) || 0;

        acc.set(id, currentSum + Number(obj?.total_hours ?? 0));
        totalHoursByShift.set(
          obj?.shift_id,
          currentTime + Number(obj.total_hours ?? 0)
        );
        totalHoursByStaffIncludingTravelTime.set(
          obj?.shift_id,
          currentTravelTime +
            Number(obj.total_hours ?? 0) +
            Number(obj.travel_from_time ?? 0) +
            Number(obj.travel_to_time ?? 0)
        );
        return acc;
      }, totalHoursByStaff);

      let totalOvertimeHours = 0;
      for (const [key, value] of totalHoursByStaff) {
        const classification = staffClassifications.find(
          (x) => x.staff_classification_staff_id == key
        );

        const minimumHours =
          classification?.staff_classification_minimum_hours_per_week ?? 0;

        const overtime_threshold =
          classification?.staff_classification_overtime_threshold ?? 0;

        //todo:come back to this and refactor
        // if (minimumHours > value) {
        //   under_minimum_hours++;
        // } else
        if (value > overtime_threshold) staff_in_overtime++;

        totalOvertimeHours +=
          classification?.staff_classification_target_hours_per_week ?? 0;
      }

      if (staff_in_overtime > 0 && totalOvertimeHours > 0)
        average_overtime = totalOvertimeHours / staff_in_overtime;

      const industryCategoryIds = [
        ...operations[PolymorphicType.OC_OPERATIONS_SESSIONS],
        ...operations[PolymorphicType.OC_OPERATIONS_DRIVES],
      ].map((x) => {
        const shiftId = shifts.find(
          (y) => y.shiftable_id == x.id && y.shiftable_type == x.shiftable_type
        )?.id;
        return {
          shift_id: shiftId,
          industry_category_id: x.industry_category_id,
        };
      });

      const industryCategories = await this.industryCategoriesRepository.find({
        where: {
          id: In(industryCategoryIds.map((x) => x.industry_category_id)),
          tenant_id: Number(filter.tenant_id),
        },
      });

      const shiftsWithSettings = industryCategoryIds.map((x) => {
        const industry_category = industryCategories.find(
          (y) => y.id == x.industry_category_id
        );
        return {
          shift_id: x.shift_id,
          industry_category: industry_category,
        };
      });

      //OEF Calculations
      const shiftsProjections = await this.shiftsProjectionsStaffRepository
        .createQueryBuilder('shifts_projections_staff')
        .where({
          is_archived: false,
          shift_id: In(shiftsIds),
        })
        .select([
          'shifts_projections_staff.shift_id as shift_id',
          'COALESCE(SUM(shifts_projections_staff.procedure_type_qty), 0) as procedure_type_qty',
          'COALESCE(SUM(shifts_projections_staff.product_yield), 0) as product_yield',
        ])
        .groupBy('shifts_projections_staff.shift_id')
        .getRawMany();

      const oefValues = {
        exclude_travel_procedures_per_hour: 0,
        exclude_travel_products_per_hour: 0,
        include_travel_procedures_per_hour: 0,
        include_travel_products_per_hour: 0,
      };

      shiftsProjections.forEach((projection) => {
        if (projection.shift_id) {
          const productYieldSum = projection.product_yield ?? 0;

          const procedureTypeQty = projection.procedure_type_qty ?? 0;

          const totalHours = totalHoursByShift.get(projection.shift_id) ?? 0;

          const totalHoursIncludingTravelTime =
            totalHoursByStaffIncludingTravelTime.get(projection.shift_id) ?? 0;

          const availableStaff = assignedStaff.filter(
            (x) => x.shift_id == projection.shift_id
          ).length;

          const industry_category =
            shiftsWithSettings.find((x) => x.shift_id == projection.shift_id)
              ?.industry_category ?? null;

          //We calculate the oef for a given shift
          //OEF - Product with total hours
          if (productYieldSum > 0 && totalHours > 0 && availableStaff > 0) {
            const oef_products = this.CalculateOef(
              productYieldSum,
              totalHours,
              availableStaff,
              industry_category
            );
            oefValues.exclude_travel_products_per_hour += oef_products;
            //OEF - Product with total hours including travel time
            const oef_products_including_travel_time = this.CalculateOef(
              productYieldSum,
              totalHoursIncludingTravelTime,
              availableStaff,
              industry_category
            );
            oefValues.include_travel_products_per_hour +=
              oef_products_including_travel_time;
            //OEF - Procedures with total hours
            const oef_procedures = this.CalculateOef(
              procedureTypeQty,
              totalHours,
              availableStaff,
              industry_category
            );
            oefValues.include_travel_procedures_per_hour += oef_procedures;
            //OEF - Procedures with total hours including travel time
            const oef_procedures_including_travel_time = this.CalculateOef(
              procedureTypeQty,
              totalHoursIncludingTravelTime,
              availableStaff,
              industry_category
            );
            oefValues.exclude_travel_procedures_per_hour +=
              oef_procedures_including_travel_time;
          }
        }
      });

      if (shiftsWithSettings && shiftsWithSettings?.length > 0) {
        oefValues.exclude_travel_procedures_per_hour = this.GetMiddleValue(
          oefValues.exclude_travel_procedures_per_hour,
          shiftsWithSettings?.length
        );

        oefValues.exclude_travel_products_per_hour = this.GetMiddleValue(
          oefValues.exclude_travel_products_per_hour,
          shiftsWithSettings?.length
        );

        oefValues.include_travel_procedures_per_hour = this.GetMiddleValue(
          oefValues.include_travel_procedures_per_hour,
          shiftsWithSettings?.length
        );

        oefValues.include_travel_products_per_hour = this.GetMiddleValue(
          oefValues.include_travel_products_per_hour,
          shiftsWithSettings?.length
        );

        const response: StaffScheduleSummaryDto = {
          operations: {
            total_operations: total_operations,
            fully_staffed: fully_staffed,
            overstaffed: overstaffed,
            status_exclutions: status_exclutions,
            tenant_id: Number(filter?.tenant_id),
          },
          staff: {
            total_staff: assignedStaff.length,
            average_overtime: Math.round(average_overtime),
            staff_in_overtime: staff_in_overtime,
            under_minimum_hours: under_minimum_hours,
            tenant_id: Number(filter?.tenant_id),
          },
          efficiency: {
            exclude_travel_procedures_per_hour:
              oefValues.exclude_travel_procedures_per_hour,
            exclude_travel_products_per_hour:
              oefValues.exclude_travel_products_per_hour,
            include_travel_procedures_per_hour:
              oefValues.include_travel_procedures_per_hour,
            include_travel_products_per_hour:
              oefValues.include_travel_products_per_hour,
            tenant_id: Number(filter?.tenant_id),
          },
          tenant_id: Number(filter?.tenant_id),
        };
        return resSuccess(
          `${this.message} fetched successfully.`,
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          response
        );
      }
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getAvailableStaff(filter: FilterAvailableStaff, shiftId) {
    try {
      const queryData = await this.getStaffAvailabilityBaseQuery(
        filter,
        false
      ).getRawMany();
      const data =
        queryData.length > 0
          ? await this.GetStaffAvailability(
              queryData,
              shiftId,
              filter.certifications,
              filter.date
            )
          : [];
      const defaultValuesQuery = this.getDefaultTimeValuesByRole(
        filter.role_id,
        shiftId.shiftId,
        filter.tenant_id
      );
      const roleStaffAssignmentDto = await defaultValuesQuery.getRawOne();

      // it appears staff_config table doesn't have RTD values for all roles
      if (roleStaffAssignmentDto != undefined) {
        // set to 0 until directions table is fully implemented
        roleStaffAssignmentDto.travel_from_time = 0;
        roleStaffAssignmentDto.travel_to_time = 0;
        // Calculate clock_in_time, clock_out_time, total_hours
        const role_times = this.calculateRTD(roleStaffAssignmentDto);

        return {
          status_code: HttpStatus.OK,
          data,
          record_count: data.length,
          role_times,
        };
      } else {
        return {
          status_code: HttpStatus.OK,
          data,
          record_count: data.length,
          role_times: null,
        };
      }
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getSharedStaff(filter: FilterSharedStaff, shiftId) {
    try {
      const queryData = await this.getStaffAvailabilityBaseQuery(filter, true);

      const operationDate = new Date(filter.date).toISOString().split('T')[0];

      const availableStaff = await queryData
        .leftJoin(
          'resource_sharings',
          'resource_sharings',
          `resource_sharings.from_collection_operation_id = staff.collection_operation_id`
        )
        .andWhere('resource_sharings.share_type = 2')
        .andWhere(`resource_sharings.tenant_id = ${filter?.tenant_id}`)
        .andWhere('resource_sharings.is_archived = false')
        .andWhere(
          `'${operationDate}' BETWEEN resource_sharings.start_date AND resource_sharings.end_date`
        )
        .andWhere(
          `resource_sharings.to_collection_operation_id = ${filter.collection_operation_id}`
        )
        .getRawMany();

      const data = await this.GetStaffAvailability(
        availableStaff,
        shiftId,
        filter.certificates,
        filter.date
      );

      const response = data.map<SharedStaffDto>((x) => {
        return {
          id: x.id,
          first_name: x.first_name,
          last_name: x.last_name,
          collection_operation: x.collection_operation,
          teams: x.teams,
          schedule_dates: x.schedule_dates,
          assigned_hours: x.assigned_hours,
          target_hours: x.target_hours,
          staff_classification: x.staff_classification,
          is_available: x.is_available,
          already_scheduled: x.already_scheduled,
          tenant_id: x.tenant_id,
          is_certified: x.is_certified,
          is_certificate_expired: x.is_certificate_expired,
        };
      });

      return resSuccess(
        `${this.message} staff availability fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async GetStaffAvailability(
    queryData: any[],
    shiftId: any,
    requiredCertificates: string,
    operationDate: Date
  ): Promise<StaffAvailabilityDto[]> {
    // //Mapping (staff_leave, already_scheduled, schedule_dates, teams)  to distinct staff
    const currentOperation = await this.shiftsRepository
      .createQueryBuilder('shifts')
      .leftJoin(
        'sessions',
        'session',
        `shifts.shiftable_id = session.id AND shifts.shiftable_type = 'sessions'`
      )
      .leftJoin(
        'drives',
        'drive',
        `shifts.shiftable_id = drive.id AND shifts.shiftable_type = 'drives'`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `shifts.shiftable_id = oc_non_collection_event.id AND shifts.shiftable_type = 'oc_non_collection_events'`
      )
      .select([
        'CAST(start_time AS TIME) as start_time, CAST(end_time AS TIME) as end_time',
        `COALESCE(drive.date, session.date, oc_non_collection_event.date) as current_operation_date`,
      ])
      .where('shifts.id = :shiftId', { shiftId: shiftId.shiftId })
      .execute();
    const staffMap = new Map();
    for (const obj of queryData) {
      const id = obj.id;
      const current = staffMap.get(id);
      const updatedObj = {
        ...obj,
        already_scheduled: current?.already_scheduled ?? false,
        is_available: current?.is_available ?? true,
        teams: current?.teams ?? [],
        certificate: current?.certificate ?? [],
        schedule_dates: current?.schedule_dates ?? [],
        staff_assignment_id: current?.staff_assignment_id ?? [],
      };
      const timestamp = obj.schedule_dates
        ? new Date(obj.schedule_dates)
        : null;
      const scheduleDate = timestamp
        ? timestamp.toISOString().slice(0, 10)
        : null;
      if (
        (obj.split_shift === true || obj.draft_split_shift === true) &&
        scheduleDate &&
        scheduleDate ===
          new Date(currentOperation[0].current_operation_date)
            .toISOString()
            .slice(0, 10)
      ) {
        const shiftEndTime = obj.draft_shift_end_time
          ? obj.draft_shift_end_time + obj.draft_travel_from_time * 60000
          : obj.shift_end_time + obj.travel_from_time * 60000;
        const shiftStartTime = obj.draft_shift_start_time
          ? obj.draft_shift_start_time + obj.draft_travel_to_time * 60000
          : obj.shift_start_time + obj.travel_to_time * 60000;
        const shift_id = obj.shift_id ? obj.shift_id : obj.draft_shift_id;
        if (
          ((shiftEndTime && currentOperation[0].start_time > shiftEndTime) ||
            (shiftStartTime &&
              currentOperation[0].end_time < shiftStartTime)) &&
          shift_id !== shiftId.shiftId
        ) {
          updatedObj.already_scheduled = false;
        } else {
          updatedObj.already_scheduled = true;
        }
      } else {
        if (obj.staff_assignment_id || obj.reason === 'C') {
          if (
            scheduleDate &&
            scheduleDate ===
              new Date(currentOperation[0].current_operation_date)
                .toISOString()
                .slice(0, 10)
          ) {
            updatedObj.already_scheduled = true;
          }
        }

        if (
          obj.staff_assignment_id &&
          obj.reason === 'U' &&
          obj.draft_shift_id === shiftId.shiftId
        ) {
          updatedObj.already_scheduled = false;
        }
      }

      if (!obj.is_available) {
        updatedObj.is_available = false;
      }
      if (obj.teams && !updatedObj?.teams?.find((x) => x == obj.teams)) {
        updatedObj.teams.push(obj.teams);
      }
      if (
        obj.certificate_id &&
        !updatedObj?.certificate?.find((x) => x.id == obj.certificate_id)
      ) {
        updatedObj.certificate.push({
          id: obj.certificate_id,
          expires: obj.expires,
          expiration_date: obj.expiration_date,
        });
      }
      if (
        obj.schedule_dates &&
        !updatedObj?.schedule_dates?.find(
          (x) => x?.getTime() == obj.schedule_dates.getTime()
        )
      ) {
        updatedObj.schedule_dates.push(obj.schedule_dates);
      }
      if (
        obj.staff_assignment_id &&
        !updatedObj?.staff_assignment_id?.find(
          (x) => x == obj.staff_assignment_id
        )
      ) {
        updatedObj.staff_assignment_id.push(obj.staff_assignment_id);
      }
      staffMap.set(id, updatedObj);
    }

    const staffIds = [];
    let staffAssignmentIds = [];
    staffMap.forEach((x) => {
      if (x.staff_assignment_id && x.staff_assignment_id?.length > 0) {
        if (!staffAssignmentIds.find((y) => y == x.staff_assignment_id)) {
          const staffAssignmentIdsSet = new Set([
            ...staffAssignmentIds,
            ...x.staff_assignment_id,
          ]);
          staffAssignmentIds = [...staffAssignmentIdsSet];
        }
      }
      staffIds.push(x.id);
    });
    //We get the total hours per staff - refactor this later unecessary call to db
    const staffAssignments =
      (await this.staffAssignmentsRepository
        .createQueryBuilder('staff_assignments')
        .where({
          is_archived: false,
          id: In(staffAssignmentIds),
        })
        .select([
          'staff_assignments.staff_id as staff_id',
          'sum(staff_assignments.total_hours) as assigned_hours',
        ])
        .groupBy('staff_assignments.staff_id')
        .getRawMany()) ?? [];

    staffMap.forEach((x) => {
      const current = staffMap.get(x.id);
      const assignedHours =
        staffAssignments.find((y) => y.staff_id == x.id)?.assigned_hours ?? 0;

      const {
        isCertified,
        isCertificationExpired,
      }: {
        isCertified: boolean;
        isCertificationExpired: boolean;
      } = this.GetCertification(
        current.certificate,
        requiredCertificates
          ? requiredCertificates.split(',').map(String)
          : null,
        operationDate
      );

      staffMap.set(x.id, {
        ...current,
        assigned_hours: assignedHours,
        is_certified: isCertified,
        is_certification_expired: isCertificationExpired,
      });
    });

    const staffAvailability: StaffAvailabilityDto[] = [];
    staffMap.forEach((x) => {
      staffAvailability.push({
        id: x.id,
        first_name: x.first_name,
        last_name: x.last_name,
        collection_operation: x.collection_operation_id,
        teams: x.teams,
        schedule_dates: x.schedule_dates,
        assigned_hours: x.assigned_hours,
        target_hours:
          x?.staff_classification?.staff_classification
            ?.target_hours_per_week ?? 0,
        is_preferred: x.is_preferred == 1 ? true : false,
        is_available: x.is_available,
        already_scheduled: x.already_scheduled,
        staff_classification:
          x?.staff_classification?.staff_classification ?? null,
        tenant_id: x.tenant_id,
        is_certified: x.is_certified,
        is_certificate_expired: x.is_certification_expired,
      });
    });
    return staffAvailability;
  }

  private GetCertification(
    certificates: any[],
    requiredCertificates: string[],
    operationDate: Date
  ) {
    if (!requiredCertificates || requiredCertificates.length == 0)
      return {
        isCertified: true,
        isCertificationExpired: false,
      };

    let isCertificationExpired = false;
    const currentOperationDate = new Date(operationDate);

    for (const required of requiredCertificates) {
      const current = certificates.find((x) => x.id == required);

      if (!current) {
        return {
          isCertified: false,
          isCertificationExpired: false,
        };
      }

      if (current && current.expires && current.expiration_date) {
        const certificateDate = new Date(current.expiration_date);

        if (currentOperationDate > certificateDate) {
          isCertificationExpired = true;
        }
      }
    }
    return {
      isCertified: true,
      isCertificationExpired: isCertificationExpired,
    };
  }

  async getStaffUnderMinimumHours(filter: FilterStaffSummaryInterface) {
    try {
      let response = (await this.getStaffUnderminimumHoursData({
        ...filter,
        is_published: 'false',
      })) as any[];

      if (filter?.is_published == 'true') {
        response = response.concat(
          await this.getStaffUnderminimumHoursData(filter)
        );
      }

      return resSuccess(
        `${this.message} staff under minimum hours fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getStaffUnderminimumHoursData(filter: FilterStaffSummaryInterface) {
    try {
      const { page, limit, sortName, sortOrder, is_published } = filter;

      const { shifts } = (await this.getScheduleOperations(filter)) as {
        shifts: Shifts[];
      };

      const shiftsIds = shifts.map((x) => x.id);

      let query = this.getStaffAssignmentsRepository(is_published)
        .createQueryBuilder('staff_assignments')
        .innerJoin('staff', 'staff', 'staff.id = staff_assignments.staff_id')
        .innerJoin(
          'staff_classification',
          'staff_classification',
          'staff.classification_id = staff_classification.id'
        )
        .innerJoin(
          'staff_roles_mapping',
          'staff_roles_mapping',
          'staff_roles_mapping.staff_id = staff.id and staff_roles_mapping.is_primary = true'
        )
        .innerJoin(
          'contacts_roles',
          'contacts_roles',
          'contacts_roles.id = staff_roles_mapping.role_id'
        )
        .select([
          '(staff.id) as staff_id',
          `(staff.first_name || ' ' || staff.last_name) as name`,
          '(contacts_roles.name) as primary_role',
          '(sum(staff_assignments.total_hours)) as total_hours',
          '(sum(staff_classification.minimum_hours_per_week)) as minimum_hours_per_week',
          'staff_assignments.tenant_id as tenant_id',
        ])
        .groupBy('staff.id, contacts_roles.name, staff_assignments.tenant_id')
        .where(
          `staff_assignments.shift_id in (${shiftsIds}) and total_hours < minimum_hours_per_week`
        );

      if (page && limit) {
        const { skip, take } = this.commonFunction.pagination(limit, page);

        query = query.limit(take).offset(skip);
      }
      if (sortName && sortOrder) {
        query.orderBy(sortName, sortOrder);
      }

      return await query.getRawMany();
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getStatusExclusions(filter: FilterStaffSummaryInterface) {
    try {
      // eslint-disable-next-line prefer-const
      let { response, shiftsIds } = (await this.getScheduleOperationData(
        filter
      )) as { response: StatusExclusionsDto[]; shiftsIds: bigint[] };

      const projections: any[] =
        await this.shiftsProjectionsStaffRepository.find({
          where: { shift_id: In(shiftsIds) },
        });

      for (let i = 0; i < response.length; i++) {
        const projection = projections.filter(
          (x) => x.shift_id == response[i].id
        );

        if (projection && projection.length > 0) {
          for (const proj of projection) {
            response[i].projection += proj.product_yield;
          }
        }
      }

      /* First sort, then apply page & limit, because sorting can be done by calculated values
         which means we need to fetch all, calculate and then sort */
      if (filter.sortName && filter.sortOrder) {
        response = this.sort(response, filter.sortName, filter.sortOrder);
      }
      if (filter.page && filter.limit) {
        const startIndex = (filter.page - 1) * filter.limit;
        const endIndex = startIndex + filter.limit;
        response = response.slice(startIndex, endIndex);
      }

      return resSuccess(
        `${this.message} status exclusions fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  //todo: refactor this method
  async getOverStaffedDrives(filter: FilterStaffSummaryInterface) {
    try {
      // eslint-disable-next-line prefer-const
      let { response, shiftsIds } = (await this.getScheduleOperationData(
        filter
      )) as {
        response: any[];
        shiftsIds: bigint[];
      };

      const projections: any[] =
        await this.shiftsProjectionsStaffRepository.find({
          where: { shift_id: In(shiftsIds) },
        });

      for (let i = 0; i < response.length; i++) {
        const projection = projections.filter(
          (x) => x.shift_id == response[i].id
        );
        let assignedStaff = 0;
        let requestedStaffQty = [];
        if (projection && projection.length > 0) {
          for (const proj of projection) {
            response[i].projection += proj.procedure_type_qty;
          }

          //Get Requested and fulfilled staff
          const staffSetups = projection.map(
            (projection) => projection.staff_setup_id
          );
          requestedStaffQty = await this.staffConfigRepository.find({
            where: {
              staff_setup_id: In(staffSetups),
            },
          });

          assignedStaff = await this.staffAssignmentsRepository.count({
            where: {
              operation_id: response[i].shiftable_id,
              operation_type: response[i].shiftable_type,
              shift_id: In(shiftsIds),
            },
          });

          if (filter.is_published == 'true') {
            assignedStaff += await this.staffAssignmentsDraftsRepository.count({
              where: {
                operation_id: response[i].shiftable_id,
                operation_type: response[i].shiftable_type,
                shift_id: In(shiftsIds),
              },
            });
          }
        }
        response[i].requested = 0;
        response[i].fulfilled = assignedStaff;

        if (requestedStaffQty.length > 0) {
          for (const reqStaff of requestedStaffQty) {
            response[i].requested += reqStaff.qty;
          }
        }
      }
      /* First sort, then apply page & limit, because sorting can be done by calculated values
         which means we need to fetch all, calculate and then sort */
      if (filter.sortName && filter.sortOrder) {
        response = this.sort(response, filter.sortName, filter.sortOrder);
      }
      if (filter.page && filter.limit) {
        const startIndex = (filter.page - 1) * filter.limit;
        const endIndex = startIndex + filter.limit;
        response = response.slice(startIndex, endIndex);
      }

      return resSuccess(
        `${this.message} overstaffed drives fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getScheduleOperations(filter: FilterStaffSummaryInterface) {
    try {
      let schedule = null;
      if (filter?.schedule_id) {
        schedule = await this.scheduleRepository.findOne({
          where: {
            id: filter.schedule_id,
            is_archived: false,
            tenant_id: filter.tenant_id,
          },
          relations: ['collection_operation_id'],
        });
      } else
        return resError(
          `Schedule with id ${filter?.schedule_id ?? 'null'} not found`,
          ErrorConstants.Error
        );

      if (!filter?.tenant_id)
        return resError(`Tenant id not found`, ErrorConstants.Error);

      const { start_date, end_date } = schedule;

      const operations = {
        drives: [],
        sessions: [],
        oc_non_collection_events: [],
      };

      const operationsIds = {
        drives: [],
        sessions: [],
        oc_non_collection_events: [],
      };

      const operation_types = [
        PolymorphicType.OC_OPERATIONS_DRIVES,
        PolymorphicType.OC_OPERATIONS_SESSIONS,
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
      ];

      const allShifts = await this.shiftsRepository.find({
        where: {
          shiftable_type: In(operation_types),
          tenant_id: filter.tenant_id,
          is_archived: false,
        },
      });

      //todo:It is not fetching proper ids for oc_non_collection_events IN(265,293,294,296,295)
      allShifts.forEach((shift) => {
        operationsIds[shift.shiftable_type].push(shift.shiftable_id);
      });

      operations[PolymorphicType.OC_OPERATIONS_DRIVES] =
        operationsIds[PolymorphicType.OC_OPERATIONS_DRIVES].length > 0
          ? await this.drivesRepository
              .createQueryBuilder('drive')
              .where({
                is_archived: false,
                id: In(operationsIds[PolymorphicType.OC_OPERATIONS_DRIVES]),
                date: Between<Date>(start_date, end_date),
                tenant_id: filter.tenant_id,
              })
              .innerJoin('accounts', 'account', 'drive.account_id = account.id')
              .innerJoin(
                'operations_status',
                'operation_status',
                'drive.operation_status_id = operation_status.id'
              )
              .select([
                'drive.id as id',
                `'${PolymorphicType.OC_OPERATIONS_DRIVES}' as shiftable_type`,
                'drive.recruiter_id as recruiter_id',
                'account.industry_category as industry_category_id',
                'operation_status.name as operation_status',
                'operation_status.applies_to as operation_states',
              ])
              .getRawMany()
          : [];

      operations[PolymorphicType.OC_OPERATIONS_SESSIONS] =
        operationsIds[PolymorphicType.OC_OPERATIONS_SESSIONS].length > 0
          ? await this.sessionsRepository
              .createQueryBuilder('sessions')
              .where({
                is_archived: false,
                id: In(operationsIds[PolymorphicType.OC_OPERATIONS_SESSIONS]),
                date: Between<Date>(start_date, end_date),
                tenant_id: filter.tenant_id,
              })
              .innerJoin(
                'facility',
                'facility',
                'sessions.donor_center_id = facility.id and facility.donor_center IS TRUE'
              )
              .innerJoin(
                'operations_status',
                'operation_status',
                'sessions.operation_status_id = operation_status.id'
              )
              .select([
                'sessions.id as id',
                'facility.industry_category as industry_category_id',
                `'${PolymorphicType.OC_OPERATIONS_SESSIONS}' as shiftable_type`,
                'operation_status.name as operation_status',
                'operation_status.applies_to as operation_states',
              ])
              .getRawMany()
          : [];

      operations['oc_non_collection_events'] =
        operationsIds['oc_non_collection_events'].length > 0
          ? await this.nonCollectionEventsRepository
              .createQueryBuilder('nce')
              .where({
                is_archived: false,
                id: In(operationsIds['oc_non_collection_events']),
                date: Between<Date>(start_date, end_date),
                tenant_id: filter.tenant_id,
              })
              .innerJoin(
                'operations_status',
                'operation_status',
                'nce.status_id = operation_status.id'
              )
              .select([
                'nce.id as id',
                `'oc_non_collection_events' as shiftable_type`,
                'nce.owner_id as owner_id',
                'operation_status.name as operation_status',
                'operation_status.applies_to as operation_states',
              ])
              .getRawMany()
          : [];

      const shifts = allShifts.filter((x) =>
        operations[x.shiftable_type].find((y) => BigInt(y.id) == x.shiftable_id)
      );

      if (shifts === undefined || shifts?.length <= 0)
        return resSuccess(
          `${this.message} staff under minimum hours fetched successfully - no shifts found under schedule.`,
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          [],
          0
        );

      return {
        shifts: shifts,
        operations: operations,
        collection_operation_id: Number(schedule.collection_operation_id.id),
      };
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getScheduleOperationData(filter: FilterStaffSummaryInterface) {
    try {
      const { page, limit, sortName, sortOrder } = filter;

      const { shifts, collection_operation_id } =
        (await this.getScheduleOperations(filter)) as {
          shifts: Shifts[];
          collection_operation_id: number;
        };

      if (!collection_operation_id)
        return resError(
          'Collection Operation Id not found.',
          ErrorConstants.Error
        );

      const shiftsIds = shifts?.map((x) => x.id);

      const query = this.shiftsRepository
        .createQueryBuilder('shifts')
        .leftJoin(
          'sessions',
          'session',
          `shifts.shiftable_id = session.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
        )
        .leftJoin(
          'drives',
          'drive',
          `shifts.shiftable_id = drive.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
        )
        .leftJoin(
          'oc_non_collection_events',
          'oc_non_collection_event',
          `shifts.shiftable_id = oc_non_collection_event.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
        )
        .leftJoin(
          'operations_status',
          'operation_status',
          'operation_status.id in (coalesce(session.operation_status_id, drive.operation_status_id, oc_non_collection_event.status_id))'
        )
        .leftJoin(
          'facility',
          'facility',
          'session.donor_center_id = facility.id AND facility.donor_center IS TRUE'
        )
        .leftJoin(
          'crm_locations',
          'crm_location',
          'crm_location.id IN (drive.location_id, oc_non_collection_event.location_id)'
        )
        .leftJoin(
          'address',
          'address',
          `address.addressable_id IN(crm_location.id, facility.id) AND ((address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}' AND crm_location.id IS NOT NULL) OR (address.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}' AND facility.id IS NOT NULL))`
        )
        .leftJoin(
          'staff',
          'staff',
          'staff.id in (coalesce(drive.recruiter_id, oc_non_collection_event.owner_id))'
        )
        .leftJoin(
          'nce_collection_operations',
          'nce_collection_operation',
          'nce_collection_operation.nce_id = oc_non_collection_event.id'
        )
        .leftJoin('accounts', 'account', 'drive.account_id = account.id')
        .select([
          'shifts.id as id',
          //todo: add proper session recruiter after discussion with solutions team for now use facility name
          `coalesce((staff.first_name || ' ' || staff.last_name), facility.name) as recruiter`,
          'coalesce(drive.date, session.date, oc_non_collection_event.date) as date',
          // `(address.city || ', ' || address.state) as location`,
          `crm_location.name AS location`,
          'operation_status.name as status',
          `0 as projection`,
          'shifts.tenant_id as tenant_id',
        ])
        //todo: add schedule status checks
        .where(
          `shifts.id in (${shiftsIds}) and shifts.tenant_id = ${filter.tenant_id}
          and coalesce(account.collection_operation, session.collection_operation_id, nce_collection_operation.business_unit_id) in (${collection_operation_id})`
        );

      const response = await query.getRawMany<StatusExclusionsDto>();
      return { response: response, shiftsIds: shiftsIds };
    } catch (exception) {}
  }

  CalculateOef(product, hours, staff, industry_category) {
    let oef = product / hours / staff;

    if (industry_category) {
      if (oef > industry_category.maximum_oef) {
        oef = industry_category.maximum_oef;
      } else if (oef < industry_category.minimum_oef) {
        oef = industry_category.maximum_oef;
      }
    }
    return oef;
  }

  GetMiddleValue(val, count) {
    if (val && val > 0) {
      return Math.round((val / count) * 100) / 100;
    } else return 0;
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

  getStaffAssignmentsRepository(isPublished: string) {
    return isPublished == 'true'
      ? this.staffAssignmentsDraftsRepository
      : this.staffAssignmentsRepository;
  }

  getDefaultTimeValuesByRole(roleId, shiftId, tenant_id) {
    const query = this.contactsRolesRepository
      .createQueryBuilder('cr')
      .innerJoinAndSelect('staff_config', 'sc', 'sc.contact_role_id = cr.id')
      .innerJoinAndSelect('staff_setup', 'ss', `sc.staff_setup_id = ss.id`)
      .innerJoinAndSelect(
        'shifts_projections_staff',
        'sps',
        `sps.shift_id = ${shiftId} AND sps.staff_setup_id = ss.id`
      )
      .innerJoinAndSelect('shifts', 'sh', `sh.id = ${shiftId}`)
      .select([
        `sc.lead_time as lead_time`,
        `sc.setup_time as setup_time`,
        `sc.breakdown_time as breakdown_time`,
        `sc.wrapup_time as wrapup_time`,
        `sh.start_time as shift_start_time`,
        `sh.end_time as shift_end_time`,
      ])
      .where(`cr.id = ${roleId} and cr.tenant_id = ${tenant_id}`)
      .groupBy(
        'sc.lead_time, sc.setup_time, sc.breakdown_time, sc.wrapup_time, sh.start_time, sh.end_time'
      );
    return query;
  }

  calculateRTD(objForCalculation) {
    let minutesIn =
      objForCalculation.shift_start_time.getHours() * 60 +
      objForCalculation.shift_start_time.getMinutes();
    minutesIn =
      minutesIn -
      objForCalculation.lead_time -
      objForCalculation.setup_time -
      objForCalculation.travel_to_time;
    objForCalculation.clock_in_time = this.formatClockTime(minutesIn);

    let minutesOut =
      objForCalculation.shift_end_time.getHours() * 60 +
      objForCalculation.shift_end_time.getMinutes();
    minutesOut =
      minutesOut +
      objForCalculation.breakdown_time +
      objForCalculation.wrapup_time +
      objForCalculation.travel_from_time;

    objForCalculation.clock_out_time = this.formatClockTime(minutesOut);

    objForCalculation.total_hours = Number(
      (minutesOut - minutesIn) / 60
    ).toFixed(2);
    return objForCalculation;
  }

  formatClockTime(allMinutes: number) {
    const hours = Math.floor(allMinutes / 60); // returns 24 for midnight
    const minutes = allMinutes % 60;
    const hoursToDisplay = hours < 12 ? hours : hours - 12;
    // for one-digit numbers display 0 before the number
    return `${hoursToDisplay < 10 ? `0${hoursToDisplay}` : hoursToDisplay}:${
      minutes < 10 ? `0${minutes}` : minutes
    } ${hours < 12 ? 'AM' : hours == 24 ? 'AM' : 'PM'}`;
  }

  //todo: probably segregate this into a sort service for calculated values that will require sorting
  sort(data: any[], sortProperty: string, sortOrder: 'ASC' | 'DESC'): any[] {
    if (!sortProperty || !sortOrder) {
      return data;
    }

    if (sortProperty == 'date')
      return this.sortByDate(data, sortProperty, sortOrder);

    return data.sort((a, b) => {
      const valueA = a[sortProperty];
      const valueB = b[sortProperty];

      // Handle different data types (numbers, strings) and nullish values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'ASC' ? valueA - valueB : valueB - valueA;
      } else {
        return sortOrder === 'ASC'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  }

  sortByDate(
    data: any[],
    sortProperty: string,
    sortOrder: 'ASC' | 'DESC'
  ): any[] {
    if (!sortProperty || !sortOrder) {
      return data;
    }

    const parsedData = data.map((item) => {
      const value = item[sortProperty];

      const dateValue = value ?? null;

      return {
        ...item,
        [sortProperty]: new Date(dateValue),
      };
    });

    return parsedData.sort((a, b) => {
      const dateA = a[sortProperty];
      const dateB = b[sortProperty];

      // Ensure both are valid dates before comparison
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return sortOrder === 'ASC'
          ? a[sortProperty].localeCompare(b[sortProperty])
          : b[sortProperty].localeCompare(a[sortProperty]);
      }

      return sortOrder === 'ASC'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  }
}
