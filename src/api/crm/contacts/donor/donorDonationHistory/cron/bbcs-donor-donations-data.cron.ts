import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { DonorDonations } from '../entities/donor-donations.entity';
import { DonorDonationsHospitals } from '../entities/donor-donations-hospitals.entity';
import { Hospitals } from '../entities/hospitals.entity';
import { HospitalsHistory } from '../entities/hospitals-history.entity';
import { Donors } from '../../entities/donors.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { BBCSConnector } from 'src/connector/bbcsconnector';

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

@Injectable()
export class DonorDonationsDataBBCS {
  constructor(
    @InjectRepository(Donors)
    private readonly donorRepository: Repository<Donors>,
    @InjectRepository(DonorDonations)
    private readonly donorDonationsRepository: Repository<DonorDonations>,
    @InjectRepository(DonorDonationsHospitals)
    private readonly donorDonationsHospitalsRepository: Repository<DonorDonationsHospitals>,
    @InjectRepository(Hospitals)
    private readonly hospitalsRepository: Repository<Hospitals>,
    @InjectRepository(HospitalsHistory)
    private readonly hospitalsHistoryRepository: Repository<HospitalsHistory>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly BBCSConnectorService: BBCSConnector,
    private readonly entityManager: EntityManager
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async triggerDonorDonationsHospitalsBBCSAssertion() {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      console.log(
        'CRON: Donor Donation History - Job Started _______________________________',
        moment().format()
      );
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const filePath = path.resolve('./src/imports/bbcs-donor-donations.csv');

      const csvPromise = new Promise(function (resolve, reject) {
        let fetchData = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row: any) => {
            fetchData.push(row);
          })
          .on('end', () => {
            console.log('CSV file successfully processed');
            resolve(fetchData);
          })
          .on('error', reject);
      });
      const csvArray: any = await csvPromise;

      for (const row of csvArray) {
        const donorFound: any = await this.donorRepository.findOne({
          where: {
            external_id: row?.BBCS_DONOR_UUID,
            is_archived: false,
          },
          relations: ['tenant_id', 'created_by'],
        });
        if (!donorFound) {
          continue;
        } else {
          const foundDonation: any =
            await this.donorDonationsRepository.findOneBy({
              donor_id: { id: donorFound?.id },
              donation_date: row?.DONATION_DATE,
              is_archived: false,
            });
          if (!foundDonation) {
            continue;
          } else {
            const foundHospital: any = await this.hospitalsRepository.findOneBy(
              {
                hospital_name: row?.HOSPITAL,
              }
            );
            if (!foundHospital) {
              const hospitalData = new Hospitals();
              hospitalData.hospital_name = row?.HOSPITAL;
              hospitalData.is_archived = false;
              hospitalData.created_by = donorFound?.created_by?.id;
              const newHospital: any = await queryRunner.manager.save(
                hospitalData
              );

              const address = new Address();
              address.address1 = row?.HOSPITAL_ADDRESS_1;
              address.address2 = row?.HOSPITAL_ADDRESS_2;
              address.zip_code = row?.HOSPITAL_ZIPCODE;
              address.city = row?.HOSPITAL_CITY;
              address.state = row?.HOSPITAL_STATE;
              address.country = row?.HOSPITAL_STATE;
              address.created_by = donorFound?.created_by?.id;
              address.addressable_id = newHospital?.id;
              address.addressable_type = 'hospital';
              address.tenant_id = donorFound?.tenant_id?.id;
              address.latitude = 1;
              address.longitude = 1;
              if (row?.latitude && row?.longitude) {
                address.coordinates = `(${row?.latitude}, ${row?.longitude})`;
              }
              await queryRunner.manager.save(address);

              const donation_hospital = new DonorDonationsHospitals();
              donation_hospital.created_by = donorFound?.created_by?.id;
              donation_hospital.date_shipped = row?.SHIPMENT_DATE;
              donation_hospital.donors_donations_id = foundDonation?.id;
              donation_hospital.hospitals_id = newHospital?.id;
              donation_hospital.is_archived = false;

              await queryRunner.manager.save(donation_hospital);
            } else {
              const existingDonationHospital =
                await this.donorDonationsHospitalsRepository.findOne({
                  where: {
                    donors_donations_id: { id: foundDonation?.id },
                    is_archived: false,
                  },
                  relations: ['donors_donations_id'],
                });
              if (!existingDonationHospital) {
                const donation_hospital = new DonorDonationsHospitals();
                donation_hospital.created_by = donorFound?.created_by?.id;
                donation_hospital.date_shipped = row?.SHIPMENT_DATE;
                donation_hospital.donors_donations_id = foundDonation?.id;
                donation_hospital.hospitals_id = foundHospital?.id;
                donation_hospital.is_archived = false;

                await queryRunner.manager.save(donation_hospital);
              } else {
                continue;
              }
            }
          }
        }
      }

      console.log(
        'CRON: Donor Donation History - Job Finished _______________________________',
        moment().format()
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerBBCSDonorDonationAssertion() {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      console.log(
        'CRON: Donor Donation Assertion - Job Started _______________________________',
        moment().format()
      );
      await queryRunner.connect();
      await queryRunner.startTransaction();
      let start = null;
      const limit = 50;
      const date = new Date('2000-12-12 00:00:00.000');
      const bbcsDonationsData =
        await this.BBCSConnectorService.fetchDonorsDonationsData(
          limit,
          start || '',
          date?.toISOString()
        );
      if (bbcsDonationsData?.data?.length > 0) {
        for (const row of bbcsDonationsData?.data) {
          const donorFound: any = await this.donorRepository.findOne({
            where: {
              external_id: row?.UUID,
              is_archived: false,
            },
            relations: ['tenant_id', 'created_by'],
          });
          if (!donorFound) {
            const bbcsSingleDonor =
              await this.BBCSConnectorService.fetchSingleDonorsData(row.UUID);

            const newDonor = new Donors();
            newDonor.external_id = row?.UUID;
            newDonor.donor_number = row?.donorNumber;
            newDonor.first_name = row?.firstName;
            newDonor.last_name = row?.lastName;
            newDonor.birth_date = row?.birthDate;
            // newDonor.blood_type = row?.bloodType;
            newDonor.gender = row?.gender;
            newDonor.is_active = true;
            newDonor.is_archived = false;
            newDonor.appointment_date = row?.appointmentDate;
            newDonor.gallon_award1 = row?.gallonAward1;
            newDonor.gallon_award2 = row?.gallonAward2;
            newDonor.geo_code = row?.geoCode;
            newDonor.greatest_deferral_date = row?.greatestDeferralDate;
            newDonor.group_category = row?.groupCategory;
            newDonor.misc_code = row?.miscCode;
            // newDonor.race = row?.race;
            newDonor.last_donation_date = row?.lastDonationDate;
            newDonor.last_update_date = row?.lastUpdateDate;
            newDonor.next_recruit_date = row?.nextRecruitDate;
            newDonor.record_create_date = row?.recordCreateDate;
            newDonor.rec_result = row?.recResult;
            newDonor.middle_name = row?.middleName;
            // newDonor.created_by = 
            // newDonor.tenant_id = 

            const savedDonor: any = await queryRunner.manager.save(
              newDonor
            );

            const address = new Address();
            address.address1 = row?.addressLine1;
            address.address2 = row?.addressLine2;
            address.zip_code = row?.zipCode;
            address.city = row?.city;
            address.state = row?.state;
            address.country = row?.HOSPITAL_STATE;
            address.created_by = savedDonor?.created_by?.id;
            address.addressable_id = savedDonor?.id;
            address.addressable_type = 'donors';
            address.tenant_id = savedDonor?.tenant_id?.id;
            address.latitude = 1;
            address.longitude = 1;
            if (row?.latitude && row?.longitude) {
              address.coordinates = `(${row?.latitude}, ${row?.longitude})`;
            }
            await queryRunner.manager.save(address);
            // await this.BBCSConnectorService.getDonorEligibility(
            //   row.UUID,
            //   moment(date?.toISOString()),
            //   null
            // );
            console.log('......................', bbcsSingleDonor);
          } else {
          }
        }
      }
      console.log('......................', bbcsDonationsData.data[0]);
      console.log(
        'CRON: Donor Donation Assertion - Job Finished _______________________________',
        moment().format()
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
