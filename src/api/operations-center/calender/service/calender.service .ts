import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository, In, Between } from 'typeorm';
import { GetMonthlyCalenderInterface } from '../interface/oc-calender-monthly.interface';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { Procedure } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedure.entity';
import { Products } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Favorites } from '../../manage-favorites/entities/favorites.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Drives } from '../../operations/drives/entities/drives.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactTypeEnum } from 'src/api/crm/contacts/common/enums';
import { Sessions } from '../../operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from '../../operations/non-collection-events/entities/oc-non-collection-events.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { StaffShiftSchedule } from 'src/api/crm/contacts/staff/staffShiftSchedule/entity/staff-shift-schedule.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { DailyGoalsCalenders } from 'src/api/system-configuration/tenants-administration/organizational-administration/goals/daily-goals-calender/entity/daily-goals-calender.entity';
import { ProcedureTypesProducts } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types-products.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { ResourceSharings } from '../../resource-sharing/entities/resource-sharing.entity';
import moment from 'moment';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import {
  organizationalLevelWhere,
  organizationalLevelWhereString,
} from 'src/api/common/services/organization.service';

@Injectable()
export class CalendersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    @InjectRepository(OperationsStatus)
    private readonly operationsStatusRepository: Repository<OperationsStatus>,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelsRepository: Repository<OrganizationalLevels>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(Favorites)
    private readonly favoritesRepository: Repository<Favorites>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    @InjectRepository(NonCollectionEvents)
    private readonly nonCollectionEventsRepository: Repository<NonCollectionEvents>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(StaffShiftSchedule)
    private readonly staffShiftScheduleRepository: Repository<StaffShiftSchedule>,
    @InjectRepository(ShiftsDevices)
    private readonly shiftsDevicesRepository: Repository<ShiftsDevices>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftsVehiclesRepository: Repository<ShiftsVehicles>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRepository: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(DailyGoalsCalenders)
    private readonly dailyGoalsCalendersRepository: Repository<DailyGoalsCalenders>,
    @InjectRepository(ProcedureTypesProducts)
    private readonly procedureTypesProductsRepository: Repository<ProcedureTypesProducts>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(DonorDonations)
    private readonly donorDonationsRepository: Repository<DonorDonations>,
    @InjectRepository(ResourceSharings)
    private readonly resourceSharingsRepository: Repository<ResourceSharings>,
    @InjectRepository(StaffSetup)
    private readonly staffSetupRepository: Repository<StaffSetup>
  ) {}
  async findAllMonthly(
    user: any,
    getMonthlyCalenderInterface: GetMonthlyCalenderInterface
  ) {
    try {
      let countData: any;
      const response: any = [];
      const {
        procedure_type_id,
        product_id,
        operation_status_id,
        view_as,
        week_view,
        week_start_date,
        week_end_date,
      }: any = getMonthlyCalenderInterface;
      const { organizational_levels }: any = getMonthlyCalenderInterface;
      let { month, year }: any = getMonthlyCalenderInterface;
      if (!month || !year) {
        const currentDate = new Date();
        month = currentDate.getMonth() + 1;
        year = currentDate.getFullYear();
      }

      let firstDay = new Date(year, month - 1, 1);
      let lastDay = new Date(year, month, 0);

      if (week_view && week_start_date && week_end_date) {
        firstDay = new Date(week_start_date);
        lastDay = new Date(week_end_date);
      }
      let createdBy: any = {};
      let managerUserIds: any;
      if (user.is_manager) {
        const managerUsersWhere: any = {
          assigned_manager: {
            id: user?.id,
          },
        };

        const managerUsers = await this.userRepository.find({
          where: managerUsersWhere,
          relations: ['assigned_manager'],
        });

        managerUserIds = managerUsers.map((user) => {
          return user?.id;
        });
        createdBy = { ...createdBy, id: In(managerUserIds) };
      } else {
        managerUserIds = [user?.id];
        createdBy = {
          ...createdBy,
          id: user?.id,
        };
      }
      const tenant_id: any = user?.tenant?.id;

      let procedureType: any = {};
      let operationStatus: any = {};
      let collectionOperation: any = {};
      let productProcedureType: any = {};

      const userBusinessUnits = await this.businessUnitsRepository.find({
        where: {
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: ['organizational_level_id', 'tenant'],
      });

      // Filter business units with is_collection_operation = true
      const filteredBusinessUnits = userBusinessUnits?.filter(
        (userBusinessUnit) => {
          return (
            userBusinessUnit?.organizational_level_id
              ?.is_collection_operation === true
          );
        }
      );

      let collectionOperationIds: any = filteredBusinessUnits?.map(
        (userBusinessUnit) => {
          return userBusinessUnit?.id;
        }
      );

      collectionOperation = {
        ...collectionOperation,
        collection_operation_id: In(collectionOperationIds),
      };
      if (organizational_levels) {
        const { collection_operations } = JSON.parse(organizational_levels);
        const coIds = Object.keys(collection_operations).map((co_id) => +co_id);
        collectionOperationIds = coIds;

        collectionOperation = {
          ...collectionOperation,
          collection_operation_id: In(collectionOperationIds),
        };
      }

      const procedureTypes = await this.procedureTypesRepository.find({
        where: {
          tenant_id: tenant_id,
          is_archive: false,
        },
      });

      const procedureTypesIds = procedureTypes.map((item) => {
        return item?.id;
      });

      let uniqueProcedureTypeIds: any = new Set(procedureTypesIds);
      uniqueProcedureTypeIds = [...uniqueProcedureTypeIds];
      procedureType = {
        ...procedureType,
        procedure_type_id: In([...uniqueProcedureTypeIds]),
      };
      if (procedure_type_id) {
        uniqueProcedureTypeIds = [procedure_type_id];
        procedureType = {
          ...procedureType,
          procedure_type_id: procedure_type_id,
        };
      }

      const product = await this.productsRepository.find({
        where: {
          tenant_id: tenant_id,
          is_archived: false,
        },
      });

      const productsIds = product.map((item) => {
        return item?.id;
      });

      const procedureTypeProducts =
        await this.procedureTypesProductsRepository.find({
          where: {
            product_id: In(productsIds),
          },
        });

      const productsProcedureTypeIds = procedureTypeProducts.map((item) => {
        return item.procedure_type_id;
      });

      const activeProductsProcedureTypes = await this.procedureRepository.find({
        where: {
          id: In(productsProcedureTypeIds),
          tenant_id: tenant_id,
          is_archive: false,
        },
      });

      const activeProductsProcedureTypesIds = activeProductsProcedureTypes.map(
        (procedure_type) => procedure_type?.id
      );

      const uniqueProcedureTypeProductIds: any = new Set(
        activeProductsProcedureTypesIds
      );

      productProcedureType = {
        ...productProcedureType,
        procedure_type_id: In([...uniqueProcedureTypeProductIds]),
      };

      if (
        (view_as &&
          view_as == 'product' &&
          uniqueProcedureTypeProductIds.size === 0) ||
        (view_as == undefined && uniqueProcedureTypeProductIds.size === 0)
      ) {
        let emptyResponse = {
          date: '',
          goal_products: 0,
          goal_procedures: 0,
          actual_products: 0,
          actual_procedures: 0,
          net_total_shared_staff: 0,
          net_total_shared_devices: 0,
          net_total_shared_vehicles: 0,
          procedureOutsideDrivesCount: 0,
          procedureInsideDrivesCount: 0,
          productOutsideDrivesCount: 0,
          productInsideDrivesCount: 0,
          total_drives: 0,
          total_sessions: 0,
          total_events: 0,
          scheduled_products: 0,
          scheduled_procedures: 0,
          staff_booked: 0,
          devices_booked: 0,
          vehicles_booked: 0,
          staff_available: 0,
          vehicles_available: 0,
          devices_available: 0,
          nce: [],
          drives: [],
          sessions: [],
        };
        for (
          let day = firstDay;
          day <= lastDay;
          day.setDate(day.getDate() + 1)
        ) {
          const dayOfMonth = day.toISOString().split('T')[0];
          emptyResponse = { ...emptyResponse, date: dayOfMonth };
          response.push(emptyResponse);
        }

        return resSuccess(
          'Monthly calender view data fetched successfully.',
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          response
        );
      }

      if (view_as && view_as == 'product') {
        uniqueProcedureTypeIds = [...uniqueProcedureTypeProductIds];
      }

      if (product_id) {
        const procedureTypeProducts =
          await this.procedureTypesProductsRepository.find({
            where: {
              product_id: product_id,
            },
          });

        const productsProcedureTypeIds = procedureTypeProducts.map((item) => {
          return item.procedure_type_id;
        });

        uniqueProcedureTypeIds = productsProcedureTypeIds;
        productProcedureType = {
          ...productProcedureType,
          procedure_type_id: In(uniqueProcedureTypeIds),
        };
      }

      if (operation_status_id) {
        operationStatus = {
          ...operationStatus,
          operation_status_id: operation_status_id,
        };
      }

      for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
        const dayOfMonth = day.toISOString().split('T')[0];
        const startOfDay = dayOfMonth.concat(' 00:00:00');
        const endOfDay = dayOfMonth.concat(' 23:59:59');

        const goalProceduresQuery = await this.dailyGoalsCalendersRepository
          .createQueryBuilder('daily_goals_calender')
          .select(
            "SUM(CASE WHEN daily_goals_calender.goal_amount = 'NaN' THEN 0 ELSE daily_goals_calender.goal_amount END)",
            'procedureTypeGoals'
          )
          .leftJoin('daily_goals_calender.created_by', 'created_by')
          .leftJoin(
            'daily_goals_calender.collection_operation',
            'collection_operation'
          )
          .where(
            `daily_goals_calender.date = '${dayOfMonth}' AND daily_goals_calender.is_archived = false AND daily_goals_calender.tenant_id = '${tenant_id}' AND daily_goals_calender.procedure_type_id IN (${uniqueProcedureTypeIds})`
          );

        if (organizational_levels) {
          const { collection_operations } = JSON.parse(organizational_levels);
          const coIds = Object.keys(collection_operations).map(
            (co_id) => +co_id
          );

          if (coIds.length > 0) {
            goalProceduresQuery.andWhere(
              `collection_operation.id IN (${coIds})`
            );
          }
        }

        const goal_procedures_data =
          await this.dailyGoalsCalendersRepository.query(
            goalProceduresQuery.getSql()
          );
        const goal_procedures =
          goal_procedures_data?.length > 0
            ? goal_procedures_data[0]?.procedureTypeGoals
            : 0;
        const goal_products = goal_procedures;

        const procedureTypeDonations = this.donorDonationsRepository
          .createQueryBuilder('donations')
          .leftJoin('donations.donation_type', 'donation_type')

          .where(
            `donation_date = '${dayOfMonth}' AND donations.is_archived = false AND donation_type.id IN (${uniqueProcedureTypeIds})`
          );

        const actual_procedures = await procedureTypeDonations.getCount();
        const actual_products = actual_procedures;

        const totalStaffCountQuery = this.staffSetupRepository
          .createQueryBuilder('staff_setups')
          .select('SUM(staff_config.qty)', 'totalQty')
          .leftJoin(
            'staff_config',
            'staff_config',
            'staff_config.staff_setup_id = staff_setups.id'
          )
          .leftJoin('staff_setups.procedure_type_id', 'procedure_type_id')
          .groupBy('staff_setups.tenant_id')
          .andWhere(
            `staff_setups.is_archived = false AND staff_setups.tenant_id = ${tenant_id} AND procedure_type_id.id IN (${uniqueProcedureTypeIds})`
          );

        const totalQtyResult = await totalStaffCountQuery.getRawOne();
        const totalStaffCount = totalQtyResult
          ? parseInt(totalQtyResult.totalQty)
          : 0;

        let collectionOperationId = {};

        if (
          collectionOperation &&
          collectionOperation.collection_operation_id
        ) {
          collectionOperationId = {
            ...collectionOperationId,
            collection_operation: collectionOperation.collection_operation_id,
          };
        }

        const totalDeviceCountQuery = this.deviceRepository
          .createQueryBuilder('device')
          .where({
            tenant: user.tenant,
            is_archived: false,
            status: true,
          });
        if (organizational_levels) {
          const { collection_operations } = JSON.parse(organizational_levels);

          const coIds = Object.keys(collection_operations).map(
            (co_id) => +co_id
          );

          if (coIds.length > 0) {
            totalDeviceCountQuery.andWhere(
              `collection_operation IN (${coIds})`
            );
          }
        }

        const totalDeviceCount = await totalDeviceCountQuery.getCount();

        const totalVehicleCountQuery = this.vehicleRepository
          .createQueryBuilder('vehicle')
          .where({
            tenant: user.tenant,
            is_archived: false,
            is_active: true,
          });

        if (organizational_levels) {
          const { collection_operations } = JSON.parse(organizational_levels);
          const coIds = Object.keys(collection_operations).map(
            (co_id) => +co_id
          );

          if (coIds.length > 0) {
            totalVehicleCountQuery.andWhere(
              `collection_operation IN (${coIds})`
            );
          }
        }
        const totalVehicleCount = await totalVehicleCountQuery.getCount();
        // shared counts ***************************************************************************************************************8
        // shared-staff
        let net_total_shared_staff: any;
        const sharedStaff = await this.resourceSharingsRepository
          .createQueryBuilder('resource_sharing')
          .select('SUM(resource_sharing.quantity)', 'totalQuantity')
          .where({
            share_type: 2,
            is_archived: false,
            tenant_id: user.tenant,
          })
          .andWhere(
            ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
            { dayOfMonth }
          )
          .getRawOne();
        net_total_shared_staff =
          sharedStaff && sharedStaff?.totalQuantity
            ? +sharedStaff?.totalQuantity
            : 0;

        if (organizational_levels) {
          const negSharedStaff = await this.resourceSharingsRepository
            .createQueryBuilder('resource_sharing')
            .select('SUM(resource_sharing.quantity)', 'totalQuantity')
            .where({
              share_type: 2,
              from_collection_operation_id: {
                id: In(collectionOperationIds),
              },
              tenant_id: user.tenant,
              is_archived: false,
            })
            .andWhere(
              ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
              { dayOfMonth }
            )
            .getRawOne();
          const totalNegShareStaff =
            negSharedStaff && negSharedStaff?.totalQuantity
              ? +negSharedStaff?.totalQuantity
              : 0;

          const posSharedStaff = await this.resourceSharingsRepository
            .createQueryBuilder('resource_sharing')
            .select('SUM(resource_sharing.quantity)', 'totalQuantity')

            .where({
              share_type: 2,
              to_collection_operation_id: {
                id: In(collectionOperationIds),
              },
              tenant_id: user.tenant,
              is_archived: false,
            })
            .andWhere(
              ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
              { dayOfMonth }
            )
            .getRawOne();

          const totalPositiveSharedStaff =
            posSharedStaff && posSharedStaff?.totalQuantity
              ? +posSharedStaff?.totalQuantity
              : 0;

          net_total_shared_staff =
            totalPositiveSharedStaff - totalNegShareStaff;
        }

        // vehicle  *******************************************************
        let net_total_shared_vehicles: any;
        const sharedVehicles = await this.resourceSharingsRepository
          .createQueryBuilder('resource_sharing')
          .select('SUM(resource_sharing.quantity)', 'totalQuantity')

          .where({
            share_type: 3,
            is_archived: false,
            tenant_id: user.tenant,
          })
          .andWhere(
            ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
            { dayOfMonth }
          )
          .getRawOne();
        net_total_shared_vehicles =
          sharedVehicles && sharedVehicles?.totalQuantity
            ? +sharedVehicles?.totalQuantity
            : 0;

        if (organizational_levels) {
          const negSharedVehicle = await this.resourceSharingsRepository
            .createQueryBuilder('resource_sharing')
            .select('SUM(resource_sharing.quantity)', 'totalQuantity')

            .where({
              share_type: 3,
              from_collection_operation_id: {
                id: In(collectionOperationIds),
              },
              is_archived: false,
              tenant_id: user.tenant,
            })
            .andWhere(
              ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
              { dayOfMonth }
            )
            .getRawOne();
          const totalNegShareVehicle =
            negSharedVehicle && negSharedVehicle?.totalQuantity
              ? +negSharedVehicle?.totalQuantity
              : 0;

          const posSharedVehicle = await this.resourceSharingsRepository
            .createQueryBuilder('resource_sharing')
            .select('SUM(resource_sharing.quantity)', 'totalQuantity')

            .where({
              share_type: 3,
              to_collection_operation_id: {
                id: In(collectionOperationIds),
              },
              is_archived: false,
              tenant_id: user.tenant,
            })
            .andWhere(
              ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
              { dayOfMonth }
            )

            .getRawOne();

          const totalPositiveSharedVehicle =
            posSharedVehicle && posSharedVehicle?.totalQuantity
              ? +posSharedVehicle?.totalQuantity
              : 0;

          net_total_shared_vehicles =
            totalPositiveSharedVehicle - totalNegShareVehicle;
        }

        //  devices
        let net_total_shared_devices: any;
        const sharedDevices = await this.resourceSharingsRepository
          .createQueryBuilder('resource_sharing')
          .select('SUM(resource_sharing.quantity)', 'totalQuantity')

          .where({
            share_type: 1,
            is_archived: false,
            tenant_id: user.tenant,
          })
          .andWhere(
            ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
            { dayOfMonth }
          )
          .getRawOne();

        net_total_shared_devices =
          sharedDevices && sharedDevices?.totalQuantity
            ? +sharedDevices?.totalQuantity
            : 0;
        if (organizational_levels) {
          const negSharedDevice = await this.resourceSharingsRepository
            .createQueryBuilder('resource_sharing')
            .select('SUM(resource_sharing.quantity)', 'totalQuantity')
            .where({
              share_type: 1,
              is_archived: false,
              tenant_id: user.tenant,
              from_collection_operation_id: {
                id: In(collectionOperationIds),
              },
            })
            .andWhere(
              ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
              { dayOfMonth }
            )
            .getRawOne();

          const totalNegShareDevice =
            negSharedDevice && negSharedDevice?.totalQuantity
              ? +negSharedDevice?.totalQuantity
              : 0;

          const posSharedDevice = await this.resourceSharingsRepository
            .createQueryBuilder('resource_sharing')
            .select('SUM(resource_sharing.quantity)', 'totalQuantity')
            .where({
              share_type: 1,
              to_collection_operation_id: {
                id: In(collectionOperationIds),
              },
              is_archived: false,
              tenant_id: user.tenant,
            })
            .andWhere(
              ':dayOfMonth BETWEEN resource_sharing.start_date AND resource_sharing.end_date',
              { dayOfMonth }
            )
            .getRawOne();

          const totalPositiveSharedDevice =
            posSharedDevice && posSharedDevice?.totalQuantity
              ? +posSharedDevice?.totalQuantity
              : 0;

          net_total_shared_devices =
            totalPositiveSharedDevice - totalNegShareDevice;
        }

        ///  final response count
        countData = {
          date: dayOfMonth,
          goal_products: +goal_products,
          goal_procedures: +goal_procedures,
          actual_products,
          actual_procedures,
          net_total_shared_staff,
          net_total_shared_devices,
          net_total_shared_vehicles,
        };

        const driveCondition = `drives.is_archived = false AND drives.is_blueprint = false AND drives.date = '${dayOfMonth}' AND drives.tenant_id = ${tenant_id} ${
          operation_status_id
            ? `AND drives.operation_status_id = ${operationStatus.operation_status_id}`
            : ''
        }`;
        const query: any = this.drivesRepository
          .createQueryBuilder('drives')
          .select(
            `(  SELECT JSON_BUILD_OBJECT(
              'oef_procedures', drives.oef_procedures,
              'oef_products', drives.oef_products,
              'id', drives.id,
              'created_at', drives.created_at,
              'is_archived', drives.is_archived,
              'name', drives.name,
              'oef_products' , drives.oef_products,
              'oef_procedures' , drives.oef_procedures,
              'account_id', drives.account_id,
              'location_id', drives.location_id,
              'is_linkable', drives.is_linkable,
              'is_linked', drives.is_linked,
              'date', drives.date,
              'is_multi_day_drive', drives.is_multi_day_drive,
              'tenant_id', drives.tenant_id,
              'promotion_id', drives.promotion_id,
              'operation_status_id', JSON_BUILD_OBJECT(
                'id', operations_status.id,
                'name', operations_status.name,
                'chip_color', operations_status.chip_color
              ),
              'recruiter_id', drives.recruiter_id,
              'shifts',(
                SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', shifts.id,
                    'start_time', shifts.start_time,
                    'end_time', shifts.end_time,
                    'vehicles', (
                      SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'shift_id', shifts_vehicles.shift_id,
                          'vehicle_id', JSON_BUILD_OBJECT(
                            'id', vehicle.id,
                            'name', vehicle.name
                          )
                        )
                      )
                      FROM "shifts_vehicles" AS shifts_vehicles
                      LEFT JOIN "vehicle" AS vehicle
                        ON vehicle.id = shifts_vehicles.vehicle_id AND vehicle.is_archived = FALSE
                      WHERE shifts_vehicles.shift_id = shifts.id AND shifts_vehicles.is_archived = FALSE
                    )
                    )
                )
                FROM "shifts" AS shifts
                WHERE shifts.shiftable_id = drives.id AND shifts.is_archived = FALSE AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            ),
              'drive_contacts', (
                SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', drives_contacts.id,
                    'accounts_contacts_id', drives_contacts.accounts_contacts_id,
                    'drive_id', drives_contacts.drive_id,
                    'role_id', drives_contacts.role_id,
                    'role', (
                      SELECT JSON_BUILD_OBJECT(
                        'id', contacts_roles.id,
                        'name', contacts_roles.name
                      )
                      FROM contacts_roles
                      WHERE contacts_roles.id = drives_contacts.role_id
                      AND contacts_roles.name = 'Primary Chairperson'
                    ),
                    'account_contacts', (
                      SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'contactable_id', account_contacts.id,
                          'contactable_type', account_contacts.contactable_type,
                          'contactable_data', (
                            SELECT JSON_AGG(
                              JSON_BUILD_OBJECT(
                                'data', contact.data,
                                'is_primary', contact.is_primary,
                                'contact_type', contact.contact_type
                              )
                            )
                            FROM contacts contact
                            WHERE contact.contactable_id = account_contacts.record_id
                            AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                            AND (
                              (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                              OR
                              (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                            )
                          )
                        )
                      )
                      FROM account_contacts AS account_contacts
                      WHERE account_contacts.id = drives_contacts.accounts_contacts_id
                    )
                  )
                )
                FROM drives_contacts
                WHERE drives_contacts.drive_id = drives.id AND drives_contacts.is_archived = FALSE
              )
            )
          FROM drives drive
          LEFT JOIN operations_status ON operations_status.id = drives.operation_status_id
          WHERE drive.id = drives.id
          )`,
            'drive'
          )
          .addSelect(
            `(
            SELECT JSON_BUILD_OBJECT(
              'earliest_shift_start_time', MIN(shifts.start_time),
              'latest_shift_return_time', MAX(shifts.end_time),
              'shifts', COUNT(*),
              'total_oef_products', SUM(shifts.oef_products),
                  'total_oef_procedures', SUM(shifts.oef_procedures)
          )
          FROM shifts
          WHERE shifts.shiftable_id = drives.id
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
        )`,
            'shifts_data'
          )

          .addSelect(
            `(Select JSON_BUILD_OBJECT(
    'total_procedure_type_qty', COALESCE(SUM( total_procedure_type_qty), 0),
    'total_product_yield', COALESCE(SUM( total_product_yield), 0),
    'staff_count', COALESCE(SUM(staff_count), 0),
    'vehicle_count', COALESCE(SUM(vehicle_count), 0),
    'device_count', COALESCE(SUM(device_count), 0)
) AS projections
From 
(SELECT 

Max(shifts_projections_staff.procedure_type_qty) as total_procedure_type_qty,
Max(shifts_projections_staff.product_yield) as total_product_yield,
Max(staff_config.qty) as staff_count,
COUNT(distinct shifts_vehicles.vehicle_id) as vehicle_count,
COUNT(distinct shifts_devices.device_id) as device_count

  FROM shifts
  LEFT JOIN shifts_projections_staff ON shifts.id = shifts_projections_staff.shift_id
  LEFT JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
  LEFT JOIN staff_config ON staff_setup.id = staff_config.staff_setup_id
  LEFT JOIN shifts_vehicles ON shifts.id = shifts_vehicles.shift_id
  LEFT JOIN shifts_devices ON shifts.id = shifts_devices.shift_id
  WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
  Group by shifts.id
) AS projections_temp
) As projections`
          )
          .addSelect(
            `(
              SELECT JSON_AGG( JSON_BUILD_OBJECT(
                  'start_time',shifts.start_time,
                  'end_time',shifts.end_time
                )) FROM shifts WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
          )`,
            'shifts_hours'
          )
          .addSelect(
            `(SELECT JSON_BUILD_OBJECT(
              'id', account.id,
              'name', account.name,
              'alternate_name', account.alternate_name,
              'phone', account.phone,
              'website', account.website,
              'facebook', account.facebook,
              'industry_category', account.industry_category,
              'industry_subcategory', account.industry_subcategory,
              'stage', account.stage,
              'source', account.source,
              'collection_operation', account.collection_operation,
              'recruiter', account.recruiter,
              'territory', account.territory,
              'population', account.population,
              'is_active', account.is_active,
              'RSMO', account.rsmo,
              'account_contacts', (
                  SELECT JSON_AGG(
                      JSON_BUILD_OBJECT(
                          'id', account_contacts_id.id,
                          'contactable_id', account_contacts_id.contactable_id,
                          'contactable_type', account_contacts_id.contactable_type,
                          'is_archived', account_contacts_id.is_archived,
                          'role_id', (
                              SELECT JSON_BUILD_OBJECT(
                                  'name', role.name,
                                  'id', role.id
                              )
                              FROM contacts_roles AS role
                              WHERE role.id = account_contacts_id.role_id
                          ),
                          'record_id', (
                              SELECT JSON_BUILD_OBJECT(
                                  'id', record_id.id,
                                  'first_name', record_id.first_name,
                                  'last_name', record_id.last_name,
                                  'contactable_data', (
                                      SELECT JSON_AGG(
                                          JSON_BUILD_OBJECT(
                                              'data', contact.data,
                                              'is_primary', contact.is_primary,
                                              'contact_type', contact.contact_type
                                          )
                                      )
                                      FROM contacts contact
                                      WHERE contact.contactable_id = record_id.id
                                          AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                                          AND (
                                              (contact.is_primary = true AND contact.contact_type BETWEEN '${ContactTypeEnum.WORK_PHONE}' AND '${ContactTypeEnum.OTHER_EMAIL}')
                                          )
                                  )
                              )
                              FROM crm_volunteer AS record_id
                              WHERE record_id.id = account_contacts_id.record_id
                          )
                      )
                  )
                  FROM account_contacts AS account_contacts_id
                  LEFT JOIN contacts_roles AS role ON role.id = account_contacts_id.role_id
                  WHERE account_contacts_id.contactable_id = drives.account_id AND account_contacts_id.contactable_type = '${PolymorphicType.CRM_ACCOUNTS}' AND account_contacts_id.is_archived = FALSE
              )
          ) FROM accounts WHERE accounts.id = drives.account_id)`,
            'account'
          )
          .addSelect(
            `(
            SELECT JSON_BUILD_OBJECT(
                'id', crm_locations.id,
                'created_at', crm_locations.created_at,
                'is_archived', crm_locations.is_archived,
                'name', crm_locations.name,
                'cross_street', crm_locations.cross_street,
                'floor', crm_locations.floor,
                'room', crm_locations.room,
                'room_phone', crm_locations.room_phone,
                'becs_code', crm_locations.becs_code,
                'site_type', crm_locations.site_type,
                'qualification_status', crm_locations.qualification_status,
                'is_active', crm_locations.is_active
            )
            FROM crm_locations
            WHERE crm_locations.id = drives.location_id
        )`,
            'crm_locations'
          )
          .addSelect(
            `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'name', tasks.task_name
              )
            )
            FROM tasks
            WHERE tasks.taskable_id = drives.id AND tasks.taskable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )`,
            'task_names'
          )
          .addSelect(
            `(
          SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'short_name', vehicle.short_name
          ))
          FROM shifts
          LEFT JOIN shifts_vehicles ON shifts.id = shifts_vehicles.shift_id
          LEFT JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
          WHERE shifts.shiftable_id = drives.id
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
        )`,
            'vehicles'
          )
          .addSelect(
            `(
          SELECT JSON_BUILD_OBJECT(
            'first_name', "user"."first_name",
            'last_name', "user"."last_name"
          )
          FROM "user"
          WHERE "user"."id" = drives.recruiter_id
      )`,
            'recruiter'
          )

          .addSelect(
            `(
                SELECT JSON_BUILD_OBJECT(
                  'linked_drive_id', linked_drives.prospective_drive_id,
                    'account_id', linked_drive.account_id,
                    'account_name', linked_account.name
                )
                FROM linked_drives
                LEFT JOIN drives as linked_drive ON linked_drives.prospective_drive_id = linked_drive.id
left join  accounts linked_account on  linked_drive.account_id = linked_account.id
WHERE linked_drives.current_drive_id = drives.id
            )`,
            'linked_drive'
          )

          .addSelect(
            `(
          SELECT JSON_AGG(total_quantity)
          FROM (
            SELECT staff_config.qty as total_quantity
            FROM shifts
  LEFT JOIN shifts_projections_staff ON shifts.id = shifts_projections_staff.shift_id
  LEFT JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
  LEFT JOIN staff_config ON staff_setup.id = staff_config.staff_setup_id
  WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
  GROUP BY shifts.id, staff_config.qty
          ) AS subquery
        )`,
            'staff_setups_count'
          )
          .leftJoin(
            Shifts,
            'shifts',
            `shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.shiftable_id =drives.id`
          )
          .leftJoin('drives.account', 'account')
          .leftJoin(
            'business_units',
            'bu',
            'account.collection_operation = bu.id AND bu.is_archived = false'
          )
          .leftJoin('drives.location', 'crm_locations')
          .leftJoin(
            'shifts_projections_staff',
            'sps',
            `sps.shift_id = shifts.id AND sps.procedure_type_id IN (${uniqueProcedureTypeIds})`
          )
          .andWhere(driveCondition)
          .groupBy('drives.id, account.id');

        if (organizational_levels) {
          const { collection_operations } = JSON.parse(organizational_levels);

          let olWhere = '';
          Object.entries(collection_operations).forEach(([co_id, value]) => {
            olWhere += olWhere ? ' OR ' : '';
            olWhere += `(bu.id = ${co_id}`;
            const { recruiters } = <any>value;
            if (recruiters?.length) {
              olWhere += ` AND account.id IN (${recruiters})`;
            }
            olWhere += ')';
          });
          query.andWhere(`(${olWhere})`);
        }
        if (procedure_type_id || product_id) {
          query.andWhere(
            `sps.procedure_type_id IN (${uniqueProcedureTypeIds})`
          );
        }
        const drives = await this.drivesRepository.query(query.getSql());
        const outsideDrives = drives.filter(
          (drive) => drive.crm_locations.site_type === 'Outside'
        );
        const insideDrives = drives.filter(
          (drive) => drive.crm_locations.site_type === 'Inside'
        );

        const procedureOutsideDrivesCount =
          outsideDrives?.length > 0 ? outsideDrives.length : 0;
        const procedureInsideDrivesCount =
          insideDrives?.length > 0 ? insideDrives.length : 0;
        const productOutsideDrivesCount =
          outsideDrives?.length > 0 ? outsideDrives.length : 0;
        const productInsideDrivesCount =
          insideDrives?.length > 0 ? insideDrives.length : 0;

        const drivesCount = drives?.length;

        // Calculate the sum of staff_count for all drives
        const totalDrivesStaffCount = drives?.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.staff_count !== undefined
          ) {
            return sum + drive.projections.staff_count;
          }
          return sum;
        }, 0);

        // Calculate the sum of staff_count for Inside drives
        const totalInsideDrivesStaffCount =
          insideDrives?.length > 0
            ? insideDrives?.reduce((sum, drive) => {
                if (
                  drive?.projections &&
                  drive?.projections?.staff_count !== undefined
                ) {
                  return sum + drive?.projections.staff_count;
                }
                return sum;
              }, 0)
            : 0;

        // Calculate the sum of staff_count for Outside drives
        const totalOutsideDrivesStaffCount =
          outsideDrives?.length > 0
            ? outsideDrives?.reduce((sum, drive) => {
                if (
                  drive?.projections &&
                  drive?.projections?.staff_count !== undefined
                ) {
                  return sum + drive?.projections.staff_count;
                }
                return sum;
              }, 0)
            : 0;

        // Calculate the sum of vehicle_count for all drives
        const totalDrivesVehicleCount = drives.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.vehicle_count !== undefined
          ) {
            return sum + drive.projections.vehicle_count;
          }
          return sum;
        }, 0);

        // Calculate the sum of vehicle_count for Inside drives
        const totalInsideDrivesVehicleCount =
          insideDrives?.length > 0
            ? insideDrives?.reduce((sum, drive) => {
                if (
                  drive?.projections &&
                  drive?.projections?.vehicle_count !== undefined
                ) {
                  return sum + drive?.projections.vehicle_count;
                }
                return sum;
              }, 0)
            : 0;

        // Calculate the sum of vehicle_count for Outside drives
        const totalOutsideDrivesVehicleCount =
          outsideDrives?.length > 0
            ? outsideDrives?.reduce((sum, drive) => {
                if (
                  drive?.projections &&
                  drive?.projections?.vehicle_count !== undefined
                ) {
                  return sum + drive?.projections.vehicle_count;
                }
                return sum;
              }, 0)
            : 0;

        // Calculate the sum of device_count for all drives
        const totalDrivesDevicesCount = drives.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.device_count !== undefined
          ) {
            return sum + drive.projections.device_count;
          }
          return sum;
        }, 0);

        // Calculate the sum of device_count for Outside drives
        const totalOutsideDrivesDeviceCount =
          outsideDrives?.length > 0
            ? outsideDrives?.reduce((sum, drive) => {
                if (
                  drive?.projections &&
                  drive?.projections?.device_count !== undefined
                ) {
                  return sum + drive?.projections.device_count;
                }
                return sum;
              }, 0)
            : 0;

        // Calculate the sum of device_count for Inside drives
        const totalInsideDrivesDeviceCount =
          insideDrives?.length > 0
            ? insideDrives?.reduce((sum, drive) => {
                if (
                  drive?.projections &&
                  drive?.projections?.device_count !== undefined
                ) {
                  return sum + drive?.projections.device_count;
                }
                return sum;
              }, 0)
            : 0;

        const sessionsQuery = this.sessionsRepository
          .createQueryBuilder('sessions')
          .leftJoinAndSelect(
            'sessions.donor_center',
            'dc',
            'dc.is_archived = false'
          )
          .leftJoinAndSelect(
            'sessions.operation_status',
            'oc',
            'oc.is_archived = false'
          )
          .addSelect(
            `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'name', tasks.task_name
              )
            )
            FROM tasks
            WHERE tasks.taskable_id = sessions.id AND tasks.taskable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
            )`,
            'task_names'
          )
          .addSelect(
            `(
            SELECT JSON_BUILD_OBJECT(
              'earliest_shift_start_time', MIN(shifts.start_time),
              'latest_shift_return_time', MAX(shifts.end_time),
              'shifts', COUNT(*),
              'total_oef_products', SUM(shifts.oef_products),
                  'total_oef_procedures', SUM(shifts.oef_procedures)
          )
          FROM shifts
          WHERE shifts.shiftable_id = sessions.id
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
        )`,
            'shifts_data'
          )

          .addSelect(
            `(Select JSON_BUILD_OBJECT(
            'total_procedure_type_qty', COALESCE(SUM( total_procedure_type_qty), 0),
            'total_product_yield', COALESCE(SUM( total_product_yield), 0),
            'staff_count', COALESCE(SUM(staff_count), 0),
            'vehicle_count', COALESCE(SUM(vehicle_count), 0),
            'device_count', COALESCE(SUM(device_count), 0)
        ) AS projections
        From 
        (SELECT 
        
        Max(shifts_projections_staff.procedure_type_qty) as total_procedure_type_qty,
        Max(shifts_projections_staff.product_yield) as total_product_yield,
        Max(staff_config.qty) as staff_count,
        COUNT(distinct shifts_vehicles.vehicle_id) as vehicle_count,
        COUNT(distinct shifts_devices.device_id) as device_count
        
          FROM shifts
          LEFT JOIN shifts_projections_staff ON shifts.id = shifts_projections_staff.shift_id
          LEFT JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
          LEFT JOIN staff_config ON staff_setup.id = staff_config.staff_setup_id
          LEFT JOIN shifts_vehicles ON shifts.id = shifts_vehicles.shift_id
          LEFT JOIN shifts_devices ON shifts.id = shifts_devices.shift_id
          WHERE shifts.shiftable_id = sessions.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
          Group by shifts.id
        ) AS projections_temp
        ) As projections`
          )

          .addSelect(
            `(
          SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'short_name', vehicle.short_name
          ))
          FROM shifts
          LEFT JOIN shifts_vehicles ON shifts.id = shifts_vehicles.shift_id
          LEFT JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
          WHERE shifts.shiftable_id = sessions.id
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
        )`,
            'vehicles'
          )
          .addSelect(
            `(
          SELECT JSON_AGG(total_quantity)
          FROM (
            SELECT staff_config.qty as total_quantity
            FROM shifts
  LEFT JOIN shifts_projections_staff ON shifts.id = shifts_projections_staff.shift_id
  LEFT JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
  LEFT JOIN staff_config ON staff_setup.id = staff_config.staff_setup_id
  WHERE shifts.shiftable_id = sessions.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
  GROUP BY shifts.id, staff_config.qty
          ) AS subquery
        )`,
            'staff_setups_count'
          )

          .leftJoin(
            'shifts',
            'shifts',
            `shifts.shiftable_id = sessions.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
          )
          .leftJoin(
            'shifts_projections_staff',
            'sps',
            `sps.shift_id = shifts.id AND sps.procedure_type_id IN (${uniqueProcedureTypeIds})`
          )
          .leftJoinAndSelect(
            'business_units',
            'bu',
            'dc.collection_operation = bu.id AND bu.is_archived = false'
          )

          .where({
            tenant: user.tenant,
            is_archived: false,
            date: Between(startOfDay, endOfDay),
          });

        if (organizational_levels) {
          sessionsQuery.andWhere(
            organizationalLevelWhere(
              organizational_levels,
              'bu.id',
              null,
              'dc.id'
            )
          );
        }
        if (organizational_levels) {
          const { collection_operations } = JSON.parse(organizational_levels);
          let olWhere = '';
          const params = {};
          Object.entries(collection_operations).forEach(
            ([co_id, value], index) => {
              olWhere += olWhere ? ' OR ' : '';
              olWhere += `(bu.id = :co_id${index}`;
              params[`co_id${index}`] = co_id;
              const { donor_centers } = <any>value;
              if (donor_centers?.length) {
                olWhere += ` AND dc.id IN (:...donor_centers${index})`;
                params[`donor_centers${index}`] = donor_centers;
              }
              olWhere += ')';
            }
          );
          sessionsQuery.andWhere(`(${olWhere})`, params);
        }
        if (procedure_type_id || product_id) {
          sessionsQuery.andWhere(
            `sps.procedure_type_id IN (${uniqueProcedureTypeIds})`
          );
        }
        sessionsQuery.groupBy('sessions.id, dc.id, oc.id, bu.id');
        const sessions = await sessionsQuery.getRawMany();
        const sessionsCount = sessions?.length;

        const totalSesionsStaffCount = sessions.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.staff_count !== undefined
          ) {
            return sum + drive.projections.staff_count;
          }
          return sum;
        }, 0);
        // Calculate the sum of staff_count for all drives
        const totalSessionsVehicleCount = sessions.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.vehicle_count !== undefined
          ) {
            return sum + drive.projections.vehicle_count;
          }
          return sum;
        }, 0);

        const totalSessionsDevicesCount = sessions.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.device_count !== undefined
          ) {
            return sum + drive.projections.device_count;
          }
          return sum;
        }, 0);
        const nceQuery: any = this.nonCollectionEventsRepository
          .createQueryBuilder('oc_non_collection_events')
          .select([
            'oc_non_collection_events.id AS id',
            'oc_non_collection_events.date AS date',
            'oc_non_collection_events.event_name AS name',
          ])
          .addSelect(
            `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'name', tasks.task_name
              )
            ) AS task_names
            FROM tasks
            WHERE tasks.taskable_id = oc_non_collection_events.id AND tasks.taskable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
            )`
          )
          .addSelect(
            `(
            SELECT JSON_BUILD_OBJECT(
              'earliest_shift_start_time', MIN(shifts.start_time),
              'latest_shift_return_time', MAX(shifts.end_time),
              'shifts', COUNT(*),
              'total_oef_products', SUM(shifts.oef_products),
                  'total_oef_procedures', SUM(shifts.oef_procedures)
          )
          FROM shifts
          WHERE shifts.shiftable_id = oc_non_collection_events.id
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
        )`,
            'shifts_data'
          )

          .addSelect(
            `(Select JSON_BUILD_OBJECT(
            'total_procedure_type_qty', COALESCE(SUM( total_procedure_type_qty), 0),
            'total_product_yield', COALESCE(SUM( total_product_yield), 0),
            'staff_count', COALESCE(SUM(staff_count), 0),
            'vehicle_count', COALESCE(SUM(vehicle_count), 0),
            'device_count', COALESCE(SUM(device_count), 0)
        ) AS projections
        From 
        (SELECT 
        
        Max(shifts_projections_staff.procedure_type_qty) as total_procedure_type_qty,
        Max(shifts_projections_staff.product_yield) as total_product_yield,
        Max(staff_config.qty) as staff_count,
        COUNT(distinct shifts_vehicles.vehicle_id) as vehicle_count,
        COUNT(distinct shifts_devices.device_id) as device_count
        
          FROM shifts
          LEFT JOIN shifts_projections_staff ON shifts.id = shifts_projections_staff.shift_id
          LEFT JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
          LEFT JOIN staff_config ON staff_setup.id = staff_config.staff_setup_id
          LEFT JOIN shifts_vehicles ON shifts.id = shifts_vehicles.shift_id
          LEFT JOIN shifts_devices ON shifts.id = shifts_devices.shift_id
          WHERE shifts.shiftable_id = oc_non_collection_events.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
          Group by shifts.id
        ) AS projections_temp
        ) As projections`
          )
          .addSelect(
            `(
          SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'short_name', vehicle.short_name
          ))
          FROM shifts
          LEFT JOIN shifts_vehicles ON shifts.id = shifts_vehicles.shift_id
          LEFT JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
          WHERE shifts.shiftable_id = oc_non_collection_events.id
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
        )`,
            'vehicles'
          )
          .addSelect(
            `(
          SELECT JSON_AGG(total_quantity)
          FROM (
            SELECT staff_config.qty as total_quantity
            FROM shifts
  LEFT JOIN shifts_projections_staff ON shifts.id = shifts_projections_staff.shift_id
  LEFT JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
  LEFT JOIN staff_config ON staff_setup.id = staff_config.staff_setup_id
  WHERE shifts.shiftable_id = oc_non_collection_events.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'
  GROUP BY shifts.id, staff_config.qty
          ) AS subquery
        )`,
            'staff_setups_count'
          )
          .addSelect(
            `(
          SELECT JSON_BUILD_OBJECT(
              'id', crm_locations.id,
              'created_at', crm_locations.created_at,
              'is_archived', crm_locations.is_archived,
              'name', crm_locations.name,
              'cross_street', crm_locations.cross_street,
              'floor', crm_locations.floor,
              'room', crm_locations.room,
              'room_phone', crm_locations.room_phone,
              'becs_code', crm_locations.becs_code,
              'site_type', crm_locations.site_type,
              'qualification_status', crm_locations.qualification_status,
              'is_active', crm_locations.is_active
          )
          FROM crm_locations
          WHERE crm_locations.id = oc_non_collection_events.location_id
      )`,
            'crm_locations'
          )
          .addSelect(
            `(SELECT JSON_BUILD_OBJECT(
            'operation_status_id', (SELECT JSON_BUILD_OBJECT(
              'id', operations_status.id,
              'name', operations_status.name,
              'chip_color',operations_status.chip_color
            ) FROM operations_status WHERE operations_status.id = oc_non_collection_events.status_id)
          )) AS status`
          )
          .addSelect(
            `(SELECT JSON_BUILD_OBJECT(
            'non_collection_profile', (SELECT JSON_BUILD_OBJECT(
              'id', crm_non_collection_profiles.id,
              'name', crm_non_collection_profiles.profile_name
            ) FROM crm_non_collection_profiles WHERE crm_non_collection_profiles.id = oc_non_collection_events.non_collection_profile_id)
          )) AS ncp`
          )
          .leftJoin(
            'shifts',
            'shifts',
            `shifts.shiftable_id = oc_non_collection_events.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
          )
          .leftJoin(
            'nce_collection_operations',
            'nce_collection_operations',
            'nce_collection_operations.nce_id = oc_non_collection_events.id'
          )
          .leftJoin(
            'shifts_projections_staff',
            'sps',
            `sps.shift_id = shifts.id AND sps.procedure_type_id IN (${uniqueProcedureTypeIds})`
          )
          .where(`oc_non_collection_events.tenant_id = ${user.tenant.id}`);

        nceQuery.andWhere(
          `oc_non_collection_events.is_archived = false AND oc_non_collection_events.date = '${dayOfMonth}' ${
            operation_status_id
              ? `AND oc_non_collection_events.status_id = ${operationStatus.operation_status_id}`
              : ''
          }`
        );

        if (organizational_levels) {
          const { collection_operations } = JSON.parse(organizational_levels);

          const coIds = Object.keys(collection_operations).map(
            (co_id) => +co_id
          );

          if (coIds.length > 0) {
            nceQuery.andWhere(
              `nce_collection_operations.business_unit_id IN (${coIds})`
            );
          }
        }
        if (procedure_type_id || product_id) {
          nceQuery.andWhere(
            `sps.procedure_type_id IN (${uniqueProcedureTypeIds})`
          );
        }
        nceQuery
          .orderBy('oc_non_collection_events.id', 'DESC')
          .groupBy('oc_non_collection_events.id')
          .getQuery();

        const nce = await this.nonCollectionEventsRepository.query(
          nceQuery.getSql()
        );

        const nceCount = nce?.length;

        const totalNceStaffCount = nce.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.staff_count !== undefined
          ) {
            return sum + drive.projections.staff_count;
          }
          return sum;
        }, 0);
        // Calculate the sum of staff_count for all drives
        const totalNceVehicleCount = nce.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.vehicle_count !== undefined
          ) {
            return sum + drive.projections.vehicle_count;
          }
          return sum;
        }, 0);

        const totalNceDevicesCount = nce.reduce((sum, drive) => {
          if (
            drive.projections &&
            drive.projections.device_count !== undefined
          ) {
            return sum + drive.projections.device_count;
          }
          return sum;
        }, 0);

        const scheduled_products = drivesCount + sessionsCount;
        const scheduled_procedures = drivesCount + sessionsCount;
        const booked_staff =
          totalNceStaffCount + totalSesionsStaffCount + totalDrivesStaffCount;
        const devices_booked =
          totalNceDevicesCount +
          totalSessionsDevicesCount +
          totalDrivesDevicesCount;
        const vehicles_booked =
          totalNceVehicleCount +
          totalSessionsVehicleCount +
          totalDrivesVehicleCount;
        const staff_available = totalStaffCount - booked_staff;
        const vehicles_available = totalVehicleCount - vehicles_booked;
        const devices_available = totalDeviceCount - devices_booked;
        response.push({
          ...countData,
          procedureOutsideDrivesCount,
          procedureInsideDrivesCount,
          productOutsideDrivesCount,
          productInsideDrivesCount,
          total_drives: drivesCount,
          total_sessions: sessionsCount,
          total_events: nceCount,
          scheduled_products,
          scheduled_procedures,
          staff_booked: booked_staff,
          devices_booked: devices_booked,
          vehicles_booked: vehicles_booked,
          staff_available: staff_available,
          vehicles_available: vehicles_available,
          devices_available: devices_available,
          totalOutsideDrivesStaffCount,
          totalInsideDrivesStaffCount,
          totalOutsideDrivesVehicleCount,
          totalInsideDrivesVehicleCount,
          totalInsideDrivesDeviceCount,
          totalOutsideDrivesDeviceCount,
          totalNceStaffCount,
          totalSesionsStaffCount,
          totalDrivesStaffCount,
          totalDrivesDevicesCount,
          totalSessionsDevicesCount,
          totalNceDevicesCount,
          totalDrivesVehicleCount,
          totalSessionsVehicleCount,
          totalNceVehicleCount,
          nce: nce,
          drives,
          sessions,
          tenant_id: user?.tenant?.id,
        });
      }

      return resSuccess(
        'Monthly calender view data fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Operations-Center Calender Monthly View   >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findProcedureTypeProducts(procedureTypeId: any) {
    try {
      const products = await this.procedureTypesRepository
        .createQueryBuilder('procedureType')
        .leftJoinAndSelect('procedureType.products', 'product')
        .where('procedureType.id = :procedureTypeId', { procedureTypeId })
        .getRawMany();
      return resSuccess(
        'Procedure-type-products feteched successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        products
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Operations-Center Calender Monthly View Procedure Type Products   >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
