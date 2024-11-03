import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterProductProcedures1711349971736 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'procedure_types',
      new TableColumn({
        name: 'becs_appointment_reason',
        type: 'varchar(255)',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'procedure_types_history',
      new TableColumn({
        name: 'becs_appointment_reason',
        type: 'varchar(255)',
        isNullable: true,
      })
    );

    // await queryRunner.addColumn(
    //   'procedure',
    //   new TableColumn({
    //     name: 'becs_appointment_reason',
    //     type: 'text',
    //     isNullable: true,
    //   })
    // );

    // await queryRunner.addColumn(
    //   'procedure',
    //   new TableColumn({
    //     name: 'becs_procedure_code',
    //     type: 'text',
    //     isNullable: true,
    //   })
    // );
    // await queryRunner.dropColumn(
    //   'procedure',
    //   new TableColumn({
    //     name: 'becs_appointment_reason',
    //     type: 'bigint',
    //     isNullable: true,
    //   })
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('procedure_types', 'becs_appointment_reason');
    await queryRunner.dropColumn('procedure', 'becs_appointment_reason');
  }
}
