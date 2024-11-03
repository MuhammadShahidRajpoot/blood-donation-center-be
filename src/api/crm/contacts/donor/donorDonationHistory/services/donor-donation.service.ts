import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { Sort } from 'src/common/interface/sort';
import { pagination } from 'src/common/utils/pagination';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { HistoryService } from 'src/api/common/services/history.service';
import { DonorDonationsHistory } from '../entities/donor-donations-history.entity';
import { DonorDonations } from '../entities/donor-donations.entity';
import { FilterDonorDonationsDto } from '../dto/filter-donor-donations.dto';
import { GetAllHospitalsInterface } from '../interfaces/hospital.interface';
import { Hospitals } from '../entities/hospitals.entity';
import { EntityManager, ILike, In, Repository } from 'typeorm';
import { DonationStatusEnum } from '../../enum/donors.enum';
import moment from 'moment';

@Injectable()
export class DonorDonationService extends HistoryService<DonorDonationsHistory> {
  constructor(
    @InjectRepository(DonorDonations)
    private readonly donRepository: Repository<DonorDonations>,
    @InjectRepository(DonorDonationsHistory)
    readonly donHistoryRepository: Repository<DonorDonationsHistory>,
    @InjectRepository(Hospitals)
    readonly hospitalRepository: Repository<Hospitals>,
    private readonly entityManager: EntityManager
  ) {
    super(donHistoryRepository);
  }

  async get(
    page: number,
    limit: number,
    sortBy: Sort,
    filter: FilterDonorDonationsDto
  ) {
    function removeDonPrefix(data) {
      const result = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const newKey = key.replace(/^don_/, '');
          result[newKey] = data[key];
        }
      }
      return result;
    }

    try {
      let donorDonationCondition =
        'don.is_archived = false AND drives.is_blueprint = false';
      // if (filter.hospital) {
      //   const response = await this.hospitalRepository
      //     .createQueryBuilder('hospital')
      //     .where({
      //       id: In(filter.hospital),
      //     })
      //     .getMany();
      //   const hospitalIds = response.map((hospital) => hospital.id);
      //   donorDonationCondition = `${donorDonationCondition} AND don.account_id IN (${hospitalIds})`;
      // }

      let donorDonQuery = this.donRepository
        .createQueryBuilder('don')
        .leftJoin('procedure', 'pt', 'don.donation_type = pt.id')
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
          'id', type.id,
          'name', type.name,
          'credit', pt.credits
          )FROM procedure_types AS type WHERE type.id = pt.procedure_type_id  )`,
          'procedure'
        )
        .leftJoin('facility', 'fy', 'don.facility_id = fy.id')
        .addSelect('fy.name AS location')
        .innerJoin(
          'donors_donations_hospitals',
          'ddh',
          'don.id = ddh.donors_donations_id'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
            'id', hospital.id,
            'name', hospital.hospital_name
            )FROM hospitals AS hospital WHERE hospital.id = ddh.hospitals_id )`,
          'hospital'
        )
        .addSelect('ddh.date_shipped AS dateShipped');

      const where = {};

      Object.assign(where, {
        donor_id: filter?.donor_id,
      });

      if (filter.status) {
        Object.assign(where, {
          donation_status: filter?.status,
        });
      }

      donorDonQuery.where(where);

      if (filter.procedure_type.length > 0) {
        const procedureIds = filter.procedure_type;

        donorDonQuery = donorDonQuery.andWhere(
          'pt.procedure_type_id  IN (:...procedureIds)',
          {
            procedureIds,
          }
        );
      }

      if (filter.start_date && filter.end_date) {
        const startDate = filter.start_date;
        const endDate = filter.end_date;
        donorDonQuery = donorDonQuery.andWhere(
          'don.donation_date BETWEEN :startDate AND :endDate',
          { startDate, endDate }
        );
      }

      if (filter.hospital.length > 0) {
        const hospitalIds = filter.hospital;

        donorDonQuery = donorDonQuery.andWhere(
          'ddh.hospitals_id IN (:...hospitalIds)',
          {
            hospitalIds,
          }
        );
      }

      if (sortBy.sortName && sortBy.sortOrder) {
        if (sortBy.sortName == 'location') {
          donorDonQuery = donorDonQuery.addOrderBy('fy.name', sortBy.sortOrder);
        } else if (sortBy.sortName == 'procedure') {
          donorDonQuery = donorDonQuery.leftJoinAndSelect(
            'pt.procedure_type_id',
            'type'
          );
          donorDonQuery = donorDonQuery.addOrderBy(
            'type.name',
            sortBy.sortOrder
          );
        } else if (sortBy.sortName == 'dateshipped') {
          donorDonQuery = donorDonQuery.addOrderBy(
            'ddh.date_shipped',
            sortBy.sortOrder
          );
        } else if (sortBy.sortName == 'hospital') {
          donorDonQuery = donorDonQuery.leftJoinAndSelect(
            'ddh.hospitals_id',
            'hospitals_id'
          );
          donorDonQuery = donorDonQuery.addOrderBy(
            'hospitals_id.hospital_name',
            sortBy.sortOrder
          );
        } else if (sortBy.sortName == 'credit') {
          donorDonQuery = donorDonQuery.addOrderBy(
            'pt.credits',
            sortBy.sortOrder
          );
        } else {
          donorDonQuery = donorDonQuery.addOrderBy(
            sortBy.sortName,
            sortBy.sortOrder
          );
        }
      }

      const count = await donorDonQuery.getCount();

      if (page && limit) {
        const { skip, take } = pagination(page, limit);
        donorDonQuery = donorDonQuery.limit(take).offset(skip);
      }

      let records = await donorDonQuery.getRawMany();

      records = records.map((record) => {
        return removeDonPrefix(record);
      });

      return resSuccess(
        'Donor Donation records',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { count, records }
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllHospitals(getAllHospitalsInterface: GetAllHospitalsInterface) {
    const fetchAll = getAllHospitalsInterface?.fetchAll === true;
    const sortName = getAllHospitalsInterface?.sortName;
    const sortBy = getAllHospitalsInterface?.sortOrder;

    if ((sortName && !sortBy) || (sortBy && !sortName)) {
      return new HttpException(
        'When selecting sort SortBy & SortName is required.',
        HttpStatus.BAD_REQUEST
      );
    }

    let response;
    let count;

    const sorting: { [key: string]: 'ASC' | 'DESC' } = {};
    if (sortName && sortBy) {
      sorting[sortName] = sortBy.toUpperCase() as 'ASC' | 'DESC';
    } else {
      sorting['id'] = 'DESC';
    }

    const limit: number = getAllHospitalsInterface?.limit
      ? +getAllHospitalsInterface.limit
      : +process.env.PAGE_SIZE;

    const page = getAllHospitalsInterface?.page
      ? +getAllHospitalsInterface.page
      : 1;
    if (fetchAll) {
      [response, count] = await this.hospitalRepository.findAndCount({
        where: {
          is_archived: false,
        },
        order: sorting,
        relations: ['created_by'],
      });
    } else {
      const page = getAllHospitalsInterface?.page
        ? +getAllHospitalsInterface.page
        : 1;

      [response, count] = await this.hospitalRepository.findAndCount({
        where: {
          is_archived: false,
          ...(getAllHospitalsInterface?.keyword && {
            name: ILike(`%${getAllHospitalsInterface?.keyword}%`),
          }),
        },
        take: limit,
        skip: (page - 1) * limit,
        order: sorting,
        relations: ['created_by'],
      });
    }

    return {
      status: HttpStatus.OK,
      response: 'Hospitals Fetched ',
      count: count,
      data: response,
    };
  }

  async mapBBCSDonationHistory(donor, row, donorProcedure = null) {
    const appointmentableType = row?.drive == 0 ? 'sessions' : 'drives';
    const newDonation = new DonorDonations();
    newDonation.donor_id = donor.id;
    newDonation.bbcs_uuid = row.UUID;
    if (donorProcedure) {
      newDonation.donation_type = donorProcedure.procedure_type_id;
      newDonation.procedure_id = donorProcedure.id;
      newDonation.points = donorProcedure.credits;
    }
    // handle status
    let status;
    switch(row?.outcome) {
      case "010": 
      status = parseInt(DonationStatusEnum.Donated_010);
        break;
      default:
        status = parseInt(DonationStatusEnum.Appeared_005)
        break;
    }
    newDonation.donation_status = status;
    const donationDate = moment(row?.date).format("YYYY-MM-DD");
    const donationDateTime = moment(row?.date).format("YYYY-MM-DD HH:mm:ss");
    // // get appointment Id
    const appointmentIdResult = await this.entityManager.query(`
        SELECT donors_appointments.id FROM donors_appointments 
        INNER JOIN shifts_slots ON donors_appointments.slot_id = shifts_slots.id
        WHERE donors_appointments.donor_id=${donor.id} AND donors_appointments.appointmentable_type = '${appointmentableType}'
        AND shifts_slots.start_time = '${donationDateTime}'
        LIMIT 1`);
        const appointmentId = appointmentIdResult[0]?.id;
    if (appointmentId) {
        newDonation.appointment_id = appointmentId;
    }
    // // get facility Id
    if (appointmentableType === "sessions") {
      const facilityIdResult = await this.entityManager.query(`
          SELECT f.id FROM facility f
          INNER JOIN sessions s ON f.id = s.donor_center_id AND s.date='${donationDate}' AND f.tenant_id=${donor.tenant_id}
          WHERE f.code = '${row?.source}' AND s.tenant_id=${donor.tenant_id}
          LIMIT 1
        `);
        const facilityId = facilityIdResult[0]?.id;
        if(facilityId) {
            newDonation.facility_id = facilityId;
        }
    } else {
      const driveIdResult = await this.entityManager.query(`
        SELECT d.id FROM crm_locations cl
        INNER JOIN drives d ON cl.id = d.location_id AND d.date='${donationDate}' AND cl.tenant_id=${donor.tenant_id}
        WHERE cl.becs_code = '${row?.source}' AND d.tenant_id=${donor.tenant_id}
        LIMIT 1
      `);
      const driveId = driveIdResult[0]?.id;
      if(driveId) {
        newDonation.drive_id = driveId;
      }
    }
    newDonation.donation_date = moment(row.date).toDate();
    if(donor?.account_id) {
      newDonation.account_id = donor.account_id;
    }
    newDonation.created_by = donor.created_by?.id;
    newDonation.tenant_id = donor.tenant_id;
    newDonation.is_archived = false;
    return newDonation;
  }
}
