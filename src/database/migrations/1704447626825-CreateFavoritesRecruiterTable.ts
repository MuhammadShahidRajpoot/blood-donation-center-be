import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFavoritesRecruiterTable1704447626825
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'favorites_recruiters',
      columns: [
        {
          name: 'id',
          type: 'bigint',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'favorite_id',
          type: 'bigint',
          isNullable: false,
        },
        {
          name: 'recruiter_id',
          type: 'bigint',
          isNullable: false,
        },
        {
          name: 'tenant_id',
          type: 'bigint',
          isNullable: false,
        },
        {
          name: 'is_archived',
          type: 'boolean',
          default: false,
          isNullable: false,
        },
        {
          name: 'is_active',
          type: 'boolean',
          default: true,
          isNullable: false,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          isNullable: false,
          default: `('now'::text)::timestamp(6) with time zone`,
        },
        {
          name: 'created_by',
          type: 'bigint',
          isNullable: true,
        },
      ],
    });

    await queryRunner.createTable(table, true);

    const favoritesForeignKey = new TableForeignKey({
      columnNames: ['favorite_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'favorites',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_favorites_id',
    });

    const userForeignKey = new TableForeignKey({
      columnNames: ['recruiter_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_recruiter_id',
    });
    const createdByForeignKey = new TableForeignKey({
      columnNames: ['created_by'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_created_by_id',
    });
    const tenantForeignKey = new TableForeignKey({
      columnNames: ['tenant_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'tenant',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_tenant_id',
    });

    await queryRunner.createForeignKeys('favorites_recruiters', [
      favoritesForeignKey,
      userForeignKey,
      createdByForeignKey,
      tenantForeignKey,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('favorites_recruiters', 'FK_favorites_id');
    await queryRunner.dropForeignKey('favorites_recruiters', 'FK_recruiter_id');
    await queryRunner.dropForeignKey(
      'favorites_recruiters',
      'FK_created_by_id'
    );
    await queryRunner.dropForeignKey('favorites_recruiters', 'FK_tenant_id');
    await queryRunner.dropTable('favorites_recruiters');
  }
}
