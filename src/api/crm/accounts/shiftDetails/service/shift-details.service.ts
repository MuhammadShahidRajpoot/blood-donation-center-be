import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

dotenv.config();

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    private readonly entityManager: EntityManager
  ) {}

  async find(id: any) {
    try {
      if (!id) {
        return resError(
          'Accounts blue print id is required',
          ErrorConstants.Error,
          400
        );
      }
      const bluePrintData = await this.drivesRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!bluePrintData) {
        return resError(
          `Blue print detail not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const queryCount = await this.drivesRepository
        .createQueryBuilder('drives')
        .select(
          `(JSON_BUILD_OBJECT(
                        
                        'id',drives.id,
                        'tenant_id', drives.tenant_id
                    )
                    )`,
          'drives'
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
                          'tenant_id', shifts.tenant_id,
                          'vehicle', (
                              SELECT JSON_AGG(JSON_BUILD_OBJECT(
                                  'id', vehicle.id,
                                  'name', vehicle.name,
                                  'tenant_id', vehicle.tenant_id
                              ))
                              FROM shifts_vehicles
                              JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
                              WHERE shifts_vehicles.shift_id = shifts.id
                          ),
                          'device', (
                              SELECT JSON_AGG(JSON_BUILD_OBJECT(
                                  'id', device.id,
                                  'name', device.name,
                                  'tenant_id', device.tenant_id
                              ))
                              FROM shifts_devices
                              JOIN device ON shifts_devices.device_id = device.id
                              WHERE shifts_devices.shift_id = shifts.id
                          ),
                          'staff_setup', (
                              SELECT JSON_AGG(JSON_BUILD_OBJECT(
                                  'id', staff_setup.id,
                                  'name', staff_setup.name,
                                  'tenant_id', staff_setup.tenant_id
                              ))
                              FROM shifts_projections_staff
                              JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
                              WHERE shifts_projections_staff.shift_id = shifts.id
                          ),
                          'products', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                            'id', products.id,
                              'name', products.name, 
                              'product_qty',shifts_projections_staff.product_yield,
                              'tenant_id', products.tenant_id
                          ) ) FROM products
                                  JOIN procedure_types_products ON products.id = procedure_types_products.product_id
                                  JOIN shifts_projections_staff ON procedure_types_products.procedure_type_id = shifts_projections_staff.procedure_type_id
                                  JOIN shifts ON shifts_projections_staff.shift_id = shifts.id
                                  WHERE shifts.shiftable_id = ${id} AND
                                  shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND
                                  shifts.is_archived= false
                        ),
                        'procedure_types', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                          'id', procedure_types.id,
                            'name', procedure_types.name, 
                            'procedure_type_qty',shifts_projections_staff.procedure_type_qty,
                            'tenant_id', procedure_types.tenant_id
                        ) ) FROM procedure_types
                                JOIN shifts_projections_staff ON procedure_types.id = shifts_projections_staff.procedure_type_id
                                JOIN shifts ON shifts_projections_staff.shift_id = shifts.id
                                WHERE shifts.shiftable_id = ${id} AND
                                shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND
                                shifts.is_archived= false
                      ),
                          'shifts_projections_staff', (SELECT JSON_AGG( JSON_BUILD_OBJECT(
                            'procedure_type_qty',  shifts_projections_staff.procedure_type_qty,
                            'product_qty', shifts_projections_staff.product_yield
        
                            )
                        )
                        FROM shifts_projections_staff, shifts
                          WHERE shifts.id = shifts_projections_staff.shift_id 
                          AND shifts.shiftable_id = ${id} AND
                          shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.is_archived= false AND shifts_projections_staff.is_archived = false
        
                          )
                      ))
                      FROM shifts
                      WHERE shifts.shiftable_id = drives.id
                      AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                      AND shifts.is_archived= false
                  )`,
          'shifts'
        )
        .where(`drives.is_archived = false AND drives.id = ${id}`)
        .getQuery();

      const SampleCount = await this.drivesRepository.query(queryCount);
      SampleCount['0'].tenant_id = SampleCount['0'].drives.tenant_id;
      SampleCount.tenant_id = SampleCount['0'].drives.tenant_id;

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
}
