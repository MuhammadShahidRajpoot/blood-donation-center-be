import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AlterDriveTablePrimaryKey1703594200825
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =================== Get the Certifications and Drop the Foreign key for drives ==================
    const drives_certifications = await queryRunner.getTable(
      'drives_certifications'
    );
    const foreignKeyDriveCertifications =
      drives_certifications.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_certifications',
      foreignKeyDriveCertifications
    );

    // =================== Get the Promotional Items and Drop the Foreign key for drives ==================
    const drives_promotional_items = await queryRunner.getTable(
      'drives_promotional_items'
    );
    const foreignKeyDriveDrives_promotional_items =
      drives_promotional_items.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_promotional_items',
      foreignKeyDriveDrives_promotional_items
    );

    // =================== Get the Marketing Material Items and Drop the Foreign key for drives ==================
    const drives_marketing_material_items = await queryRunner.getTable(
      'drives_marketing_material_items'
    );
    const foreignKeyDrives_marketing_material_items =
      drives_marketing_material_items.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_marketing_material_items',
      foreignKeyDrives_marketing_material_items
    );

    // =================== Get the Drive Equipments and Drop the Foreign key for drives ==================
    const drives_equipments = await queryRunner.getTable('drives_equipments');
    const foreignKeyDrives_equipments = drives_equipments.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'drives_equipments',
      foreignKeyDrives_equipments
    );

    // =================== Get the Drive Contacts and Drop the Foreign key for drives ==================
    const drives_contacts = await queryRunner.getTable('drives_contacts');
    const foreignKeyDrives_contacts = drives_contacts.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'drives_contacts',
      foreignKeyDrives_contacts
    );

    // =================== Get the Drive Supp Accunts and Drop the Foreign key for drives ==================
    const drives_donor_comms_supp_accounts = await queryRunner.getTable(
      'drives_donor_comms_supp_accounts'
    );
    const foreignKeyDrives_donor_comms_supp_accounts =
      drives_donor_comms_supp_accounts.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_donor_comms_supp_accounts',
      foreignKeyDrives_donor_comms_supp_accounts
    );

    // =================== Get the Prospects Blueprints and Drop the Foreign key for drives ==================
    const prospects_blueprints = await queryRunner.getTable(
      'prospects_blueprints'
    );
    const foreignKeyProspects_blueprints =
      prospects_blueprints.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('blueprint_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'prospects_blueprints',
      foreignKeyProspects_blueprints
    );

    // =================== Get the Drive Zip Codes and Drop the Foreign key for drives ==================
    const drives_zipcodes = await queryRunner.getTable('drives_zipcodes');
    const foreignKeyDrives_zipcodes = drives_zipcodes.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'drives_zipcodes',
      foreignKeyDrives_zipcodes
    );

    // =================== Get the Donor Donations and Drop the Foreign key for drives ==================
    const donors_donations = await queryRunner.getTable('donors_donations');
    const foreignKeyDonors_donations = donors_donations.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'donors_donations',
      foreignKeyDonors_donations
    );

    // =================== Get the Linked Drives and Drop the Foreign key for drives ==================
    const linked_drives_current = await queryRunner.getTable('linked_drives');
    const foreignKeyLinked_drives_current =
      linked_drives_current.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('current_drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'linked_drives',
      foreignKeyLinked_drives_current
    );

    const linked_drives_prospective = await queryRunner.getTable(
      'linked_drives'
    );
    const foreignKeyLinked_drives_propspective =
      linked_drives_prospective.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('prospective_drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'linked_drives',
      foreignKeyLinked_drives_propspective
    );

    // Drop Current PK
    const table = await queryRunner.getTable('drives');
    await queryRunner.dropPrimaryKey(table, table.primaryColumns?.[0]?.name);

    // Apply new sequence and generate new PK
    await queryRunner.query(
      "ALTER TABLE drives ALTER COLUMN id SET DEFAULT nextval('even_drive_sequence')"
    );
    await queryRunner.query('ALTER TABLE drives ADD PRIMARY KEY (id)');

    // =================== Create the Foreign key for drives in Certifications ==================
    await queryRunner.createForeignKey(
      'drives_certifications',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Promotional Items ==================
    await queryRunner.createForeignKey(
      'drives_promotional_items',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Marketing Material Items ==================
    await queryRunner.createForeignKey(
      'drives_marketing_material_items',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Equipments ==================
    await queryRunner.createForeignKey(
      'drives_equipments',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Contacts ==================
    await queryRunner.createForeignKey(
      'drives_contacts',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Supp Accounts ==================
    await queryRunner.createForeignKey(
      'drives_donor_comms_supp_accounts',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Zip codes ==================
    await queryRunner.createForeignKey(
      'drives_zipcodes',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Donor Donations ==================

    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_donors_donations_drive_id',
      })
    );

    // =================== Create the Foreign key for drives in Linked Drives ==================
    await queryRunner.createForeignKey(
      'linked_drives',
      new TableForeignKey({
        columnNames: ['current_drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'linked_drives',
      new TableForeignKey({
        columnNames: ['prospective_drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Prospects Blueprints ==================
    await queryRunner.createForeignKey(
      'prospects_blueprints',
      new TableForeignKey({
        columnNames: ['blueprint_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // =================== Get the Certifications and Drop the Foreign key for drives ==================
    const drives_certifications = await queryRunner.getTable(
      'drives_certifications'
    );
    const foreignKeyDriveCertifications =
      drives_certifications.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_certifications',
      foreignKeyDriveCertifications
    );

    // =================== Get the Promotional Items and Drop the Foreign key for drives ==================
    const drives_promotional_items = await queryRunner.getTable(
      'drives_promotional_items'
    );
    const foreignKeyDriveDrives_promotional_items =
      drives_promotional_items.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_promotional_items',
      foreignKeyDriveDrives_promotional_items
    );

    // =================== Get the Marketing Material Items and Drop the Foreign key for drives ==================
    const drives_marketing_material_items = await queryRunner.getTable(
      'drives_marketing_material_items'
    );
    const foreignKeyDrives_marketing_material_items =
      drives_marketing_material_items.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_marketing_material_items',
      foreignKeyDrives_marketing_material_items
    );

    // =================== Get the Drive Equipments and Drop the Foreign key for drives ==================
    const drives_equipments = await queryRunner.getTable('drives_equipments');
    const foreignKeyDrives_equipments = drives_equipments.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'drives_equipments',
      foreignKeyDrives_equipments
    );

    // =================== Get the Drive Contacts and Drop the Foreign key for drives ==================
    const drives_contacts = await queryRunner.getTable('drives_contacts');
    const foreignKeyDrives_contacts = drives_contacts.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'drives_contacts',
      foreignKeyDrives_contacts
    );

    // =================== Get the Drive Supp Accunts and Drop the Foreign key for drives ==================
    const drives_donor_comms_supp_accounts = await queryRunner.getTable(
      'drives_donor_comms_supp_accounts'
    );
    const foreignKeyDrives_donor_comms_supp_accounts =
      drives_donor_comms_supp_accounts.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'drives_donor_comms_supp_accounts',
      foreignKeyDrives_donor_comms_supp_accounts
    );

    // =================== Get the Prospects Blueprints and Drop the Foreign key for drives ==================
    const prospects_blueprints = await queryRunner.getTable(
      'prospects_blueprints'
    );
    const foreignKeyProspects_blueprints =
      prospects_blueprints.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('blueprint_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'prospects_blueprints',
      foreignKeyProspects_blueprints
    );

    // =================== Get the Drive Zip Codes and Drop the Foreign key for drives ==================
    const drives_zipcodes = await queryRunner.getTable('drives_zipcodes');
    const foreignKeyDrives_zipcodes = drives_zipcodes.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'drives_zipcodes',
      foreignKeyDrives_zipcodes
    );

    // =================== Get the Donor Donations and Drop the Foreign key for drives ==================
    const donors_donations = await queryRunner.getTable('donors_donations');
    const foreignKeyDonors_donations = donors_donations.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('drive_id') !== -1
    );
    await queryRunner.dropForeignKey(
      'donors_donations',
      foreignKeyDonors_donations
    );

    // =================== Get the Linked Drives and Drop the Foreign key for drives ==================
    const linked_drives_current = await queryRunner.getTable('linked_drives');
    const foreignKeyLinked_drives_current =
      linked_drives_current.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('current_drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'linked_drives',
      foreignKeyLinked_drives_current
    );

    const linked_drives_prospective = await queryRunner.getTable(
      'linked_drives'
    );
    const foreignKeyLinked_drives_propspective =
      linked_drives_prospective.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('prospective_drive_id') !== -1
      );
    await queryRunner.dropForeignKey(
      'linked_drives',
      foreignKeyLinked_drives_propspective
    );

    // Revert changes: revert the primary key to its original state
    const table = await queryRunner.getTable('drives');
    await queryRunner.dropPrimaryKey(table, table.primaryColumns?.[0]?.name);
    await queryRunner.query(
      "ALTER TABLE drives ALTER COLUMN id SET DEFAULT nextval('drives_id_seq')"
    );
    await queryRunner.query('ALTER TABLE drives ADD PRIMARY KEY (id)');

    // =================== Create the Foreign key for drives in Certifications ==================
    await queryRunner.createForeignKey(
      'drives_certifications',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Promotional Items ==================
    await queryRunner.createForeignKey(
      'drives_promotional_items',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Marketing Material Items ==================
    await queryRunner.createForeignKey(
      'drives_marketing_material_items',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Equipments ==================
    await queryRunner.createForeignKey(
      'drives_equipments',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Contacts ==================
    await queryRunner.createForeignKey(
      'drives_contacts',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Supp Accounts ==================
    await queryRunner.createForeignKey(
      'drives_donor_comms_supp_accounts',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Drive Zip codes ==================
    await queryRunner.createForeignKey(
      'drives_zipcodes',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Donor Donations ==================

    await queryRunner.createForeignKey(
      'donors_donations',
      new TableForeignKey({
        columnNames: ['drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_donors_donations_drive_id',
      })
    );

    // =================== Create the Foreign key for drives in Linked Drives ==================
    await queryRunner.createForeignKey(
      'linked_drives',
      new TableForeignKey({
        columnNames: ['current_drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'linked_drives',
      new TableForeignKey({
        columnNames: ['prospective_drive_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    // =================== Create the Foreign key for drives in Prospects Blueprints ==================
    await queryRunner.createForeignKey(
      'prospects_blueprints',
      new TableForeignKey({
        columnNames: ['blueprint_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drives',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }
}
