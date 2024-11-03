import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export enum telerecruitment_requests_status_enum {
  PENDING = 'pending', // if required approval
  DECLINED = 'declined',
  CREATED = 'created', // if does not requires approval or it is approve
  CANCELLED = 'cancelled',
}

export class CreateTableTelerecruitmentRequests1710945110368
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'telerecruitment_requests',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'job_status',
            type: 'enum',
            enum: Object.values(telerecruitment_requests_status_enum),
            isNullable: false,
          },
          {
            name: 'drive_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_created',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_accepted',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_declined',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'telerecruitment_requests',
      new TableForeignKey({
        columnNames: ['call_job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_jobs',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'telerecruitment_requests',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'telerecruitment_requests',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'telerecruitment_requests',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'telerecruitment_requests',
      'FK_call_job_id'
    );

    await queryRunner.dropForeignKey('telerecruitment_requests', 'FK_drive_id');

    await queryRunner.dropForeignKey(
      'telerecruitment_requests',
      'FK_tenant_id'
    );

    await queryRunner.dropForeignKey(
      'telerecruitment_requests',
      'FK_created_by'
    );

    await queryRunner.dropTable('telerecruitment_requests');
  }
}
