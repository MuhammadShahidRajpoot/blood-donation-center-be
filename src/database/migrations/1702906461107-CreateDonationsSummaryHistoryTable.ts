import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDonationsSummeryHistoryTable1702906461107
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'donations_summary_history',
      columns: [
        {
          name: 'rowkey',
          type: 'bigint',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        { name: 'history_reason', type: 'varchar(1)', isNullable: false },
        { name: 'id', type: 'bigint', isNullable: false },
        { name: 'shift_id', type: 'bigint', isNullable: false },
        { name: 'procedure_type_id', type: 'int', isNullable: false },
        { name: 'procedure_type_qty', type: 'int', isNullable: false },
        { name: 'operation_date', type: 'date', isNullable: false },
        { name: 'operation_id', type: 'int', isNullable: false },
        { name: 'operationable_type', type: 'int', isNullable: false },
        { name: 'total_appointments', type: 'int', isNullable: false },
        { name: 'registered', type: 'int', isNullable: false },
        { name: 'performed', type: 'int', isNullable: false },
        { name: 'actual', type: 'int', isNullable: false },
        { name: 'deferrals', type: 'int', isNullable: false },
        { name: 'qns', type: 'int', isNullable: false },
        { name: 'ftd', type: 'int', isNullable: false },
        { name: 'walkout', type: 'int', isNullable: false },
        { name: 'created_at', type: 'timestamp', isNullable: false },
        { name: 'created_by', type: 'bigint', isNullable: true },
      ],
    });

    await queryRunner.createTable(table, true);

    const idForeignKey = new TableForeignKey({
      columnNames: ['id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'donation_summary',
      onDelete: 'CASCADE',
    });

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

    await queryRunner.createForeignKeys('donations_summary_history', [
      idForeignKey,
      shiftForeignKey,
      procedureTypeForeignKey,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('donations_summary_history', 'FK_id');
    await queryRunner.dropForeignKey(
      'donations_summary_history',
      'FK_shift_id'
    );
    await queryRunner.dropForeignKey(
      'donations_summary_history',
      'FK_procedure_type_id'
    );

    await queryRunner.dropTable('donations_summary_history');
  }
}
