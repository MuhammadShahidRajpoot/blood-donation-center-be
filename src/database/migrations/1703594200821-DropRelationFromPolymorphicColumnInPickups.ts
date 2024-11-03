import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class DropRelationFromPolymorphicColumnInPickups1703594200821
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('pickups', 'FK_pickable_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'pickups',
      new TableForeignKey({
        columnNames: ['pickable_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_pickable_id',
      })
    );
  }
}
