import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDiffTables1708610681129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE operations_status_history;');
    await queryRunner.changeColumn(
      'operations_status_history',
      new TableColumn({
        name: 'applies_to',
        type: 'operations_status_history_applies_to_enum[]',
        isNullable: false,
      }),
      new TableColumn({
        name: 'applies_to',
        type: 'text[]',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'procedure',
      new TableColumn({
        name: 'procedure_type_id ',
        type: 'bigint',
        isNullable: true,
      }),
      new TableColumn({
        name: 'procedure_type_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'email_template',
      new TableColumn({
        name: 'templateId',
        type: 'bigint',
        isNullable: true,
      }),
      new TableColumn({
        name: 'templateid',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'email_template_history',
      new TableColumn({
        name: 'templateid',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.query('TRUNCATE TABLE accounts_history;');

    await queryRunner.changeColumn(
      'accounts',
      new TableColumn({
        name: 'RSMO',
        type: 'boolean',
        isNullable: false,
      }),
      new TableColumn({
        name: 'rsmo',
        type: 'boolean',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'accounts_history',
      new TableColumn({
        name: 'RSMO',
        type: 'boolean',
        isNullable: false,
      }),
      new TableColumn({
        name: 'rsmo',
        type: 'boolean',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'accounts',
      new TableColumn({
        name: 'BECS_code',
        type: 'varchar(255)',
        isNullable: true,
      }),
      new TableColumn({
        name: 'becs_code',
        type: 'varchar(255)',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'accounts_history',
      new TableColumn({
        name: 'BECS_code',
        type: 'varchar(255)',
        isNullable: true,
      }),
      new TableColumn({
        name: 'becs_code',
        type: 'varchar(255)',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'task',
      new TableColumn({
        name: 'offset',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'off_set',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'task_history',
      new TableColumn({
        name: 'offset',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'off_set',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'drives_marketing_material_items',
      new TableColumn({
        name: 'marketing_material_id',
        type: 'bigint',
        isNullable: false,
      }),
      new TableColumn({
        name: 'marketing_material_item_id',
        type: 'bigint',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'drives_marketing_material_items_history',
      new TableColumn({
        name: 'marketing_material_id',
        type: 'bigint',
        isNullable: false,
      }),
      new TableColumn({
        name: 'marketing_material_item_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
