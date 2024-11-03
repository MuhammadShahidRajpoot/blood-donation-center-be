import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class AlterDonorDonationsTableForBBCS1712153642645 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('donors_donations', [
      new TableColumn({
        name: 'appointment_id',
        type: 'bigint',
        isNullable: true,
      }),
      new TableColumn({
        name: 'procedure_id',
        type: 'bigint',
        isNullable: true,
      }),
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'donors_appointments',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_appointment_id',
      })
    );

    await queryRunner.createForeignKey(
      'donors_donations',
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
    await queryRunner.dropColumns('donors_donations', ['appointment_id', 'procedure_id', 'tenant_id']);
    await queryRunner.dropForeignKey('donors_donations', 'FK_appointment_id');
    await queryRunner.dropForeignKey('donors_donations', 'FK_tenant_id');
  }

}
