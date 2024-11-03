import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableDialingCenterCallJobsRemoveIsArchived1711973283693
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('dialing_center_call_jobs', 'is_archived');
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
