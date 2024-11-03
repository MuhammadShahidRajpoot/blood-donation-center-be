import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DonationsSummery } from '../entities/sessions-donation-summery.entity';
import { DonationsSummeryDTO } from '../dto/donations-summery.dto';
import { GetAllDonationsSummerInterface } from '../interfaces/donations.summery.interface';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Sessions } from '../../entities/sessions.entity';
import { EditDonationsSummeryDTO } from '../dto/edit-donations-summeries.dto';
import { DonationsSummeryHistory } from '../entities/sessions-donations-summery-history.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
// import { Shifts } from 'src/api/shifts/entities/shifts.entity';
// import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';

@Injectable()
export class DonationsSummeryService {
  constructor(
    @Inject(REQUEST)
    private readonly request: UserRequest,
    @InjectRepository(DonationsSummery)
    private readonly donationsSummeryRepository: Repository<DonationsSummery>,
    @InjectRepository(DonationsSummeryHistory)
    private readonly donationsSummeryHistoryRepository: Repository<DonationsSummeryHistory>,
    @InjectRepository(Shifts)
    private readonly shiftsRepo: Repository<Shifts>,
    @InjectRepository(Sessions)
    private readonly sessionsRepo: Repository<Sessions>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    private readonly entityManager: EntityManager
  ) {}

  async getAll(id, queryParams) {
    try {
      const {
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        operationable_type,
      } = queryParams;
      if (!id) {
        return resError('session_id is required', ErrorConstants.Error, 400);
      }
      let sortOrder = queryParams?.sortOrder;
      let sortName = queryParams?.sortName;
      console.log({ queryParams, sortName, sortOrder });

      if (sortName) {
        if (sortName == 'oef_products') {
          sortName = `(SELECT shifts.oef_products from shifts WHERE shifts.shiftable_id = ${id}
          AND shifts.shiftable_type = '${operationable_type}'
          AND shifts.is_archived = false LIMIT 1)`;
          sortOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
        }
        if (sortName == 'oef_procedures') {
          sortName = `shifts.oef_procedures`;
          sortOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
        }
      } else {
        sortName = 'shifts.id';
        sortOrder = 'DESC';
      }
      console.log({ queryParams, sortName, sortOrder });
      const sessionDetails = await this.shiftsRepo
        .createQueryBuilder('shifts')
        .select(
          `JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', shifts.id,
        'oef_products', shifts.oef_products,
        'oef_procedures', shifts.oef_procedures,
        'date', shifts.created_at,
        'tenant_id', shifts.tenant_id,
        'donations_summary', (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'procedure_type_qty', donation_summary.procedure_type_qty,
              'operation_date', donation_summary.operation_date,
              'total_appointments', donation_summary.total_appointments,
              'registered', donation_summary.registered,
              'performed', donation_summary.performed,
              'actual', donation_summary.actual,
              'deferrals', donation_summary.deferrals,
              'qns', donation_summary.qns,
              'ftd', donation_summary.ftd,
              'walkout', donation_summary.walkout,
              'created_at', donation_summary.created_at,
              'shifts_projections_staff', (
                SELECT 
                  JSON_BUILD_OBJECT(
                    'total_product_yield', SUM(shifts_projections_staff.product_yield),
                    'total_procedure_type_qty', SUM(shifts_projections_staff.procedure_type_qty)
                  )
                FROM shifts_projections_staff
                WHERE shifts_projections_staff.shift_id = shifts.id
                  AND shifts_projections_staff.procedure_type_id = donation_summary.procedure_type_id
              )
            )
          )
          FROM (
            SELECT DISTINCT ON (shift_id, procedure_type_id) * FROM donation_summary
          ) donation_summary
          WHERE donation_summary.shift_id = shifts.id
        )
      )
    ) AS "shifts"`
        )
        .where(
          `shifts.id IN (SELECT DISTINCT ON (id) id FROM shifts WHERE shiftable_id = ${id} AND shiftable_type = '${operationable_type}' AND is_archived = false)`
        )
        .groupBy('shifts.id')
        .orderBy('shifts.id', 'DESC')
        .limit(limit)
        .offset((page - 1) * limit)
        .getQuery();

      const data = await this.sessionsRepo.query(sessionDetails);

      data[0] = {
        ...data[0],
        tenant_id: data[0]?.shifts[0]?.tenant_id || this.request.user.tenant.id,
      };
      return resSuccess(
        'Shifts Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        data
      );
    } catch (error) {
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async create(
    createDto: DonationsSummeryDTO,
    session_id,
    shift_id,
    procedure_type_id,
    user
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const sessionExist = await this.sessionsRepo.findOne({
        where: {
          id: session_id,
          is_archived: false,
        },
      });

      if (!sessionExist) {
        return resError(
          'not data against this session',
          ErrorConstants.Error,
          400
        );
      }
      const shiftExist = await this.shiftsRepo.findOne({
        where: {
          id: shift_id,
          shiftable_id: sessionExist?.id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
        },
      });

      if (!shiftExist) {
        return resError(
          'not data against this shift',
          ErrorConstants.Error,
          400
        );
      }

      const procedureExist = await this.procedureTypesRepository.findOne({
        where: {
          id: procedure_type_id,
        },
      });

      if (!procedureExist) {
        return resError(
          'not data against this procedure type',
          ErrorConstants.Error,
          400
        );
      }

      const donationSummery = new DonationsSummery();
      donationSummery.total_appointments = createDto.appointments;
      donationSummery.operation_date = createDto.operation_date;
      donationSummery.registered = createDto.registered;
      donationSummery.procedure_type_id = procedureExist?.id;
      donationSummery.procedure_type_qty = createDto.procedure_type_qty;
      donationSummery.performed = createDto.performed;
      donationSummery.actual = createDto.actual;
      donationSummery.deferrals = createDto.deferrals;
      donationSummery.qns = createDto.qns;
      donationSummery.ftd = createDto.ftd;
      donationSummery.walkout = createDto.walk_out;
      donationSummery.created_by = createDto.walk_out;
      donationSummery.walkout = createDto.walk_out;
      donationSummery.shift_id = shiftExist?.id;
      donationSummery.operation_id = sessionExist?.id;
      donationSummery.created_at = new Date();
      donationSummery.operationable_type = 'sessions';
      donationSummery.created_by = user?.id;
      const saveDonationSummery = await queryRunner.manager.save(
        donationSummery
      );

      return resSuccess(
        'Donation Summery Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...donationSummery }
      );
    } catch (error) {
      console.error(error);
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
  async update(
    editDto: EditDonationsSummeryDTO,
    session_id,
    shift_id,
    procedure_type_id,
    user,
    operationable_type
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      console.log('operationable_type0', operationable_type);
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const existingDonationSummery =
        await this.donationsSummeryRepository.findOne({
          where: {
            shift_id: shift_id,
            procedure_type_id: procedure_type_id,
            operation_id: session_id,
            operationable_type: operationable_type,
          },
        });
      if (!existingDonationSummery) {
        return resError(
          'Donation summary not found',
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      existingDonationSummery.total_appointments =
        editDto?.appointments ?? existingDonationSummery.total_appointments;
      existingDonationSummery.registered =
        editDto?.registered ?? existingDonationSummery.registered;
      existingDonationSummery.performed =
        editDto?.performed ?? existingDonationSummery.performed;
      existingDonationSummery.actual =
        editDto?.actual ?? existingDonationSummery.actual;
      existingDonationSummery.deferrals =
        editDto?.deferrals ?? existingDonationSummery.deferrals;
      existingDonationSummery.qns = editDto?.qns ?? existingDonationSummery.qns;
      existingDonationSummery.ftd = editDto?.ftd ?? existingDonationSummery.ftd;
      existingDonationSummery.walkout =
        editDto?.walk_out ?? existingDonationSummery.walkout;
      existingDonationSummery.created_by = user?.id;
      const savedDonationSummery = await this.donationsSummeryRepository.update(
        { id: (existingDonationSummery as DonationsSummery).id },
        {
          ...existingDonationSummery,
        }
      );

      return resSuccess(
        'Donation Summery updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
