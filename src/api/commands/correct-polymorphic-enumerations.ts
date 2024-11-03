import { Command, CommandRunner } from 'nest-commander';
import { EntityManager, QueryRunner } from 'typeorm';
import { PolymorphicType } from '../common/enums/polymorphic-type.enum';

@Command({ name: 'correct-polymorphic-enumerations' })
export class CorrectPolymorpicEnumerationsCommand extends CommandRunner {
  private readonly tables = {
    contact_preferences: 'contact_preferenceable_type',
    custom_fields_data: 'custom_field_datable_type',
    crm_attachments: 'attachmentable_type',
    contacts: 'contactable_type',
    communications: 'communicationable_type',
    address: 'addressable_type',
    duplicates: 'duplicatable_type',
    tasks: 'taskable_type',
    notes: 'noteable_type',
    donors_appointments: 'appointmentable_type',
    account_contacts: 'contactable_type',
    staff_assignments: 'operation_type',
    oc_approvals: 'operationable_type',
    shifts: 'shiftable_type',
    call_jobs_associated_operations: 'operationable_type',
    call_scripts: 'script_type',
  };
  private readonly incorrectEnumeration = {
    SC_TENANT: ['Tenant'],
    CRM_ACCOUNTS: ['account'],
    CRM_LOCATIONS: ['crm_location', 'locations'],
    CRM_CONTACTS_STAFF: ['staffs'],
    CRM_CONTACTS_VOLUNTEERS: ['crm_volunteers', 'volunteer'],
    CRM_CONTACTS_DONORS: ['donor'],
    CRM_DONOR_CENTERS: ['donor_center'],
    CRM_DONOR_CENTERS_BLUEPRINTS: [
      'crm_donor_center_blueprints',
      'donor_center_blueprint',
    ],
    CRM_NON_COLLECTION_PROFILES: [
      'crm_non_collection_profile',
      'ncp',
      'crm_ncp',
    ],
    CRM_NON_COLLECTION_PROFILES_BLUEPRINTS: [
      'crm_non_collection_profile_blueprints',
      'crm_non_collection_profile_blueprint',
      'crm_non_collection_profiles_blueprints',
      'crm_non_collection_profiles_blueprint',
      'crm_ncp_blueprint',
    ],
    OC_OPERATIONS_DRIVES: ['drive', 'oc_drive', 'oc_drives', 'DRIVES'],
    OC_OPERATIONS_SESSIONS: [
      'session',
      'oc_session',
      'oc_sessions',
      'SESSIONS',
    ],
    OC_OPERATIONS_NON_COLLECTION_EVENTS: [
      'non_collection_event',
      'non_collection_events',
      'oc_non_collection_event',
      'nce',
      'oc_nce',
      'NON_COLLECTION_EVENTS',
    ],
  };
  private queryRunner: QueryRunner;

  constructor(private readonly entityManager: EntityManager) {
    super();
    this.queryRunner = this.entityManager.connection.createQueryRunner();
  }

  async update(
    tableName: string,
    columnName: string,
    types: string[],
    value: string
  ) {
    const updateQuery = `
      UPDATE ${tableName} 
      SET ${columnName} = '${value}' 
      WHERE ${columnName} IN (${types.map((_, index) => `$${index + 1}`)})
    `;

    const result = await this.queryRunner.query(updateQuery, types);
    console.info(
      `${result[1]} records are updated with ${columnName}="${value}"`
    );
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    try {
      await this.queryRunner.connect();
      await this.queryRunner.startTransaction();

      // iterate over each table with polymorphic column
      for (const [tableName, columnName] of Object.entries(this.tables)) {
        const promises = [];
        console.info(
          `"${tableName}" => "${columnName}" enumerations fixing is started.`
        );
        // iterate over each polymorphic enumeration with key and type
        for (const [typeKey, typeValue] of Object.entries(PolymorphicType)) {
          const types = this.incorrectEnumeration[typeKey] || [];
          if (!types.length) continue;
          promises.push(this.update(tableName, columnName, types, typeValue));
        }
        await Promise.all(promises);
        console.info(
          `"${tableName}" => "${columnName}" enumerations is fixed.`
        );
      }

      await this.queryRunner.commitTransaction();
    } catch (error) {
      console.error(`Exception occured: ${error}`);
      await this.queryRunner.rollbackTransaction();
    } finally {
      await this.queryRunner.release();
    }
  }
}
