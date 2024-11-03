import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableCallJobContactRemoveColumn1711466066426
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_job_contacts', 'is_archived');
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
