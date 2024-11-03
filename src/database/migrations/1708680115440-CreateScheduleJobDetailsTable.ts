import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateScheduleJobDetailsTable1708680115440
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule_job_details',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'job_title',
            type: 'varchar',
            isUnique: true,
            length: '255',
            isNullable: false,
          },
          {
            name: 'job_description',
            type: 'text',
            isNullable: false,
          },
          { name: 'is_active', type: 'boolean', default: false },
        ],
      })
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('schedule_job_details');
  }
}
