import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class AddTeanatIdInDialingCenterNotes1713280645437 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'dialing_centers_notes',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      'dialing_centers_notes',
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
    const table = await queryRunner.getTable('dialing_centers_notes');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tenant_id') !== -1
    );
    await queryRunner.dropForeignKey('dialing_centers_notes', foreignKey);
    await queryRunner.dropColumn('dialing_centers_notes', 'tenant_id');
  }

}
