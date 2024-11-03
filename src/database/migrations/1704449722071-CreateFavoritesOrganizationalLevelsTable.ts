import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateFavoritesOrganizationalLevelsTable1704449722071
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'favorites_org_levels',
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
          name: 'organization_level_id',
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

    const organizationalLevelsForeignKey = new TableForeignKey({
      columnNames: ['organization_level_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'organizational_levels',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_organization_level_id',
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

    await queryRunner.createForeignKeys('favorites_org_levels', [
      favoritesForeignKey,
      organizationalLevelsForeignKey,
      createdByForeignKey,
      tenantForeignKey,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('favorites_org_levels', 'FK_favorites_id');
    await queryRunner.dropForeignKey(
      'favorites_org_levels',
      'FK_organization_level_id'
    );
    await queryRunner.dropForeignKey(
      'favorites_org_levels',
      'FK_created_by_id'
    );
    await queryRunner.dropForeignKey('favorites_org_levels', 'FK_tenant_id');
    await queryRunner.dropTable('favorites_org_levels');
  }
}
