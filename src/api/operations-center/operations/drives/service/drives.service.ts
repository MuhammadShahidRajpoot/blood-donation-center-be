import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository, ILike, IsNull } from 'typeorm';
import { DrivesHistory } from '../entities/drives-history.entity';
import { HistoryService } from 'src/api/common/services/history.service';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  CreateDriveDto,
  DriveMarketingInputDto,
  ResourceSharingDto,
  SupplementalRecruitmentDto,
  UpdateDriveDto,
} from '../dto/create-drive.dto';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { Drives } from '../entities/drives.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { DrivesContacts } from '../entities/drive-contacts.entity';
import { QueryRunner } from 'typeorm/browser';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ShiftsService } from 'src/api/shifts/services/shifts.service';
import { DrivesEquipments } from '../entities/drives-equipment.entity';
import { DrivesCertifications } from '../entities/drives-certifications.entity';
import { DrivesMarketingMaterialItems } from '../entities/drives-marketing-material-items.entity';
import { DrivesPromotionalItems } from '../entities/drives_promotional_items.entity';
import { GetAllDrivesFilterInterface } from '../interface/get-drives-filter.interface';
import { OrderByConstants } from 'src/api/system-configuration/constants/order-by.constants';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactTypeEnum } from 'src/api/crm/contacts/common/enums';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { DrivesZipCodes } from '../entities/drives-zipcodes.entity';
import { DrivesDonorCommunicationSupplementalAccounts } from '../entities/drives-donor-comms-supp-accounts.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { VehicleType } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicle-type/entities/vehicle-type.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import {
  AddShiftSlotDTO,
  UpdateShiftsProjectionStaff,
} from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/dto/create-blueprint.dto';
import { DriveContactsService } from './drive-contacts.service';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { ListChangeAuditDto } from '../dto/change-audit.dto';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { CustomFieldsDataHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data-history';
import { HistoryReason } from 'src/common/enums/history_reason.enum';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';
import { DrivesZipCodesHistory } from '../entities/drives-zipcodes-history.entity';
import { Modified } from 'src/common/interface/modified';
import { DriveEquipmentsService } from './drive-equipments.service';
import { DriveCertificationsService } from './drive-certifications.service';
import { PickupService } from './pickups.service';
import { LinkedDrives } from '../entities/linked-drives.entity';
import { getTenantConfig } from 'src/api/common/utils/tenantConfig';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import moment, { Moment } from 'moment';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { ResourceSharings } from 'src/api/operations-center/resource-sharing/entities/resource-sharing.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { resource_share_type_enum } from 'src/api/operations-center/resource-sharing/enum/resource-sharing.enum';
import { ExportService } from 'src/api/crm/contacts/common/exportData.service';
import { DriveStatusEnum } from '../enums';
import { OcApprovals } from 'src/api/operations-center/approvals/entities/oc-approval.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { OperationsApprovalsService } from './opertion-approvals.service';
import { Address } from '../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { getLinkedDriveDto } from '../dto/drives-contact.dto';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { OperationTypeEnum } from 'src/api/call-center/call-schedule/call-jobs/enums/operation-type.enum';
import { userBusinessUnitHierarchy } from 'src/api/system-configuration/tenants-administration/user-administration/user/utils';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { pagination } from 'src/common/utils/pagination';
import { PushNotifications } from 'src/api/notifications/entities/push-notifications.entity';
import { UserNotifications } from 'src/api/notifications/entities/user-notifications.entity';
import { TargetNotifications } from 'src/api/notifications/entities/target-notifications.entity';
import { NotificationsService } from 'src/api/notifications/services/notifications.service';

@Injectable()
export class DrivesService extends HistoryService<DrivesHistory> {
  constructor(
    @Inject(REQUEST)
    private readonly request: UserRequest,
    @InjectRepository(LinkedDrives)
    private readonly linkedDrivesRepo: Repository<LinkedDrives>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(DrivesHistory)
    private readonly drivesHistoryRepository: Repository<DrivesHistory>,
    @InjectRepository(DrivesDonorCommunicationSupplementalAccounts)
    private readonly drivesDonorCommunicationSupplementalAccountsRepo: Repository<DrivesDonorCommunicationSupplementalAccounts>,
    @InjectRepository(DrivesZipCodes)
    private readonly drivesZipCodesRepo: Repository<DrivesZipCodes>,
    @InjectRepository(DrivesZipCodesHistory)
    private readonly drivesZipCodesHistoryRepo: Repository<DrivesZipCodesHistory>,
    @InjectRepository(DrivesPromotionalItems)
    private readonly drivesPromotionalItemsRepo: Repository<DrivesPromotionalItems>,
    @InjectRepository(DrivesMarketingMaterialItems)
    private readonly drivesMarketingMaterialItemsRepo: Repository<DrivesMarketingMaterialItems>,
    @InjectRepository(DrivesCertifications)
    private readonly drivesCertificationsRepo: Repository<DrivesCertifications>,
    @InjectRepository(DrivesEquipments)
    private readonly drivesEquipmentsRepo: Repository<DrivesEquipments>,
    @InjectRepository(CustomFieldsDataHistory)
    private readonly customFieldsDataHistoryRepo: Repository<CustomFieldsDataHistory>,
    @InjectRepository(ShiftsStaffSetups)
    private readonly shiftsStaffSetupsRepo: Repository<ShiftsStaffSetups>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftsVehiclesRepo: Repository<ShiftsVehicles>,
    @InjectRepository(VehicleType)
    private readonly VehicleTypeRepo: Repository<VehicleType>,
    @InjectRepository(Vehicle)
    private readonly VehicleRepo: Repository<Vehicle>,
    @InjectRepository(DrivesContacts)
    private readonly DriveContactRepo: Repository<DrivesContacts>,
    @InjectRepository(CustomFieldsData)
    private readonly customFieldsDataRepo: Repository<CustomFieldsData>,
    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Accounts)
    private readonly accountsRespository: Repository<Accounts>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationsRespository: Repository<CrmLocations>,
    @InjectRepository(PromotionEntity)
    private readonly promotionsRespository: Repository<PromotionEntity>,
    @InjectRepository(User)
    private readonly usersRespository: Repository<User>,
    @InjectRepository(OperationsStatus)
    private readonly operationStatusRespository: Repository<OperationsStatus>,
    @InjectRepository(AccountContacts)
    private readonly accountContactsRespository: Repository<AccountContacts>,
    @InjectRepository(ContactsRoles)
    private readonly contactRolesRespository: Repository<ContactsRoles>,
    @InjectRepository(BookingRules)
    private readonly bookingRulesRepository: Repository<BookingRules>,
    @InjectRepository(Tenant)
    private readonly tenantRespository: Repository<Tenant>,
    @InjectRepository(ShiftsSlots)
    private readonly shiftsSlotRepo: Repository<ShiftsSlots>,
    @InjectRepository(Shifts)
    private readonly shiftsRepo: Repository<Shifts>,
    @InjectRepository(TenantConfigurationDetail)
    private readonly tenantConfigRepository: Repository<TenantConfigurationDetail>,
    @InjectRepository(DonorsAppointments)
    private readonly entityDonorsAppointmentsRepository: Repository<DonorsAppointments>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypeRepo: Repository<ProcedureTypes>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepo: Repository<BusinessUnits>,
    @InjectRepository(UserBusinessUnits)
    private readonly userBusinessUnitsRepository: Repository<UserBusinessUnits>,
    @InjectRepository(OcApprovals)
    private readonly approvalsRepo: Repository<OcApprovals>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRepo: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(Device)
    private readonly devicesRepo: Repository<Device>,
    @InjectRepository(StaffSetup)
    private readonly staffSetupRepo: Repository<StaffSetup>,
    @InjectRepository(ChangeAudits)
    private readonly changeAuditsRepo: Repository<ChangeAudits>,
    @InjectRepository(PushNotifications)
    private readonly pushNotificationsRepository: Repository<PushNotifications>,
    @InjectRepository(UserNotifications)
    private readonly userNotificationsRepository: Repository<UserNotifications>,
    @InjectRepository(TargetNotifications)
    private readonly targetNotificationsRepository: Repository<TargetNotifications>,
    private readonly shiftsService: ShiftsService,
    private readonly entityManager: EntityManager,
    private readonly drivesContactService: DriveContactsService,
    private readonly driveCertificationsService: DriveCertificationsService,
    private readonly driveEquipmentsService: DriveEquipmentsService,
    private readonly BBCSConnectorService: BBCSConnector,
    private readonly drivePickupService: PickupService,
    private readonly exportService: ExportService,
    private readonly driveApprovalsService: OperationsApprovalsService,
    private readonly flagService: FlaggedOperationService,
    private readonly notificationService: NotificationsService
  ) {
    super(drivesHistoryRepository);
  }
  /**
   * check entity exist in database
   * @param repository
   * @param query
   * @param entityName
   * @returns {object}
   */
  async entityExist<T>(
    repository: Repository<T>,
    query,
    entityName
  ): Promise<T> {
    const entityObj = await repository.findOne(query);
    if (!entityObj) {
      resError(
        `${entityName} not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    return entityObj;
  }

  /**
   * Calculate limit and skip
   * @param limit
   * @param page
   * @returns {skip, take}
   */
  pagination(limit: number, page: number) {
    page = page <= 0 ? 1 : page;
    const take: any = limit;
    const skip: any = (page - 1) * limit;

    return { skip, take };
  }

  async saveBasicDriveInfo(
    queryRunner: QueryRunner,
    createDriveDto: CreateDriveDto,
    is_blueprint = false,
    operation_status: OperationsStatus
  ) {
    const account = await this.entityExist(
      this.accountsRespository,
      { where: { id: createDriveDto.account_id } },
      'Account'
    );

    const existingDrive = await this.drivesRepository.find({
      where: {
        account_id: createDriveDto.account_id,
        date: createDriveDto.date,
        is_archived: false,
        is_blueprint: false,
      },
    });

    if (existingDrive.length) {
      resError(
        `Drive already exist for ${account.name} on ${createDriveDto.date}.`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }

    const location = await this.entityExist(
      this.crmLocationsRespository,
      { where: { id: createDriveDto.location_id } },
      'CRM Location'
    );
    let promotion = null;
    if (createDriveDto.promotion_id) {
      promotion = await this.entityExist(
        this.promotionsRespository,
        { where: { id: createDriveDto.promotion_id } },
        'Promotion'
      );
    }
    const recruiter = await this.entityExist(
      this.usersRespository,
      { where: { id: createDriveDto.recruiter_id } },
      'Promotion'
    );

    const drive = new Drives();
    drive.account = account;
    drive.location = location;
    drive.promotion = promotion;
    drive.recuriter = recruiter;
    drive.operation_status = operation_status;
    drive.is_multi_day_drive = createDriveDto.is_multi_day_drive;
    drive.date = createDriveDto.date;
    drive.created_by = createDriveDto.created_by;
    drive.tenant_id = createDriveDto.tenant_id;
    drive.is_linkable = createDriveDto.is_linkable;
    drive.is_linked = createDriveDto.is_linked;
    drive.open_to_public = createDriveDto.open_to_public;
    drive.approval_status = this.request.user?.override
      ? DriveStatusEnum.APPROVED
      : DriveStatusEnum.PENDING;
    //  Marketing Data Start

    drive.order_due_date = createDriveDto.marketing.order_due_date;
    drive.marketing_start_date = createDriveDto.marketing.marketing_start_date;
    drive.marketing_end_date = createDriveDto.marketing.marketing_end_date;
    drive.marketing_start_time = createDriveDto.marketing.marketing_start_time;
    drive.marketing_end_time = createDriveDto.marketing.marketing_end_time;
    drive.oef_products = createDriveDto.oef_products;
    drive.oef_procedures = createDriveDto.oef_procedures;
    drive.online_scheduling_allowed = createDriveDto.online_scheduling_allowed;
    drive.donor_information = createDriveDto.marketing.donor_info;
    drive.instructional_information =
      createDriveDto.marketing.instructional_info;
    drive.is_blueprint = is_blueprint;

    // Marketing Data End

    // ==== Donor Communication Start ====
    drive.tele_recruitment = createDriveDto.tele_recruitment_enabled;
    drive.email = createDriveDto.email_enabled;
    drive.sms = createDriveDto.sms_enabled;
    drive.tele_recruitment_status = createDriveDto.tele_recruitment_status;
    drive.email_status = createDriveDto.email_status;
    drive.sms_status = createDriveDto.sms_status;
    drive.marketing_items_status = createDriveDto?.marketing_items_status;
    drive.promotional_items_status = createDriveDto?.promotional_items_status;
    // ==== Donor Communication End ====

    return await queryRunner.manager.save(drive);
  }
  async updateBasicDriveInfo(
    queryRunner: QueryRunner,
    createDriveDto: UpdateDriveDto,
    is_blueprint = false,
    getDrive: Drives,
    operation_status: OperationsStatus,
    location: CrmLocations
  ) {
    const account = await this.entityExist(
      this.accountsRespository,
      { where: { id: createDriveDto.account_id } },
      'Account'
    );

    const existingDrive = await this.drivesRepository.find({
      where: {
        id: getDrive.id,
        account_id: createDriveDto.account_id,
        date: createDriveDto.date,
      },
    });

    if (!existingDrive) {
      const checkValid = await this.drivesRepository.find({
        where: {
          account_id: createDriveDto.account_id,
          date: createDriveDto.date,
        },
      });
      if (!checkValid) {
        resError(
          `Drive already exist for ${account.name} on ${createDriveDto.date}.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    let promotion = null;
    if (createDriveDto.promotion_id) {
      promotion = await this.entityExist(
        this.promotionsRespository,
        { where: { id: createDriveDto.promotion_id } },
        'Promotion'
      );
    }
    const recruiter = await this.entityExist(
      this.usersRespository,
      { where: { id: createDriveDto.recruiter_id } },
      'Promotion'
    );

    const drive: any = new Drives();
    // drive.id = getDrive.id;
    drive.account = account;
    drive.location = location;
    drive.promotion = promotion;
    drive.recuriter = recruiter;
    drive.operation_status = operation_status;
    drive.is_multi_day_drive = createDriveDto.is_multi_day_drive;
    drive.date = createDriveDto.date;
    drive.created_by = createDriveDto.created_by;
    drive.tenant_id = createDriveDto.tenant_id;
    drive.is_linkable = createDriveDto.is_linkable;
    drive.is_linked = createDriveDto.is_linked;
    drive.open_to_public = createDriveDto.open_to_public;
    drive.oef_products = createDriveDto.oef_products;
    drive.oef_procedures = createDriveDto.oef_procedures;
    //  Marketing Data Start

    drive.order_due_date = createDriveDto.marketing.order_due_date;
    drive.marketing_start_date = createDriveDto.marketing.marketing_start_date;
    drive.marketing_end_date = createDriveDto.marketing.marketing_end_date;
    drive.marketing_start_time = createDriveDto.marketing.marketing_start_time;
    drive.marketing_end_time = createDriveDto.marketing.marketing_end_time;
    drive.online_scheduling_allowed = createDriveDto.online_scheduling_allowed;
    drive.donor_information = createDriveDto.marketing.donor_info;
    drive.instructional_information =
      createDriveDto.marketing.instructional_info;
    drive.is_blueprint = is_blueprint;
    drive.created_at = new Date();
    // Marketing Data End

    // ==== Donor Communication Start ====
    drive.tele_recruitment = createDriveDto.tele_recruitment_enabled;
    drive.email = createDriveDto.email_enabled;
    drive.sms = createDriveDto.sms_enabled;
    drive.tele_recruitment_status = createDriveDto.tele_recruitment_status;
    drive.email_status = createDriveDto.email_status;
    drive.sms_status = createDriveDto.sms_status;
    drive.marketing_items_status = createDriveDto?.marketing_items_status;
    drive.promotional_items_status = createDriveDto?.promotional_items_status;
    if (this.request.user?.override) {
      drive.approval_status = DriveStatusEnum.APPROVED;
    } else {
      drive.approval_status = DriveStatusEnum.PENDING;
    }
    // ==== Donor Communication End ====

    const generalChanges = await this.monitorGeneralChanges(
      getDrive,
      createDriveDto,
      account,
      promotion,
      operation_status
    );

    const savedD = await queryRunner.manager.update(
      Drives,
      { id: getDrive.id },
      drive
    );
    return { drive: savedD, generalChanges, id: getDrive.id, original: drive };
  }

  async updateLinkedDrive(body: any, user, id) {
    try {
      const res = await this.shiftsService.updateLinkedShift(
        body,
        id,
        user,
        this.request.user?.tenant?.id
      );
      return { ...res };
    } catch (err) {
      console.log(err);
    }
  }

  async saveCustomFields(
    queryRunner: QueryRunner,
    data: Drives,
    created_by: User,
    tenant: Tenant,
    createCustomFieldDrivesDataDto: CreateDriveDto
  ) {
    const { fields_data, custom_field_datable_type } =
      createCustomFieldDrivesDataDto.custom_fields;

    if (!custom_field_datable_type) {
      resError(
        `custom_field_datable_type is required.`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }

    if (fields_data?.length) {
      for (const item of fields_data) {
        const customField = await this.customFieldsRepository.findOne({
          where: { id: item?.field_id, is_archived: false },
        });
        if (!customField) {
          resError(
            `Field not found for ID ${item?.field_id}.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        if (customField?.is_required && !item?.field_data) {
          resError(
            `Field data must be required for field id ${customField?.id}.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        const customFieldData = new CustomFieldsData();
        customFieldData.custom_field_datable_id = data.id;
        customFieldData.custom_field_datable_type = custom_field_datable_type;
        customFieldData.field_id = customField;
        customFieldData.tenant_id = tenant?.id;
        customFieldData.created_by = created_by;
        customFieldData.field_data = item?.field_data;
        await queryRunner.manager.save(customFieldData);
      }
    }
  }
  async create(createDriveDto: CreateDriveDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const operation_status = await this.entityExist(
        this.operationStatusRespository,
        { where: { id: createDriveDto.operations_status_id } },
        'Operation Status'
      );

      const drive = await this.saveBasicDriveInfo(
        queryRunner,
        createDriveDto,
        false,
        operation_status
      );
      if (createDriveDto.linked_id?.[0] !== null) {
        const saveLinked = new LinkedDrives();
        saveLinked.current_drive_id = drive.id;
        saveLinked.prospective_drive_id =
          createDriveDto?.linked_id?.[0] ?? createDriveDto?.linked_id;
        saveLinked.is_archived = false;
        saveLinked.created_by = createDriveDto.created_by;
        await queryRunner.manager.save(saveLinked);

        const findLinkDrive = await this.drivesRepository.findOne({
          where: {
            id: createDriveDto?.linked_id?.[0] ?? createDriveDto?.linked_id,
          },
        });
        let found = new Drives();
        found = findLinkDrive;
        found.is_linked = true;
        await this.drivesRepository.save(found);
      }
      // console.log('Saved the basic info drive ID is ', drive.id);
      await this.drivesContactService.saveDriveContacts(
        queryRunner,
        createDriveDto.contacts,
        drive,
        createDriveDto.created_by
      );
      // console.log('Saved the drive contacts');
      // await this.saveCustomFields(
      //   queryRunner,
      //   drive,
      //   createDriveDto.created_by,
      //   createDriveDto.tenant_id,
      //   createDriveDto
      // );

      // console.log('Saved the drive Custom fields');

      // eslint-disable-next-line
      let start = moment(createDriveDto?.shifts?.[0]?.start_time);
      // eslint-disable-next-line
      let end = moment(createDriveDto?.shifts?.[0]?.end_time);

      const shiftsDto = createDriveDto.shifts;
      const shifts: any = await this.shiftsService.createShiftByShiftAble(
        createDriveDto,
        queryRunner,
        shiftsDto,
        drive,
        createDriveDto.created_by,
        createDriveDto.tenant_id,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        true,
        true,
        start,
        end
      );
      // console.log('Saved the drive shifts', shifts);

      await this.driveEquipmentsService.saveEquipments(
        queryRunner,
        createDriveDto.equipment,
        drive,
        createDriveDto.created_by
      );
      // console.log('Saved the drive equipments');

      await this.driveCertificationsService.saveCertifications(
        queryRunner,
        createDriveDto.certifications,
        drive,
        createDriveDto.created_by
      );
      // console.log('Saved the drive cerificationst');

      await this.saveMarketingInfo(
        queryRunner,
        createDriveDto.marketing,
        drive,
        createDriveDto.created_by
      );
      // console.log('Saved the drive marketing info');
      const driveCustomFieds = [];
      const custom_fields = {
        custom_fields: {
          fields_data: createDriveDto?.custom_fields?.fields_data,
          custom_field_datable_type:
            createDriveDto?.custom_fields?.custom_field_datable_type,
          custom_field_datable_id: drive?.id,
        },
      };

      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        drive,
        this.request.user.id,
        this.request.user.tenant,
        custom_fields,
        driveCustomFieds
      );

      await this.saveDonorCommunicationData(
        queryRunner,
        createDriveDto.donor_communication,
        createDriveDto.zip_codes,
        drive,
        createDriveDto.created_by
      );
      // console.log('Saved the drive donor communication info');

      await this.createResourceSharing(
        queryRunner,
        createDriveDto.resource_sharing
      );
      await this.createBlueprint(
        queryRunner,
        createDriveDto,
        operation_status,
        drive
      );
      // await this.saveDriveonBBCS(drive, createDriveDto, start, end,numberOfSlots);

      const changeAudit = new ChangeAudits();
      changeAudit.changes_field = 'Drive';
      changeAudit.changes_to = 'Drive Created';
      changeAudit.changes_from = null;
      changeAudit.changed_when =
        this.request.user.first_name + ' ' + this.request.user.last_name;
      changeAudit.created_by = createDriveDto.created_by;
      changeAudit.tenant_id = createDriveDto.tenant_id;
      changeAudit.auditable_id = drive.id;
      changeAudit.auditable_type = OperationTypeEnum.DRIVES as any;
      await queryRunner.manager.save(changeAudit);

      await queryRunner.commitTransaction();

      const driveShifts = await this.shiftsRepo.find({
        where: {
          shiftable_id: drive?.id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          is_archived: false,
          tenant_id: this.request.user?.tenant?.id,
          slots: {
            is_archived: false,
          },
          projections: {
            is_archived: false,
          },
        },
        relations: [
          'slots',
          'projections',
          'projections.staff_setup',
          'devices',
          'devices.device',
          'vehicles',
          'vehicles.vehicle',
        ],
      });
      let numberOfSlotsDrive = 0;

      const slots: any = Object.values(createDriveDto?.slots || {})?.[0];
      const numberOfSlotsDTO = slots.reduce(
        (acc, obj) => acc + obj.items?.length,
        0
      );
      driveShifts.forEach((shift) => {
        numberOfSlotsDrive += shift.slots.length;
      });

      const certifications = await this.drivesCertificationsRepo.find({
        where: {
          certification_id: In(createDriveDto.certifications),
          drive_id: drive?.id,
          is_archived: false,
        },
        relations: ['certification'],
      });

      const location = await this.entityExist(
        this.crmLocationsRespository,
        { where: { id: createDriveDto.location_id } },
        'CRM Location'
      );
      const getdrive = await this.drivesRepository.findOne({
        where: { id: drive?.id },
        relations: [
          'account',
          'promotion',
          'operation_status',
          'location',
          'certifications',
          'certifications.certification',
          'marketing_items',
          'marketing_items.marketing_material',
          'promotional_items',
          'promotional_items.promotional_item',
        ],
      });
      await this.driveApprovalsService.handleApprovals(
        queryRunner,
        createDriveDto,
        getdrive,
        operation_status,
        shifts,
        numberOfSlotsDTO,
        numberOfSlotsDrive,
        shifts,
        certifications,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        location
      );

      const manager_id = this.request.user.assigned_manager?.id;
      const createDriveNotificationDto: any = {
        title: 'Dirves Creation',
        content: 'Drive Created Successfully',
        organizational_level: [1, 2, 3],  // will be updated for dynamic OL later  after discussion
        module: [156],
        actionable_link: 'http://example.com/action',
        user_id: this.request?.user?.id,
        target_type_id: manager_id ? manager_id : null,
        target_type: 'users',
      };

      await this.notificationService.create(createDriveNotificationDto);

      this.flagService.flaggedOperation(
        drive.id,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        this.request.user?.tenant?.id
      );
      delete drive?.created_by;
      return resSuccess('Drive Created.', 'success', HttpStatus.CREATED, {
        ...drive,
        tenant_id: this.request.user?.tenant?.id,
      });
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async UpdateLinkDrive(body, user, drive_id: bigint) {
    try {
      const findShift = await this.shiftsRepo.findOne({
        where: {
          id: body.current_shift,
        },
      });
      if (!findShift) {
        return resError('can not find shift', ErrorConstants.Error, 400);
      }
      findShift.start_time = body.start_time;
      findShift.end_time = body.end_time;
      findShift.oef_products = body.oef_products;
      findShift.oef_procedures = body.oef_procedures;
      findShift.break_start_time = body.break_start_time;
      const shiftIdString = findShift.id.toString();
      // Use the update method to update the entity
      await this.shiftsRepo.update(shiftIdString, {
        start_time: findShift.start_time,
        end_time: findShift.end_time,
        oef_products: findShift.oef_products,
        oef_procedures: findShift.oef_procedures,
        break_start_time: findShift.break_start_time,
      });

      const deleteVehices = await this.shiftsVehiclesRepo.delete({
        shift_id: body.current_shift,
      });
      if (body?.vehicles?.length > 0) {
        for (const veh of body?.vehicles) {
          // console.log('veh?.id', veh?.id);
          const addVeh = new ShiftsVehicles();
          addVeh.shift_id = body.current_shift;
          addVeh.vehicle = veh;
          addVeh.vehicle_id = veh?.id;
          addVeh.created_by = user;
          await this.shiftsVehiclesRepo.save(addVeh);
        }
      }

      const deleteProjection = await this.shiftsProjectionsStaffRepo.delete({
        shift_id: body.shift_id,
      });

      const addpro = new ShiftsProjectionsStaff();
      addpro.shift_id = body.shift_id;
      addpro.procedure_type_id = body.projection.procedure_type_id;
      addpro.procedure_type = body.projection.procedure_type;
      addpro.created_by = user;
      // addpro.procedure_type = body.projection.procedure_type;
      // addpro.procedure_type_id = body.projection.procedure_type.id;
      addpro.procedure_type_qty = body.projection.procedure_type_qty;
      addpro.product_yield = body.projection.product_yield;
      addpro.staff_setup_id = body.projection.staff_setup_id;
      addpro.is_donor_portal_enabled = body.projection.is_donor_portal_enabled;
      await this.shiftsProjectionsStaffRepo.save(addpro);

      const saveLinked = new LinkedDrives();
      saveLinked.current_drive_id = drive_id;
      saveLinked.prospective_drive_id = body.linked_id;
      saveLinked.is_archived = false;
      saveLinked.created_by = user;
      await this.linkedDrivesRepo.save(saveLinked);

      return resSuccess('Drive Linked', 'success', HttpStatus.CREATED);
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, 400);
    }
  }

  async update(createDriveDto: UpdateDriveDto, id) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      const getdrive = await this.drivesRepository.findOne({
        where: { id: id },
        relations: [
          'account',
          'promotion',
          'operation_status',
          'location',
          'certifications',
          'certifications.certification',
          'marketing_items',
          'marketing_items.marketing_material',
          'promotional_items',
          'promotional_items.promotional_item',
        ],
      });

      const driveShifts = await this.shiftsRepo.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          is_archived: false,
          tenant_id: this.request.user?.tenant?.id,
          slots: {
            is_archived: false,
          },
          projections: {
            is_archived: false,
          },
        },
        relations: [
          'slots',
          'projections',
          'projections.staff_setup',
          'devices',
          'devices.device',
          'vehicles',
          'vehicles.vehicle',
        ],
      });

      if (!getdrive) {
        console.log('no drive found');
      }
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const operation_status = await this.entityExist(
        this.operationStatusRespository,
        { where: { id: createDriveDto.operations_status_id } },
        'Operation Status'
      );

      const location = await this.entityExist(
        this.crmLocationsRespository,
        { where: { id: createDriveDto.location_id } },
        'CRM Location'
      );

      const drive = await this.updateBasicDriveInfo(
        queryRunner,
        createDriveDto,
        createDriveDto.is_blueprint,
        getdrive,
        operation_status,
        location
      );
      if (createDriveDto.linked_id) {
        const saveLinked = new LinkedDrives();
        saveLinked.current_drive_id = drive.id;
        saveLinked.prospective_drive_id =
          createDriveDto?.linked_id?.[0] ?? createDriveDto?.linked_id;
        saveLinked.is_archived = false;
        saveLinked.created_by = createDriveDto.created_by;
        saveLinked.created_at = new Date();
        await queryRunner.manager.save(saveLinked);
        const findLinkDrive = await this.drivesRepository.findOne({
          where: {
            id: createDriveDto?.linked_id?.[0] ?? createDriveDto?.linked_id,
          },
        });
        let found = new Drives();
        found = findLinkDrive;
        found.is_linked = true;
        found.created_by = createDriveDto.created_by;
        found.created_at = new Date();
        await this.drivesRepository.save(found);
      }
      const driveCustomFieds = [];
      const custom_fields = {
        custom_fields: {
          fields_data: createDriveDto?.custom_fields?.fields_data,
          custom_field_datable_type:
            createDriveDto?.custom_fields?.custom_field_datable_type,
          custom_field_datable_id: getdrive?.id,
        },
      };

      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        getdrive,
        this.request.user.id,
        this.request.user.tenant,
        custom_fields,
        driveCustomFieds
      );

      await this.drivesContactService.updateDriveContacts(
        queryRunner,
        createDriveDto.contacts,
        getdrive,
        createDriveDto.created_by
      );

      const shiftsDto = createDriveDto.shifts;

      const { shiftChanges: changesAuditShift, shifts } =
        await this.shiftsService.editShift(
          queryRunner,
          shiftsDto,
          createDriveDto.slots,
          getdrive.id,
          PolymorphicType.OC_OPERATIONS_DRIVES,
          HistoryReason.C,
          createDriveDto.created_by,
          createDriveDto.tenant_id,
          createDriveDto,
          getdrive?.date
        );
      const allChangeAuditData = [
        ...changesAuditShift,
        ...drive.generalChanges,
      ];

      await this.driveEquipmentsService.UpdateEquipments(
        queryRunner,
        createDriveDto.equipment,
        getdrive,
        createDriveDto.created_by
      );

      const certifications = await this.drivesCertificationsRepo.find({
        where: {
          certification_id: In(createDriveDto.certifications),
          drive_id: id,
          is_archived: false,
        },
        relations: ['certification'],
      });

      await this.driveCertificationsService.updateCertifications(
        queryRunner,
        createDriveDto.certifications,
        getdrive,
        createDriveDto.created_by
      );
      await this.updateMarketingInfo(
        queryRunner,
        createDriveDto.marketing,
        getdrive,
        createDriveDto.created_by
      );

      await this.UpdateDonorCommunicationData(
        queryRunner,
        createDriveDto.donor_communication,
        createDriveDto.zip_codes,
        getdrive,
        createDriveDto.created_by
      );

      // await this.createHistory({
      //   ...getdrive,
      //   history_reason: HistoryReason.C,
      //   created_by: createDriveDto.created_by,
      //   created_at: new Date(),
      // });

      const user = await this.entityExist(
        this.usersRespository,
        { where: { id: createDriveDto.created_by } },
        'User'
      );

      let numberOfSlotsDrive = 0;

      const slots: any = Object.values(createDriveDto?.slots || {})?.[0];
      const numberOfSlotsDTO = slots.reduce(
        (acc, obj) => acc + obj.items.length,
        0
      );

      driveShifts.forEach((shift) => {
        numberOfSlotsDrive += shift.slots.length;
      });

      await this.driveApprovalsService.handleApprovals(
        queryRunner,
        createDriveDto,
        getdrive,
        operation_status,
        shifts,
        numberOfSlotsDTO,
        numberOfSlotsDrive,
        driveShifts,
        certifications,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        location
      );

      const manager_id = this.request.user.assigned_manager?.id;
      const updateDriveNotificationDto: any = {
        title: 'Update Dirve',
        content: 'Drive Updated Successfully',
        organizational_level: [1, 2, 3],    // will be updated for dynamic OL later  after discussion
        module: [156],
        actionable_link: 'http://example.com/action',
        user_id: this.request?.user?.id,
        target_type_id: manager_id ? manager_id : null,
        target_type: 'users',
      };

      await this.notificationService.create(updateDriveNotificationDto);
      for (const change of allChangeAuditData) {
        await this.changeAuditsRepo.save({
          changes_field: change?.changes_field || null,
          changes_to: change?.changes_to || null,
          changes_from: change?.changes_from || null,
          changed_when: user.first_name + ' ' + user.last_name,
          created_by: createDriveDto.created_by,
          created_at: new Date(),
          tenant_id: createDriveDto.tenant_id,
          auditable_id: id,
          auditable_type: OperationTypeEnum.DRIVES as any,
        });
      }

      await queryRunner.commitTransaction();
      this.flagService.flaggedOperation(
        id,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        this.request.user.tenant?.id
      );

      return resSuccess('Drive Edited.', 'success', HttpStatus.CREATED, {
        tenant_id: driveShifts?.[0]?.tenant_id || this.request.user.tenant?.id,
      });
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async createBlueprint(
    queryRunner: QueryRunner,
    createDriveDto: CreateDriveDto,
    operation_status: any,
    driveData: any
  ) {
    const blueprint = await this.drivesRepository.findOne({
      where: {
        account_id: createDriveDto.account_id,
        location_id: createDriveDto.location_id,
        is_blueprint: true,
        is_active: true,
        is_archived: false,
      },
    });

    if (!blueprint) {
      const blueprint = await this.saveBasicDriveInfo(
        queryRunner,
        createDriveDto,
        true,
        operation_status
      );
      await this.drivesContactService.saveDriveContacts(
        queryRunner,
        createDriveDto.contacts,
        blueprint,
        createDriveDto.created_by
      );
      const driveCustomFieds = [];
      const custom_fields = {
        custom_fields: {
          fields_data: createDriveDto?.custom_fields?.fields_data,
          custom_field_datable_type:
            createDriveDto?.custom_fields?.custom_field_datable_type,
          custom_field_datable_id: driveData?.id,
        },
      };
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        driveData,
        this.request.user.id,
        this.request.user.tenant,
        custom_fields,
        driveCustomFieds
      );

      await this.shiftsService.createShiftByShiftAble(
        createDriveDto,
        queryRunner,
        createDriveDto.shifts,
        blueprint,
        createDriveDto.created_by,
        createDriveDto.tenant_id,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        true,
        true
      );

      await this.driveEquipmentsService.saveEquipments(
        queryRunner,
        createDriveDto.equipment,
        blueprint,
        createDriveDto.created_by
      );

      await this.driveCertificationsService.saveCertifications(
        queryRunner,
        createDriveDto.certifications,
        blueprint,
        createDriveDto.created_by
      );

      await this.saveMarketingInfo(
        queryRunner,
        createDriveDto.marketing,
        blueprint,
        createDriveDto.created_by
      );

      await this.saveDonorCommunicationData(
        queryRunner,
        createDriveDto.donor_communication,
        createDriveDto.zip_codes,
        blueprint,
        createDriveDto.created_by
      );
    }
  }

  handleDateInput(keyword: string) {
    const dateParts = keyword.split('-');
    let dateCondition = '';
    switch (dateParts.length) {
      case 1:
        // Assuming Year will always be 4 digits
        if (dateParts[0].length === 4) {
          dateCondition = `EXTRACT(year FROM drives.date) = ${dateParts[0]}`;
        } else {
          dateCondition = `EXTRACT(month FROM drives.date) = ${dateParts[0]} OR EXTRACT(day FROM drives.date) = ${dateParts[0]}`;
        }
        break;
      case 2:
        // Determine if it's Year-Month or Month-Day based on the value
        // Assuming Year will always be 4 digits
        if (dateParts[1].length === 4) {
          dateCondition = `EXTRACT(day FROM drives.date) = ${dateParts[0]} AND EXTRACT(year FROM drives.date) = ${dateParts[1]}`;
        } else {
          // Month-Day format
          dateCondition = `EXTRACT(month FROM drives.date) = ${dateParts[0]} AND EXTRACT(day FROM drives.date) = ${dateParts[1]}`;
        }
        break;
      case 3: // Month-Day-Year
        dateCondition = `EXTRACT(month FROM drives.date) = ${dateParts[0]} AND EXTRACT(day FROM drives.date) = ${dateParts[1]} AND EXTRACT(year FROM drives.date) = ${dateParts[2]}`;
        break;
      default:
        console.error('Invalid date format');
        break;
    }
    return dateCondition;
  }

  convertTo24Hour(time12h) {
    // Split the time string into hours, minutes, and AM/PM
    const timeArr = time12h.split(':');
    let hours = parseInt(timeArr[0]);
    const minutes = parseInt(timeArr[1]);
    const period = time12h.slice(-2).toUpperCase();

    // Convert 12-hour format to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours == 12) {
      hours -= 12;
    }

    // Pad single-digit hours/minutes with leading zeros
    const h = hours < 10 ? '0' + hours : hours;
    const m = minutes < 10 ? '0' + minutes : minutes;

    // Return the time in 24-hour format
    return h + ':' + m;
  }

  isTimeInput(keyword: string) {
    return keyword && keyword.includes(':');
  }

  handleTimeInput(keyword: string) {
    let timeCondition = '';
    if (this.isTimeInput(keyword)) {
      const times = keyword.split('-').map((t) => t.trim());
      // Time handling logic
      if (times.length === 1) {
        const startTime = times[0].split(':').map((t) => t.trim());
        if (startTime.length === 2) {
          const [hour, minute] = startTime;
          const timePart = `${hour.padStart(2, '0')}:${minute.padStart(
            2,
            '0'
          )}`;
          timeCondition = `OR TO_CHAR(start_time, 'HH24:MI') LIKE '%${this.convertTo24Hour(
            timePart
          )}%' `;
        }
      } else if (times.length === 2) {
        const startTime = times[0].split(':').map((t) => t.trim());
        const endTime = times[1].split(':').map((t) => t.trim());
        if (startTime.length === 2 && endTime.length === 2) {
          const [startHour, startMinute] = startTime;
          const [endHour, endMinute] = endTime;
          const startPart = `${startHour.padStart(
            2,
            '0'
          )}:${startMinute.padStart(2, '0')}`;
          const endPart = `${endHour.padStart(2, '0')}:${endMinute.padStart(
            2,
            '0'
          )}`;

          timeCondition = `OR TO_CHAR(start_time, 'HH24:MI') LIKE '%${this.convertTo24Hour(
            startPart
          )}%' AND TO_CHAR(end_time, 'HH24:MI') LIKE '%${this.convertTo24Hour(
            endPart
          )}%'  `;
        }
      }
    }
    return timeCondition;
  }

  async searchDrives(keyword: string) {
    let searchCondition = '';
    let active;

    if (keyword) {
      if (
        keyword.toLowerCase().includes('in') &&
        keyword.toLowerCase().includes('active')
      ) {
        active = false;
      } else {
        active = true;
      }

      const response = await this.accountsRespository
        .createQueryBuilder('accounts')
        .where({
          name: ILike(`%${keyword}%`),
        })
        .getMany();

      const locations = await this.crmLocationsRespository
        .createQueryBuilder('locations')
        .where({
          name: ILike(`%${keyword}%`),
        })
        .getMany();
      const users = await this.usersRespository.find({
        where: [
          {
            role: { is_recruiter: true },
            is_impersonateable_user: false,
            first_name: ILike(
              `%${keyword.includes(' ') ? keyword.split(' ')[0] : keyword}%`
            ),
          },
          {
            role: { is_recruiter: true },
            last_name: ILike(
              `%${keyword.includes(' ') ? keyword.split(' ')[1] : keyword}%`
            ),
          },
        ],
        select: ['id'],
        relations: ['role'],
      });
      const accountIds = response.map((account) => account.id);
      const locationIds = locations.map((location) => location.id);
      const userIds = users.map((user) => user.id);
      if (accountIds.length && locationIds.length)
        searchCondition = `${searchCondition} AND ( drives.account_id IN (${accountIds}) OR drives.location_id IN (${locationIds}) ) `;
      else if (accountIds.length)
        searchCondition = `${searchCondition} AND ( drives.account_id IN (${accountIds}) ) `;
      else if (locationIds.length)
        searchCondition = `${searchCondition} AND ( drives.location_id IN (${locationIds}) ) `;
      if (userIds.length)
        searchCondition = `${searchCondition} ${
          keyword.includes(' ') ? 'AND' : 'OR'
        } ( drives.recruiter_id IN (${userIds}) ) `;
      if (active !== undefined) {
        searchCondition = `${searchCondition} AND drives.is_active = ${
          active === true
        } `;
      }
    }
    // searching for date or time
    if (keyword && (/\d/.test(keyword) || keyword.includes(':'))) {
      if (this.isTimeInput(keyword)) {
        const condition = this.handleTimeInput(keyword);
        // if (condition) {
        // query.andWhere(condition);
        // }
      } else {
        const condition = this.handleDateInput(keyword);
        if (condition) {
          searchCondition = `${searchCondition} AND ( ${condition} )`;
        }
      }
    }
    return searchCondition;
  }

  async getPaginatedFilteredData(
    getDrivesFilterInterface: GetAllDrivesFilterInterface
  ) {
    const {
      limit = parseInt(process.env.PAGE_SIZE),
      page = 1,
      sortBy,
      childSortBy,
      sortOrder = OrderByConstants.DESC,
      keyword,
      fetch_all = false,
      is_linkable,
      is_linked,
      account,
      location,
      min_projection,
      max_projection,
      organizational_levels,
      promotion,
      status,
      day,
      shiftStart,
      shiftEnd,
      endDate,
      exportType,
      downloadType,
      startDate,
      is_active,
      ids,
    } = getDrivesFilterInterface;

    let sortName = '';
    let sortingOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    if (sortBy) {
      if (sortBy == 'status') {
        sortName = 'status';
      }
      if (sortBy == 'account') {
        sortName = 'account_name';
      }
      // if (sortBy == 'recruiter') {
      //   sortName =
      //     '(SELECT "user"."first_name" FROM "user" WHERE "user"."id" = "drives"."recruiter_id" LIMIT 1)';
      // }

      if (sortBy == 'crm_locations') {
        sortName = 'location_name';
      }
      if (sortBy == 'date') {
        sortName = 'date';
      }
      if (sortBy == 'hours') {
        sortName = `start_time`;
      }
      if (sortBy == 'projection') {
        sortName = `procedure_type_qty`;
      }
    } else {
      sortName = 'id';
    }

    let driveCondition = {};
    if (keyword) {
      driveCondition = {
        account: {
          name: ILike(`%${keyword}%`),
        },
        location: {
          name: ILike(`%${keyword}%`),
        },
      };
    }

    if (ids) {
      driveCondition = `id IN (${ids})`;
    }

    if (is_linkable !== undefined && is_linked !== undefined) {
      driveCondition = `${driveCondition} AND drives.is_linked = ${is_linked} AND drives.is_linkable = ${is_linkable}`;
    }

    if (is_active) {
      driveCondition = `${driveCondition} AND drives.is_active = ${
        is_active === 'true'
      }`;
    }

    const userBusinessUnits = await userBusinessUnitHierarchy(
      this.request.user.id,
      this.userBusinessUnitsRepository,
      this.businessUnitsRepo,
      this.request.user?.role?.is_auto_created,
      this.request.user?.tenant?.id
    );

    const userBusinessUnitsIds =
      userBusinessUnits?.map((units) => units.id) || [];

    const drivesQuery = this.drivesRepository
      .createQueryBuilder('drives')
      .leftJoin('drives.operation_status', 'os', 'os.is_archived = false')
      .leftJoin('drives.account', 'account', 'account.is_archived = false')
      .leftJoin('drives.location', 'location', 'location.is_archived = false')
      .leftJoin(
        'drives.drive_contacts',
        'drive_contacts',
        'drive_contacts.is_archived = false'
      )
      .leftJoin(
        'drive_contacts.role',
        'contacts_roles',
        'contacts_roles.is_primary_chairperson =true AND contacts_roles.is_archived = false'
      )
      .leftJoin(
        'drive_contacts.accounts_contacts',
        'accounts_contacts',
        `accounts_contacts.is_archived = false`
        // `accounts_contacts.is_archived = false AND accounts_contacts.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'`
      )
      .leftJoin(
        'accounts_contacts.record',
        'record_id',
        'record_id.is_archived = false'
      )
      .leftJoin(
        'shifts',
        'shift',
        `shift.shiftable_id = drives.id AND shift.is_archived=false and shift.shiftable_type='${PolymorphicType.OC_OPERATIONS_DRIVES}'`
      )
      // AND phone.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
      .leftJoin(
        'contacts',
        'phone',
        `phone.contactable_id = drives.id 
        AND phone.is_archived = false AND phone.is_primary = true
        AND phone.contact_type IN(1,2,3)`
      )
      // AND email.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
      .leftJoin(
        'contacts',
        'email',
        `email.contactable_id = drives.id
        AND email.is_archived = false AND email.is_primary = true
        AND email.contact_type IN(4,5,6)`
      )
      .leftJoin('shifts_projections_staff', 'sps', `sps.shift_id = shift.id`)
      .select([
        'distinct(drives.id) AS id',
        'drives.date AS date',
        'account.name AS account_name',
        'account.id AS account_id',
        'account.is_archived AS account_is_archived',
        'account.is_active AS account_is_active',
        'account.recruiter AS account_recruiter_id',
        'location.name AS location_name',
        'location.id AS location_id',
        'os.name AS status',
        'os.chip_color AS status_chip_color',
        `CONCAT(record_id.first_name, ' ', record_id.last_name) AS cp_name`,
        `Min(shift.start_time)  OVER () AS  start_time`,
        `Max(shift.end_time)  OVER () AS  end_time`,
        'email.data cp_email',
        'phone.data AS cp_phone',
        `SUM(sps.product_yield) OVER (PARTITION BY "drives"."id") AS product_yield`,
        `SUM(sps.procedure_type_qty) OVER (PARTITION BY "drives"."id") AS procedure_type_qty`,
        `CONCAT(SUM(sps.product_yield) OVER (PARTITION BY "drives"."id"), ' / ', SUM(sps.procedure_type_qty) OVER (PARTITION BY "drives"."id") ) AS projection`,
        `drives.tenant_id as tenant_id`,
        `case when "account".collection_operation in (${userBusinessUnitsIds?.join(
          ','
        )}) then true else false end as writeable`,
      ])
      .where({
        tenant_id: this.request.user.tenant.id,
        is_archived: false,
        is_blueprint: false,
        ...driveCondition,
      });

    if (account != null) {
      drivesQuery.andWhere(`drives.account_id = ${account}`);
    }

    if (promotion != null) {
      const pro = JSON.parse(promotion);
      const idArray = pro.map((item) => item.id);
      drivesQuery.andWhere(`drives.promotion_id IN (${idArray.join(', ')})`);
    }

    if (status != null) {
      const pro = JSON.parse(status);

      const idArray = pro.map((item) => item.id);
      drivesQuery.andWhere(`os.id  IN (${idArray.join(', ')})`);
    }

    if (day != null) {
      const pro = JSON.parse(day);

      const nameArray = pro.map((item) => item.name);

      drivesQuery.andWhere(
        `EXTRACT(DOW FROM drives.date) IN (${nameArray
          .map((day) => nameArray.indexOf(day) + 1)
          .join(', ')})`
      );
    }

    if (location != null) {
      drivesQuery.andWhere(`location.id = ${location}`);
    }

    if (min_projection != null) {
      drivesQuery.andWhere(`sps.procedure_type_qty >= ${min_projection}`);
    }
    if (max_projection != null) {
      drivesQuery.andWhere(`sps.procedure_type_qty <= ${max_projection}`);
    }
    if (shiftStart != null) {
      drivesQuery.andWhere(
        `EXTRACT(HOUR FROM start_time) * 3600 + EXTRACT(MINUTE FROM start_time) * 60 + EXTRACT(SECOND FROM start_time) <= EXTRACT(HOUR FROM TIME '${shiftStart}') * 3600 + EXTRACT(MINUTE FROM TIME '${shiftStart}') * 60 + EXTRACT(SECOND FROM TIME '${shiftStart}')`
      );
    }
    if (shiftEnd != null) {
      drivesQuery.andWhere(
        `EXTRACT(HOUR FROM start_time) * 3600 + EXTRACT(MINUTE FROM start_time) * 60 + EXTRACT(SECOND FROM start_time) >= EXTRACT(HOUR FROM TIME '${shiftEnd}') * 3600 + EXTRACT(MINUTE FROM TIME '${shiftEnd}') * 60 + EXTRACT(SECOND FROM TIME '${shiftEnd}')`
      );
    }
    if (startDate != null && endDate != null) {
      drivesQuery.andWhere(
        `drives.date BETWEEN '${startDate}' AND '${endDate}'`
      );
    }

    if (organizational_levels) {
      drivesQuery.andWhere(
        organizationalLevelWhere(
          organizational_levels,
          'account.collection_operation',
          'drives.recruiter_id'
        )
      );
    }

    drivesQuery.orderBy(sortName, sortingOrder);
    const count = await drivesQuery.getCount();
    if (page && limit) {
      const { skip, take } = pagination(page, limit);
      drivesQuery.limit(take).offset(skip);
    }

    console.log(drivesQuery.getQuery());

    const data = await drivesQuery.getRawMany();
    console.log('Data', JSON.stringify(data));

    return { data, count };
  }

  async getAll(
    getDrivesFilterInterface: GetAllDrivesFilterInterface,
    req: any
  ) {
    try {
      const { data, count } = await this.getPaginatedFilteredData(
        getDrivesFilterInterface
      );

      return {
        status: HttpStatus.OK,
        message: 'Drives Fetched Successfully',
        data: data,
        count: count,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFetchAllDrive(getDrivesFilterInterface) {
    const {
      sortBy,
      sortOrder = OrderByConstants.DESC,
      keyword,
      is_linkable,
      is_linked,
      is_active,
      ids,
    } = getDrivesFilterInterface;

    let sortName = '';
    let sortingOrder = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    if (sortBy) {
      if (sortBy == 'status') {
        sortName =
          '(SELECT name FROM operations_status WHERE operations_status.id = drives.operation_status_id LIMIT 1)';
        sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
      if (sortBy == 'account') {
        sortName = 'account.name';
        sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
      if (sortBy == 'recruiter') {
        sortName =
          '(SELECT "user"."first_name" FROM "user" WHERE "user"."id" = "drives"."recruiter_id" LIMIT 1)';
        sortOrder.toUpperCase();
      }

      if (sortBy == 'crm_locations') {
        sortName = 'crm_locations.name';
        sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
      if (sortBy == 'date') {
        sortName = 'drives.date';
        sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
      if (sortBy == 'hours') {
        sortName = `(SELECT start_time FROM shifts WHERE shifts.shiftable_id = drives.id  AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' LIMIT 1)`;
        sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
      if (sortBy == 'projection') {
        sortName = `drives.oef_procedures`;
        sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
    } else {
      sortName = 'drives.id';
      sortingOrder = 'DESC';
    }

    let driveCondition = `drives.is_archived = false AND drives.is_blueprint = false AND drives.tenant_id = ${this.request.user?.tenant?.id}`;

    if (ids) {
      driveCondition = `${driveCondition} AND drives.id IN (${ids})`;
    }

    if (is_linkable !== undefined && is_linked !== undefined) {
      driveCondition = `${driveCondition} AND drives.is_linked = ${is_linked} AND drives.is_linkable = ${is_linkable}`;
    }

    if (is_active) {
      driveCondition = `${driveCondition} AND drives.is_active = ${
        is_active === 'true'
      } `;
    }
    if (keyword) {
      const searchConditions = await this.searchDrives(keyword);
      if (searchConditions) {
        driveCondition = `${driveCondition} ${searchConditions}`;
      }
    }
    const queryforAll = this.drivesRepository
      .createQueryBuilder('drives')
      .select(
        `(  SELECT JSON_BUILD_OBJECT(
              'oef_procedures', drives.oef_procedures,
              'oef_products', drives.oef_products,
              'id', drives.id,
              'created_at', drives.created_at,
              'is_archived', drives.is_archived,
              'name', drives.name,
              'oef_products' , drives.oef_products,
              'oef_procedures' , drives.oef_procedures,
              'oef_products','COALESCE(SUM(shifts.product_yield), 0) AS product_yield',
              'oef_procedures','COALESCE(SUM(shifts.procedure_type_qty), 0) AS procedure_type_qty'
              'account_id', drives.account_id,
              'location_id', drives.location_id,
              'is_linkable', drives.is_linkable,
              'is_linked', drives.is_linked,
              'date', drives.date,
              'is_multi_day_drive', drives.is_multi_day_drive,
              'tenant_id', drives.tenant_id,
              'promotion_id', drives.promotion_id,
              'is_active', drives.is_active,
              'operation_status_id', JSON_BUILD_OBJECT(
                'id', operations_status.id,
                'name', operations_status.name,
                'chip_color', operations_status.chip_color
              ),
              'recruiter_id', drives.recruiter_id,
              'shifts',(
                SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', shifts.id,
                    'start_time', shifts.start_time,
                    'end_time', shifts.end_time,
                    'vehicles', (
                      SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'shift_id', shifts_vehicles.shift_id,
                          'vehicle_id', JSON_BUILD_OBJECT(
                            'id', vehicle.id,
                            'name', vehicle.name,
                            'tenant_id', vehicle.tenant_id
                          )
                        )
                      )
                      FROM "shifts_vehicles" AS shifts_vehicles
                      LEFT JOIN "vehicle" AS vehicle
                        ON vehicle.id = shifts_vehicles.vehicle_id AND vehicle.is_archived = FALSE
                      WHERE shifts_vehicles.shift_id = shifts.id AND shifts_vehicles.is_archived = FALSE
                    )
                    )
                )
                FROM "shifts" AS shifts
                WHERE shifts.shiftable_id = drives.id AND shifts.is_archived = FALSE AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            ),
              'drive_contacts', (
                SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', drives_contacts.id,
                    'accounts_contacts_id', drives_contacts.accounts_contacts_id,
                    'drive_id', drives_contacts.drive_id,
                    'role_id', drives_contacts.role_id,
                    'role', (
                      SELECT JSON_BUILD_OBJECT(
                        'id', contacts_roles.id,
                        'name', contacts_roles.name,
                        'tenant_id', contacts_roles.tenant_id
                      )
                      FROM contacts_roles
                      WHERE contacts_roles.id = drives_contacts.role_id
                      AND contacts_roles.name = 'Primary Chairperson'
                      ),
                  'record_id', (SELECT JSON_AGG(
                             JSON_BUILD_OBJECT(
                                'id', record_id.id,
                                'first_name', record_id.first_name,
                                'last_name', record_id.last_name,
                                'contactable_data', (
                                    SELECT JSON_AGG(
                                        JSON_BUILD_OBJECT(
                                            'data', contact.data,
                                            'is_primary', contact.is_primary,
                                            'contact_type', contact.contact_type,
                                            'tenant_id', contact.tenant_id
                                        )
                                    )
                                    FROM contacts contact
                                    WHERE contact.contactable_id = record_id.id
                                        AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                                        AND (
                                            (contact.is_primary = true AND contact.contact_type BETWEEN '${ContactTypeEnum.WORK_PHONE}' AND '${ContactTypeEnum.OTHER_EMAIL}')
                                        )
                                )
                                )
                            )
                            FROM crm_volunteer AS record_id, account_contacts, drives_contacts
                            WHERE record_id.id = account_contacts.record_id AND drives_contacts.accounts_contacts_id = account_contacts.id AND drives_contacts.drive_id =drives.id
                    ),
                    'account_contacts', (
                      SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'contactable_id', account_contacts.id,
                          'contactable_type', account_contacts.contactable_type,
                          'contactable_data', (
                            SELECT JSON_AGG(
                              JSON_BUILD_OBJECT(
                                'data', contact.data,
                                'is_primary', contact.is_primary,
                                'contact_type', contact.contact_type,
                                'tenant_id', contact.tenant_id
                              )
                            )
                            FROM contacts contact
                            WHERE contact.contactable_id = account_contacts.record_id
                            AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                            AND (
                              (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                              OR
                              (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                            )
                          )
                        )
                      )
                      FROM account_contacts AS account_contacts
                      WHERE account_contacts.id = drives_contacts.accounts_contacts_id
                    )
                  )
                )
                FROM drives_contacts
                WHERE drives_contacts.drive_id = drives.id AND drives_contacts.is_archived = FALSE
              )
            )
          FROM drives drive
          LEFT JOIN operations_status ON operations_status.id = drives.operation_status_id
          WHERE drive.id = drives.id
          )`,
        'drive'
      )
      .addSelect(
        `(
              SELECT JSON_AGG( JSON_BUILD_OBJECT(
                  'start_time',shifts.start_time,
                  'end_time',shifts.end_time,
                  'tenant_id', shifts.tenant_id
                )) FROM shifts WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
          )`,
        'shifts_hours'
      )
      .addSelect(
        `(SELECT JSON_BUILD_OBJECT(
              'id', account.id,
              'name', account.name,
              'alternate_name', account.alternate_name,
              'phone', account.phone,
              'website', account.website,
              'facebook', account.facebook,
              'industry_category', account.industry_category,
              'industry_subcategory', account.industry_subcategory,
              'stage', account.stage,
              'source', account.source,
              'collection_operation', account.collection_operation,
              'recruiter', account.recruiter,
              'territory', account.territory,
              'population', account.population,
              'is_active', account.is_active,
              'RSMO', account."rsmo",
              'tenant_id', account.tenant_id,
              'account_contacts', (
                  SELECT JSON_AGG(
                      JSON_BUILD_OBJECT(
                          'id', account_contacts_id.id,
                          'contactable_id', account_contacts_id.contactable_id,
                          'contactable_type', account_contacts_id.contactable_type,
                          'is_archived', account_contacts_id.is_archived,
                          'role_id', (
                              SELECT JSON_BUILD_OBJECT(
                                  'name', role.name,
                                  'id', role.id,
                                  'is_primary_chairperson', role.is_primary_chairperson,
                                  'tenant_id', role.tenant_id
                              )
                              FROM contacts_roles AS role
                              WHERE role.id = account_contacts_id.role_id
                          ),
                          'record_id', (
                              SELECT JSON_BUILD_OBJECT(
                                  'id', record_id.id,
                                  'first_name', record_id.first_name,
                                  'last_name', record_id.last_name,
                                  'contactable_data', (
                                      SELECT JSON_AGG(
                                          JSON_BUILD_OBJECT(
                                              'data', contact.data,
                                              'is_primary', contact.is_primary,
                                              'contact_type', contact.contact_type,
                                              'tenant_id', contact.tenant_id
                                          )
                                      )
                                      FROM contacts contact
                                      WHERE contact.contactable_id = record_id.id
                                          AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                                          AND (
                                              (contact.is_primary = true AND contact.contact_type BETWEEN '${ContactTypeEnum.WORK_PHONE}' AND '${ContactTypeEnum.OTHER_EMAIL}')
                                          )
                                  )
                              )
                              FROM crm_volunteer AS record_id
                              WHERE record_id.id = account_contacts_id.record_id
                          )
                      )
                  )
                  FROM account_contacts AS account_contacts_id
                  LEFT JOIN contacts_roles AS role ON role.id = account_contacts_id.role_id
                  WHERE account_contacts_id.contactable_id = drives.account_id AND account_contacts_id.contactable_type = '${PolymorphicType.CRM_ACCOUNTS}' AND account_contacts_id.is_archived = FALSE
              )
          ) FROM accounts WHERE accounts.id = drives.account_id)`,
        'account'
      )
      .addSelect(
        `(
            SELECT JSON_BUILD_OBJECT(
                'id', crm_locations.id,
                'created_at', crm_locations.created_at,
                'is_archived', crm_locations.is_archived,
                'name', crm_locations.name,
                'cross_street', crm_locations.cross_street,
                'floor', crm_locations.floor,
                'room', crm_locations.room,
                'room_phone', crm_locations.room_phone,
                'becs_code', crm_locations.becs_code,
                'site_type', crm_locations.site_type,
                'qualification_status', crm_locations.qualification_status,
                'is_active', crm_locations.is_active,
                'tenant_id', crm_locations.tenant_id
            )
            FROM crm_locations
            WHERE crm_locations.id = drives.location_id
        )`,
        'crm_locations'
      )
      .leftJoin('drives.account', 'account')
      .leftJoin(
        'business_units',
        'bu',
        'account.collection_operation = bu.id AND bu.is_archived = false'
      )
      .leftJoin('drives.location', 'crm_locations')
      .where(driveCondition);
    queryforAll.orderBy(sortName, sortingOrder);
    queryforAll.getQuery();

    const sampleAll = await this.drivesRepository.query(queryforAll.getSql());

    return { data: sampleAll };
  }
  async getExportURL(
    getDrivesFilterInterface: GetAllDrivesFilterInterface,
    req: any
  ) {
    try {
      const { exportType, downloadType } = getDrivesFilterInterface;

      console.log({ exportType, downloadType });

      let exportData = [];
      let url: string;
      if (exportType?.toString() == 'filtered' && downloadType) {
        let primaryCP = null;
        let CPPhone = null;
        let CPEmail = null;
        const { data } = await this.getPaginatedFilteredData(
          getDrivesFilterInterface
        );
        exportData = data;
        const newArray = exportData.map((item) => {
          const shiftsHours =
            item.shifts_hours && item.shifts_hours.length
              ? item.shifts_hours
              : [];
          let start_time = item.shifts_hours[0].start_time ?? null;
          let end_time = item.shifts_hours[0].end_time ?? null;
          for (const time of shiftsHours) {
            start_time =
              time.start_time < start_time ? time.start_time : start_time;
            end_time = time.end_time > end_time ? time.end_time : end_time;
          }
          for (const contact of item?.account?.account_contacts || []) {
            if (contact?.role_id?.name == 'Primary Chairperson') {
              primaryCP = `${contact?.record_id?.first_name || ''} ${
                contact?.record_id?.last_name || ''
              }`;
              CPPhone = contact?.record_id?.contactable_data?.[0]?.data;
              CPEmail = contact?.record_id?.contactable_data?.[1]?.data;
            }
          }
          return {
            operataion_date: item?.drive?.date,
            account: item?.account?.name,
            location: item?.crm_locations?.name,
            Projection:
              item?.drive?.oef_procedures + '/' + item?.drive?.oef_products,
            hours:
              moment(start_time).format('hh:mm a') +
              '-' +
              moment(end_time).format('hh:mm a'),
            PrimaryCP: primaryCP,
            CPPhone: CPPhone,
            CPEmail: CPEmail,
          };
        });

        const prefixName = getDrivesFilterInterface?.selectedOptions
          ? getDrivesFilterInterface?.selectedOptions.trim()
          : 'Drives';
        url = await this.exportService.exportDataToS3(
          newArray,
          getDrivesFilterInterface,
          prefixName,
          'Drives'
        );
      } else if (exportType?.toString() == 'all' && downloadType) {
        let primaryCP = null;
        let CPPhone = null;
        let CPEmail = null;
        const { data } = await this.getFetchAllDrive(getDrivesFilterInterface);
        exportData = data;
        const newArray = exportData.map((item) => {
          const shiftsHours =
            item.shifts_hours && item.shifts_hours.length
              ? item.shifts_hours
              : [];
          let start_time = item?.shifts_hours[0]?.start_time ?? null;
          let end_time = item?.shifts_hours[0]?.end_time ?? null;
          for (const time of shiftsHours) {
            start_time =
              time.start_time < start_time ? time.start_time : start_time;
            end_time = time.end_time > end_time ? time.end_time : end_time;
          }
          for (const contact of item?.account?.account_contacts || []) {
            if (contact?.role_id?.name == 'Primary Chairperson') {
              primaryCP = `${contact?.record_id?.first_name || ''} ${
                contact?.record_id?.last_name || ''
              }`;
              CPPhone = contact?.record_id?.contactable_data?.[0]?.data;
              CPEmail = contact?.record_id?.contactable_data?.[1]?.data;
            }
          }
          return {
            operataion_date: item?.drive?.date,
            account: item?.account?.name,
            location: item?.crm_locations?.name,
            Projection:
              item?.drive?.oef_procedures + '/' + item?.drive?.oef_products,
            hours:
              moment(start_time).format('hh:mm a') +
              '-' +
              moment(end_time).format('hh:mm a'),
            PrimaryCP: primaryCP,
            CPPhone: CPPhone,
            CPEmail: CPEmail,
          };
        });
        const prefixName = getDrivesFilterInterface?.selectedOptions
          ? getDrivesFilterInterface?.selectedOptions.trim()
          : 'Drives';
        url = await this.exportService.exportDataToS3(
          newArray,
          getDrivesFilterInterface,
          prefixName,
          'Drives'
        );
      }
      console.log({ url });

      return {
        status: HttpStatus.OK,
        message: 'Drives URL Fectehd Successfully',
        tenant_id: this.request.user?.tenant?.id,
        url,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateShiftProjectionStaff(
    updateShiftsProjectionStaff: UpdateShiftsProjectionStaff
  ) {
    try {
      const shiftIds = updateShiftsProjectionStaff?.shift_ids
        ? Array.isArray(updateShiftsProjectionStaff?.shift_ids)
          ? updateShiftsProjectionStaff?.shift_ids
          : [updateShiftsProjectionStaff?.shift_ids]
        : [];

      if (!updateShiftsProjectionStaff.procedure_type_id) {
        resError(
          `Procedure type id is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const shiftsData = await this.shiftsRepo.find({
        where: {
          id: In(shiftIds),
        },
      });

      if (!shiftsData.length || shiftsData.length === 0) {
        resError(
          `Shift not found.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const shiftsProjectionStaffData = await Promise.all(
        shiftsData?.map(async (shift) => {
          const projectionstaff = await this.shiftsProjectionsStaffRepo.findOne(
            {
              where: {
                shift_id: shift.id,
                procedure_type_id:
                  updateShiftsProjectionStaff.procedure_type_id,
              },
            }
          );
          if (projectionstaff) {
            projectionstaff.is_donor_portal_enabled =
              updateShiftsProjectionStaff.is_donor_portal_enabled;
            await this.shiftsProjectionsStaffRepo.save(projectionstaff);
          }
        })
      );
      return resSuccess(
        'Staff Projection staff Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async addShiftSlot(addShiftSlotDto: AddShiftSlotDTO, user: any) {
    try {
      if (!addShiftSlotDto.slots || addShiftSlotDto.slots.length === 0) {
        resError(
          `Need data to create shift slot.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const slotData: any = [];
      for (const shiftItem of addShiftSlotDto.slots) {
        if (!shiftItem?.procedure_type_id) {
          resError(
            `Procedure Type id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        if (!shiftItem?.shift_id) {
          resError(
            `Shift id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        const saveSlots = new ShiftsSlots();
        saveSlots.shift_id = shiftItem.shift_id;
        saveSlots.procedure_type_id = shiftItem.procedure_type_id;
        saveSlots.created_by = user;
        saveSlots.start_time = shiftItem.start_time;
        saveSlots.end_time = shiftItem.end_time;
        saveSlots.tenant_id = this.request.user?.tenant?.id;
        await this.shiftsSlotRepo.save(saveSlots);
        const { created_by, ...rest } = saveSlots;
        slotData.push({
          ...rest,
          tenant_id: this.request.user?.tenant?.id,
        });
      }

      return resSuccess(
        'Shift Slots created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        slotData
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getProcedureTypeSlots(getShiftIds: any) {
    try {
      const shiftIds = getShiftIds?.shift_ids
        ? Array.isArray(getShiftIds?.shift_ids)
          ? getShiftIds?.shift_ids
          : [getShiftIds?.shift_ids]
        : [];

      const shiftSlots = await this.shiftsSlotRepo.find({
        relations: ['procedure_type', 'donors', 'appointments.donor', 'shift'],
        where: {
          shift: { id: In(shiftIds) },
          procedure_type_id: getShiftIds?.procedure_type_id,
          is_archived: false,
        },
        order: {
          start_time: 'ASC',
        },
      });

      if (!shiftSlots.length || shiftSlots.length === 0) {
        resError(
          `Shift slot not found.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const totalSlots = shiftSlots.length;
      const filledSlots = shiftSlots.filter(
        (slots) => slots?.donors?.length > 0
      ).length;

      const updatedShiftSlots = shiftSlots.map((item: any) => ({
        ...item,
        tenant_id: item?.shift?.tenant_id,
      }));

      const data = [
        ...updatedShiftSlots,
        {
          filled_slots: filledSlots,
          total_slots: totalSlots,
          tenant_id: updatedShiftSlots[0]?.shift?.tenant_id,
        },
      ];

      return resSuccess(
        'Shift slots found.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        data
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getDriveShiftDonorSchdules(user: any, id: any) {
    try {
      const findShifts = await this.shiftsRepo.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
        },
      });

      if (!findShifts || findShifts.length === 0) {
        resError(
          `Shifts not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shiftsDrawHours = await this.shiftsRepo
        .createQueryBuilder('shift')
        .select([
          'MIN(shift.start_time) AS start_time',
          'MAX(shift.end_time) AS end_time',
          'MAX(shift.tenant_id) AS tenant_id',
        ])
        .where({
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          is_archived: false,
        })
        .groupBy('shift.shiftable_id')
        .getRawOne();

      const shiftsWithSlots = await Promise.all(
        findShifts.map(async (shift) => {
          const shiftSlots = await this.shiftsSlotRepo
            .createQueryBuilder('shiftSlot')
            .leftJoinAndSelect('shiftSlot.procedure_type', 'procedureType')
            .leftJoinAndSelect(
              'shiftSlot.appointments',
              'da',
              'shiftSlot.id = da.slot_id AND shiftSlot.procedure_type_id = da.procedure_type_id'
            )
            .leftJoinAndSelect('da.donor', 'donor')
            .leftJoinAndSelect('shiftSlot.donors', 'd', 'd.id = da.donor_id')
            .where(
              `shiftSlot.shift_id = :shiftId AND shiftSlot.is_archived = false`,
              {
                shiftId: shift.id,
              }
            )
            .orderBy('shiftSlot.start_time')
            .getMany();

          return shiftSlots;
        })
      );

      const flattenedShiftSlots = shiftsWithSlots.flat();
      const totalSlots = flattenedShiftSlots?.length;

      const filledSlots = flattenedShiftSlots.filter(
        (slots) => slots?.donors?.length > 0
      ).length;

      const data = await this.drivesRepository
        .createQueryBuilder('drives')
        .leftJoin(
          'shifts',
          'shifts',
          'shifts.shiftable_id = drives.id AND shifts.shiftable_type = :type',
          {
            type: PolymorphicType.OC_OPERATIONS_DRIVES,
          }
        )
        .leftJoin(
          'shifts_projections_staff',
          'shifts_projections_staff',
          'shifts_projections_staff.shift_id = shifts.id'
        )
        .select([
          'shifts_projections_staff.shift_id AS id',
          'shifts_projections_staff.is_donor_portal_enabled AS is_donor_portal_enabled',
          'shifts_projections_staff.procedure_type_qty AS procedure_type_qty',
        ])
        .where(
          'drives.id = :id AND drives.is_archived = false AND shifts_projections_staff.shift_id IS NOT NULL',
          { id: id }
        )

        .getRawMany();
      const totalProcedureQty = data.reduce(
        (total, shift) => total + shift.procedure_type_qty,
        0
      );

      return resSuccess(
        'Shifts and Shift Slots retrieved successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {
          shifts: findShifts,
          shift_slots: flattenedShiftSlots,
          total_slots: totalSlots,
          draw_hours: shiftsDrawHours,
          filled_slots: filledSlots,
          total_procedures: totalProcedureQty,
          tenant_id: findShifts[0].tenant_id,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getLastDrive(tenant_id, account_id) {
    try {
      const [data, count] = await this.drivesRepository.find({
        where: {
          tenant_id: tenant_id,
          account_id: account_id,
          is_archived: false,
        },
        take: 1,
        order: { id: 'DESC' },
      });
      return {
        status: HttpStatus.OK,
        message: 'Last drive fetched successfully',
        data: data,
        count: count,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDrivesModifiedData(drive: Drives): Promise<Modified> {
    const modifiedObjs = await Promise.all([
      this.getModifiedData(drive, this.usersRespository),
      this.drivesContactService.getModifiedData(drive, this.usersRespository, {
        drive_id: drive.id,
      }),
      this.driveCertificationsService.getModifiedData(drive),
      this.driveEquipmentsService.getModifiedData(drive),
    ]);

    modifiedObjs.sort(
      (obj1, obj2) => obj2.modified_at.getTime() - obj1.modified_at.getTime()
    );

    return modifiedObjs.length ? modifiedObjs[0] : null;
  }

  async findOne(id: any) {
    try {
      const query = this.drivesRepository
        .createQueryBuilder('drives')
        .select(
          `(  SELECT JSON_BUILD_OBJECT(
                'oef_procedures', drives.oef_procedures,
                'oef_products', drives.oef_products,
                'id', drives.id,
                'is_default_blueprint', drives.is_default_blueprint,
                'created_at', drives.created_at,
                'is_archived', drives.is_archived,
                'name', drives.name,
                'account_id', drives.account_id,
                'location_id', drives.location_id,
                'date', drives.date,
                'is_multi_day_drive', drives.is_multi_day_drive,
                'tenant_id', drives.tenant_id,
                'promotion_id', drives.promotion_id,
                'is_linkable',drives.is_linkable,
                'marketing_items_status', drives.marketing_items_status,
                'promotional_items_status', drives.promotional_items_status,
                'operation_status_id',(SELECT JSON_BUILD_OBJECT(
                  'id',operations_status.id,
                  'name',operations_status.name,
                  'tenant_id', operations_status.tenant_id
                ) From operations_status WHERE operations_status.id = drives.operation_status_id ), 
                'recruiter_id', drives.recruiter_id,
                'created_by', (SELECT JSON_BUILD_OBJECT(
                  'id',"user"."id",
                  'first_name',"user"."first_name",
                  'last_name',"user"."last_name",
                  'tenant_id', "user"."tenant_id"
                ) From "user" WHERE "user"."id" = "drives"."created_by"),
                'linked_drive',(
                  SELECT JSON_BUILD_OBJECT(
                    'id',linked_drives.id,
                    'tenant_id', drives.tenant_id,
                    'prospective_drive_id',linked_drives.prospective_drive_id
                  ) From "linked_drives" AS linked_drives WHERE linked_drives.current_drive_id = drives.id AND linked_drives.is_archived = FALSE
                ),
                'drive_contacts', (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', drives_contacts.id,
                      'accounts_contacts_id', drives_contacts.accounts_contacts_id,
                      'drive_id', drives_contacts.drive_id,
                      'role_id', drives_contacts.role_id,
                      'role', (
                        SELECT JSON_BUILD_OBJECT(
                          'id', contacts_roles.id,
                          'is_primary_chairperson',contacts_roles.is_primary_chairperson,
                          'name', contacts_roles.name,
                          'tenant_id', contacts_roles.tenant_id
                        )
                        FROM contacts_roles
                        WHERE contacts_roles.id = drives_contacts.role_id

                      ),
                      'record_id', (SELECT JSON_AGG(
                                 JSON_BUILD_OBJECT(
                                    'id', record_id.id,
                                    'first_name', record_id.first_name,
                                    'last_name', record_id.last_name,
                                    'tenant_id',record_id.tenant_id,
                                    'contactable_data', (
                                        SELECT JSON_AGG(
                                            JSON_BUILD_OBJECT(
                                                'data', contact.data,
                                                'is_primary', contact.is_primary,
                                                'tenant_id', contact.tenant_id,
                                                'contact_type', contact.contact_type
                                            )
                                        )
                                        FROM contacts contact
                                        WHERE contact.contactable_id = record_id.id
                                            AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                                            AND (
                                                (contact.is_primary = true AND contact.contact_type BETWEEN '${ContactTypeEnum.WORK_PHONE}' AND '${ContactTypeEnum.OTHER_EMAIL}')
                                            )
                                    )
                                    )
                                )
                                FROM crm_volunteer AS record_id, account_contacts, drives_contacts, contacts_roles
                                WHERE record_id.id = account_contacts.record_id AND drives_contacts.accounts_contacts_id = account_contacts.id AND drives_contacts.drive_id =drives.id  AND drives_contacts.role_id = contacts_roles.id AND contacts_roles.is_primary_chairperson = true
                            ),
                      'account_contacts', (
                        SELECT JSON_AGG(
                          JSON_BUILD_OBJECT(
                            'contactable_id', account_contacts.id,
                            'tenant_id', drive.tenant_id,
                            'contactable_type', account_contacts.contactable_type,
                            'contactable_data', (
                              SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                  'data', contact.data,
                                  'tenant_id', contact.tenant_id,
                                  'is_primary', contact.is_primary,
                                  'contact_type', contact.contact_type
                                )
                              )
                              FROM contacts contact
                              WHERE contact.contactable_id = account_contacts.record_id
                              AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                              AND (
                                (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                                OR
                                (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                              )
                            )
                          )
                        )
                        FROM account_contacts AS account_contacts
                        WHERE account_contacts.id = drives_contacts.accounts_contacts_id
                      )
                    )
                  )
                  FROM drives_contacts
                  WHERE drives_contacts.drive_id = drives.id AND drives_contacts.is_archived = FALSE
                )
              )
            FROM drives drive WHERE drive.id = drives.id
            )`,
          'drive'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
            'id', account.id,
            'name', account.name,
            'alternate_name', account.alternate_name,
            'phone', account.phone,
            'website', account.website,
            'facebook', account.facebook,
            'is_archived', account.is_archived,
            'industry_category', (SELECT JSON_BUILD_OBJECT(
              'id',industry_categories.id,
              'name',industry_categories.name,
              'tenant_id', industry_categories.tenant_id
            ) From industry_categories WHERE industry_categories.id = accounts.industry_category ),
            'industry_subcategory', (SELECT JSON_BUILD_OBJECT(
              'id',industry_categories.id,
              'name',industry_categories.name,
              'tenant_id', industry_categories.tenant_id
            ) From industry_categories WHERE industry_categories.id = accounts.industry_subcategory ),
            'stage', (SELECT JSON_BUILD_OBJECT(
              'id',stages.id,
              'name',stages.name,
              'tenant_id', stages.tenant_id
            ) From stages WHERE stages.id = accounts.stage ),
            'source', (SELECT JSON_BUILD_OBJECT(
              'id',sources.id,
              'name',sources.name,
              'tenant_id', sources.tenant_id
            ) From sources WHERE sources.id = accounts.source ),
            'collection_operation',  (SELECT JSON_BUILD_OBJECT(
              'id',business_units.id,
              'name',business_units.name,
              'tenant_id', business_units.tenant_id
            ) From business_units WHERE business_units.id = accounts.collection_operation ),
            'territory', (SELECT JSON_BUILD_OBJECT(
              'id',territory.id,
              'territory_name',territory.territory_name,
              'tenant_id', territory.tenant_id
            ) From territory WHERE territory.id = accounts.territory ),
            'recruiter', (SELECT JSON_BUILD_OBJECT(
              'id',"user"."id",
              'first_name',"user"."first_name",
              'last_name',"user"."last_name",
              'tenant_id', "user".tenant_id
            ) From "user" WHERE "user"."id" = "accounts"."recruiter" ),
            'population', account.population,
            'is_active', account.is_active,
            'RSMO', account."rsmo",
            'tenant_id', account.tenant_id,
            'affiliations',(
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', account_affiliations.id,
                  'affiliation_data',(
                    SELECT JSON_BUILD_OBJECT(
                      'name',affiliation.name,
                      'tenant_id', affiliation.tenant_id
                    )
                    FROM affiliation AS affiliation
                    WHERE affiliation.id = account_affiliations.affiliation_id
                  )
                )
              )
              FROM account_affiliations AS account_affiliations
              WHERE account_affiliations.account_id = drives.account_id AND account_affiliations.is_archived = FALSE AND account_affiliations.closeout_date IS NULL  
            ),
            'account_contacts', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', account_contacts_id.id,
                  'contactable_id', account_contacts_id.contactable_id,
                  'contactable_type', account_contacts_id.contactable_type,
                  'tenant_id', accounts.tenant_id,
                  'is_archived', account_contacts_id.is_archived,
                  'role_id', (SELECT JSON_BUILD_OBJECT(
                    'name',role.name,
                    'id',role.id,
                    'tenant_id', role.tenant_id,
                    'is_primary_chairperson', role.is_primary_chairperson
                  ) From contacts_roles AS role WHERE role.id = account_contacts_id.role_id ),
                  'record_id', (
                    SELECT JSON_BUILD_OBJECT(
                      'id', record_id.id,
                      'first_name', record_id.first_name,
                      'last_name', record_id.last_name,
                      'tenant_id', record_id.tenant_id,
                      'contactable_data', ( 
                        SELECT JSON_AGG(
                          JSON_BUILD_OBJECT(
                            'data', contact.data,
                            'is_primary', contact.is_primary,
                            'tenant_id', contact.tenant_id,
                            'contact_type', contact.contact_type
                          )
                        )
                        FROM contacts contact
                        WHERE contact.contactable_id = record_id.id
                        AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                        AND (
                          (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                          OR
                          (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                        )
                      )
                    )
                    FROM crm_volunteer AS record_id
                    WHERE record_id.id = account_contacts_id.record_id
                  )
                )
              )
              FROM account_contacts AS account_contacts_id
              WHERE account_contacts_id.contactable_id = drives.account_id AND account_contacts_id.contactable_type = '${PolymorphicType.CRM_ACCOUNTS}' AND account_contacts_id.is_archived = FALSE
            )
          ) FROM accounts WHERE accounts.id = drives.account_id)`,
          'account'
        )
        .addSelect(
          `(
            SELECT JSON_BUILD_OBJECT(
                'id', crm_locations.id,
                'created_at', crm_locations.created_at,
                'is_archived', crm_locations.is_archived,
                'name', crm_locations.name,
                'cross_street', crm_locations.cross_street,
                'floor', crm_locations.floor,
                'room', crm_locations.room,
                'room_phone', crm_locations.room_phone,
                'becs_code', crm_locations.becs_code,
                'site_type', crm_locations.site_type,
                'qualification_status', crm_locations.qualification_status,
                'is_active', crm_locations.is_active,
                'tenant_id', crm_locations.tenant_id
            )
            FROM crm_locations
            WHERE crm_locations.id = drives.location_id
        )`,
          'crm_locations'
        )
        .addSelect(
          `(SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', drives_certifications.drive_id,
              'tenant_id', drives.tenant_id,
              'certificate_id', (SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', certification.id,
                    'tenant_id', certification.tenant_id,
                    'name', certification.name
                  ))
               FROM "certification" AS certification WHERE certification.id = "drives_certifications"."certification_id" AND certification.is_archived = FALSE
              )
            )
          )
          FROM drives_certifications
          WHERE drives_certifications.drive_id = drives.id AND drives_certifications.is_archived = FALSE
        )`,
          'drives_certifications'
        )

        .addSelect(
          `(SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'drive_equipment_id', drives_equipments.id,
              'quantity',drives_equipments.quantity,
              'equipment_id', (
                SELECT JSON_BUILD_OBJECT(
                  'name', equipment.name,
                  'id', equipment.id,
                  'type', equipment.type
                )
              
              FROM "equipments" AS equipment WHERE equipment.id = "drives_equipments"."equipment_id" AND equipment.is_archived = FALSE
              )
            )
          )
          FROM drives_equipments
          WHERE drives_equipments.drive_id = drives.id AND drives_equipments.is_archived = FALSE
          )`,
          'drives_equipments'
        )
        .addSelect(
          `(
                SELECT JSON_AGG( JSON_BUILD_OBJECT(
                    'id',shifts.id,
                    'start_time',shifts.start_time,
                    'end_time',shifts.end_time,
                    'oef_products',shifts.oef_products,
                    'oef_procedures',shifts.oef_procedures,
                    'break_start_time', shifts.break_start_time,
                    'tenant_id', shifts.tenant_id,
                    'break_end_time', shifts.break_end_time,
                    'reduce_slots', shifts.reduce_slots,
                    'reduction_percentage', shifts.reduction_percentage,
                    'shifts_projections_staff', (
                      SELECT JSON_AGG(
                          JSON_BUILD_OBJECT(
                            'procedure_id', shifts_projections_staff.procedure_type_id,
                            'procedure_type_qty', shifts_projections_staff.procedure_type_qty,
                            'tenant_id', shifts.tenant_id,
                            'product_yield', shifts_projections_staff.product_yield,
                            'procedure_type', (
                              SELECT JSON_BUILD_OBJECT(
                                  'id', pt.id,
                                  'name', pt.name,
                                  'short_description', pt.short_description,
                                  'tenant_id', pt.tenant_id,
                                  'procedure_duration', pt.procedure_duration,
                                  'procedure_type_products', (
                                    SELECT JSON_AGG(
                                        JSON_BUILD_OBJECT(
                                            'product_id', ptp.product_id,
                                            'quantity', ptp.quantity,
                                            'tenant_id', p.tenant_id,
                                            'name', p.name
                                        )
                                    )
                                    FROM procedure_types_products ptp
                                    JOIN products p ON p.id = ptp.product_id
                                    WHERE ptp.procedure_type_id = pt.id
                                )
                              )
                              FROM procedure_types pt
                              WHERE pt.id = shifts_projections_staff.procedure_type_id
                            ),
                            'staff_setup', (
                              SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                  'id', staff_setup.id,
                                  'name', staff_setup.name,
                                  'short_name', staff_setup.short_name,
                                  'beds', staff_setup.beds,
                                  'tenant_id', staff_setup.tenant_id,
                                  'concurrent_beds', staff_setup.concurrent_beds,
                                  'stagger_slots', staff_setup.stagger_slots,
                                  'shift_id',  shifts_projections_staff.shift_id,
                                  'qty', COALESCE(sub.qty, 0)
                                )
                              ) AS staff_setup
                              FROM shifts_projections_staff sps
                              LEFT JOIN staff_setup ON sps.staff_setup_id = staff_setup.id
                              LEFT JOIN (
                                SELECT
                                  staff_setup_id,
                                  COALESCE(SUM(DISTINCT ((cr.oef_contribution * sc.qty) / 100)), 0) AS qty
                                FROM staff_config sc
                                LEFT JOIN contacts_roles cr ON sc.contact_role_id = cr.id
                                GROUP BY staff_setup_id
                              ) sub ON sub.staff_setup_id = staff_setup.id
                              WHERE staff_setup.id = shifts_projections_staff.staff_setup_id
                              GROUP BY staff_setup.id
                              )
                            )
                      )
                      FROM shifts_projections_staff
                      WHERE shifts_projections_staff.shift_id = shifts.id AND shifts_projections_staff.is_archived = false and shifts.is_archived = false
                  ),
                  'shifts_devices', (
                    SELECT JSON_AGG( JSON_BUILD_OBJECT(
                        'name',device.name,
                        'tenant_id', device.tenant_id,
                        'id', device.id
                    )) FROM device,shifts_devices,shifts WHERE shifts_devices.shift_id = shifts.id AND shifts_devices.device_id = device.id
                    AND shifts.shiftable_id = ${id} AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                ),
                'shifts_vehicles', (
                  SELECT JSON_AGG( JSON_BUILD_OBJECT(
                      'name',vehicle.name,
                      'tenant_id', vehicle.tenant_id,
                      'id', vehicle.id
                  )) FROM vehicle,shifts_vehicles,shifts WHERE shifts_vehicles.shift_id = shifts.id AND shifts_vehicles.vehicle_id = vehicle.id
                  AND shifts.shiftable_id = ${id} AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              )
                )) FROM shifts WHERE shifts.shiftable_id = ${id} AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.is_archived = false
            )`,
          'shifts'
        )
        .addSelect(
          `(SELECT COUNT( JSON_BUILD_OBJECT(
               'id', shifts_slots.id)) FROM
            shifts_slots,shifts WHERE shifts_slots.shift_id = shifts.id
            AND shifts.shiftable_id = ${id}
            AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}')`,
          'slots'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
               'current_drive_id', linked_drives.current_drive_id,
               'prospective_drive_id', linked_drives.prospective_drive_id,
               'tenant_id', drives.tenant_id
               ) FROM
               linked_drives WHERE linked_drives.current_drive_id = drives.id
               OR linked_drives.prospective_drive_id = drives.id LIMIT 1
            )`,
          'linked_drive'
        )
        .leftJoin('drives.account', 'account')
        .leftJoin('drives.location', 'crm_locations')
        .leftJoin(
          'drives_certifications',
          'drives_certifications',
          'drives_certifications.drive_id = drives.id AND drives_certifications.is_archived = FALSE'
        )
        .leftJoin(
          'drives_equipments',
          'drives_equipments',
          'drives_equipments.drive_id = drives.id '
        )
        .where(`drives.is_archived = false AND drives.id = ${id} `)
        .getQuery();

      const drive = await this.drivesRepository.query(query);
      // console.log('DRIVE --->', drive);
      const customFieldsData: any = await this.customFieldsDataRepo.find({
        where: {
          custom_field_datable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          custom_field_datable_id: id,
        },
        relations: ['field_id', 'field_id.pick_list'],
      });

      // const modifiedData = await this.getDrivesModifiedData({
      //   ...drive?.[0]?.drive,
      //   created_by: drive?.[0]?.drive?.created_by,
      // });

      if (drive?.length) {
        const modifiedData: any = await getModifiedDataDetails(
          this.drivesHistoryRepository,
          id,
          this.usersRespository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        drive[0].drive.modified_by = drive[0].drive.created_by;
        drive[0].drive.modified_at = drive[0].drive.created_at;
        drive[0].drive.created_at = modified_at
          ? modified_at
          : drive[0].drive.created_at;
        drive[0].drive.created_by = modified_by
          ? modified_by
          : drive[0].drive.created_by;
      }

      const updatedDrive = drive.map((item: any) => ({
        ...item,
        tenant_id: item?.drive?.tenant_id,
      }));

      const userBusinessUnits = await userBusinessUnitHierarchy(
        this.request.user.id,
        this.userBusinessUnitsRepository,
        this.businessUnitsRepo,
        this.request.user?.role?.is_auto_created,
        this.request.user?.tenant?.id
      );

      const userBusinessUnitsIds = userBusinessUnits?.map((units) => units.id);

      const updatedRecord = updatedDrive?.map((drive) => {
        const co_id = drive?.account
          ? drive?.account?.collection_operation
            ? drive?.account?.collection_operation?.id?.toString()
            : null
          : null;
        return {
          ...drive,
          writeable: userBusinessUnitsIds?.includes(co_id),
        };
      });

      return {
        status: HttpStatus.OK,
        message: 'Drive Fetched Successfully',
        data: updatedRecord,
        customFieldsData,
        // modifiedData,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getShiftInfo(id: any) {
    try {
      const queryCount = await this.drivesRepository
        .createQueryBuilder('drives')
        .select(
          `(JSON_BUILD_OBJECT(
                        
                        'id',drives.id,
                        'tenant_id', drives.tenant_id
                    )
                    )`,
          'drives'
        )

        .addSelect(
          `(
                      SELECT JSON_AGG(JSON_BUILD_OBJECT(
                          'start_time', shifts.start_time,
                          'end_time', shifts.end_time,
                          'oef_products', shifts.oef_products,
                          'oef_procedures', shifts.oef_procedures,
                          'reduce_slots', shifts.reduce_slots,
                          'reduction_percentage', shifts.reduction_percentage,
                          'break_start_time', shifts.break_start_time,
                          'break_end_time', shifts.break_end_time,
                          'tenant_id', shifts.tenant_id,
                          'vehicle', (
                              SELECT JSON_AGG(JSON_BUILD_OBJECT(
                                  'id', vehicle.id,
                                  'name', vehicle.name,
                                  'tenant_id', vehicle.tenant_id
                              ))
                              FROM shifts_vehicles
                              JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
                              WHERE shifts_vehicles.shift_id = shifts.id
                          ),
                          'device', (
                              SELECT JSON_AGG(JSON_BUILD_OBJECT(
                                  'id', device.id,
                                  'name', device.name,
                                  'tenant_id', device.tenant_id
                              ))
                              FROM shifts_devices
                              JOIN device ON shifts_devices.device_id = device.id
                              WHERE shifts_devices.shift_id = shifts.id
                          ),
                          'staff_setup', (
                              SELECT JSON_AGG(JSON_BUILD_OBJECT(
                                  'id', staff_setup.id,
                                  'name', staff_setup.name,
                                  'tenant_id', staff_setup.tenant_id
                              ))
                              FROM shifts_projections_staff
                              JOIN staff_setup ON shifts_projections_staff.staff_setup_id = staff_setup.id
                              WHERE shifts_projections_staff.shift_id = shifts.id
                          ),
                          'products', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                            'id', products.id,
                              'name', products.name, 
                              'product_qty',shifts_projections_staff.product_yield,
                              'tenant_id', products.tenant_id
                          ) ) FROM products
                                  JOIN procedure_types_products ON products.id = procedure_types_products.product_id
                                  JOIN shifts_projections_staff ON procedure_types_products.procedure_type_id = shifts_projections_staff.procedure_type_id
                                  JOIN shifts ON shifts_projections_staff.shift_id = shifts.id
                                  WHERE shifts.shiftable_id = ${id} AND
                                  shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND
                                  shifts.is_archived= false
                        ),
                        'procedure_types', (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                          'id', procedure_types.id,
                            'name', procedure_types.name, 
                            'procedure_type_qty',shifts_projections_staff.procedure_type_qty,
                            'tenant_id', procedure_types.tenant_id
                        ) ) FROM procedure_types
                                JOIN shifts_projections_staff ON procedure_types.id = shifts_projections_staff.procedure_type_id
                                JOIN shifts ON shifts_projections_staff.shift_id = shifts.id
                                WHERE shifts.shiftable_id = ${id} AND
                                shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND
                                shifts.is_archived= false
                      ),
                          'shifts_projections_staff', (SELECT JSON_AGG( JSON_BUILD_OBJECT(
                            'procedure_type_qty',  shifts_projections_staff.procedure_type_qty,
                            'product_qty', shifts_projections_staff.product_yield
        
                            )
                        )
                        FROM shifts_projections_staff, shifts
                          WHERE shifts.id = shifts_projections_staff.shift_id 
                          AND shifts.shiftable_id = ${id} AND
                          shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.is_archived= false AND shifts_projections_staff.is_archived = false
        
                          )
                      ))
                      FROM shifts
                      WHERE shifts.shiftable_id = drives.id
                      AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                      AND shifts.is_archived= false
                  )`,
          'shifts'
        )
        .where(`drives.is_archived = false AND drives.id = ${id}`)
        .getQuery();

      const SampleCount = await this.drivesRepository.query(queryCount);
      SampleCount['0'].tenant_id = SampleCount['0'].drives.tenant_id;
      SampleCount.tenant_id = SampleCount['0'].drives.tenant_id;

      return resSuccess(
        'Shift details fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...SampleCount }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async saveMarketingInfo(
    queryRunner: QueryRunner,
    marketing: DriveMarketingInputDto,
    drive: Drives,
    created_by: User
  ) {
    for (const marketingMaterialItem of marketing.marketing_materials) {
      const marketingMaterial = new DrivesMarketingMaterialItems();
      marketingMaterial.marketing_material_item_id =
        marketingMaterialItem.marketing_material_item_id;
      marketingMaterial.drive = drive;
      marketingMaterial.created_by = created_by;
      marketingMaterial.quantity = marketingMaterialItem.quantity;
      await queryRunner.manager.save(marketingMaterial);
    }

    for (const promotionalItemObj of marketing.promotional_items) {
      const promotionalItem = new DrivesPromotionalItems();
      promotionalItem.promotional_item_id =
        promotionalItemObj.promotional_item_id;
      promotionalItem.drive = drive;
      promotionalItem.created_by = created_by;
      promotionalItem.quantity = promotionalItemObj.quantity;
      await queryRunner.manager.save(promotionalItem);
    }
  }
  async updateMarketingInfo(
    queryRunner: QueryRunner,
    marketing: DriveMarketingInputDto,
    getdrive: Drives,
    created_by: User
  ) {
    await this.drivesMarketingMaterialItemsRepo.delete({
      drive_id: getdrive.id,
    });
    for (const marketingMaterialItem of marketing.marketing_materials) {
      const marketingMaterial = new DrivesMarketingMaterialItems();
      marketingMaterial.marketing_material_item_id =
        marketingMaterialItem.marketing_material_item_id;
      marketingMaterial.drive_id = getdrive.id;
      marketingMaterial.created_by = created_by;
      marketingMaterial.created_at = new Date();
      marketingMaterial.quantity = marketingMaterialItem.quantity;
      await queryRunner.manager.save(marketingMaterial);
    }

    await this.drivesPromotionalItemsRepo.delete({
      drive_id: getdrive.id,
    });
    for (const promotionalItemObj of marketing.promotional_items) {
      const promotionalItem = new DrivesPromotionalItems();
      promotionalItem.promotional_item_id =
        promotionalItemObj.promotional_item_id;
      promotionalItem.drive_id = getdrive.id;
      promotionalItem.created_by = created_by;
      promotionalItem.created_at = new Date();
      promotionalItem.quantity = promotionalItemObj.quantity;
      await queryRunner.manager.save(promotionalItem);
    }
  }

  async saveDonorCommunicationData(
    queryRunner: QueryRunner,
    donor_communication: SupplementalRecruitmentDto,
    zip_codes: Array<string>,
    drive: Drives,
    created_by: User
  ) {
    for (const item of zip_codes) {
      const zipCode = new DrivesZipCodes();
      zipCode.zip_code = item;
      zipCode.drive = drive;
      zipCode.created_by = created_by;
      await queryRunner.manager.save(zipCode);
    }

    for (const item of donor_communication.account_ids) {
      const driveSupplementalAccount =
        new DrivesDonorCommunicationSupplementalAccounts();
      driveSupplementalAccount.account_id = item;
      driveSupplementalAccount.drive = drive;
      driveSupplementalAccount.created_by = created_by;
      await queryRunner.manager.save(driveSupplementalAccount);
    }
  }

  async UpdateDonorCommunicationData(
    queryRunner: QueryRunner,
    donor_communication: SupplementalRecruitmentDto,
    zip_codes: Array<string>,
    getdrive: Drives,
    created_by: User
  ) {
    await this.drivesZipCodesRepo.delete({
      drive_id: getdrive.id,
    });
    for (const item of zip_codes) {
      const zipCode = new DrivesZipCodes();
      zipCode.zip_code = item;
      zipCode.drive_id = getdrive.id;
      zipCode.created_by = created_by;
      zipCode.created_at = new Date();
      await queryRunner.manager.save(zipCode);
    }
    await this.drivesDonorCommunicationSupplementalAccountsRepo.delete({
      drive_id: getdrive.id,
    });
    for (const item of donor_communication.account_ids) {
      const driveSupplementalAccount =
        new DrivesDonorCommunicationSupplementalAccounts();
      driveSupplementalAccount.account_id = item;
      driveSupplementalAccount.drive_id = getdrive.id;
      driveSupplementalAccount.created_by = created_by;
      driveSupplementalAccount.created_at = new Date();
      await queryRunner.manager.save(driveSupplementalAccount);
    }
  }

  async getVehicles(
    CollectionOperations: bigint,
    location_type: string,
    Tenant_id: User
  ) {
    if (CollectionOperations && location_type) {
      let siteType = null;

      if (location_type === 'inside') {
        siteType = 1;
      }
      if (location_type === 'outside') {
        siteType = 2;
      } else {
        siteType = 3;
      }

      const getVehicles: any = await this.VehicleRepo.find({
        where: {
          collection_operation_id: CollectionOperations,
          vehicle_type_id: {
            location_type_id: siteType,
          },
          tenant: Tenant_id,
        },
      });

      // console.log({ getVehicles });
    } else {
      console.log(
        'CollectionOperations and location is required to get vehicles'
      );
    }
  }

  async getChangeAudit(
    { id }: { id: any },
    listChangeAuditDto: ListChangeAuditDto
  ) {
    try {
      const { page, sortBy, sortOrder, limit } = listChangeAuditDto;
      const driveData = await this.drivesRepository.find({
        where: {
          id,
        },
      });

      if (!driveData) {
        resError(`Drive not found`, ErrorConstants.Error, HttpStatus.GONE);
      }
      const [data, count] = await this.changeAuditsRepo.findAndCount({
        where: {
          auditable_id: id,
          auditable_type: OperationTypeEnum.DRIVES as any,
          tenant_id: this.request?.user?.tenant?.id,
          changes_field: Not(IsNull()),
          is_archived: false,
        },
        select: [
          'changes_from',
          'changes_field',
          'changes_to',
          'created_by',
          'changed_when',
          'created_at',
          'tenant_id',
        ],
        take: limit,
        skip: (page - 1) * limit,
        order:
          sortBy && sortOrder
            ? { [sortBy]: sortOrder.toUpperCase(), created_at: 'DESC' }
            : { created_at: 'DESC' },
      });

      return {
        status: HttpStatus.OK,
        message: 'Change Audit Fetched Successfully',
        count,
        data,
      };
    } catch (error) {
      // console.log(
      //   '<<<<<<<<<<<<<<<<<<<<<<< Drive change audit >>>>>>>>>>>>>>>>>>>>>>>>>'
      // );
      console.log({ error });
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async LinkDriveVehicle(Tenant_id: User, id, shift_id) {
    try {
      const findShift = await this.shiftsVehiclesRepo.findOne({
        where: { vehicle: { id: id }, shift: { id: shift_id } },
        relations: ['shift'],
      });
      if (!findShift) {
        return resError(
          'no shift found against this id',
          ErrorConstants.Error,
          400
        );
      }

      const findStaffProjection = await this.shiftsProjectionsStaffRepo.find({
        where: {
          shift_id: shift_id,
        },
      });
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async GetAllDrivesWithVehicles(Tenant_id: User, linkDate: getLinkedDriveDto) {
    try {
      const queryLinkDrive = this.drivesRepository
        .createQueryBuilder('drives')
        .select(
          `DISTINCT ON (drives.id)
      JSON_BUILD_OBJECT(
        'date', drives.date,
        'id', drives.id,
        'tenant_id', drives.tenant_id,
        'account', (
          SELECT JSON_BUILD_OBJECT(
            'name', accounts.name,
            'tenant_id', drives.tenant_id
          )
          FROM accounts
          WHERE drives.account_id = accounts.id
        ),
        'location', (
          SELECT JSON_BUILD_OBJECT(
            'name', crm_locations.name,
            'tenant_id', drives.tenant_id
          )
          FROM crm_locations
          WHERE drives.location_id = crm_locations.id
        ),
        'shifts',(
          SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'id',shifts.id,
            'start_time',shifts.start_time,
            'end_time',shifts.end_time,
            'oef_products',shifts.oef_products,
            'oef_procedures',shifts.oef_procedures,
            'tenant_id', drives.tenant_id,
            'shiftable_id',shifts.shiftable_id
          )) FROM shifts WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
          HAVING COUNT(*) = 1
        ),
        'staff_config', (
          SELECT JSON_AGG(JSON_BUILD_OBJECT('qty', staff_config.qty,'tenant_id', drives.tenant_id))
          FROM staff_config
          INNER JOIN public.staff_setup ON staff_config.staff_setup_id = staff_setup.id
          INNER JOIN public.shifts_staff_setups ON shifts_staff_setups.staff_setup_id = staff_setup.id
          JOIN public.shifts ON shifts.id = shifts_staff_setups.shift_id
          WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
        ),
        'vehicles', (
          SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'name', vehicle.name,
            'tenant_id', drives.tenant_id
          )) 
          FROM vehicle, shifts_vehicles, shifts, vehicle_type
          WHERE shifts_vehicles.vehicle_id = vehicle.id  
          AND shifts_vehicles.shift_id = shifts.id 
          AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
          AND shifts.shiftable_id = drives.id
          AND vehicle.vehicle_type_id = vehicle_type.id
          AND vehicle_type.linkable= true
          HAVING COUNT(vehicle.id) = 1
        )
      )
    `,
          'drives'
        );
      // .addSelect(
      //   `(SELECT JSON_AGG(JSON_BUILD_OBJECT('qty', staff_config.qty))
      //     FROM staff_config
      //     INNER JOIN public.staff_setup ON staff_config.staff_setup_id = staff_setup.id
      //     INNER JOIN public.shifts_staff_setups ON shifts_staff_setups.staff_setup_id = staff_setup.id
      //     JOIN public.shifts ON shifts.id = shifts_staff_setups.shift_id
      //     WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
      //   )`,
      //   'staff_config'
      // )

      // .addSelect(
      //   `(
      //         SELECT JSON_AGG( JSON_BUILD_OBJECT(
      //             'start_time',shifts.start_time,
      //             'end_time',shifts.end_time,
      //             'oef_products',shifts.oef_products,
      //             'oef_procedures',shifts.oef_procedures,
      //             'shiftable_id',shifts.shiftable_id
      //         )) FROM shifts WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
      //     )`,
      //   'shifts'
      // )
      // .addSelect(
      //   `(SELECT JSON_AGG(JSON_BUILD_OBJECT('qty', staff_config.qty))
      //     FROM staff_config
      //     INNER JOIN public.staff_setup ON staff_config.staff_setup_id = staff_setup.id
      //     INNER JOIN public.shifts_staff_setups ON shifts_staff_setups.staff_setup_id = staff_setup.id
      //     JOIN public.shifts ON shifts.id = shifts_staff_setups.shift_id
      //     WHERE shifts.shiftable_id = drives.id AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
      //   )`,
      //   'staff_config'
      // )

      // .leftJoin('vehicle', 'shift_vehicles')
      if (!linkDate.id) {
        queryLinkDrive.where(
          `drives.tenant_id = ${Tenant_id} AND drives.is_archived = false AND drives.is_blueprint = false AND drives.is_linked = false AND drives.is_linkable = true AND drives.date = '${linkDate?.date}'`
        );
      } else {
        queryLinkDrive.where(
          `drives.tenant_id = ${Tenant_id} AND drives.is_archived = false AND drives.is_blueprint = false AND drives.is_linked = false AND drives.is_linkable = true AND drives.date = '${linkDate?.date}' AND drives.id != ${linkDate?.id}`
        );
      }

      // .orderBy(sortName, sortOrder)
      queryLinkDrive.getQuery();

      const data = await this.drivesRepository.query(queryLinkDrive.getSql());

      const result = data?.map((item) => {
        return {
          ...item,
          tenant_id: this.request.user?.tenant?.id,
        };
      });

      return resSuccess(
        'Vehicles Found.',
        'success',
        HttpStatus.CREATED,
        result
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async LinkfromOutside(Tenant_id: User, req, body) {
    // console.log({ Tenant_id, body });
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const findDriveA = await this.drivesRepository.findOne({
        where: {
          id: body.driveA,
        },
      });
      let UpadteDriveA = new Drives();
      UpadteDriveA = findDriveA;
      UpadteDriveA.is_linked = true;
      await queryRunner.manager.save(UpadteDriveA);

      const findShift = await this.shiftsRepo.findOne({
        where: {
          shiftable_id: body.driveA,
          is_archived: false,
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
        },
      });
      body = { ...body, shift_id: findShift.id };
      const array = [];
      array.push(body);

      const findDriveB = await this.drivesRepository.findOne({
        where: {
          id: body.driveB,
        },
      });
      let UpadteDriveB = new Drives();
      UpadteDriveB = findDriveB;
      UpadteDriveB.is_linked = true;
      await queryRunner.manager.save(UpadteDriveB);

      const saveLinked = new LinkedDrives();
      saveLinked.current_drive_id = body.driveA;
      saveLinked.prospective_drive_id = body.driveB;
      saveLinked.is_archived = false;
      saveLinked.created_by = req.user.id;
      await queryRunner.manager.save(saveLinked);

      const updateDrive = { date: findDriveA.date };
      await this.shiftsService.editShift(
        queryRunner,
        array,
        body.slots,
        body.driveA,
        PolymorphicType.OC_OPERATIONS_DRIVES,
        HistoryReason.C,
        req.user,
        Tenant_id,
        updateDrive,
        updateDrive?.date
      );
      await queryRunner.commitTransaction();
      return resSuccess('Linking Successfull.', 'success', HttpStatus.CREATED, {
        ...saveLinked,
        tenant_id: req?.user?.tenant?.id,
      });
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getShiftDetails(id) {
    return this.shiftsService.GetLinkDataOnShift(+id);
  }

  async getAccountBlueprints(id: bigint) {
    try {
      const data = await this.drivesRepository.find({
        where: {
          account_id: id,
          is_blueprint: true,
          is_archived: false,
          tenant_id: this.request.user.tenant.id,
        },
        relations: ['account', 'location'],
      });
      return {
        status: HttpStatus.OK,
        message: 'Account Blueprints Drive Fetched Successfully',
        data,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAccountDrives(id: bigint) {
    try {
      const data = await this.drivesRepository.find({
        where: {
          account_id: id,
          is_blueprint: false,
          is_archived: false,
          tenant_id: this.request.user.tenant.id,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Account Blueprints Drive Fetched Successfully',
        data,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSingleDrive(id: bigint) {
    try {
      // console.log({ id });
      const query = this.drivesRepository
        .createQueryBuilder('drives')
        .select(
          `(  SELECT JSON_BUILD_OBJECT(
                'id', drives.id,
                'created_at', drives.created_at,
                'is_archived', drives.is_archived,
                'name', drives.name,
                'account', drives.account_id,
                'location_id', drives.location_id,
                'date', drives.date,
                'is_multi_day_drive', drives.is_multi_day_drive,
                'tenant_id', drives.tenant_id,
                'promotion_id', drives.promotion_id,
                'operation_status_id', drives.operation_status_id,
                'recruiter_id', drives.recruiter_id,
                'open_to_public', drives.open_to_public,
                'marketing_start_date', drives.marketing_start_date,
                'marketing_end_date', drives.marketing_end_date,
                'marketing_start_time', drives.marketing_start_time,
                'marketing_end_time', drives.marketing_end_time,
                'instructional_information', drives.instructional_information,
                'online_scheduling_allowed', drives.online_scheduling_allowed,
                'donor_information', drives.donor_information,
                'order_due_date', drives.order_due_date,
                'tele_recruitment', drives.tele_recruitment,
                'tele_recruitment_status', drives.tele_recruitment_status,
                'email', drives.email,
                'email_status', drives.email_status,
                'is_blueprint',drives.is_blueprint,
                'sms', drives.sms,
                'sms_status', drives.sms_status,
                'recruiter', (SELECT JSON_BUILD_OBJECT(
                  'id',"user"."id",
                  'first_name',"user"."first_name",
                  'tenant_id', drives.tenant_id,
                  'last_name',"user"."last_name"
                ) From "user" WHERE "user"."id" = "drives"."recruiter_id" ),
                'promotion', ( SELECT JSON_BUILD_OBJECT(
                   'id',promotion_entity.id,
                   'tenant_id', drives.tenant_id,
                   'name',promotion_entity.name)
                    from promotion_entity , drives WHERE drives.promotion_id = promotion_entity.id AND drives.id = ${id}
                   ),
                   'status',(SELECT JSON_BUILD_OBJECT(
                   'id',operations_status.id,
                   'tenant_id', drives.tenant_id,
                   'name',operations_status.name)
                    from operations_status , drives WHERE operations_status.id = drives.operation_status_id AND drives.id = ${id}
                   )
                )
              FROM drives WHERE drives.id = ${id}
            )`,
          'drive'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
            'id', account.id,
            'name', account.name,
            'alternate_name', account.alternate_name,
            'phone', account.phone,
            'website', account.website,
            'facebook', account.facebook,
            'industry_category', (SELECT JSON_BUILD_OBJECT(
              'id',industry_categories.id,
              'tenant_id', drives.tenant_id,
              'name',industry_categories.name
            ) From industry_categories WHERE industry_categories.id = accounts.industry_category ),
            'industry_subcategory', (SELECT JSON_BUILD_OBJECT(
              'id',industry_categories.id,
              'tenant_id', drives.tenant_id,
              'name',industry_categories.name
            ) From industry_categories WHERE industry_categories.id = accounts.industry_subcategory ),
            'stage', (SELECT JSON_BUILD_OBJECT(
              'id',stages.id,
              'tenant_id', drives.tenant_id,
              'name',stages.name
            ) From stages WHERE stages.id = accounts.stage ),
            'source', (SELECT JSON_BUILD_OBJECT(
              'id',sources.id,
              'tenant_id', drives.tenant_id,
              'name',sources.name
            ) From sources WHERE sources.id = accounts.source ),
            'collection_operation',  (SELECT JSON_BUILD_OBJECT(
              'id',business_units.id,
              'tenant_id', drives.tenant_id,
              'name',business_units.name
            ) From business_units WHERE business_units.id = accounts.collection_operation ),
            'territory', (SELECT JSON_BUILD_OBJECT(
              'id',territory.id,
              'tenant_id', drives.tenant_id,
              'territory_name',territory.territory_name
            ) From territory WHERE territory.id = accounts.territory ),
            'recruiter', (SELECT JSON_BUILD_OBJECT(
              'id',"user"."id",
              'tenant_id', drives.tenant_id,
              'first_name',"user"."first_name",
              'last_name',"user"."last_name"
            ) From "user" WHERE "user"."id" = "accounts"."recruiter" ),
            'population', account.population,
            'is_active', account.is_active,
            'RSMO', account."rsmo",
            'tenant_id', account."tenant_id"
          ) FROM accounts WHERE accounts.id = drives.account_id)`,
          'account'
        )
        .addSelect(
          `(
            SELECT JSON_BUILD_OBJECT(
                'id', crm_locations.id,
                'created_at', crm_locations.created_at,
                'is_archived', crm_locations.is_archived,
                'name', crm_locations.name,
                'cross_street', crm_locations.cross_street,
                'floor', crm_locations.floor,
                'room', crm_locations.room,
                'room_phone', crm_locations.room_phone,
                'becs_code', crm_locations.becs_code,
                'site_type', crm_locations.site_type,
                'tenant_id', crm_locations.tenant_id,
                'qualification_status', crm_locations.qualification_status,
                'is_active', crm_locations.is_active
            )
            FROM crm_locations
            WHERE crm_locations.id = drives.location_id
        )`,
          'crm_locations'
        )
        .addSelect(
          `(SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', drives_certifications.drive_id,
              'tenant_id', drives.tenant_id,
              'certificate_id', (SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', "certification"."id",
                    'name',"certification"."name",
                    'tenant_id', drives.tenant_id
                  ))
               FROM "certification" WHERE "drives_certifications"."certification_id" = "certification"."id"
              )
            )
          )
          FROM drives_certifications
          WHERE drives_certifications.drive_id = drives.id
        )`,
          'drives_certifications'
        )
        .addSelect(
          `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', drives_donor_comms_supp_accounts.account_id,
                'tenant_id', drives.tenant_id
            )
          )
          FROM drives_donor_comms_supp_accounts
          WHERE drives_donor_comms_supp_accounts.drive_id = drives.id
          )`,
          'drives_supp_accounts'
        )
        .addSelect(
          `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'zip_code', drives_zipcodes.zip_code,
                'tenant_id', drives.tenant_id
            )
          )
          FROM drives_zipcodes
          WHERE drives_zipcodes.drive_id = drives.id
          )`,
          'zip_codes'
        )
        .addSelect(
          `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', drives_equipments.equipment_id,
                'quantity',drives_equipments.quantity,
                'tenant_id', drives.tenant_id,
                'equipment_id', (SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'name', "equipments"."name",
                    'tenant_id', drives.tenant_id
                  )
                )
                FROM "equipments" WHERE "drives_equipments"."equipment_id" = "equipments"."id"
              )
            )
          )
          FROM drives_equipments
          WHERE drives_equipments.drive_id = drives.id AND drives_equipments.is_archived = false
          GROUP BY drives_equipments.drive_id
          )`,
          'drives_equipments'
        )
        .addSelect(
          `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', drives_marketing_material_items.marketing_material_item_id,
                'quantity',drives_marketing_material_items.quantity,
                'tenant_id', drives.tenant_id,
                'marketing_materials', (SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'name', "marketing_materials"."name",
                    'tenant_id', drives.tenant_id
                  )
                )
                FROM "marketing_materials" WHERE "drives_marketing_material_items"."marketing_material_item_id" = "marketing_materials"."id"
              )
            )
          )
          FROM drives_marketing_material_items
          WHERE drives_marketing_material_items.drive_id = drives.id
          )`,
          'drives_marketing_materials'
        )
        .addSelect(
          `(SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', drives_promotional_items.promotional_item_id,
                'quantity',drives_promotional_items.quantity,
                'tenant_id', drives.tenant_id,
                'promotional_items', (SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'name', "promotional_items"."name",
                    'tenant_id', drives.tenant_id
                  )
                )
                FROM "promotional_items" WHERE "drives_promotional_items"."promotional_item_id" = "promotional_items"."id"
              )
            )
          )
          FROM drives_promotional_items
          WHERE drives_promotional_items.drive_id = drives.id
          )`,
          'drives_promotional_items'
        )
        .addSelect(
          `(
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', drives_contacts.id,
                'accounts_contacts_id', drives_contacts.accounts_contacts_id,
                'drive_id', drives_contacts.drive_id,
                'tenant_id', drives.tenant_id,
                'role_id', drives_contacts.role_id,
                'role', (
                  SELECT JSON_BUILD_OBJECT(
                    'id', contacts_roles.id,
                    'tenant_id', drives.tenant_id,
                    'name', contacts_roles.name,
                    'is_primary_chairperson',contacts_roles.is_primary_chairperson
                  )
                  FROM contacts_roles
                  WHERE contacts_roles.id = drives_contacts.role_id
                ),
                'record_id', (
                  SELECT JSON_BUILD_OBJECT(
                    'id', record_id.id,
                    'prefix_id', record_id.prefix_id,
                    'suffix_id', record_id.suffix_id,
                    'title', record_id.title,
                    'employee', record_id.employee,
                    'nick_name', record_id.nick_name,
                    'first_name', record_id.first_name,
                    'tenant_id', drives.tenant_id,
                    'last_name', record_id.last_name,
                    'birth_date', record_id.birth_date,
                    'is_active', record_id.is_active
                  )
                  FROM crm_volunteer AS record_id
                  WHERE record_id.id = drives_contacts.accounts_contacts_id
                ),
                'account_contacts', (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'contactable_id', account_contacts.id,
                      'tenant_id', drives.tenant_id,
                      'contactable_type', account_contacts.contactable_type,
                      'contactable_data', (
                        SELECT JSON_AGG(
                          JSON_BUILD_OBJECT(
                            'data', contact.data,
                            'tenant_id', drives.tenant_id,
                            'is_primary', contact.is_primary,
                            'contact_type', contact.contact_type
                          )
                        )
                        FROM contacts contact
                        WHERE contact.contactable_id = account_contacts.id
                        AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                        AND (
                          (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                          OR
                          (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                        )
                      )
                    )
                  )
                  FROM account_contacts AS account_contacts
                  WHERE account_contacts.id = drives_contacts.accounts_contacts_id AND drives_contacts.is_archived = false 
                )
              )
            )
            FROM drives_contacts
            WHERE drives_contacts.drive_id = drives.id AND drives_contacts.is_archived = false
          )
        `,
          'drive_contacts'
        )
        .addSelect(
          `(
                SELECT JSON_AGG( JSON_BUILD_OBJECT(
                    'id',shifts.id,
                    'start_time',shifts.start_time,
                    'end_time',shifts.end_time,
                    'oef_products',shifts.oef_products,
                    'oef_procedures',shifts.oef_procedures,
                    'break_start_time', shifts.break_start_time,
                    'break_end_time', shifts.break_end_time,
                    'reduce_slots', shifts.reduce_slots,
                    'tenant_id', shifts.tenant_id,
                    'reduction_percentage', shifts.reduction_percentage,
                  'shifts_devices', (
                    SELECT JSON_AGG(JSON_BUILD_OBJECT(
                        'name', device.name,
                        'id', device.id,
                        'tenant_id', shifts.tenant_id
                    ))
                    FROM shifts_devices
                    JOIN device ON shifts_devices.device_id = device.id
                    WHERE shifts_devices.shift_id = shifts.id
                      AND shifts.shiftable_id = ${id}
                      AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                ),
                'shifts_vehicles', (
                  SELECT JSON_AGG(JSON_BUILD_OBJECT(
                      'name', vehicle.name,
                      'id', vehicle.id,
                      'tenant_id', shifts.tenant_id
                  ))
                  FROM shifts_vehicles
                  JOIN vehicle ON shifts_vehicles.vehicle_id = vehicle.id
                  WHERE shifts_vehicles.shift_id = shifts.id
                    AND shifts.shiftable_id = ${id}
                    AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              )
                )) FROM shifts WHERE shifts.shiftable_id = ${id} AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.is_archived = false
            )`,
          'shifts'
        )
        .addSelect(`drives.tenant_id`, 'tenant_id')
        .leftJoin('drives.account', 'account')
        .leftJoin('drives.location', 'location')
        .where(`drives.id = ${id}`)
        .getQuery();

      const projectionsQuery = `
      SELECT sps.procedure_type_qty as procedure_type_qty, sps.product_yield as product_yield,
      sps.shift_id as shift_id,
      (
        SELECT JSON_BUILD_OBJECT(
          'id', pt.id,
          'name', pt.name,
          'short_description', pt.short_description,
          'procedure_duration', pt.procedure_duration,
          'procedure_type_products', (
            SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                    'product_id', ptp.product_id,
                    'quantity', ptp.quantity,
                    'name', p.name
                )
            )
            FROM procedure_types_products ptp
            JOIN products p ON p.id = ptp.product_id
            WHERE ptp.procedure_type_id = pt.id
          )
        )
        FROM procedure_types pt
        WHERE pt.id = sps.procedure_type_id
      )AS procedure_type,
      JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', ss.id,
            'name', ss.name,
            'short_name', ss.short_name,
            'beds', ss.beds,
            'concurrent_beds', ss.concurrent_beds,
            'stagger_slots', ss.stagger_slots,
            'shift_id',  sps.shift_id,
            'qty', COALESCE(sub.qty, 0)
        )
      ) AS staff_setups
      FROM shifts , shifts_projections_staff sps
      JOIN staff_setup ss ON sps.staff_setup_id = ss.id AND sps.procedure_type_id = ss.procedure_type_id
      LEFT JOIN (
        SELECT
          staff_setup_id,
          COALESCE(SUM(DISTINCT ((cr.oef_contribution * sc.qty) / 100)), 0) AS qty
        FROM staff_config sc
        LEFT JOIN contacts_roles cr ON sc.contact_role_id = cr.id
        GROUP BY staff_setup_id
      ) sub ON sub.staff_setup_id = ss.id
      WHERE sps.shift_id = shifts.id and shifts.shiftable_id=${id} AND shifts.shiftable_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}' AND shifts.is_archived = false
      AND sps.is_archived = false
      GROUP BY sps.shift_id, sps.procedure_type_id,sps.procedure_type_qty,sps.product_yield
`;
      const data = await this.entityManager.query(query);

      const projections = await this.entityManager.query(projectionsQuery);

      const customFieldsData: any = await this.customFieldsDataRepo
        .createQueryBuilder('customFieldsData')
        .leftJoinAndSelect('customFieldsData.field_id', 'field_id')
        .leftJoinAndSelect('field_id.pick_list', 'pick_list')
        .where({
          custom_field_datable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          custom_field_datable_id: id,
          is_archived: false,
        })
        .andWhere(`field_id.is_archived = false AND field_id.is_active = true`)
        .getMany();

      return {
        status: HttpStatus.OK,
        message: 'Blueprint Fetched Successfully',
        data,
        customFieldsData,
        projections,
      };
    } catch (error) {
      console.log(error);
      resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addDonorAppointments(createDonorAppointmentDtos: any, user: any) {
    const savedAppointments = [];

    try {
      for (const createDonorAppointmentDto of createDonorAppointmentDtos.donor_appointment) {
        const userData = await this.usersRespository.findOneBy({
          id: createDonorAppointmentDto?.created_by,
        });

        if (!userData) {
          resError(
            `User not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }

        const appointment = new DonorsAppointments();
        appointment.appointmentable_id =
          createDonorAppointmentDto?.appointmentable_id;
        appointment.appointmentable_type =
          createDonorAppointmentDto?.appointmentable_type;
        appointment.slot_id = createDonorAppointmentDto.slot_id;
        appointment.created_by = createDonorAppointmentDto.created_by;
        appointment.tenant_id = user?.tenant?.id;
        appointment.status = createDonorAppointmentDto?.status;
        appointment.donor_id = createDonorAppointmentDto?.donor_id;
        appointment.procedure_type_id =
          createDonorAppointmentDto?.procedure_type_id;

        const savedAppointment =
          await this.entityDonorsAppointmentsRepository.save(appointment);
        savedAppointments.push(savedAppointment);
      }

      return resSuccess(
        'Donor Appointments Created.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedAppointments
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: bigint, user: any) {
    try {
      const drive: any = await this.drivesRepository.findOne({
        where: {
          id,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: [
          'created_by',
          'drive_contacts',
          'drive_contacts.created_by',
          'equipments',
          'equipments.created_by',
          'certifications',
          'certifications.created_by',
          'marketing_items',
          'marketing_items.created_by',
          'drives_donor_comms_supp_accounts',
          'drives_donor_comms_supp_accounts.created_by',
          'zip_codes',
          'zip_codes.created_by',
          'tenant',
        ],
      });
      // const driveHistory = new DrivesHistory();
      // Object.assign(driveHistory, drive);
      // driveHistory.history_reason = 'D';
      // driveHistory.created_by = drive.created_by.id;
      // driveHistory.tenant_id = drive.tenant_id;
      // driveHistory.location_id = drive.location_id;
      // driveHistory.promotion_id = drive.promotion_id;
      // driveHistory.recruiter_id = drive.recruiter_id;
      // driveHistory.operation_status_id = drive.operation_status_id;
      // driveHistory.account_id = drive.account_id;
      // await this.createHistory(driveHistory);
      // await this.shiftsService.createShiftHistory(
      //   id,
      //   shiftable_type_enum.DRIVES,
      //   HistoryReason.D
      // );
      // TODO Custom fields History

      for (const driveCotact of drive.drive_contacts) {
        // const contactHistory = new DrivesContactsHistory();
        // Object.assign(contactHistory, driveCotact);
        // contactHistory.history_reason = 'D';
        // contactHistory.created_by = driveCotact.created_by.id;
        // await this.entityManager.save(contactHistory);
        const driveCotactt: any = driveCotact;
        driveCotactt.is_archived = true;
        driveCotactt.created_at = new Date();
        driveCotactt.created_by = user;
        await this.entityManager.save(driveCotactt);
      }

      for (const equipment of drive.equipments) {
        // const equipmentHistory = new DrivesEquipmentHistory();
        // Object.assign(equipmentHistory, equipment);
        // equipmentHistory.history_reason = 'D';
        // equipmentHistory.created_by = equipment.created_by.id;
        // await this.entityManager.save(equipmentHistory);
        const equipmentt: any = equipment;
        equipmentt.is_archived = true;
        equipmentt.created_at = new Date();
        equipmentt.created_by = user;
        await this.entityManager.save(equipmentt);
      }

      for (const certification of drive.certifications) {
        // const certificationHistory = new DrivesCertificationsHistory();
        // Object.assign(certificationHistory, certification);
        // certificationHistory.history_reason = 'D';
        // certificationHistory.created_by = certification.created_by.id;
        // await this.entityManager.save(certificationHistory);
        const Certification: any = certification;
        Certification.created_at = new Date();
        Certification.created_by = user;
        Certification.is_archived = true;
        await this.entityManager.save(Certification);
      }

      for (const marketing of drive.marketing_items) {
        // const marketingHistory = new DrivesMarketingMaterialItemsHistory();
        // Object.assign(marketingHistory, marketing);
        // marketingHistory.history_reason = 'D';
        // marketingHistory.created_by = marketing.created_by.id;
        // await this.entityManager.save(marketingHistory);
        const Marketing: any = marketing;
        Marketing.is_archived = true;
        Marketing.created_at = new Date();
        Marketing.created_by = user;
        await this.entityManager.save(Marketing);
      }

      for (const item of drive.drives_donor_comms_supp_accounts) {
        // const itemHistory =
        //   new DrivesDonorCommunicationSupplementalAccountsHistory();
        // Object.assign(itemHistory, item);
        // itemHistory.history_reason = 'D';
        // itemHistory.created_by = item.created_by.id;
        // await this.entityManager.save(itemHistory);
        const Item: any = item;
        Item.is_archived = true;
        Item.created_at = new Date();
        Item.created_by = user;
        await this.entityManager.save(Item);
      }

      for (const item of drive.zip_codes) {
        // const itemHistory = new DrivesZipCodesHistory();
        // Object.assign(itemHistory, item);
        // itemHistory.history_reason = 'D';
        // itemHistory.created_by = item.created_by.id;
        // await this.entityManager.save(itemHistory);

        const Item: any = item;
        Item.is_archived = true;
        Item.created_at = new Date();
        Item.created_by = user;
        await this.entityManager.save(Item);
      }

      const customFields = await this.customFieldsDataRepo.find({
        where: {
          custom_field_datable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          custom_field_datable_id: id,
        },
        relations: ['field_id', 'field_id.pick_list', 'created_by', 'tenant'],
      });

      for (const item of customFields) {
        // const itemHistory = new CustomFieldsDataHistory();
        // itemHistory.history_reason = 'D';
        // itemHistory.id = item?.id;
        // itemHistory.custom_field_datable_id = item?.custom_field_datable_id;
        // itemHistory.custom_field_datable_type = item?.custom_field_datable_type;
        // itemHistory.field_id = item?.field_id?.id;
        // itemHistory.tenant_id = item?.tenant?.id;
        // itemHistory.created_by = this.request.user?.id;
        // itemHistory.is_archived = item.is_archived;
        // itemHistory.field_data = item.field_data;
        // await this.entityManager.save(itemHistory);
        const Item: any = item;
        Item.is_archived = true;
        Item.created_at = new Date();
        Item.created_by = user;
        await this.entityManager.save(Item);
      }

      await this.changeAuditsRepo.update(
        {
          auditable_id: id as any,
          auditable_type: OperationTypeEnum.DRIVES as any,
        },
        { is_archived: true }
      );

      drive.is_archived = true;
      drive.created_at = new Date();
      drive.created_by = user;
      const archivedDrive = await this.entityManager.save(drive);

      Object.assign(archivedDrive, {
        tenant_id: archivedDrive.tenant.id,
      });

      delete archivedDrive?.created_by;
      return resSuccess(
        'Drive archived.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT,
        archivedDrive
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async monitorGeneralChanges(
    driveBeforeUpdate,
    editDriveDto,
    account,
    promotion,
    operation_status
  ) {
    const changesOccured = [];

    if (
      new Date(driveBeforeUpdate.date).getDate() !==
      new Date(editDriveDto.date).getDate()
    ) {
      changesOccured.push({
        changes_from: new Date(driveBeforeUpdate.date),
        changes_to: new Date(editDriveDto.date),
        changes_field: `Drive Date`,
      });
    }

    if (BigInt(driveBeforeUpdate?.account.id) !== BigInt(account?.id)) {
      changesOccured.push({
        changes_from: driveBeforeUpdate.account.name,
        changes_to: account?.name,
        changes_field: `Drive Account`,
      });
    }

    if (
      driveBeforeUpdate?.promotion?.id &&
      promotion?.id &&
      BigInt(driveBeforeUpdate?.promotion?.id) !== BigInt(promotion?.id)
    ) {
      changesOccured.push({
        changes_from: driveBeforeUpdate.promotion.name,
        changes_to: promotion?.name,
        changes_field: `Drive Promotion`,
      });
    }
    if (
      BigInt(driveBeforeUpdate?.operation_status.id) !==
      BigInt(operation_status?.id)
    ) {
      changesOccured.push({
        changes_from: driveBeforeUpdate.operation_status.name,
        changes_to: operation_status?.name,
        changes_field: `Drive Status`,
      });
    }
    return changesOccured;
  }
  async saveDriveonBBCS(
    drive: Drives,
    createDriveDto: CreateDriveDto,
    start: Moment,
    end: Moment,
    numberOfSlots
  ) {
    const account: any = await this.accountsRespository.findOne({
      where: {
        id: createDriveDto.account_id,
      },
      relations: ['source'],
    });

    const query = `
    SELECT crm_locations.*, address.*
        FROM crm_locations
        INNER JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
        LEFT JOIN crm_volunteer AS volunteer ON crm_locations.site_contact_id = volunteer.id
        WHERE crm_locations.is_archived = false
        AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
        AND crm_locations.id = ${createDriveDto?.location_id}
    `;

    const location = await this.crmLocationsRespository.query(query);
    const tenantConfig = await getTenantConfig(
      this.tenantConfigRepository,
      this.request?.user?.tenant?.id
    );

    const procedureTypeIds = createDriveDto?.shifts
      ?.flatMap((item) =>
        item?.projections?.map((projItem) => projItem.procedure_type_id)
      )
      .filter(Boolean); // Filter out undefined or falsy values

    const proceduresInDrive = await this.procedureTypeRepo.find({
      where: {
        id: In(procedureTypeIds),
      },
    });

    const leastDurationProcedure = proceduresInDrive.reduce(
      (minDurationProcedure, item) => {
        if (
          !minDurationProcedure ||
          item.procedure_duration < minDurationProcedure.procedure_duration
        ) {
          return item;
        }
        return minDurationProcedure;
      },
      null
    );

    const leastDuration = leastDurationProcedure?.procedure_duration;

    //Start of Option 2 for procedure duration
    // const procedureTypeIds = [];
    // createDriveDto?.shifts?.map((item) => {
    //   item?.projections?.map((projItem) => {
    //     procedureTypeIds.push(projItem.procedure_type_id);
    //   });
    // });

    // const proceduresInDrive = await this.procedureTypeRepo.find({
    //   where: {
    //     id: In(procedureTypeIds),
    //   },
    // });

    // let leastDuration = proceduresInDrive?.[0]?.procedure_duration;

    // proceduresInDrive?.map((item) => {
    //   item.procedure_duration < leastDuration
    //     ? (leastDuration = item.procedure_duration)
    //     : '';
    // });
    // End of Option 2 for procedure duration

    const bbcsDriveData = {
      source: account?.source?.id,
      isNewDrive: true,
      driveDate: createDriveDto.date,
      start: start.format('HH:mm:ss'),
      end: end.format('HH:mm:ss'),
      last: '13:00:00', // Question for this as last shift might end after shift end time due to allowappointment at shift end time
      donors: 0,
      beds: numberOfSlots,
      donorsPerInterval: leastDuration,
      group: 'ABCD', //account?.name, // Double check if its the correct one
      group2: 0,
      group3: 0,
      group4: 0,
      group5: 0,
      rep: '',
      startLunch: '',
      endLunch: '',
      driveID: drive.id,
      comment1: '', // empty
      comment2: '', // empty
      comment3: '', // empty
      comment4: '', // empty
      comment5: '', // empty
      comment6: '', // empty
      comment7: '', // empty
      comment8: '', // empty
      description: location?.[0]?.address1, //address line one
      addressLineOne: location?.[0]?.address1,
      addressLineTwo: location?.[0]?.address2,
      city: location?.[0]?.city,
      state: 'CA', //location?.[0]?.state, // Not working with location.state
      zipCode: location?.[0]?.zip_code,
      zipCodeExt: '', //optional
    };
    const isBBCSDriveCreated = await this.BBCSConnectorService.setDriveBBCS(
      bbcsDriveData,
      tenantConfig
    );
    // if (!isBBCSDriveCreated) throw new Error('Error Creating Drive on BBCS');
  }

  async createResourceSharing(
    queryRunner: QueryRunner,
    resource_sharing: ResourceSharingDto[]
  ) {
    for (const item of resource_sharing) {
      const sharedResource = new ResourceSharings();
      const fromCollectionOperation = await this.entityExist(
        this.businessUnitsRepo,
        {
          where: {
            id: item.from_collection_operation_id,
          },
        },
        'Collection Operation'
      );
      const toCollectionOperation = await this.entityExist(
        this.businessUnitsRepo,
        {
          where: {
            id: item.to_collection_operation_id,
          },
        },
        'Collection Operation'
      );
      sharedResource.from_collection_operation_id = fromCollectionOperation;
      sharedResource.to_collection_operation_id = toCollectionOperation;
      sharedResource.description = item.description;
      sharedResource.share_type = resource_share_type_enum.STAFF;
      sharedResource.quantity = item.quantity;
      sharedResource.start_date = item.start_date;
      sharedResource.end_date = item.end_date;
      sharedResource.is_active = true;
      sharedResource.created_by = this?.request?.user;
      sharedResource.tenant_id = this?.request?.user?.tenant;
      await queryRunner.manager.save(sharedResource);
    }
  }

  async LocationCordinatesfromShift(id: bigint) {
    try {
      if (!id) {
        console.log('no id');
      }
      const getshift = await this.shiftsRepo.findOne({
        where: {
          id: id,
        },
      });
      const getStaffSetup = await this.shiftsProjectionsStaffRepo.find({
        where: {
          shift_id: getshift.id,
        },
      });
      const array = [];
      for (const staff of getStaffSetup) {
        const finditeration = await this.staffSetupRepo.findOne({
          where: {
            id: staff.staff_setup_id,
          },
          relations: ['staff_configuration'],
        });
        array.push(finditeration);
      }
      let count = 0;
      for (const iteration of array) {
        for (const breakDown of iteration?.staff_configuration) {
          count += breakDown?.breakdown_time ?? 0;
        }
      }
      const getDrive = await this.drivesRepository.findOne({
        where: { id: getshift.shiftable_id },
      });
      const getLocaton = await this.crmLocationsRespository.findOne({
        where: { id: getDrive.location_id },
      });
      const getAddress = await this.addressRepo.findOne({
        where: {
          addressable_id: getLocaton.id,
          addressable_type: PolymorphicType.CRM_LOCATIONS,
        },
      });
      let coors = getAddress.coordinates;
      const data = {
        address: {
          ...getAddress,
          coordinates: { ...(coors as {}), tenant_id: getAddress.tenant_id },
        },
        drive: { ...getDrive, tenant_id: getAddress?.tenant_id },
        shift: getshift,
        breakDowns: count,
        tenant_id: getAddress?.tenant_id,
      };
      return resSuccess(
        'fetched coordinates.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        data
      );
    } catch (err) {
      console.log('err', err);
    }
  }
  async LocationCordinates(id) {
    try {
      if (!id) {
        console.log('no id');
      }
      // const getDrive = await this.drivesRepository.findOne({
      //   where: { id: id },
      // });
      const getLocaton = await this.crmLocationsRespository.findOne({
        where: { id: id },
      });
      const getAddress = await this.addressRepo.findOne({
        where: {
          addressable_id: getLocaton.id,
          addressable_type: PolymorphicType.CRM_LOCATIONS,
        },
      });

      let result = {};

      if (getAddress) {
        const coordinates: any = getAddress.coordinates;
        result = {
          ...getAddress,
          coordinates: {
            ...coordinates,
            tenant_id: this.request.user?.tenant?.id,
          },
        };
      }
      return resSuccess(
        'fetched coordinates.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        result
      );
    } catch (err) {
      console.log('err', err);
    }
  }

  async getDriveContacts(id: any) {
    try {
      const query = this.drivesRepository
        .createQueryBuilder('drives')
        .select(
          `(  SELECT JSON_BUILD_OBJECT(
              'tenant_id', drive.tenant_id,
              'drive_contacts', (
                SELECT JSON_AGG(
                  JSON_BUILD_OBJECT(
                    'id', drives_contacts.id,
                    'accounts_contacts_id', drives_contacts.accounts_contacts_id,
                    'drive_id', drives_contacts.drive_id,
                    'role_id', drives_contacts.role_id,
                    'role', (
                      SELECT JSON_BUILD_OBJECT(
                        'id', contacts_roles.id,
                        'is_primary_chairperson',contacts_roles.is_primary_chairperson,
                        'name', contacts_roles.name
                      )
                      FROM contacts_roles
                      WHERE contacts_roles.id = drives_contacts.role_id
                      AND 
                        contacts_roles.is_primary_chairperson =  true
                    ),
                    'record_id', (SELECT JSON_AGG(
                               JSON_BUILD_OBJECT(
                                  'id', record_id.id,
                                  'first_name', record_id.first_name,
                                  'last_name', record_id.last_name,
                                  'contactable_data', (
                                      SELECT JSON_AGG(
                                          JSON_BUILD_OBJECT(
                                              'data', contact.data,
                                              'is_primary', contact.is_primary,
                                              'contact_type', contact.contact_type
                                          )
                                      )
                                      FROM contacts contact
                                      WHERE contact.contactable_id = record_id.id
                                          AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                                          AND (
                                              (contact.is_primary = true AND contact.contact_type BETWEEN '${ContactTypeEnum.WORK_PHONE}' AND '${ContactTypeEnum.OTHER_EMAIL}')
                                          )
                                  )
                                  )
                              )
                              FROM crm_volunteer AS record_id, account_contacts, drives_contacts, contacts_roles
                              WHERE record_id.id = account_contacts.record_id AND drives_contacts.accounts_contacts_id = account_contacts.id AND drives_contacts.drive_id =drives.id  AND drives_contacts.role_id = contacts_roles.id AND contacts_roles.is_primary_chairperson = true
                          ),
                    'account_contacts', (
                      SELECT JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'contactable_id', account_contacts.id,
                          'contactable_type', account_contacts.contactable_type,
                          'contactable_data', (
                            SELECT JSON_AGG(
                              JSON_BUILD_OBJECT(
                                'data', contact.data,
                                'is_primary', contact.is_primary,
                                'contact_type', contact.contact_type
                              )
                            )
                            FROM contacts contact
                            WHERE contact.contactable_id = account_contacts.record_id
                            AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}'
                            AND (
                              (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')
                              OR
                              (contact.is_primary = true AND contact.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND contact.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND contact.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')
                            )
                          )
                        )
                      )
                      FROM account_contacts AS account_contacts
                      WHERE account_contacts.id = drives_contacts.accounts_contacts_id
                    )
                  )
                )
                FROM drives_contacts
                WHERE drives_contacts.drive_id = drives.id AND drives_contacts.is_archived = FALSE
              )
            )
          FROM drives drive WHERE drive.id = drives.id
          )`,
          'drive'
        )
        // .leftJoin('drives.account', 'account')
        .where(`drives.is_archived = false AND drives.id = ${id} `)
        .getQuery();

      const drive = await this.drivesRepository.query(query);
      return resSuccess(
        'Drive contacts fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        drive[0].drive
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
