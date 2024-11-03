import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';
export class SegmentsContactToDonor1713280411425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('segments_contacts');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('contact_id') !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('segments_contacts', foreignKey);
      await queryRunner.createForeignKey(
        'segments_contacts',
        new TableForeignKey({
          columnNames: ['contact_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'donors',
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
        })
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('segments_contacts');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('contact_id') !== -1
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('segments_contacts', foreignKey);
      await queryRunner.createForeignKey(
        'segments_contacts',
        new TableForeignKey({
          columnNames: ['contact_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'contacts',
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
        })
      );
    }
  }
}
