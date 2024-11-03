import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDonationSummaryTable1702903610945
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'donation_summary',
      columns: [
        {
          name: 'id',
          type: 'bigint',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'shift_id',
          type: 'bigint',
          isNullable: false,
        },
        {
          name: 'procedure_type_id',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'procedure_type_qty',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'operation_date',
          type: 'date',
          isNullable: false,
        },
        {
          name: 'operation_id',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'operationable_type',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'total_appointments',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'registered',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'performed',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'actual',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'deferrals',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'qns',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'ftd',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'walkout',
          type: 'int',
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          isNullable: false,
        },
        {
          name: 'created_by',
          type: 'bigint',
          isNullable: true,
        },
      ],
    });

    await queryRunner.createTable(table, true);

    const shiftForeignKey = new TableForeignKey({
      columnNames: ['shift_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'shifts',
      onDelete: 'CASCADE',
    });

    const procedureTypeForeignKey = new TableForeignKey({
      columnNames: ['procedure_type_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'procedure_types',
      onDelete: 'CASCADE',
    });

    await queryRunner.createForeignKeys('donation_summary', [
      shiftForeignKey,
      procedureTypeForeignKey,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('donation_summary', 'FK_shift_id');
    await queryRunner.dropForeignKey(
      'donation_summary',
      'FK_procedure_type_id'
    );
    await queryRunner.dropTable('donation_summary');
  }
}
