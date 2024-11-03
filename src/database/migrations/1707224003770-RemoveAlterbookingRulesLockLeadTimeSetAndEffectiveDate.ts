import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAlterbookingRulesLockLeadTimeSetAndEffectiveDate1707224003770
  implements MigrationInterface
{
  name = 'RemoveAlterbookingRulesLockLeadTimeSetAndEffectiveDate1707224003770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "booking_rules" ALTER COLUMN "schedule_lock_lead_time" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_rules" ALTER COLUMN "schedule_lock_lead_time_eff_date" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "booking_rules" ALTER COLUMN "schedule_lock_lead_time" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_rules" ALTER COLUMN "schedule_lock_lead_time_eff_date" SET NOT NULL`
    );
  }
}
