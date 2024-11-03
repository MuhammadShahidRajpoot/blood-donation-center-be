import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrmLocations } from '../../entities/crm-locations.entity';
import { Qualification } from '../entities/qualification.entity';
import { QualificationHistory } from '../entities/qualification-history.entity';
import moment from 'moment';

@Injectable()
export class QualificationExpiration {
  constructor(
    @InjectRepository(CrmLocations)
    private readonly LocationsRepo: Repository<CrmLocations>,
    @InjectRepository(Qualification)
    private readonly QualificationRepo: Repository<Qualification>,
    private readonly entityManager: EntityManager
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerQualificationExpiration() {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      console.log(
        'CRON: Qualifications Expiration - Job Started _______________________________',
        moment().format()
      );
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const getExpiredQualification = await this.QualificationRepo.find({
        where: {
          qualification_expires: LessThan(new Date()),
          qualification_status: true,
        },
      });
      if (getExpiredQualification) {
        for (const qu of getExpiredQualification) {
          let data = new Qualification();
          data = qu;
          data.qualification_status = false;
          queryRunner.manager.save(data);

          const findLocation = await this.LocationsRepo.findOne({
            where: {
              id: qu.location_id as any,
            },
          });
          if (findLocation) {
            let updateLocation = new CrmLocations();
            updateLocation = findLocation;
            updateLocation.qualification_status = 'Expired';
            queryRunner.manager.save(updateLocation);
          }
        }
      }

      await queryRunner.commitTransaction();

      console.log(
        'CRON: Qualification Expiration - Job Finished _______________________________',
        moment().format()
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
