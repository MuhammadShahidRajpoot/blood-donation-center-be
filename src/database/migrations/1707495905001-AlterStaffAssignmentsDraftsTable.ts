import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffAssignmentsDraftsTable1707495905001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.query(`
      do $$ 
      declare 
        role_id_constraint  varchar(255);
      begin 

        SELECT constraint_name into role_id_constraint
        FROM information_schema.key_column_usage
        WHERE table_name = 'staff_assignments_drafts'
        AND column_name = 'role_id';
          
          IF role_id_constraint IS NOT NULL THEN
          EXECUTE 'ALTER TABLE public."staff_assignments_drafts" DROP CONSTRAINT "'||role_id_constraint||'";';
          END IF;
        
        ALTER TABLE staff_assignments_drafts
        ADD CONSTRAINT staff_assignments_drafts_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES contacts_roles(id);
      
      end $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('staff_assignments_drafts', 'tenant_id');
  }
}
