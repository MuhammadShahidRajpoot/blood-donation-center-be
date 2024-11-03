import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexRegardingAlphabetTTables1703239610564
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // TASK
    await queryRunner.createIndex(
      'task', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASK_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'task', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASK_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // TASK

    // TASK COLLECTION OPERATION
    await queryRunner.createIndex(
      'task_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASK_COLLECTION_OPERATIONS_TASK_ID',
        columnNames: ['task_id'],
      })
    );
    await queryRunner.createIndex(
      'task_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASK_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
    await queryRunner.createIndex(
      'task_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASK_COLLECTION_OPERATIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'task_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASK_COLLECTION_OPERATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // TASK COLLECTION OPERATION
    // TASKS
    await queryRunner.createIndex(
      'tasks', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASKS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'tasks', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASKS_ASSIGNED_TO',
        columnNames: ['assigned_to'],
      })
    );
    await queryRunner.createIndex(
      'tasks', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASKS_ASSIGNED_BY',
        columnNames: ['assigned_by'],
      })
    );
    await queryRunner.createIndex(
      'tasks', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TASKS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // TASKS
    // TEAM
    await queryRunner.createIndex(
      'team', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'team', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // TEAM
    // TEAM COLLECTION OPERAIONS
    await queryRunner.createIndex(
      'team_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_COLLECTION_OPERATIONS_TEAM_ID',
        columnNames: ['team_id'],
      })
    );
    await queryRunner.createIndex(
      'team_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
    await queryRunner.createIndex(
      'team_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_COLLECTION_OPERATIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'team_collection_operations', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_COLLECTION_OPERATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // TEAM COLLECTION OPERAIONS
    // TEAM STAFF
    await queryRunner.createIndex(
      'team_staff', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_STAFF_TEAM_ID',
        columnNames: ['team_id'],
      })
    );
    await queryRunner.createIndex(
      'team_staff', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_STAFF_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'team_staff', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_STAFF_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'team_staff', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TEAM_STAFF_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // TEAM STAFF
    // TENANT
    await queryRunner.createIndex(
      'tenant', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // TENANT
    // TENANT APPLICATIONS
    await queryRunner.createIndex(
      'tenant_applications', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_APPLICATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'tenant_applications', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_APPLICATIONS_APPLICATION_ID',
        columnNames: ['application_id'],
      })
    );
    // TENANT APPLICATIONS
    // TENANT CONFIGURATION DETAIL
    await queryRunner.createIndex(
      'tenant_configuration_detail', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_CONFIGURATION_DETAIL_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'tenant_configuration_detail', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_CONFIGURATION_DETAIL_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // TENANT CONFIGURATION DETAIL
    // TENANT ROLE
    await queryRunner.createIndex(
      'tenant_role', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_ROLE_ROLE_ID',
        columnNames: ['role_id'],
      })
    );
    await queryRunner.createIndex(
      'tenant_role', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TENANT_ROLE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // TENANT ROLE
    // TERRITORY
    await queryRunner.createIndex(
      'territory', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TERRITORY_RECRUITER',
        columnNames: ['recruiter'],
      })
    );
    await queryRunner.createIndex(
      'territory', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TERRITORY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'territory', // table name
      new TableIndex({
        // creating new index
        name: 'IDX_TERRITORY_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // TERRITORY
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    // TASK
    await queryRunner.dropIndex('task', 'IDX_TASK_TENANT_ID');
    await queryRunner.dropIndex('task', 'IDX_TASK_CREATED_BY');
    // TASK
    // TASK COLLECTION OPERATION
    await queryRunner.dropIndex(
      'task_collection_operations',
      'IDX_TASK_COLLECTION_OPERATIONS_TASK_ID'
    );
    await queryRunner.dropIndex(
      'task_collection_operations',
      'IDX_TASK_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex(
      'task_collection_operations',
      'IDX_TASK_COLLECTION_OPERATIONS_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'task_collection_operations',
      'IDX_TASK_COLLECTION_OPERATIONS_TENANT_ID'
    );
    // TASK COLLECTION OPERATION
    // TASKS
    await queryRunner.dropIndex('tasks', 'IDX_TASKS_TENANT_ID');
    await queryRunner.dropIndex('tasks', 'IDX_TASKS_ASSIGNED_TO');
    await queryRunner.dropIndex('tasks', 'IDX_TASKS_ASSIGNED_BY');
    await queryRunner.dropIndex('tasks', 'IDX_TASKS_CREATED_BY');
    // TASKS
    // TEAM
    await queryRunner.dropIndex('team', 'IDX_TEAM_CREATED_BY');
    await queryRunner.dropIndex('team', 'IDX_TEAM_TENANT_ID');
    // TEAM
    // TEAM COLLECTION OPERAIONS
    await queryRunner.dropIndex(
      'team_collection_operations',
      'IDX_TEAM_COLLECTION_OPERATIONS_TEAM_ID'
    );
    await queryRunner.dropIndex(
      'team_collection_operations',
      'IDX_TEAM_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex(
      'team_collection_operations',
      'IDX_TEAM_COLLECTION_OPERATIONS_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'team_collection_operations',
      'IDX_TEAM_COLLECTION_OPERATIONS_TENANT_ID'
    );
    // TEAM COLLECTION OPERAIONS
    // TEAM STAFF
    await queryRunner.dropIndex('team_staff', 'IDX_TEAM_STAFF_TEAM_ID');
    await queryRunner.dropIndex('team_staff', 'IDX_TEAM_STAFF_STAFF_ID');
    await queryRunner.dropIndex('team_staff', 'IDX_TEAM_STAFF_CREATED_BY');
    await queryRunner.dropIndex('team_staff', 'IDX_TEAM_STAFF_TENANT_ID');
    // TEAM STAFF
    // TENANT
    await queryRunner.dropIndex('tenant', 'IDX_TENANT_CREATED_BY');
    // TENANT
    // TENANT APPLICATIONS
    await queryRunner.dropIndex(
      'tenant_applications',
      'IDX_TENANT_APPLICATIONS_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'tenant_applications',
      'IDX_TENANT_APPLICATIONS_APPLICATION_ID'
    );
    // TENANT APPLICATIONS
    // TENANT CONFIGURATION DETAIL
    await queryRunner.dropIndex(
      'tenant_configuration_detail',
      'IDX_TENANT_CONFIGURATION_DETAIL_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'tenant_configuration_detail',
      'IDX_TENANT_CONFIGURATION_DETAIL_CREATED_BY'
    );
    // TENANT CONFIGURATION DETAIL
    // TENANT ROLE
    await queryRunner.dropIndex('tenant_role', 'IDX_TENANT_ROLE_ROLE_ID');
    await queryRunner.dropIndex('tenant_role', 'IDX_TENANT_ROLE_TENANT_ID');
    // TENANT ROLE
    // TERRITORY
    await queryRunner.dropIndex('territory', 'IDX_TERRITORY_RECRUITER');
    await queryRunner.dropIndex('territory', 'IDX_TERRITORY_TENANT_ID');
    await queryRunner.dropIndex('territory', 'IDX_TERRITORY_CREATED_BY');
    // TERRITORY
  }
}
