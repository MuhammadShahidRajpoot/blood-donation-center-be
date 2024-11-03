import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AlterSessionsTablePrimaryKey1703594200826
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =================== Get the Donor Donations and Drop the Foreign key for Sessions ==================
    const donors_donations = await queryRunner.getTable('donors_donations');
    const foreignKeyDonors_donations = donors_donations.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('sessions_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'donors_donations',
      foreignKeyDonors_donations
    );

    // =================== Get the Session Promotions and Drop the Foreign key for Sessions ==================
    const sessions_promotions = await queryRunner.getTable(
      'sessions_promotions'
    );
    const foreignKeySessions_promotions = sessions_promotions.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('session_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'sessions_promotions',
      foreignKeySessions_promotions
    );

    const table = await queryRunner.getTable('sessions');
    await queryRunner.dropPrimaryKey(table, table.primaryColumns?.[0]?.name);
    await queryRunner.query(
      "ALTER TABLE sessions ALTER COLUMN id SET DEFAULT nextval('odd_session_sequence')"
    );
    await queryRunner.query('ALTER TABLE sessions ADD PRIMARY KEY (id)');

    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['sessions_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sessions',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'sessions_promotions',
      new TableForeignKey({
        columnNames: ['session_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sessions',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =================== Get the Donor Donations and Drop the Foreign key for Sessions ==================
    const donors_donations = await queryRunner.getTable('donors_donations');
    const foreignKeyDonors_donations = donors_donations.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('sessions_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'donors_donations',
      foreignKeyDonors_donations
    );

    // =================== Get the Session Promotions and Drop the Foreign key for Sessions ==================
    const sessions_promotions = await queryRunner.getTable(
      'sessions_promotions'
    );
    const foreignKeySessions_promotions = sessions_promotions.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('session_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'sessions_promotions',
      foreignKeySessions_promotions
    );

    // Revert changes: revert the primary key to its original state
    const table = await queryRunner.getTable('sessions');
    await queryRunner.dropPrimaryKey(table, table.primaryColumns?.[0]?.name);
    await queryRunner.query(
      "ALTER TABLE sessions ALTER COLUMN id SET DEFAULT nextval('sessions_id_seq')"
    );
    await queryRunner.query('ALTER TABLE sessions ADD PRIMARY KEY (id)');

    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['sessions_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sessions',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'sessions_promotions',
      new TableForeignKey({
        columnNames: ['session_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sessions',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }
}
