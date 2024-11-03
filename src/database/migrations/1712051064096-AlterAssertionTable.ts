import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAssertionTable1712051064096 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'assertion',
      'id',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isGenerated: true,
        generationStrategy: 'increment',
        isPrimary: true,
      })
    );

    await queryRunner.changeColumn(
      'assertion',
      'expiration_months',
      new TableColumn({
        name: 'expiration_months',
        type: 'integer',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
