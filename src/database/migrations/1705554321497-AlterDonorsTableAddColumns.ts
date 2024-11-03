import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterDonorsTableAddColumns1705554321497
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donors',
      'blood_type',
      new TableColumn({
        name: 'blood_group_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'donors',
      'race',
      new TableColumn({
        name: 'race_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'donors',
      new TableForeignKey({
        columnNames: ['blood_group_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blood_groups',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_blood_group_id',
      })
    );

    await queryRunner.createForeignKey(
      'donors',
      new TableForeignKey({
        columnNames: ['race_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'becs_races',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_race_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donors',
      'blood_type_id',
      new TableColumn({
        name: 'blood_type',
        type: 'varchar',
        length: '60',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'donors',
      'race',
      new TableColumn({
        name: 'race',
        type: 'varchar',
        isNullable: true,
      })
    );

    await queryRunner.dropForeignKey('donors', 'FK_blood_group_id');
    await queryRunner.dropForeignKey('donors', 'FK_race_id');
  }
}
