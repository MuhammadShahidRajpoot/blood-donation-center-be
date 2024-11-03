import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryService } from 'src/api/common/services/history.service';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { UserRequest } from 'src/common/interface/request';
import { Repository } from 'typeorm';
import { DrivesHistory } from '../entities/drives-history.entity';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

@Injectable()
export class DrivesResultService extends HistoryService<DrivesHistory> {
  constructor(
    @Inject(REQUEST)
    private readonly request: UserRequest,
    @InjectRepository(DrivesHistory)
    private readonly drivesHistoryRepository: Repository<DrivesHistory>,
    @InjectRepository(Shifts)
    private readonly shiftsRepo: Repository<Shifts>
  ) {
    super(drivesHistoryRepository);
  }

  /**
   * check entity exist in database
   * @param repository
   * @param query
   * @param entityName
   * @returns {object}
   */
  async entityExist<T>(
    repository: Repository<T>,
    query,
    entityName
  ): Promise<T> {
    const entityObj = await repository.findOne(query);
    if (!entityObj) {
      resError(
        `${entityName} not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    return entityObj;
  }

  async getDrivesResult(id: bigint) {
    const typeProduct = 'procedure';
    const shifts = await this.shiftsRepo.query(`
    SELECT shifts.oef_procedures,
     drives.date,
    (SELECT COUNT(*) 
             FROM donors_appointments 
             WHERE donors_appointments.slot_id = (SELECT slot.id 
              FROM shifts_slot slot
              WHERE slot.shift_id = shifts.id
              ) 
              
              ) AS appointment_count,
             ${
               typeProduct === 'procedure'
                 ? `(SELECT SUM(sps.product_yields) 
             FROM shifts_projections_staff sps
             WHERE sps.shift_id = shifts.id) 
             AS total_product_yield`
                 : `(SELECT SUM(sps.procedure_type_quantity) 
             FROM shifts_projections_staff sps
             WHERE sps.shift_id = shifts.id)
              AS total_procedure_quantity`
             }
    FROM shifts
    JOIN drives ON shifts.shiftable_id = drives.id
    WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}' 
    AND shifts.shiftable_id = ${id}
`);
    console.log({ shifts });

    return shifts;
  }
}
