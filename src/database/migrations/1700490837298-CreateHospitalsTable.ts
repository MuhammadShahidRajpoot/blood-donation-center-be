import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHospitalsTable1700490837298 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hospitals',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true },
          {
            name: 'hospital_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          { name: 'created_by', type: 'bigint', isNullable: false },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hospitals');
  }
}
