import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, In, Not, LessThan } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import {
  resError,
  resSuccess,
} from '../../system-configuration/helpers/response';
import { ErrorConstants } from '../../system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { HistoryService } from '../../common/services/history.service';
import moment from 'moment';
import { ShiftsHistory } from '../entities/shifts-history.entity';
import { Shifts } from '../entities/shifts.entity';
import { QueryRunner } from 'typeorm/browser';
import { ShiftsDto } from '../dto/shifts.dto';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { ShiftsProjectionsStaff } from '../entities/shifts-projections-staff.entity';
import { ShiftsVehicles } from '../entities/shifts-vehicles.entity';
import { ShiftsDevices } from '../entities/shifts-devices.entity';
import { ShiftsStaffSetups } from '../entities/shifts-staffsetups.entity';
import { ShiftsSlots } from '../entities/shifts-slots.entity';
import { HistoryReason } from 'src/common/enums/history_reason.enum';
import { ShiftsProjectionsStaffHistory } from '../entities/shifts-projections-staff-history.entity';
import { ShiftsStaffSetupsHistory } from '../entities/shifts-staffsetups-history.entity';
import { ShiftsVehiclesHistory } from '../entities/shifts-vehicles-history.entity';
import { ShiftsSlotsHistory } from '../entities/shifts-slots-history.entity';
import { ShiftsDevicesHistory } from '../entities/shifts-devices-history.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { ProcedureTypesProducts } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types-products.entity';
import { Products } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import _, { isInteger } from 'lodash';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Address } from '../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { differenceInMinutes } from 'date-fns';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';

dotenv.config();

@Injectable()
export class ShiftsService extends HistoryService<ShiftsHistory> {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
    @InjectRepository(Drives)
    private readonly drivesRepo: Repository<Drives>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationRepo: Repository<CrmLocations>,
    @InjectRepository(ProcedureTypesProducts)
    private readonly procedureTypesProductsRepo: Repository<ProcedureTypesProducts>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(StaffSetup)
    private readonly staffSetupRepo: Repository<StaffSetup>,
    @InjectRepository(ShiftsProjectionsStaffHistory)
    private readonly shiftsProjectionsStaffHistoryRepo: Repository<ShiftsProjectionsStaffHistory>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRepo: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(ShiftsDevices)
    private readonly shiftDeviceRepo: Repository<ShiftsDevices>,
    @InjectRepository(ShiftsSlots)
    private readonly shiftsSlotsRepo: Repository<ShiftsSlots>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftsVehiclesRepo: Repository<ShiftsVehicles>,
    @InjectRepository(ShiftsSlotsHistory)
    private readonly shiftsSlotsHistoryRepo: Repository<ShiftsSlotsHistory>,
    @InjectRepository(ShiftsStaffSetups)
    private readonly shiftsStaffSetupRepo: Repository<ShiftsStaffSetups>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Vehicle)
    private readonly vehiceRepository: Repository<Vehicle>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ShiftsHistory)
    private readonly shiftsHistory: Repository<ShiftsHistory>,
    private readonly entityManager: EntityManager
  ) {
    super(shiftsHistory);
  }

  async createShiftByShiftAble(
    body,
    queryRunner: QueryRunner,
    shifts: ShiftsDto[],
    data: any,
    created_by: User,
    tenant_id,
    shiftable_type: PolymorphicType,
    hasVehicles: boolean,
    hasSlots: boolean,
    start = moment(),
    end = moment()
  ) {
    for (let i = 0; i < shifts.length; i++) {
      const shiftItem = shifts[i];
      if (moment(shiftItem.start_time).isSameOrBefore(start)) {
        start = moment(shiftItem.start_time);
      }
      if (moment(shiftItem.end_time).isSameOrAfter(end)) {
        end = moment(shiftItem.end_time);
      }
      const shift = new Shifts();
      shift.shiftable_id = data.id;
      shift.shiftable_type = shiftable_type;
      shift.start_time = shiftItem.start_time;
      shift.end_time = shiftItem.end_time;
      if (shiftItem?.break_start_time) {
        shift.break_start_time =
          shiftItem.break_start_time != ''
            ? new Date(shiftItem.break_start_time)
            : null;
      }
      if (shiftItem?.break_end_time) {
        shift.break_end_time =
          shiftItem.break_end_time != ''
            ? new Date(shiftItem.break_end_time)
            : null;
      }

      shift.created_by = created_by;
      shift.created_at = new Date();
      shift.oef_procedures = shiftItem.oef_procedures;
      shift.oef_products = shiftItem.oef_products;
      shift.reduce_slots = shiftItem.reduce_slots;
      shift.reduction_percentage = shiftItem.reduction_percentage;
      shift.tenant_id = tenant_id;
      shift.shift_number = i + 1;
      await queryRunner.manager.save(shift);
      shiftItem.id = shift.id;
      for (const projectionItem of shiftItem.projections) {
        for (const staffSetup of projectionItem.staff_setups) {
          const projection = new ShiftsProjectionsStaff();
          projection.procedure_type_id = projectionItem.procedure_type_id;
          projection.procedure_type_qty = projectionItem.procedure_type_qty;
          projection.product_yield = projectionItem.product_yield;
          projection.shift = shift;
          projection.staff_setup_id = staffSetup;
          projection.created_by = created_by;
          projection.created_at = new Date();
          await queryRunner.manager.save(projection);
          const shiftstaff = new ShiftsStaffSetups();
          shiftstaff.shift_id = shift;
          shiftstaff.staff_setup_id = staffSetup;
          shiftstaff.created_by = created_by;
          await queryRunner.manager.save(shiftstaff);
        }
      }

      if (hasVehicles)
        for (const vehicle of shiftItem.vehicles) {
          const shiftVehicle = new ShiftsVehicles();
          shiftVehicle.shift = shift;
          shiftVehicle.vehicle_id = vehicle;
          shiftVehicle.created_by = created_by;
          await queryRunner.manager.save(shiftVehicle);
        }

      if (hasSlots) {
        for (const slots of body.slots[i.toString()]) {
          for (const time of slots.items) {
            const saveSlots = new ShiftsSlots();
            saveSlots.shift_id = shift.id;
            saveSlots.procedure_type_id = slots.procedure_type_id;
            saveSlots.bed = time.bed;
            saveSlots.staff_setup_id = slots.staff_setup_id;
            saveSlots.created_by = created_by;
            saveSlots.start_time = time.startTime;
            saveSlots.end_time = time.endTime;
            saveSlots.tenant_id = tenant_id;
            await queryRunner.manager.save(saveSlots);
          }
        }
      }

      for (const device of shiftItem.devices) {
        const shiftDevice = new ShiftsDevices();
        shiftDevice.shift = shift;
        shiftDevice.device_id = device;
        shiftDevice.created_by = created_by;
        await queryRunner.manager.save(shiftDevice);
      }
    }
    return shifts;
  }

  async duplicateShiftById(queryRunner: QueryRunner, blueprint, id, tenant_id) {
    const findShifts = await this.shiftsRepository.find({
      where: {
        shiftable_id: id,
        shiftable_type: 'crm_donor_center_blueprints',
      },
      relations: ['created_by', 'tenant'],
    });
    for (const shiftItem of findShifts) {
      const shift = new Shifts();
      shift.shiftable_id = blueprint.id;
      shift.shiftable_type = 'crm_donor_center_blueprints';
      shift.start_time = shiftItem?.start_time;
      shift.end_time = shiftItem?.end_time;

      shift.break_start_time = shiftItem?.break_start_time;

      shift.break_end_time = shiftItem?.break_end_time;
      shift.created_by = blueprint?.created_by;
      shift.oef_procedures = shiftItem?.oef_procedures;
      shift.oef_products = shiftItem?.oef_products;
      shift.reduce_slots = shiftItem?.reduce_slots;
      shift.reduction_percentage = shiftItem?.reduction_percentage;
      shift.tenant_id = blueprint?.tenant_id;

      const newShift = await queryRunner.manager.save(shift);

      const findProjectionStaff = await this.shiftsProjectionsStaffRepo.find({
        where: {
          shift: { id: shiftItem.id },
        },
        relations: ['procedure_type', 'staff_setup'],
      });

      if (findProjectionStaff?.length == 0) {
        return resError('No ProjectionStaff found', ErrorConstants.Error, 400);
      }

      for (const projectionItem of findProjectionStaff) {
        const projection = new ShiftsProjectionsStaff();
        projection.procedure_type_id = projectionItem.procedure_type_id;
        projection.procedure_type_qty = projectionItem.procedure_type_qty;
        projection.product_yield = projectionItem.product_yield;
        projection.shift_id = newShift.id;
        projection.staff_setup_id = projectionItem.staff_setup_id;
        projection.created_by = blueprint.created_by;
        await queryRunner.manager.save(projection);
      }

      const findShiftStaffSetup = await this.shiftsStaffSetupRepo.find({
        where: {
          shift_id: shiftItem?.id as any,
        },
        relations: ['staff_setup_id'],
      });

      if (findShiftStaffSetup?.length == 0) {
        return resError('No ShiftStaffSetup found', ErrorConstants.Error, 400);
      }
      for (const staffItem of findShiftStaffSetup) {
        const shiftstaff = new ShiftsStaffSetups();
        shiftstaff.shift_id = newShift;
        shiftstaff.staff_setup_id = staffItem.staff_setup_id;
        shiftstaff.created_by = blueprint.created_by;
        await queryRunner.manager.save(shiftstaff);
      }

      const findShiftSlots = await this.shiftsSlotsRepo.find({
        where: {
          shift: { id: shiftItem.id },
        },
        relations: ['shift', 'procedure_type', 'donors', 'appointments'],
      });
      if (findShiftSlots?.length == 0) {
        for (const slots of findShiftSlots) {
          const saveSlots = new ShiftsSlots();
          saveSlots.shift_id = newShift.id;
          saveSlots.procedure_type_id = slots.procedure_type_id;
          saveSlots.created_by = blueprint.created_by;
          saveSlots.start_time = slots.start_time;
          saveSlots.appointments = slots.appointments;
          saveSlots.end_time = slots.end_time;
          saveSlots.tenant_id = tenant_id;
          await queryRunner.manager.save(saveSlots);
        }
      }

      const findShiftDevices = await this.shiftDeviceRepo.find({
        where: {
          shift_id: shiftItem?.id,
        },
        relations: ['device'],
      });

      for (const device of findShiftDevices) {
        const shiftDevice = new ShiftsDevices();
        shiftDevice.shift = newShift;
        shiftDevice.device_id = device.device_id;
        shiftDevice.created_by = blueprint.created_by;
        await queryRunner.manager.save(shiftDevice);
      }
    }
  }

  async createShiftHistory(
    shiftable_id: bigint,
    shiftable_type: PolymorphicType,
    history_reson: HistoryReason
  ) {
    const shifts = await this.shiftsRepository.find({
      where: {
        shiftable_id,
        shiftable_type,
      },
      relations: [
        'projections',
        'projections.created_by',
        'staff_setups',
        'staff_setups.created_by',
        'vehicles',
        'vehicles.created_by',
        'slots',
        'slots.created_by',
        'devices',
        'devices.created_by',
        'created_by',
      ],
    });

    for (const shiftItem of shifts) {
      const shiftItemHistory = new ShiftsHistory();
      Object.assign(shiftItemHistory, shiftItem);
      shiftItemHistory.history_reason = history_reson;
      shiftItemHistory.tenant_id = shiftItem.tenant_id;
      shiftItemHistory.created_by = shiftItem.created_by.id;
      await this.createHistory(shiftItemHistory);
      for (const projectionItem of shiftItem.projections) {
        const projectionItemHistory = new ShiftsProjectionsStaffHistory();
        Object.assign(projectionItemHistory, projectionItem);
        projectionItemHistory.history_reason = history_reson;
        projectionItemHistory.created_by = projectionItem.created_by.id;
        await this.entityManager.save(projectionItemHistory);
      }

      for (const staffSetup of shiftItem.staff_setups) {
        const staffSetupHistory = new ShiftsStaffSetupsHistory();
        Object.assign(staffSetupHistory, staffSetup);
        staffSetupHistory.shift_id = shiftItem.id;
        staffSetupHistory.history_reason = history_reson;
        staffSetupHistory.created_by = staffSetup.created_by.id;
        await this.entityManager.save(staffSetupHistory);
      }
      for (const vehicle of shiftItem.vehicles) {
        const shiftVehicleHistory = new ShiftsVehiclesHistory();
        Object.assign(shiftVehicleHistory, vehicle);
        shiftVehicleHistory.history_reason = history_reson;
        shiftVehicleHistory.created_by = vehicle.created_by.id;
        await this.entityManager.save(shiftVehicleHistory);
      }

      for (const slot of shiftItem.slots) {
        const slotHistory = new ShiftsSlotsHistory();
        Object.assign(slotHistory, slot);
        slotHistory.history_reason = history_reson;
        slotHistory.created_by = slot.created_by.id;
        await this.entityManager.save(slotHistory);
      }

      for (const device of shiftItem.devices) {
        const shiftDeviceHistory = new ShiftsDevicesHistory();
        Object.assign(shiftDeviceHistory, device);
        shiftDeviceHistory.history_reason = history_reson;
        shiftDeviceHistory.created_by = device.created_by.id;
        await this.entityManager.save(shiftDeviceHistory);
      }
    }
  }

  async editShift(
    queryRunner: QueryRunner,
    body: any,
    slots,
    shiftable_id: any,
    shiftable_type: PolymorphicType,
    history_reson: HistoryReason,
    created_by,
    tenant_id,
    updateDto?,
    operationDate?
  ) {
    const operationDateDto =
      shiftable_type == PolymorphicType.OC_OPERATIONS_DRIVES ||
      shiftable_type == PolymorphicType.OC_OPERATIONS_SESSIONS
        ? updateDto?.date
        : null;
    body = body.sort((a, b) => a.id - b.id);
    if (updateDto?.remove_shift?.length > 0) {
      for (const rev of updateDto?.remove_shift) {
        if (rev?.shift_id) {
          const findShift = await this.shiftsRepository.findOne({
            where: {
              id: rev?.shift_id,
            },
          });
          findShift.is_archived = true;
          await this.shiftsRepository.save(findShift);
        }
        const findProjection = await this.shiftsProjectionsStaffRepo.findOne({
          where: {
            shift_id: rev?.shift_id,
          },
        });
        let archivedata = new ShiftsProjectionsStaff();
        archivedata = findProjection;
        archivedata.is_archived = true;
        archivedata.created_at = new Date();
        archivedata.created_by = created_by;
        await this.shiftsProjectionsStaffRepo.save(archivedata);
        const findSlots = await this.shiftsSlotsRepo.find({
          where: {
            shift_id: rev?.shift_id,
          },
        });
        if (findSlots?.length > 0) {
          for (const slot of findSlots) {
            let slots = new ShiftsSlots();
            slots = slot;
            slots.is_archived = true;
            slots.created_at = new Date();
            slots.created_by = created_by;
            slots.tenant_id = tenant_id;
            await queryRunner.manager.save(slots);
          }
        }
      }
    }

    const shifts = await this.shiftsRepository.find({
      where: {
        shiftable_id,
        shiftable_type,
        is_archived: false,
        tenant_id,
        slots: {
          is_archived: false,
        },
      },
      relations: [
        'projections',
        'projections.procedure_type',
        'projections.created_by',
        'staff_setups',
        'staff_setups.created_by',
        'vehicles',
        'vehicles.created_by',
        'slots',
        'slots.procedure_type',
        'slots.created_by',
        'devices',
        'devices.created_by',
        'created_by',
        'projections.procedure_type.procedure_types_products',
        'projections.procedure_type.procedure_types_products.products',
      ],
      order: {
        id: 'ASC',
        slots: {
          start_time: 'ASC',
        },
      },
    });
    let i = 0;

    let shiftChanges = [];

    if (
      shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
      shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
    )
      shiftChanges = await this.monitorShiftsChanges(
        shifts,
        body,
        created_by,
        shiftable_type,
        updateDto?.remove_shift
      );
    for (const shiftItem of body) {
      let isNewShift = false;
      let new_data_of_Shifts = null;

      if (shiftItem?.shift_id) {
        const shiftsbody = await this.shiftsRepository
          .createQueryBuilder('shift')
          .where('shift.id = :id', { id: shiftItem?.shift_id })
          .leftJoinAndSelect('shift.created_by', 'created_by')
          .getOne();

        shiftsbody.shiftable_id = shiftable_id;
        shiftsbody.shiftable_type = shiftable_type;
        shiftsbody.start_time = new Date(shiftItem?.start_time);
        shiftsbody.end_time = new Date(shiftItem?.end_time);
        if (shiftItem.break_start_time) {
          shiftsbody.break_start_time =
            shiftItem.break_start_time != ''
              ? new Date(shiftItem.break_start_time)
              : null;
        } else {
          shiftsbody.break_start_time = null;
        }
        if (shiftItem.break_end_time) {
          shiftsbody.break_end_time =
            shiftItem.break_end_time != ''
              ? new Date(shiftItem.break_end_time)
              : null;
        } else {
          shiftsbody.break_end_time = null;
        }
        shiftsbody.created_by = created_by;
        shiftsbody.created_at = new Date();
        shiftsbody.oef_procedures = shiftItem?.oef_procedures;
        shiftsbody.oef_products = shiftItem?.oef_products;
        shiftsbody.reduce_slots = shiftItem?.reduce_slots;
        shiftsbody.shift_number = i + 1;
        shiftsbody.reduction_percentage = shiftItem?.reduction_percentage;
        shiftsbody.tenant_id = tenant_id;
        // await queryRunner.manager.update(shiftsbody);
        await queryRunner.manager.update(
          Shifts,
          { id: shiftsbody.id },
          shiftsbody
        );
      } else {
        isNewShift = true;
        const new_shift = new Shifts();
        new_shift.shiftable_id = shiftable_id;
        new_shift.shiftable_type = shiftable_type;
        new_shift.start_time = shiftItem?.start_time;
        new_shift.end_time = shiftItem?.end_time;
        new_shift.created_at = new Date();
        new_shift.created_by = created_by;
        if (shiftItem.break_start_time) {
          new_shift.break_start_time =
            shiftItem.break_start_time != ''
              ? new Date(shiftItem.break_start_time)
              : null;
        } else {
          new_shift.break_end_time = null;
        }
        if (shiftItem.break_end_time) {
          new_shift.break_end_time =
            shiftItem.break_end_time != ''
              ? new Date(shiftItem.break_end_time)
              : null;
        } else {
          new_shift.break_end_time = null;
        }
        new_shift.oef_procedures = shiftItem?.oef_procedures;
        new_shift.oef_products = shiftItem?.oef_products;
        new_shift.reduce_slots = shiftItem?.reduce_slots;
        new_shift.reduction_percentage = shiftItem?.reduction_percentage;
        new_shift.tenant_id = tenant_id;
        new_shift.shift_number = i + 1;
        new_data_of_Shifts = await this.shiftsRepository.save(new_shift);
        shiftItem.id = new_data_of_Shifts.id;
      }
      const effectiveShiftId = shiftItem.shift_id
        ? shiftItem.shift_id
        : new_data_of_Shifts.id;
      const projectionsQuery = `
      SELECT sps.procedure_type_qty as procedure_type_qty, sps.product_yield as product_yield,
      sps.shift_id as shift_id,
      (
        SELECT JSON_BUILD_OBJECT(
          'id', pt.id,
          'name', pt.name,
          'short_description', pt.short_description,
          'procedure_duration', pt.procedure_duration,
          'procedure_type_products', (
            SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                    'product_id', ptp.product_id,
                    'quantity', ptp.quantity,
                    'name', p.name
                )
            )
            FROM procedure_types_products ptp
            JOIN products p ON p.id = ptp.product_id
            WHERE ptp.procedure_type_id = pt.id
          )
        )
        FROM procedure_types pt
        WHERE pt.id = sps.procedure_type_id
      ) AS procedure_type,
      JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', ss.id,
            'name', ss.name,
            'short_name', ss.short_name,
            'beds', ss.beds,
            'concurrent_beds', ss.concurrent_beds,
            'stagger_slots', ss.stagger_slots,
            'shift_id',  sps.shift_id,
            'qty', COALESCE(sub.qty, 0)
        )
      ) AS staff_setups
      FROM shifts , shifts_projections_staff sps
      JOIN staff_setup ss ON sps.staff_setup_id = ss.id AND sps.procedure_type_id = ss.procedure_type_id
      LEFT JOIN (
        SELECT staff_setup_id, COALESCE(SUM(DISTINCT ((cr.oef_contribution * sc.qty) / 100)), 0) AS qty
        FROM staff_config sc
        LEFT JOIN contacts_roles cr ON sc.contact_role_id = cr.id
        GROUP BY staff_setup_id
      ) sub ON sub.staff_setup_id = ss.id
      WHERE sps.shift_id = shifts.id and shifts.id = ${effectiveShiftId}
      AND shifts.shiftable_type = '${shiftable_type}' AND shifts.is_archived = false
      AND sps.is_archived = false
      GROUP BY sps.shift_id, sps.procedure_type_id,sps.procedure_type_qty,sps.product_yield`;
      const existingProjections = await this.entityManager.query(
        projectionsQuery
      );

      if (
        shiftable_type == PolymorphicType.OC_OPERATIONS_DRIVES ||
        shiftable_type == PolymorphicType.OC_OPERATIONS_SESSIONS ||
        shiftable_type == PolymorphicType.CRM_DONOR_CENTERS_BLUEPRINTS
      ) {
        console.log('New Shift Slots');

        await this.generateSlots(
          queryRunner,
          i,
          shiftItem?.shift_id ?? new_data_of_Shifts?.id,
          shifts?.[i]?.slots || [],
          slots || {},
          created_by,
          tenant_id,
          existingProjections,
          shiftItem.projections,
          isNewShift,
          operationDate,
          operationDateDto,
          shiftable_type
        );
      } else {
        let count = 0;

        const existingProjections = await this.shiftsProjectionsStaffRepo.find({
          where: { shift_id: shiftItem.shift_id, is_archived: false },
        });

        for (const projection of existingProjections) {
          if (!shiftItem?.shift_id) {
            break;
          }
        }
        await this.shiftsProjectionsStaffRepo.delete({
          shift_id: shiftItem.shift_id,
          is_archived: false,
        });
        for (const projectionItem of shiftItem.projections) {
          for (const staffSetup of projectionItem.staff_setups) {
            count++;
            const newProjection = new ShiftsProjectionsStaff();
            newProjection.procedure_type_id = projectionItem?.procedure_type_id;
            newProjection.procedure_type_qty =
              projectionItem?.procedure_type_qty;
            newProjection.product_yield = projectionItem?.product_yield;
            newProjection.shift_id =
              shiftItem?.shift_id ?? new_data_of_Shifts?.id;
            newProjection.staff_setup_id = staffSetup;
            newProjection.created_by = created_by;
            await queryRunner.manager.save(newProjection);
          }
        }
        await this.generateAllSlots(
          slots,
          shifts?.[i]?.slots,
          created_by,
          queryRunner,
          i,
          isNewShift ? new_data_of_Shifts?.id : shiftItem?.shift_id,
          tenant_id
        );
      }

      await this.handleChangeDevices(
        shifts?.[i]?.devices || [],
        shiftItem?.devices || [],
        shiftItem?.shift_id ?? new_data_of_Shifts?.id,
        created_by,
        queryRunner
      );

      await this.handleChangeVehicles(
        shifts?.[i]?.vehicles || [],
        shiftItem?.vehicles || [],
        shiftItem?.shift_id ?? new_data_of_Shifts?.id,
        created_by,
        queryRunner
      );
      i++;
    }
    return { shiftChanges, shifts: body };
  }

  async handleChangeVehicles(
    shiftVehicles,
    dtoVehicles,
    shift_id,
    created_by,
    queryRunner
  ) {
    const shiftVehicleIds = shiftVehicles?.map((item) =>
      item.vehicle_id.toString()
    );
    // Calculate removed items
    const removedItems = shiftVehicleIds.filter(
      (item) => !dtoVehicles?.includes(item)
    );

    // Calculate new items
    const newItems = (dtoVehicles ?? []).filter(
      (item) => !shiftVehicleIds.includes(item)
    );
    console.log({ newItems, removedItems });

    await this.shiftsVehiclesRepo.update(
      {
        vehicle_id: In(removedItems),
      },
      {
        is_archived: true,
      }
    );
    await this.shiftsVehiclesRepo.delete({
      vehicle_id: In(removedItems),
    });
    for (const item of newItems) {
      const shiftVehicle = new ShiftsVehicles();
      shiftVehicle.shift_id = shift_id;
      shiftVehicle.vehicle_id = item;
      shiftVehicle.created_by = created_by;
      shiftVehicle.created_at = new Date();
      if (!queryRunner) await this.shiftsVehiclesRepo.save(shiftVehicle);
      else await queryRunner.manager.save(shiftVehicle);
    }
  }

  async handleChangeDevices(
    shiftDevices,
    dtoDevices,
    shift_id,
    created_by,
    queryRunner: QueryRunner
  ) {
    const shiftDevicesIds = shiftDevices?.map((item) =>
      item.device_id.toString()
    );
    // Calculate removed items
    const removedItems = shiftDevicesIds.filter(
      (item) => !dtoDevices?.includes(item)
    );

    // Calculate new items
    const newItems = (dtoDevices ?? []).filter(
      (item) => !shiftDevicesIds.includes(item)
    );

    await queryRunner.manager.update(
      ShiftsDevices,
      {
        device_id: In(removedItems),
        shift_id,
      },
      {
        is_archived: true,
      }
    );
    await queryRunner.manager.delete(ShiftsDevices, {
      device_id: In(removedItems),
      shift_id,
    });

    for (const item of newItems) {
      const shiftDevices = new ShiftsDevices();
      shiftDevices.shift_id = shift_id;
      shiftDevices.device_id = item;
      shiftDevices.created_by = created_by;
      shiftDevices.created_at = new Date();
      if (!queryRunner) await this.shiftDeviceRepo.save(shiftDevices);
      else await queryRunner.manager.save(shiftDevices);
    }
  }
  async handleChangeProjection(
    existingProjections,
    newProjections,
    isNewShift,
    shift_id,
    created_by,
    queryRunner: QueryRunner,
    slots,
    index,
    tenant_id
  ) {
    console.log(`Case 6: Change Projection (Remove All Slots/Appointments)`);
    let isHandled = false;
    if (isNewShift) {
      console.log(`New Shift, New Projection Handle`);

      for (const projectionItem of newProjections) {
        for (const staffSetup of projectionItem.staff_setups) {
          const newProjection = new ShiftsProjectionsStaff();
          newProjection.procedure_type_id = projectionItem?.procedure_type_id;
          newProjection.procedure_type_qty = projectionItem?.procedure_type_qty;
          newProjection.product_yield = projectionItem?.product_yield;
          newProjection.shift_id = shift_id;
          newProjection.staff_setup_id = staffSetup;
          newProjection.created_by = created_by;
          newProjection.created_at = new Date();
          await queryRunner.manager.save(newProjection);
        }
      }
      const slotArray = slots[index?.toString()]; // Get the array of slots for the current key
      for (const slotObject of slotArray ?? []) {
        // Now, 'slotObject' represents each individual object within the slotArray
        // Perform your operations on 'slotObject' here
        // For example, you can uncomment and modify your existing code accordingly
        for (const item of slotObject.items) {
          const editSlot = new ShiftsSlots();
          editSlot.shift_id = shift_id;
          editSlot.start_time = new Date(item?.startTime);
          editSlot.end_time = new Date(item?.endTime);
          editSlot.procedure_type_id = slotObject?.procedure_type_id;
          editSlot.bed = slotObject.bed;
          editSlot.staff_setup_id = slotObject.staff_setup_id;
          editSlot.created_by = created_by;
          editSlot.tenant_id = tenant_id;
          editSlot.created_at = new Date();
          await queryRunner.manager.save(editSlot);
        }
      }
      isHandled = true;
    } else {
      console.log(`Existing Shift Change Projection`);

      const currentProjectionIds = [];
      for (const projectionItem of newProjections) {
        const existingProjection = this.findExistingProjectionInList(
          projectionItem,
          existingProjections
        );
        // console.log({ existingProjection });

        if (!existingProjection) {
          console.log(
            `Case 9 : Add new projection / Projection Changed Handle`
          );

          isHandled = true;
          currentProjectionIds.push(projectionItem?.procedure_type_id);
          console.log('projectionItem', projectionItem);
          for (const staffSetup of projectionItem?.staff_setups) {
            const newProjection = new ShiftsProjectionsStaff();
            newProjection.procedure_type_id = projectionItem?.procedure_type_id;
            newProjection.procedure_type_qty =
              projectionItem?.procedure_type_qty;
            newProjection.product_yield = projectionItem?.product_yield;
            newProjection.shift_id = shift_id;
            newProjection.staff_setup_id = staffSetup;
            newProjection.created_by = created_by;
            newProjection.created_at = new Date();
            await queryRunner.manager.save(newProjection);
          }
          const slotArray = slots[index?.toString()]; // Get the array of slots for the current key
          for (const slotObject of slotArray ?? []) {
            for (const item of slotObject?.items) {
              if (
                slotObject?.procedure_type_id?.toString() ==
                projectionItem?.procedure_type_id?.toString()
              ) {
                const editSlot = new ShiftsSlots();
                editSlot.shift_id = shift_id;
                editSlot.start_time = new Date(item?.startTime);
                editSlot.end_time = new Date(item?.endTime);
                editSlot.procedure_type_id = slotObject?.procedure_type_id;
                editSlot.bed = slotObject.bed;
                editSlot.staff_setup_id = slotObject.staff_setup_id;
                editSlot.created_by = created_by;
                editSlot.tenant_id = tenant_id;
                editSlot.created_at = new Date();
                await queryRunner.manager.save(editSlot);
              }
            }
          }
        } else {
          currentProjectionIds.push(projectionItem?.procedure_type_id);
        }
      }
      await queryRunner.manager.update(
        ShiftsSlots,
        {
          shift_id,
          procedure_type_id: Not(In(currentProjectionIds)),
        },
        {
          is_archived: true,
          created_by,
          created_at: new Date(),
          staff_setup_id: null,
        }
      );

      await queryRunner.manager.delete(ShiftsProjectionsStaff, {
        shift_id: shift_id,
        procedure_type_id: Not(In(currentProjectionIds)),
      });
    }
    // console.log({ isHandled });
    return isHandled;
  }

  async handleChangeStaffSetup(
    existingProjections,
    newProjections,
    isNewShift,
    shift_id,
    created_by,
    queryRunner: QueryRunner,
    slots,
    index,
    existingSlots: ShiftsSlots[],
    tenant_id
  ) {
    console.log(`Case 8 : Change the staff setup `);
    let isHandled = false;
    if (isNewShift) {
      console.log(`New Shift, New Projection Handle`);

      for (const projectionItem of newProjections) {
        for (const staffSetup of projectionItem.staff_setups) {
          const newProjection = new ShiftsProjectionsStaff();
          newProjection.procedure_type_id = projectionItem?.procedure_type_id;
          newProjection.procedure_type_qty = projectionItem?.procedure_type_qty;
          newProjection.product_yield = projectionItem?.product_yield;
          newProjection.shift_id = shift_id;
          newProjection.staff_setup_id = staffSetup;
          newProjection.created_by = created_by;
          newProjection.created_at = new Date();
          await queryRunner.manager.save(newProjection);
        }
      }
      const slotArray = slots[index?.toString()]; // Get the array of slots for the current key
      for (const slotObject of slotArray ?? []) {
        // Now, 'slotObject' represents each individual object within the slotArray
        // Perform your operations on 'slotObject' here
        // For example, you can uncomment and modify your existing code accordingly
        for (const item of slotObject.items) {
          const editSlot = new ShiftsSlots();
          editSlot.shift_id = shift_id;
          editSlot.start_time = new Date(item?.startTime);
          editSlot.end_time = new Date(item?.endTime);
          editSlot.procedure_type_id = slotObject?.procedure_type_id;
          editSlot.bed = slotObject.bed;
          editSlot.staff_setup_id = slotObject.staff_setup_id;
          editSlot.created_by = created_by;
          editSlot.tenant_id = tenant_id;
          editSlot.created_at = new Date();
          await queryRunner.manager.save(editSlot);
        }
      }
      isHandled = true;
    } else {
      console.log(`Existing Shift handleChangeStaffSetup`);

      const currentProjectionIds = [];
      for (const projectionItem of newProjections) {
        const existingProjection = this.findExistingProjectionInList(
          projectionItem,
          existingProjections
        );
        // console.log({ existingProjection });

        if (!existingProjection) {
          currentProjectionIds.push(projectionItem?.procedure_type_id);

          for (const staffSetup of projectionItem.staff_setups) {
            const newProjection = new ShiftsProjectionsStaff();
            newProjection.procedure_type_id = projectionItem?.procedure_type_id;
            newProjection.procedure_type_qty =
              projectionItem?.procedure_type_qty;
            newProjection.product_yield = projectionItem?.product_yield;
            newProjection.shift_id = shift_id;
            newProjection.staff_setup_id = staffSetup;
            newProjection.created_by = created_by;
            newProjection.created_at = new Date();
            await queryRunner.manager.save(newProjection);
          }

          const slotArray = slots[index?.toString()]; // Get the array of slots for the current key
          for (const slotObject of slotArray ?? []) {
            await queryRunner.manager.update(
              ShiftsSlots,
              { procedure_type_id: slotObject?.procedure_type_id, shift_id },
              {
                is_archived: true,
              }
            );
            for (const item of slotObject.items) {
              const editSlot = new ShiftsSlots();
              editSlot.shift_id = shift_id;
              editSlot.start_time = new Date(item?.startTime);
              editSlot.end_time = new Date(item?.endTime);
              editSlot.procedure_type_id = slotObject?.procedure_type_id;
              editSlot.bed = slotObject.bed;
              editSlot.staff_setup_id = slotObject.staff_setup_id;
              editSlot.created_by = created_by;
              editSlot.created_at = new Date();
              editSlot.tenant_id = tenant_id;
              await queryRunner.manager.save(editSlot);
            }
          }
        }
        if (existingProjection) {
          console.log(`Change the staff setup Existing Projection`);
          // const newStaffSetupsInOperation = []
          // console.log(existingProjection, projectionItem);
          const existingStaffSetupIds = [];
          existingProjection?.staff_setups?.map((sItem) =>
            existingStaffSetupIds.push(sItem.id.toString())
          );
          console.log(
            `Existing ${existingStaffSetupIds} , New ${projectionItem.staff_setups}`
          );

          // console.log(`Existing  Length ${existingStaffSetupIds.length}`);
          // console.log(`New  Length ${projectionItem.staff_setups.length}`);

          if (
            existingStaffSetupIds.length == 1 &&
            projectionItem.staff_setups.length == 1
          ) {
            console.log(`Handle Length One`);
            if (
              existingStaffSetupIds?.[0] !== projectionItem?.staff_setups?.[0]
            ) {
              console.log('-- Inside Staff Setup Changed--');

              isHandled = true;
              const existingSS = await this.staffSetupRepo.findOne({
                where: {
                  id: existingStaffSetupIds?.[0],
                },
              });
              const newSS = await this.staffSetupRepo.findOne({
                where: {
                  id: projectionItem?.staff_setups?.[0],
                },
              });
              console.log(
                `Existing Beds ${existingSS.beds}, New Beds ${newSS.beds}`
              );
              console.log(
                `Existing Stagger ${existingSS.stagger_slots}, New Stagger ${newSS.stagger_slots}`
              );
              console.log(
                `Existing C Beds ${existingSS.concurrent_beds}, New C Beds ${newSS.concurrent_beds}`
              );

              // When changing "beds" Increase "beds"
              if (
                newSS.beds > existingSS.beds &&
                newSS.concurrent_beds == existingSS.concurrent_beds &&
                newSS.stagger_slots == existingSS.stagger_slots
              ) {
                console.log(
                  `Increase in Beds where Concurrent beds and Stagger is Same from ${existingSS.beds} to ${newSS.beds}`
                );

                const slotArray = slots[index?.toString()];
                for (const slotObject of slotArray ?? []) {
                  console.log({ slotObject });

                  for (const item of slotObject.items) {
                    if (slotObject.bed > existingSS.beds - 1) {
                      const editSlot = new ShiftsSlots();
                      editSlot.shift_id = shift_id;
                      editSlot.start_time = new Date(item?.startTime);
                      editSlot.end_time = new Date(item?.endTime);
                      editSlot.procedure_type_id =
                        slotObject?.procedure_type_id;
                      editSlot.bed = slotObject.bed;
                      editSlot.staff_setup_id = slotObject.staff_setup_id;
                      editSlot.created_by = created_by;
                      editSlot.tenant_id = tenant_id;
                      editSlot.created_at = new Date();
                      await queryRunner.manager.save(editSlot);
                    }
                  }
                }
              }
              //   // When changing "beds" Decrease "beds"
              if (
                newSS.beds < existingSS.beds &&
                newSS.concurrent_beds == existingSS.concurrent_beds &&
                newSS.stagger_slots == existingSS.stagger_slots
              ) {
                console.log(
                  `Decrease in Beds where Concurrent beds and Stagger is Same from ${existingSS.beds} to ${newSS.beds}`
                );
                for (const slot of existingSlots) {
                  if (slot.bed > newSS.beds - 1) {
                    console.log(`Archive slot ${slot.id} of Bed ${slot.bed}`);
                    await this.archiveSlotAndAppointments(
                      queryRunner,
                      slot,
                      created_by,
                      tenant_id
                    );
                  }
                }
              }
              // When changing "concurrent beds" Increase "concurrent beds"
              if (
                newSS.beds == existingSS.beds &&
                newSS.concurrent_beds == existingSS.concurrent_beds &&
                newSS.stagger_slots !== existingSS.stagger_slots
              ) {
                console.log(
                  `Change in Stagger where beds and Concurrent Beds is Same`
                );

                const slotArray = slots[index?.toString()];
                const updatedSlotIds = [];
                for (const slotObject of slotArray ?? []) {
                  for (const item of slotObject.items) {
                    const updateSlot = this.findExistingSlot(
                      item.startTime,
                      item.endTime,
                      existingSlots,
                      1,
                      updatedSlotIds
                    );
                    if (updateSlot) {
                      // console.log(`Change the time`);
                      updateSlot.start_time = item.startTime;
                      updateSlot.end_time = item.endTime;
                      updateSlot.created_at = new Date();
                      updateSlot.created_by = created_by;
                      await queryRunner.manager.save(updateSlot);
                      updatedSlotIds.push(updateSlot.id);
                    } else {
                      // console.log(`Create new Slot`);
                      const newSlot = await this.saveEditedSlot(
                        queryRunner,
                        item.startTime,
                        item.endTime,
                        slotObject?.procedure_type_id,
                        shift_id,
                        created_by,
                        slotObject?.bed,
                        slotObject?.staff_setup_id,
                        tenant_id
                      );
                      updatedSlotIds.push(newSlot.id);
                    }
                  }
                }
                console.log(`Total updated : `, updatedSlotIds.length);

                await queryRunner.manager.update(
                  ShiftsSlots,
                  {
                    id: Not(In(updatedSlotIds)),
                    shift_id,
                  },
                  {
                    is_archived: true,
                  }
                );
              }

              if (
                newSS.beds == existingSS.beds &&
                newSS.stagger_slots == existingSS.stagger_slots &&
                newSS.concurrent_beds !== existingSS.concurrent_beds
              ) {
                console.log(
                  `Change in Concurrent Beds where beds and Stagger is Same`
                );
                const slotArray = slots[index?.toString()];
                const updatedSlotIds = [];
                for (const slotObject of slotArray ?? []) {
                  for (const item of slotObject.items) {
                    if (slotObject.bed > existingSS.concurrent_beds - 1) {
                      const updateSlot = this.findExistingSlot(
                        item.startTime,
                        item.endTime,
                        existingSlots,
                        1,
                        updatedSlotIds
                      );
                      if (updateSlot) {
                        // console.log(`Change the time`);
                        updateSlot.start_time = item.startTime;
                        updateSlot.end_time = item.endTime;
                        updateSlot.created_at = new Date();
                        updateSlot.created_by = created_by;
                        await queryRunner.manager.save(updateSlot);
                        updatedSlotIds.push(updateSlot.id);
                      } else {
                        // console.log(`Create new Slot`);
                        const newSlot = await this.saveEditedSlot(
                          queryRunner,
                          item.startTime,
                          item.endTime,
                          slotObject?.procedure_type_id,
                          shift_id,
                          created_by,
                          slotObject?.bed,
                          slotObject?.staff_setup_id,
                          tenant_id
                        );
                        updatedSlotIds.push(newSlot.id);
                      }
                    }
                  }
                }
                console.log(`Total updated : `, updatedSlotIds.length);

                await queryRunner.manager.update(
                  ShiftsSlots,
                  {
                    id: Not(In(updatedSlotIds)),
                    shift_id,
                  },
                  {
                    is_archived: true,
                  }
                );
              }
              await queryRunner.manager.update(
                ShiftsSlots,
                {
                  shift_id: shift_id,
                },
                {
                  created_by: created_by,
                  created_at: new Date(),
                  staff_setup_id: newSS.id,
                }
              );
              await queryRunner.manager.update(
                ShiftsProjectionsStaff,
                {
                  shift_id: shift_id,
                  procedure_type_id: projectionItem?.procedure_type_id,
                },
                {
                  created_by: created_by,
                  created_at: new Date(),
                  staff_setup_id: newSS.id,
                }
              );
            }
          } else {
            const newDriveStaffProjectionIds = [];
            const newProjectionSSIds = projectionItem.staff_setups.map((item) =>
              item.toString()
            );

            const removedItems = [];
            const newItems = [];
            for (const item of existingStaffSetupIds) {
              if (!newProjectionSSIds?.includes(item)) {
                removedItems.push(item);
              }
            }
            for (const item of newProjectionSSIds) {
              if (!existingStaffSetupIds.includes(item)) {
                newItems.push(item);
              }
            }

            for (const newSS of newItems) {
              newDriveStaffProjectionIds.push(newSS);
              const newShiftProjection = new ShiftsProjectionsStaff();
              newShiftProjection.procedure_type_id =
                projectionItem?.procedure_type_id;
              newShiftProjection.procedure_type_qty =
                projectionItem?.procedure_type_qty;
              newShiftProjection.product_yield = projectionItem?.product_yield;
              newShiftProjection.shift_id = shift_id;
              newShiftProjection.staff_setup_id = newSS;
              newShiftProjection.created_by = created_by;
              newShiftProjection.created_at = new Date();
              await queryRunner.manager.save(newShiftProjection);
              isHandled = true;
              console.log(`Staff setup Changed / new Staff setup`);
              const slotArray = slots[index?.toString()];
              for (const slotObject of slotArray ?? []) {
                if (slotObject.staff_setup_id == newSS) {
                  for (const item of slotObject.items) {
                    const editSlot = new ShiftsSlots();
                    editSlot.shift_id = shift_id;
                    editSlot.start_time = new Date(item?.startTime);
                    editSlot.end_time = new Date(item?.endTime);
                    editSlot.procedure_type_id = slotObject?.procedure_type_id;
                    editSlot.bed = slotObject?.bed;
                    editSlot.staff_setup_id = slotObject?.staff_setup_id;
                    editSlot.created_by = created_by;
                    editSlot.created_at = new Date();
                    editSlot.tenant_id = tenant_id;
                    await queryRunner.manager.save(editSlot);
                  }
                }
              }
            }
            // console.log({ removedItems });
            // console.log({
            //   shift_id: shift_id,
            //   procedure_type_id: existingProjection.procedure_type_id,
            //   staff_setup_id: Not(In(removedItems)),
            // });

            await queryRunner.manager.update(
              ShiftsSlots,
              {
                shift_id: shift_id,
                procedure_type_id: existingProjection.procedure_type.id,
                staff_setup_id: In(removedItems),
              },
              {
                is_archived: true,
                created_by: created_by,
                created_at: new Date(),
                staff_setup_id: null,
              }
            );

            await queryRunner.manager.delete(ShiftsProjectionsStaff, {
              shift_id: shift_id,
              procedure_type_id: existingProjection.procedure_type.id,
              staff_setup_id: In(removedItems),
            });
          }
        }
      }
    }
    console.log({ isHandled });
    return isHandled;
  }

  findExistingProjectionInList(projectionItem, existingProjections) {
    // console.log({ projectionItem });

    for (const item of existingProjections) {
      // console.log({ item });

      if (item.procedure_type.id == projectionItem?.procedure_type_id) {
        return item;
      }
    }
    return null;
  }

  async generateSlots(
    queryRunner: QueryRunner,
    index,
    shiftId,
    existingSlots: ShiftsSlots[],
    shiftSlots,
    created_by,
    tenant_id,
    existingProjections,
    newProjections,
    isNewShift,
    operationDate,
    operationDateDto,
    shiftable_type
  ) {
    let isOperationDateUpdated = false;
    console.log(new Date(operationDate), new Date(operationDateDto));

    if (
      shiftable_type !== PolymorphicType.CRM_DONOR_CENTERS_BLUEPRINTS &&
      !moment(new Date(operationDate)).isSame(
        moment(new Date(operationDateDto))
      )
    ) {
      console.log('Case : 7 => Handle change Operation date');
      await this.generateAllSlots(
        shiftSlots,
        existingSlots,
        created_by,
        queryRunner,
        index,
        shiftId,
        tenant_id
      );
      isOperationDateUpdated = true;
    }
    console.log({ isOperationDateUpdated });

    if (!isOperationDateUpdated) {
      // const projectionUpdate = false
      const projectionUpdate = await this.handleChangeProjection(
        existingProjections,
        newProjections,
        isNewShift,
        shiftId,
        created_by,
        queryRunner,
        shiftSlots,
        index,
        tenant_id
      );
      console.log({ projectionUpdate });

      if (!projectionUpdate) {
        await this.handleChangeStaffSetup(
          existingProjections,
          newProjections,
          isNewShift,
          shiftId,
          created_by,
          queryRunner,
          shiftSlots,
          index,
          existingSlots,
          tenant_id
        );

        const newShiftSlots = shiftSlots[index?.toString()];
        if (
          Array.isArray(newShiftSlots?.[0]?.items) &&
          !newShiftSlots?.[0]?.items.length
        )
          return;

        const existingProjectionProcedureDuration =
          existingSlots?.[0]?.procedure_type?.procedure_duration || null;

        const newFirstSlotStartTime = new Date(
          newShiftSlots?.[0]?.items?.[0].startTime
        );
        const newFirstSlotEndTime = new Date(
          newShiftSlots?.[0]?.items?.[0].endTime
        );
        const existingFirstSlotStartTime = new Date(
          existingSlots?.[0]?.start_time
        );
        const existingFirstSlotEndTime = new Date(existingSlots?.[0]?.end_time);

        const newLastSlotStartTime = new Date(
          newShiftSlots?.[0]?.items?.[
            newShiftSlots?.[0]?.items.length - 1
          ].startTime
        );
        const newLastSlotEndTime = new Date(
          newShiftSlots?.[0]?.items?.[
            newShiftSlots?.[0]?.items.length - 1
          ].endTime
        );
        const existingLastSlotStartTime = new Date(
          existingSlots?.[existingSlots?.length - 1]?.start_time
        );
        const existingLastSlotEndTime = new Date(
          existingSlots?.[existingSlots?.length - 1]?.end_time
        );

        // Case 1: Start Time Earlier Having new Slots Fit exactly before existing start time
        const earlierStartTimeAdjustment =
          await this.handleStartTimeEarlierExistingStartTime(
            queryRunner,
            newFirstSlotStartTime,
            existingFirstSlotStartTime,
            existingProjectionProcedureDuration,
            newShiftSlots,
            shiftId,
            created_by,
            existingSlots,
            tenant_id
          );
        // Case 3: Start Time Delay (Remove Impacted Slots/Appointments)
        const laterStartTimeAdjustment =
          await this.handleStartTimeAfterExistingStartTime(
            queryRunner,
            newFirstSlotStartTime,
            existingFirstSlotStartTime,
            existingSlots,
            tenant_id,
            created_by,
            newShiftSlots,
            shiftId
          );
        // Case 2: End Time Later Having new Slots Fit exactly after existing end time
        const laterEndTimeAdjustment =
          await this.handleEndTimeAfterExistingEndTime(
            queryRunner,
            newLastSlotStartTime,
            existingLastSlotStartTime,
            existingProjectionProcedureDuration,
            newShiftSlots,
            shiftId,
            created_by,
            existingSlots,
            tenant_id
          );
        // Case 4: End Time Earlier (Remove Impacted Slots/Appointments)
        const earlierEndTimeAdjustment =
          await this.handleEndTimeEarlierExistingEndTime(
            queryRunner,
            newLastSlotStartTime,
            existingLastSlotStartTime,
            existingSlots,
            created_by,
            tenant_id
          );
        // console.log({ newFirstSlotStartTime, existingFirstSlotStartTime });
        // console.log(!moment(newFirstSlotStartTime).isSame(moment(existingFirstSlotStartTime)));
        // console.log(!earlierStartTimeAdjustment, !laterStartTimeAdjustment, !earlierEndTimeAdjustment, !laterEndTimeAdjustment);

        if (
          !moment(newFirstSlotStartTime).isSame(
            moment(existingFirstSlotStartTime)
          ) &&
          !earlierStartTimeAdjustment &&
          !laterStartTimeAdjustment &&
          !earlierEndTimeAdjustment &&
          !laterEndTimeAdjustment
        ) {
          console.log(
            `Case 5: Major Shift Time Changes (Remove All Slots/Appointments)`
          );
          await this.updateOrAddSlots(
            queryRunner,
            newShiftSlots,
            existingSlots,
            shiftId,
            created_by,
            tenant_id
          );
        }
      }
    }
  }

  findExistingSlot(
    startTime,
    endTime,
    existingSlots: ShiftsSlots[],
    occurance = 1,
    usedSlots
  ) {
    let counterOccurance = 1;
    for (const slot of existingSlots) {
      if (
        this.isWithinRange(slot.start_time, startTime) &&
        !usedSlots.includes(slot.id)
      ) {
        if (counterOccurance == occurance) return slot;
        counterOccurance++;
      }
    }
    return null;
  }

  async generateAllSlots(
    slots,
    existingSlots,
    created_by,
    queryRunner: QueryRunner,
    index,
    shift_id,
    tenant_id
  ) {
    if (existingSlots) {
      for (const slot of existingSlots) {
        await this.archiveSlotAndAppointments(
          queryRunner,
          slot,
          created_by,
          tenant_id
        );
      }
    }

    const slotArray = slots[index?.toString()]; // Get the array of slots for the current key
    for (const slotObject of slotArray ?? []) {
      // Now, 'slotObject' represents each individual object within the slotArray
      // Perform your operations on 'slotObject' here
      // For example, you can uncomment and modify your existing code accordingly
      for (const item of slotObject.items) {
        const editSlot = new ShiftsSlots();
        editSlot.shift_id = shift_id;
        editSlot.start_time = new Date(item?.startTime);
        editSlot.end_time = new Date(item?.endTime);
        editSlot.procedure_type_id = slotObject?.procedure_type_id;
        editSlot.bed = slotObject.bed;
        editSlot.tenant_id = tenant_id;
        editSlot.staff_setup_id = slotObject.staff_setup_id;
        editSlot.created_by = created_by;
        editSlot.created_at = new Date();
        await queryRunner.manager.save(editSlot);
      }
    }
  }
  isWithinRange(slotStartTime, startTime) {
    const slotMoment = moment(slotStartTime);
    const startMoment = moment(startTime);
    return Math.abs(slotMoment.diff(startMoment, 'minutes')) <= 15;
  }

  // Case 1: Start Time Earlier Having new Slots Fit exactly before existing start time
  async handleStartTimeEarlierExistingStartTime(
    queryRunner,
    newFirstSlotStartTime,
    existingFirstSlotStartTime,
    procedure_duration,
    newShiftSlots,
    shiftId,
    created_by,
    existingSlots,
    tenant_id
  ) {
    console.log(
      'Case 1 : Start Time Adjustment (No Impact on Existing Slots/Appointments)'
    );
    if (newFirstSlotStartTime >= existingFirstSlotStartTime) {
      console.log('Not Applicable return');
      return false;
    }

    const extendedDuration = differenceInMinutes(
      existingFirstSlotStartTime,
      newFirstSlotStartTime
    );
    // console.log({ extendedDuration, procedure_duration });
    // console.log(
    //   `Is Extended duration : ${this.isExtendedDurationValid(
    //     extendedDuration,
    //     parseInt(procedure_duration)
    //   )}`
    // );

    if (
      !this.isExtendedDurationValid(
        extendedDuration,
        parseInt(procedure_duration)
      )
    ) {
      // console.log("Update or Add Slots");
      // await this.updateOrAddSlots(
      //   queryRunner,
      //   newShiftSlots,
      //   existingSlots,
      //   shiftId,
      //   created_by,
      //   tenant_id
      // );
      console.log('Not Applicable return');
      return false;
    }
    console.log('Add new Slots');
    for (const slotObject of newShiftSlots ?? []) {
      for (const item of slotObject.items) {
        if (new Date(item?.startTime) < existingFirstSlotStartTime) {
          await this.saveEditedSlot(
            queryRunner,
            item.startTime,
            item.endTime,
            slotObject.procedure_type_id,
            shiftId,
            created_by,
            slotObject?.bed,
            slotObject?.staff_setup_id,
            tenant_id
          );
        }
      }
    }
    return true;
  }

  // Case 3: Start Time Delay (Remove Impacted Slots/Appointments)
  async handleStartTimeAfterExistingStartTime(
    queryRunner,
    newFirstSlotStartTime,
    existingFirstSlotStartTime,
    existingSlots,
    tenant_id,
    created_by,
    newShiftSlots,
    shiftId
  ) {
    let isHandled = false;
    console.log(
      'Case 3: Start Time Delay (Remove Impacted Slots/Appointments)'
    );
    if (newFirstSlotStartTime <= existingFirstSlotStartTime) {
      // console.log("Update or Add Slots");
      // await this.updateOrAddSlots(
      //   queryRunner,
      //   newShiftSlots,
      //   existingSlots,
      //   shiftId,
      //   created_by,
      //   tenant_id
      // );
      console.log('Not Applicable return');
      return isHandled;
    }

    console.log('Archive Slots and appointments');
    for (const slot of existingSlots) {
      if (slot.start_time < newFirstSlotStartTime) {
        await this.archiveSlotAndAppointments(
          queryRunner,
          slot,
          created_by,
          tenant_id
        );
        isHandled = true;
      }
    }
    return isHandled;
  }

  // Case 2: End Time Later Having new Slots Fit exactly after existing end time
  async handleEndTimeAfterExistingEndTime(
    queryRunner,
    newLastSlotStartTime,
    existingLastSlotStartTime,
    procedure_duration,
    newShiftSlots,
    shiftId,
    created_by,
    existingSlots,
    tenant_id
  ) {
    console.log(
      'Case 2 : End Time Extension (No Impact on Existing Slots/Appointments)'
    );
    if (newLastSlotStartTime <= existingLastSlotStartTime) {
      console.log('Not Applicable return');
      return false;
    }

    const extendedDuration = differenceInMinutes(
      existingLastSlotStartTime,
      newLastSlotStartTime
    );
    // console.log(
    //   `Is Extended duration : ${this.isExtendedDurationValid(
    //     extendedDuration,
    //     parseInt(procedure_duration)
    //   )}`
    // );
    if (
      !this.isExtendedDurationValid(
        extendedDuration,
        parseInt(procedure_duration)
      )
    ) {
      // console.log("Update or Add Slots");
      // await this.updateOrAddSlots(
      //   queryRunner,
      //   newShiftSlots,
      //   existingSlots,
      //   shiftId,
      //   created_by,
      //   tenant_id
      // );
      console.log('Not Applicable return');
      return false;
    }

    console.log('Add new Slots');
    await this.processNewSlotsAfterExistingEndTime(
      queryRunner,
      newLastSlotStartTime,
      existingLastSlotStartTime,
      newShiftSlots,
      shiftId,
      created_by,
      tenant_id
    );
    return true;
  }

  // Case 4: End Time Earlier (Remove Impacted Slots/Appointments)
  async handleEndTimeEarlierExistingEndTime(
    queryRunner,
    newLastSlotStartTime,
    existingLastSlotStartTime,
    existingSlots,
    created_by,
    tenant_id
  ) {
    let isHandled = false;

    console.log(
      'Case 4: End Time Earlier (Remove Impacted Slots/Appointments)'
    );
    if (newLastSlotStartTime >= existingLastSlotStartTime) {
      console.log('Not Applicable return');
      return isHandled;
    }

    console.log(
      `Archive Slots and appointments : Total Count : ${existingSlots.length}`
    );
    for (const slot of existingSlots) {
      // console.log(slot.start_time, newLastSlotStartTime);
      if (slot.start_time > newLastSlotStartTime) {
        await this.archiveSlotAndAppointments(
          queryRunner,
          slot,
          created_by,
          tenant_id
        );
        isHandled = true;
      }
    }
    return isHandled;
  }

  async processNewSlotsAfterExistingEndTime(
    queryRunner,
    newLastSlotStartTime,
    existingLastSlotStartTime,
    newShiftSlots,
    shiftId,
    created_by,
    tenant_id
  ) {
    for (const slotObject of newShiftSlots ?? []) {
      for (const item of slotObject.items) {
        if (new Date(item?.startTime) > existingLastSlotStartTime) {
          await this.saveEditedSlot(
            queryRunner,
            item.startTime,
            item.endTime,
            slotObject.procedure_type_id,
            shiftId,
            created_by,
            slotObject?.bed,
            slotObject?.staff_setup_id,
            tenant_id
          );
        }
      }
    }
  }

  async archiveSlotAndAppointments(queryRunner, slot, created_by, tenant_id) {
    console.log(`Archiving Slot and Appointments of Slot Id : ${slot.id}`);

    const slotAppointments = await this.findSlotAppointments(
      queryRunner,
      slot.id,
      tenant_id
    );
    for (const appt of slotAppointments) {
      console.log(`Archiving Appt ${appt.id}`);
      await this.archiveAppointment(queryRunner, appt, created_by);
    }

    slot.is_archived = true;
    slot.created_at = new Date();
    slot.created_by = created_by;
    await queryRunner.manager.save(slot);
    console.log(`Archived Slot Id ${slot.id} ${slot.is_archived}`);
  }

  async findSlotAppointments(queryRunner, slotId, tenant_id) {
    return await queryRunner.manager.find(ShiftsSlots, {
      where: {
        appointments: {
          slot_id: slotId,
          is_archived: false,
          tenant_id,
        },
      },
    });
  }

  async archiveAppointment(queryRunner, appt, created_by) {
    // TODO: Notify donor
    console.log('Notify Donor');
    appt.is_archived = true;
    appt.created_at = new Date();
    appt.created_by = created_by;
    await queryRunner.manager.save(appt);
  }

  isExtendedDurationValid(extendedDuration, procedure_duration) {
    return isInteger(extendedDuration / procedure_duration);
  }

  async updateOrAddSlots(
    queryRunner: QueryRunner,
    newShiftSlots,
    existingSlots,
    shiftId,
    created_by,
    tenant_id
  ) {
    for (const slotObject of newShiftSlots ?? []) {
      const updatedSlotIds = [];
      for (const item of slotObject.items) {
        const updateSlot = this.findExistingSlot(
          item.startTime,
          item.endTime,
          existingSlots,
          1,
          updatedSlotIds
        );
        // console.log('found Slot in 15min =>', updateSlot?.id);
        if (updateSlot) {
          updateSlot.start_time = item.startTime;
          updateSlot.end_time = item.endTime;
          updateSlot.created_by = item.createdBy;
          updateSlot.created_at = new Date();
          await queryRunner.manager.save(updateSlot);
          updatedSlotIds.push(updateSlot.id);
        } else {
          const newSlot = await this.saveEditedSlot(
            queryRunner,
            item.startTime,
            item.endTime,
            slotObject?.procedure_type_id,
            shiftId,
            created_by,
            slotObject?.bed,
            slotObject?.staff_setup_id,
            tenant_id
          );
          console.log(newSlot.id);
          updatedSlotIds.push(newSlot.id);
        }
      }
      // console.log({ updatedSlotIds });

      await queryRunner.manager.update(
        ShiftsSlots,
        {
          id: Not(In(updatedSlotIds)),
          shift_id: shiftId,
          procedure_type_id: slotObject?.procedure_type_id,
          staff_setup_id: slotObject?.staff_setup_id,
        },
        {
          is_archived: true,
          created_at: new Date(),
          created_by: created_by,
        }
      );
    }
  }
  async saveEditedSlot(
    queryRunner,
    startTime,
    endTime,
    procedureTypeId,
    shiftId,
    created_by,
    bed,
    staff_setup_id,
    tenant_id
  ) {
    const editSlot = new ShiftsSlots();
    editSlot.shift_id = shiftId;
    editSlot.start_time = new Date(startTime);
    editSlot.end_time = new Date(endTime);
    editSlot.procedure_type_id = procedureTypeId;
    editSlot.bed = bed;
    editSlot.staff_setup_id = staff_setup_id;
    editSlot.created_by = created_by;
    editSlot.created_at = new Date();
    editSlot.tenant_id = tenant_id;
    await queryRunner.manager.save(editSlot);
    return editSlot;
  }

  async updateLinkedShift(body: any, id, user, tenant_id) {
    try {
      // body = body.sort((a, b) => a.id - b.id);
      const { shift, slots } = body;
      const newShift = shift;
      const shifts = await this.shiftsRepository.findOne({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          is_archived: false,
        },
        relations: [
          'projections',
          'projections.procedure_type',
          'projections.created_by',
          'staff_setups',
          'staff_setups.created_by',
          'vehicles',
          'vehicles.created_by',
          'slots',
          'slots.created_by',
          'devices',
          'devices.created_by',
          'created_by',
          'projections.procedure_type.procedure_types_products',
          'projections.procedure_type.procedure_types_products.products',
        ],
        order: { id: 'ASC' },
      });

      await this.shiftsProjectionsStaffRepo.delete({
        shift_id: shifts.id,
        is_archived: false,
      });

      for (const projectionItem of newShift?.[0]?.projections) {
        for (const staffSetup of projectionItem?.staff_setups) {
          const newProjection = new ShiftsProjectionsStaff();
          newProjection.procedure_type_id = projectionItem?.procedure_type_id;
          newProjection.procedure_type_qty = projectionItem?.procedure_type_qty;
          newProjection.product_yield = projectionItem?.product_yield;
          newProjection.shift_id = shifts?.id;
          newProjection.staff_setup_id = staffSetup;
          newProjection.created_by = user;
          newProjection.created_at = new Date();
          await this.shiftsProjectionsStaffRepo.save(newProjection);
        }
      }
      if (shifts?.slots) {
        for (const slot of shifts?.slots) {
          let slots = new ShiftsSlots();
          slots = slot;
          slots.is_archived = true;
          slot.created_at = new Date();
          slot.created_by = user;
          slot.tenant_id = tenant_id;
          await this.shiftsSlotsRepo.save(slots);
        }
      }

      const slotArray = slots[0?.toString()];
      for (const slotObject of slotArray ?? []) {
        for (const item of slotObject.items) {
          const editSlot = new ShiftsSlots();
          editSlot.shift_id = shifts?.id;
          editSlot.start_time = new Date(item?.startTime);
          editSlot.end_time = new Date(item?.endTime);
          editSlot.procedure_type_id = slotObject?.procedure_type_id;
          editSlot.bed = slotObject.bed;
          editSlot.staff_setup_id = slotObject.staff_setup_id;
          editSlot.created_by = user;
          editSlot.created_at = new Date();
          editSlot.tenant_id = tenant_id;
          await this.shiftsSlotsRepo.save(editSlot);
        }
      }
      if (shifts?.devices) {
        for (const delDevices of shifts.devices) {
          await this.shiftDeviceRepo.delete({
            shift_id: delDevices?.shift_id,
          });
        }
      }
      for (const insertdevices of newShift?.[0]?.devices) {
        console.log({ insertdevices });
        const shiftDevices = new ShiftsDevices();
        shiftDevices.shift_id = shifts?.id;
        shiftDevices.device_id = insertdevices as any;
        shiftDevices.created_by = user;
        shiftDevices.created_at = new Date();
        await this.shiftDeviceRepo.save(shiftDevices);
      }
      if (shifts?.vehicles) {
        for (const delvehicles of shifts.vehicles) {
          await this.shiftsVehiclesRepo.delete({
            shift_id: delvehicles?.shift_id,
          });
        }
        for (const insertdevices of newShift?.[0]?.vehicles) {
          const vehicleDevices = new ShiftsVehicles();
          vehicleDevices.shift_id = shifts?.id;
          vehicleDevices.vehicle_id = insertdevices;
          vehicleDevices.created_by = user;
          vehicleDevices.created_at = new Date();
          await this.shiftsVehiclesRepo.save(vehicleDevices);
        }
      }
      return resSuccess('linked drive updated', 'success', HttpStatus.CREATED);
    } catch (err) {
      console.log({ err });
    }
  }

  async GetLinkDataOnShift(shift_id) {
    try {
      const getShift = await this.shiftsRepository.findOne({
        where: {
          id: shift_id,
        },
      });
      const getDrive = await this.drivesRepo.findOne({
        where: { id: getShift.shiftable_id },
      });
      const location = await this.crmLocationRepo.findOne({
        where: {
          id: getDrive.location_id,
        },
      });
      const getAddress = await this.addressRepo.findOne({
        where: {
          addressable_id: location.id,
          addressable_type: PolymorphicType.CRM_LOCATIONS,
        },
      });
      const getshiftStaffSetup = await this.shiftsStaffSetupRepo.findOne({
        where: {
          shift_id: shift_id,
        },
      });
      const getShiftProjectionStaff =
        await this.shiftsProjectionsStaffRepo.findOne({
          where: { shift_id: shift_id, is_archived: false },
          relations: ['procedure_type'],
        });
      // console.log({ getShiftProjectionStaff });
      const getprocedureTypeProducts =
        await this.procedureTypesProductsRepo.findOne({
          where: {
            procedure_type_id: getShiftProjectionStaff?.procedure_type?.id,
          },
        });
      const products = await this.productsRepo.findOne({
        where: { id: getprocedureTypeProducts.product_id },
      });
      const getStaffSetup: any = await this.staffSetupRepo.find({
        where: {
          id: getshiftStaffSetup?.staff_setup_id,
        },
        relations: [
          'staff_configuration',
          'staff_configuration.contact_role_id',
        ],
      });
      const getshiftvehicles = await this.shiftsVehiclesRepo.find({
        where: {
          shift_id: shift_id,
        },
      });
      const getShiftDevices = await this.shiftDeviceRepo.find({
        where: {
          shift_id: shift_id,
        },
      });
      const get_vehicles = [];
      for (const veh of getshiftvehicles) {
        get_vehicles.push(
          await this.vehicleRepo.findOne({
            where: { id: veh.vehicle_id },
          })
        );
      }
      const get_devices = [];
      for (const veh of getShiftDevices) {
        get_devices.push(
          await this.deviceRepository.findOne({
            where: { id: veh.device_id },
          })
        );
      }
      const data = {
        drives: getDrive,
        shift: getShift,
        projection: {
          ...getShiftProjectionStaff,
          tenant_id: getDrive?.tenant_id,
        },
        products: products,
        staff: getStaffSetup,
        vehicles: get_vehicles,
        address: getAddress,
        devices: get_devices,
        tenant_id: getDrive?.tenant_id,
      };
      // console.log({ getStaffSetup });
      return resSuccess('Vehicles Found.', 'success', HttpStatus.CREATED, data);
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async monitorShiftsChanges(
    existingShifts,
    updatedShiftsDto,
    user,
    type,
    removeShifts
  ) {
    const changesArrayShifts = [];

    const shiftsIdsExisting = existingShifts
      ?.map((es) => Number(es.id))
      ?.sort();
    const shiftsIdsNew = updatedShiftsDto
      ?.map((element) => {
        return Number(element?.shift_id);
      })
      ?.sort();

    if (removeShifts?.length > 0)
      await this.compareShifts(
        changesArrayShifts,
        removeShifts,
        existingShifts?.map((es) => Number(es.id))
      );

    if (!_.isEqual(shiftsIdsExisting, shiftsIdsNew)) {
      updatedShiftsDto
        .filter((ans) => !ans?.shift_id)
        .forEach((fans, i) => {
          changesArrayShifts.push({
            changes_from: null,
            changes_to: `Insert shift ${
              shiftsIdsNew?.length -
              updatedShiftsDto.filter((ans) => !ans?.shift_id).length +
              i +
              1
            }`,
            changes_field: `Event shift`,
          });
        });
    }
    for (const [index, shift] of existingShifts.entries()) {
      const tempShift = updatedShiftsDto.find(
        (updatedShift) => Number(updatedShift?.shift_id) === Number(shift?.id)
      );

      if (!tempShift) continue;

      const deviceIdsExisting = shift?.devices
        ?.map((element) => {
          return Number(element?.device_id);
        })
        ?.sort();
      const deviceIdsNew = tempShift?.devices?.map(Number)?.sort();

      if (!_?.isEqual(deviceIdsExisting, deviceIdsNew)) {
        const { existingNames, newNames } = await this.compareDevicesVehicles(
          deviceIdsExisting,
          deviceIdsNew,
          user?.tenant?.id,
          this.deviceRepository
        );

        changesArrayShifts.push({
          changes_from: existingNames,
          changes_to: newNames,
          changes_field: `Shift ${index + 1} Devices`,
        });
      }
      if (type !== PolymorphicType.OC_OPERATIONS_SESSIONS) {
        const vehiclesIdsExisting = shift?.vehicles
          ?.map((element) => {
            return Number(element?.vehicle_id);
          })
          ?.sort();
        const vehiclesIdsNew = tempShift?.vehicles?.map(Number)?.sort();
        if (!_?.isEqual(vehiclesIdsExisting, vehiclesIdsNew)) {
          const { existingNames, newNames } = await this.compareDevicesVehicles(
            vehiclesIdsExisting,
            vehiclesIdsNew,
            user?.tenant?.id,
            this.vehiceRepository
          );

          changesArrayShifts.push({
            changes_from: existingNames,
            changes_to: newNames,
            changes_field: `Shift ${index + 1} Vehicles`,
          });
        }
      }

      await this.checkProjectionStaffChanges(
        shift?.projections,
        tempShift?.projections,
        index,
        changesArrayShifts
      );

      await this.compareTimes(
        'Start Time',
        shift?.start_time,
        tempShift?.start_time,
        index,
        changesArrayShifts
      );
      await this.compareTimes(
        'End Time',
        shift?.end_time,
        tempShift?.end_time,
        index,
        changesArrayShifts
      );
      if (
        Number(shift?.reduction_percentage) !==
        Number(tempShift?.reduction_percentage)
      ) {
        changesArrayShifts.push({
          changes_from: shift?.reduction_percentage,
          changes_to: tempShift?.reduction_percentage,
          changes_field: `Shift ${index + 1} Reduction Percentage`,
        });
      }

      if (shift?.reduce_slots !== tempShift?.reduce_slots) {
        changesArrayShifts.push({
          changes_from: shift?.reduce_slots,
          changes_to: tempShift?.reduce_slots,
          changes_field: `Shift ${index + 1} Reduce Slots`,
        });
      }
    }

    return changesArrayShifts;
  }

  async compareDevicesVehicles(idsExisting, idsNew, tenant_id, repository) {
    const unionIds = _.union(idsExisting, idsNew)?.sort();
    const names = await repository.find({
      where: {
        tenant: { id: tenant_id },
        id: In(unionIds),
      },
    });

    const existingNames = names
      .filter((single) => idsExisting?.includes(Number(single?.id)))
      .map((single) => single?.name)
      .join(', ');

    const newNames = names
      .filter((single) => idsNew?.includes(Number(single?.id)))
      .map((single) => single?.name)
      .join(', ');

    return { existingNames, newNames };
  }

  async compareTimes(
    field,
    shiftValue,
    tempShiftValue,
    index,
    changesArrayShifts
  ) {
    if (!shiftValue || !tempShiftValue) return;
    const shiftDate = moment(shiftValue);
    const tempShiftDate = moment(tempShiftValue);
    const shiftTime = shiftDate.format('HH:mm:ss');
    const tempShiftTime = tempShiftDate.format('HH:mm:ss');
    if (shiftTime !== tempShiftTime) {
      changesArrayShifts.push({
        changes_from: shiftValue || 'N/A',
        changes_to: new Date(tempShiftValue),
        changes_field: `Shift ${index + 1} ${field}`,
      });
    }
  }

  async compareShifts(changesArrayShifts, removeShifts, existingIds) {
    const deletedShiftsAll = await this.shiftsRepository.find({
      where: {
        id: In(removeShifts?.map((rs) => rs.shift_id)),
      },
    });
    if (deletedShiftsAll?.length > 0) {
      deletedShiftsAll.forEach((dsa) => {
        changesArrayShifts.push({
          changes_from: null,
          changes_to: `Delete shift ${
            existingIds?.indexOf(Number(dsa?.id)) + 1
          }`,
          changes_field: `Event Shift `,
        });
      });
    }
  }

  async checkProjectionStaffChanges(
    existingPro,
    newPro,
    shiftIndex,
    newChanges
  ) {
    // console.log({ existingPro }, { newPro });
    const existingProIds = new Set(
      existingPro?.map((epI) => Number(epI?.procedure_type_id)).sort()
    );
    const newProIds = new Set(
      newPro?.map((npI) => Number(npI?.procedure_type_id || 0)).sort()
    );

    if (!_.isEqual(existingProIds, newProIds)) {
      const newProjections = await this.procedureTypesRepository.find({
        where: {
          id: In(newPro?.map((npI) => Number(npI?.procedure_type_id || 0))),
        },
        select: ['name', 'tenant_id'],
      });

      newChanges?.push({
        changes_from: [
          ...new Set(existingPro?.map((ep) => ep?.procedure_type?.name)),
        ].join(', '),
        changes_to: newProjections?.map((np) => np.name)?.join(', '),
        changes_field: `Shift ${shiftIndex + 1} Procedure Type`,
      });
    }

    for (const [index, pro] of newPro?.entries()) {
      let tempPro = existingPro.find(
        (ep) => Number(ep?.procedure_type_id) === Number(pro?.procedure_type_id)
      );
      const ifNotTempPro = Array.from(
        new Set(existingPro?.map((item: any) => item?.procedure_type_id))
      );
      if (!tempPro) {
        tempPro = existingPro?.find(
          (ep) =>
            Number(ep?.procedure_type_id) === Number(ifNotTempPro?.[index])
        );
      }

      const newP: any = await this.procedureTypesRepository.findOne({
        where: { id: pro?.procedure_type_id },
        relations: [
          'procedure_types_products',
          'procedure_types_products.products',
        ],
      });

      if (
        Number(pro?.procedure_type_id) !== Number(tempPro?.procedure_type_id) ||
        Number(pro?.product_yield) !== Number(tempPro?.product_yield) ||
        Number(tempPro?.procedure_type_qty) !== Number(pro?.procedure_type_qty)
      ) {
        const productNameFrom =
          tempPro?.procedure_type?.procedure_types_products?.[0]?.products
            ?.name;
        const productNameTo =
          newP?.procedure_types_products?.[0]?.products?.name;

        newChanges.push({
          changes_from:
            tempPro?.procedure_type?.name &&
            productNameFrom &&
            tempPro?.procedure_type_qty &&
            tempPro?.product_yield
              ? `${tempPro?.procedure_type?.name} (${tempPro?.procedure_type_qty}), ${productNameFrom} (${tempPro?.product_yield})`
              : null,
          changes_to:
            newP &&
            pro.procedure_type_qty &&
            productNameTo &&
            pro?.product_yield
              ? `${newP?.name} (${pro.procedure_type_qty}), ${productNameTo} (${pro.product_yield})`
              : null,
          changes_field: `Shift ${shiftIndex + 1} Projection Change (${
            tempPro?.procedure_type?.name || newP?.name
          })`,
        });
      }

      let existingStaffSetups = existingPro
        ?.filter(
          (ep) =>
            Number(ep?.procedure_type_id) === Number(pro?.procedure_type_id)
        )
        ?.map((ep) => ep?.staff_setup_id);
      if (existingStaffSetups) {
        existingStaffSetups = existingPro
          ?.filter(
            (ep) =>
              Number(ep?.procedure_type_id) === Number(ifNotTempPro?.[index])
          )
          ?.map((ep) => ep?.staff_setup_id);
      }
      const newStaffSetups = pro?.staff_setups;

      if (!_.isEqual(existingStaffSetups?.sort(), newStaffSetups?.sort())) {
        const existingStaff = await this.staffSetupRepo.find({
          where: { id: In(existingStaffSetups) },
          select: ['name', 'tenant_id'],
        });
        let newStaff = [];
        if (newStaffSetups?.length) {
          newStaff = await this.staffSetupRepo.find({
            where: { id: In(newStaffSetups) },
            select: ['name', 'tenant_id'],
          });
        }
        newChanges.push({
          changes_field: `Shift ${shiftIndex + 1} Projection ${
            index + 1
          } Staff`,
          changes_from: existingStaff?.map((staff) => staff.name).join(', '),
          changes_to: newStaff?.map((staff) => staff.name).join(', '),
        });
      }
    }
  }
}
