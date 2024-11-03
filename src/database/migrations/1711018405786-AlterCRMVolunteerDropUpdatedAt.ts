import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCRMVolunteerDropUpdatedAt1623149518546
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column exists before attempting to drop it
    let isColumnExists = await queryRunner.hasColumn(
      'crm_volunteer',
      'updated_at'
    );
    if (isColumnExists) {
      await queryRunner.dropColumn('crm_volunteer', 'updated_at');
    }

    isColumnExists = await queryRunner.hasColumn(
      'crm_volunteer_history',
      'updated_at'
    );
    if (isColumnExists) {
      await queryRunner.dropColumn('crm_volunteer_history', 'updated_at');
    }
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
