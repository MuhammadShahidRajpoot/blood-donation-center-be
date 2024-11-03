import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { CallJobContacts } from '../../manage-segments/entities/call-job-contacts.entity';

@Injectable()
export class CallMaxCountReset {
  constructor(
    @InjectRepository(CallJobContacts)
    private readonly callJobContactsRepository: Repository<CallJobContacts>,
    private readonly entityManager: EntityManager
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async triggerCallMaxCountReset() {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      console.log(
        'Call Job Max Count Reset CRON Job Started _______________________________',
        moment().format()
      );
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const callJobContacts: any = await this.callJobContactsRepository.find();

      const updatePromises = [];
      for (const callJobContact of callJobContacts) {
        updatePromises.push(
          queryRunner.manager.update(
            CallJobContacts,
            { id: callJobContact.id },
            { max_call_count: BigInt(0) }
          )
        );
      }
      await Promise.all(updatePromises);
      await queryRunner.commitTransaction();

      console.log('No. of the records affected: ', callJobContacts.length);

      console.log(
        'Call Job Max Count Reset Cron Job Finished _______________________________',
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
