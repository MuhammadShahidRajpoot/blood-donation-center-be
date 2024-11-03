import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { QueryRunner } from 'typeorm/browser';
import { ShiftsDto } from 'src/api/shifts/dto/shifts.dto';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { DriveStatusEnum } from '../enums';
import { OcApprovals } from 'src/api/operations-center/approvals/entities/oc-approval.entity';
import {
  RequestStatusEnum,
  RequestTypeEnum,
} from 'src/api/operations-center/approvals/enums/oc-approval.enum';
import { OcApprovalsDetail } from 'src/api/operations-center/approvals/entities/oc-approval-detail.entity';
import {
  FieldApprovalStatusEnum,
  FieldEnum,
} from 'src/api/operations-center/approvals/enums/oc-approval-detail.enum';
import { AddFieldEnum } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/enum/addField.enum';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { DrivesCertifications } from '../entities/drives-certifications.entity';
import moment from 'moment';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { Approval } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/approvals/entity/approvals.entity';
import { MarketingMaterials } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/marketing-material/entities/marketing-material.entity';
import { PromotionalItems } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

@Injectable()
export class OperationsApprovalsService {
  constructor(
    @Inject(REQUEST)
    private readonly request: UserRequest,
    @InjectRepository(Vehicle)
    private readonly VehicleRepo: Repository<Vehicle>,
    @InjectRepository(BookingRules)
    private readonly bookingRulesRepository: Repository<BookingRules>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypeRepo: Repository<ProcedureTypes>,
    @InjectRepository(OcApprovals)
    private readonly ocApprovalsRepo: Repository<OcApprovals>,
    @InjectRepository(Approval)
    private readonly approvalsRepo: Repository<Approval>,
    @InjectRepository(Device)
    private readonly devicesRepo: Repository<Device>,
    @InjectRepository(StaffSetup)
    private readonly staffSetupRepo: Repository<StaffSetup>,
    @InjectRepository(MarketingMaterials)
    private readonly marketingMaterialsRepo: Repository<MarketingMaterials>,
    @InjectRepository(PromotionalItems)
    private readonly promotionalItemsRepo: Repository<PromotionalItems>
  ) {}

  private async getBookingRules() {
    return this.bookingRulesRepository.findOne({
      where: {
        tenant_id: this.request?.user?.tenant?.id,
      },
      relations: ['booking_rules_add_field'],
    });
  }

  private async getExistingApprovals(
    operationId: bigint,
    operationType: PolymorphicType
  ) {
    return this.ocApprovalsRepo.find({
      where: {
        operationable_id: operationId,
        operationable_type: operationType,
        request_status: RequestStatusEnum.pending,
        is_archived: false,
      },
      relations: ['details'],
    });
  }

  async handleApprovals(
    queryRunner: QueryRunner,
    operationDto,
    operation,
    operation_status: OperationsStatus,
    shifts: ShiftsDto[],
    numberOfSlots: number,
    numberOfSlotsDrive: number,
    operationShifts: Shifts[],
    certifications: DrivesCertifications[],
    operationable_type: PolymorphicType,
    location: CrmLocations
  ) {
    const isOverrideUser = this.request.user?.override;

    const bookingRules = await this.getBookingRules();
    const existingApproval = await this.getExistingApprovals(
      operation.id,
      operationable_type
    );

    let isApprovalExists = existingApproval.length > 0 ? true : false;
    let approval = existingApproval?.[0];
    let isRequestTypeMarketing = false;
    let isRequestTypeThirdRail = false;
    // console.log(existingApproval.length, 'Count of Approval');
    if (isOverrideUser) operation.approval_status = DriveStatusEnum.APPROVED;
    else {
      const approvalDetails: OcApprovalsDetail[] = [];
      // Operation Status Approval Detail
      if (
        operation.operation_status.id !== operation_status.id &&
        bookingRules.third_rail_fields_ &&
        operation_status.requires_approval
      ) {
        const fieldName = FieldEnum.operation_status;
        isRequestTypeThirdRail = true;

        if (!isApprovalExists) {
          approval = await this.createApproval(
            operation.id,
            operationable_type,
            queryRunner
          );
          isApprovalExists = true;
          await queryRunner.manager.save(approval);
          const approvalDetail = await this.createApprovalDetail(
            null,
            fieldName,
            isOverrideUser,
            {
              operation_status: operation.operation_status.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            {
              operation_status: operation_status.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            approval.id
          );
          approvalDetails.push(approvalDetail);
        } else {
          const approvalDetail = await this.findAndUpdateApproval(
            approval,
            fieldName,
            operation_status.requires_approval,
            isOverrideUser,
            {
              operation_status: operation.operation_status.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            {
              operation_status: operation_status.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            null,
            operation
          );
          approvalDetails.push(approvalDetail);
        }
      }

      // Date field Approval Detail
      if (
        +new Date(operation.date) !== +new Date(operationDto.date) &&
        bookingRules.third_rail_fields_date
      ) {
        const fieldName = FieldEnum.date;
        isRequestTypeThirdRail = true;

        if (!isApprovalExists) {
          approval = await this.createApproval(
            operation.id,
            operationable_type,
            queryRunner
          );
          isApprovalExists = true;
          const approvalDetail = await this.createApprovalDetail(
            null,
            fieldName,
            isOverrideUser,
            {
              date: moment(operation.date).format('MM-DD-YYYY'),
              tenant_id: this.request.user?.tenant?.id,
            },
            {
              date: moment(operationDto.date).format('MM-DD-YYYY'),
              tenant_id: this.request.user?.tenant?.id,
            },
            approval.id
          );
          isRequestTypeThirdRail = true;
          approvalDetails.push(approvalDetail);
        } else {
          const approvalDetail = await this.findAndUpdateApproval(
            approval,
            fieldName,
            true,
            isOverrideUser,
            {
              date: moment(operation.date).format('MM-DD-YYYY'),
              tenant_id: this.request.user?.tenant?.id,
            },
            {
              date: moment(operationDto.date).format('MM-DD-YYYY'),
              tenant_id: this.request.user?.tenant?.id,
            },
            null,
            operation
          );
          approvalDetails.push(approvalDetail);
        }
      }

      //  Location field Approval Detail
      if (
        operation?.location &&
        operation.location.id !== operationDto?.location_id?.toString() &&
        location &&
        bookingRules.third_rail_fields_location
      ) {
        const fieldName = FieldEnum.location;
        isRequestTypeThirdRail = true;

        if (!isApprovalExists) {
          approval = await this.createApproval(
            operation.id,
            operationable_type,
            queryRunner
          );
          isApprovalExists = true;
          const approvalDetail = await this.createApprovalDetail(
            null,
            fieldName,
            isOverrideUser,
            {
              location: operation.location.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            {
              location: location.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            approval.id
          );
          approvalDetails.push(approvalDetail);
        } else {
          const approvalDetail = await this.findAndUpdateApproval(
            approval,
            fieldName,
            true,
            isOverrideUser,
            {
              location: operation.location.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            {
              location: location.name,
              tenant_id: this.request.user?.tenant?.id,
            },
            null,
            operation
          );
          approvalDetails.push(approvalDetail);
        }
      }

      // Add fields Approval Details
      for (const addField of bookingRules.booking_rules_add_field) {
        if (
          operation?.recruiter_id &&
          operation.recruiter_id !== operationDto.recruiter_id.toString() &&
          addField.add_field_id.toString() == AddFieldEnum.DriveRecruiter
        ) {
          const fieldName = FieldEnum.recruiter;
          isRequestTypeThirdRail = true;
          if (!isApprovalExists) {
            approval = await this.createApproval(
              operation.id,
              operationable_type,
              queryRunner
            );
            isApprovalExists = true;
            const approvalDetail = await this.createApprovalDetail(
              null,
              fieldName,
              isOverrideUser,
              {
                recruiter: operation.recruiter_id,
                tenant_id: this.request.user?.tenant?.id,
              },
              {
                recruiter: operationDto.recruiter_id,
                tenant_id: this.request.user?.tenant?.id,
              },
              approval.id
            );
            approvalDetails.push(approvalDetail);
          } else {
            const approvalDetail = await this.findAndUpdateApproval(
              approval,
              fieldName,
              true,
              isOverrideUser,
              {
                recruiter: operation.recruiter_id,
                tenant_id: this.request.user?.tenant?.id,
              },
              {
                recruiter: operationDto.recruiter_id,
                tenant_id: this.request.user?.tenant?.id,
              },
              null,
              operation
            );
            approvalDetails.push(approvalDetail);
          }
        }
        if (
          numberOfSlots !== numberOfSlotsDrive &&
          addField.add_field_id.toString() ==
            AddFieldEnum.DriveSessionSlotsQuantity
        ) {
          const fieldName = FieldEnum.slots;
          isRequestTypeThirdRail = true;
          if (!isApprovalExists) {
            approval = await this.createApproval(
              operation.id,
              operationable_type,
              queryRunner
            );
            isApprovalExists = true;
            const approvalDetail = await this.createApprovalDetail(
              null,
              fieldName,
              isOverrideUser,
              {
                slots: numberOfSlotsDrive,
                tenant_id: this.request.user?.tenant?.id,
              },
              {
                slots: numberOfSlots,
                tenant_id: this.request.user?.tenant?.id,
              },
              approval.id
            );
            approvalDetails.push(approvalDetail);
          } else {
            const approvalDetail = await this.findAndUpdateApproval(
              approval,
              fieldName,
              true,
              isOverrideUser,
              {
                slots: numberOfSlotsDrive,
                tenant_id: this.request.user?.tenant?.id,
              },
              {
                slots: numberOfSlots,
                tenant_id: this.request.user?.tenant?.id,
              },
              null,
              operation
            );
            approvalDetails.push(approvalDetail);
          }
        }

        if (
          operationDto.open_to_public != null &&
          operation.open_to_public !== operationDto.open_to_public &&
          addField.add_field_id.toString() == AddFieldEnum.DriveOpenToPublic
        ) {
          const fieldName = FieldEnum.open_to_public;
          isRequestTypeThirdRail = true;
          if (!isApprovalExists) {
            approval = await this.createApproval(
              operation.id,
              operationable_type,
              queryRunner
            );
            isApprovalExists = true;
            const approvalDetail = await this.createApprovalDetail(
              null,
              fieldName,
              isOverrideUser,
              {
                open_to_public: operation.open_to_public ? 'YES' : 'NO',
                tenant_id: this.request.user?.tenant?.id,
              },
              {
                open_to_public: operationDto.open_to_public ? 'YES' : 'NO',
                tenant_id: this.request.user?.tenant?.id,
              },
              approval.id
            );
            approvalDetails.push(approvalDetail);
          } else {
            const approvalDetail = await this.findAndUpdateApproval(
              approval,
              fieldName,
              true,
              isOverrideUser,
              {
                open_to_public: operation.open_to_public ? 'YES' : 'NO',
                tenant_id: this.request.user?.tenant?.id,
              },
              {
                open_to_public: operationDto.open_to_public ? 'YES' : 'NO',
                tenant_id: this.request.user?.tenant?.id,
              },
              null,
              operation
            );
            approvalDetails.push(approvalDetail);
          }
        }

        if (certifications.length) {
          const removedCertifications = [];
          const newCertification = [];
          for (const certification of operation.certifications) {
            if (
              !operationDto.certifications.includes(
                parseInt(certification.certification_id)
              )
            ) {
              removedCertifications.push(certification.certification_id);
            }
          }
          const existingCertifications = operation.certifications.map((item) =>
            parseInt(item.certification_id)
          );
          for (const certification of operationDto.certifications) {
            if (!existingCertifications.includes(parseInt(certification))) {
              newCertification.push(certification);
            }
          }
          if (
            addField.add_field_id.toString() ==
              AddFieldEnum.DriveSessionNCECertifications &&
            (newCertification.length || removedCertifications.length)
          ) {
            const fieldName = FieldEnum.certifications;
            isRequestTypeThirdRail = true;
            const newItems = certifications?.map((item) => item.certification);
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                null,
                fieldName,
                isOverrideUser,
                {
                  certifications: newItems?.[0],
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  certifications: newItems?.[0],
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const previousItems = operation.certifications?.map(
                (item) => item.certification
              );
              const newItems = certifications?.map(
                (item) => item.certification
              );
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  certifications: previousItems?.[0],
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  certifications: newItems?.[0],
                  tenant_id: this.request.user?.tenant?.id,
                },
                null,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }
      }

      if (operationable_type === PolymorphicType.OC_OPERATIONS_DRIVES) {
        const approvalRequiredItems = await this.approvalsRepo.findOne({
          where: {
            tenant_id: this.request.user?.tenant?.id,
          },
        });

        if (approvalRequiredItems?.marketing_materials) {
          const dtoItems = operationDto.marketing.marketing_materials;
          const dtoItemsIds = dtoItems?.map((item) =>
            parseInt(item.marketing_material_item_id)
          );
          const existingMarketingItems = operation.marketing_items;
          const removedItems = [];
          const newItems = [];
          const changedItems = [];
          if (operation?.marketing_items) {
            for (const item of operation?.marketing_items) {
              if (
                !dtoItemsIds?.includes(parseInt(item?.marketing_material?.id))
              ) {
                removedItems.push({
                  ...item?.marketing_material,
                  quantity: item.quantity,
                });
              }
            }
          }
          const existingMarketingItemIds = existingMarketingItems?.map((item) =>
            parseInt(item.marketing_material.id)
          );
          for (const i of dtoItems) {
            if (
              !existingMarketingItemIds?.includes(
                parseInt(i.marketing_material_item_id)
              )
            ) {
              const marketinItem = await this.marketingMaterialsRepo.findOne({
                where: {
                  id: i.marketing_material_item_id,
                },
              });
              newItems.push({
                ...marketinItem,
                quantity: i.quantity,
                tenant_id: this.request.user?.tenant?.id,
              });
            } else {
              const existing = existingMarketingItems?.filter(
                (item) =>
                  item.marketing_material.id == i.marketing_material_item_id
              );
              if (existing.length) {
                changedItems.push({
                  ...(existing?.[0]?.marketing_material || {}),
                  quantity: i.quantity,
                  tenant_id: this.request.user?.tenant?.id,
                });
              }
            }
          }

          if (removedItems.length || newItems.length || changedItems.length) {
            const fieldName = FieldEnum.marketing_items;
            isRequestTypeMarketing = true;

            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                null,
                fieldName,
                isOverrideUser,
                {
                  marketing_items: existingMarketingItems.map((item) => {
                    return {
                      ...item.marketing_material,
                      quantity: item.quantity,
                      tenant_id: this.request.user?.tenant?.id,
                    };
                  }),
                },
                {
                  marketing_items: [...newItems, ...changedItems],
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const operationStatusApproval = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  marketing_items: existingMarketingItems.map((item) => {
                    return {
                      ...item.marketing_material,
                      quantity: item.quantity,
                    };
                  }),
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  marketing_items: [...newItems, ...changedItems],
                  tenant_id: this.request.user?.tenant?.id,
                },
                null,
                operation
              );
              approvalDetails.push(operationStatusApproval);
            }
          }
        }

        if (approvalRequiredItems?.promotional_items) {
          const dtoItems = operationDto.marketing.promotional_items;
          const dtoItemsIds = dtoItems?.map((item) =>
            parseInt(item.promotional_item_id)
          );
          const existingItems = operation.promotional_items;
          const removedItems = [];
          const newItems = [];
          const changedItems = [];
          for (const item of operation.promotional_items) {
            if (!dtoItemsIds?.includes(parseInt(item?.promotional_item?.id))) {
              removedItems.push({
                ...item?.promotional_item,
                quantity: item.quantity,
                tenant_id: this.request.user?.tenant?.id,
              });
            }
          }

          const existingMarketingItemIds = existingItems.map((item) =>
            parseInt(item.promotional_item.id)
          );
          for (const i of dtoItems) {
            if (
              !existingMarketingItemIds.includes(parseInt(i.promotional_item))
            ) {
              const promotional_item = await this.promotionalItemsRepo.findOne({
                where: {
                  id: i.promotional_item_id,
                },
              });
              newItems.push({
                ...promotional_item,
                quantity: i.quantity,
                tenant_id: this.request.user?.tenant?.id,
              });
            } else {
              const existing = existingItems?.filter(
                (item) => item.promotional_item.id == i.promotional_item_id
              );
              if (existing.length) {
                changedItems.push({
                  ...(existing?.[0]?.promotional_item || {}),
                  quantity: i.quantity,
                  tenant_id: this.request.user?.tenant?.id,
                });
              }
            }
          }

          if (removedItems.length || newItems.length || changedItems.length) {
            const fieldName = FieldEnum.promotional_items;
            isRequestTypeMarketing = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;

              const approvalDetail = await this.createApprovalDetail(
                null,
                fieldName,
                isOverrideUser,
                {
                  promotional_items: existingItems.map((item) => {
                    return {
                      ...item.promotional_item,
                      quantity: item.quantity,
                      tenant_id: this.request.user?.tenant?.id,
                    };
                  }),
                },
                { promotional_items: [...newItems, ...changedItems] },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const operationStatusApproval = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  promotional_items: existingItems.map((item) => {
                    return {
                      ...item.promotional_item,
                      quantity: item.quantity,
                      tenant_id: this.request.user?.tenant?.id,
                    };
                  }),
                },
                { promotional_items: [...newItems, ...changedItems] },
                null,
                operation
              );
              approvalDetails.push(operationStatusApproval);
            }
          }
        }
        if (approvalRequiredItems.tele_recruitment) {
          if (
            operation?.tele_recruitment !=
            operationDto?.tele_recruitment_enabled
          ) {
            const fieldName = FieldEnum.telerecruitment;
            isRequestTypeMarketing = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;

              const approvalDetail = await this.createApprovalDetail(
                null,
                fieldName,
                isOverrideUser,
                {
                  telerecruitment: operation?.tele_recruitment ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  telerecruitment: operationDto?.tele_recruitment_enabled
                    ? 'Yes'
                    : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                operation_status.requires_approval,
                isOverrideUser,
                {
                  telerecruitment: operation?.tele_recruitment ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  telerecruitment: operationDto?.tele_recruitment_enabled
                    ? 'Yes'
                    : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                null,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }

        if (approvalRequiredItems.sms_texting) {
          if (operation?.sms != operationDto?.sms_enabled) {
            const fieldName = FieldEnum.sms;
            isRequestTypeMarketing = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;

              const approvalDetail = await this.createApprovalDetail(
                null,
                fieldName,
                isOverrideUser,
                {
                  sms: operation.sms ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  sms: operationDto.sms_enabled ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                operation_status.requires_approval,
                isOverrideUser,
                {
                  sms: operation.sms ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  sms: operationDto.sms_enabled ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                null,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }

        if (approvalRequiredItems.email) {
          if (operation?.email != operationDto?.email_enabled) {
            const fieldName = FieldEnum.email;
            isRequestTypeMarketing = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;

              const approvalDetail = await this.createApprovalDetail(
                null,
                fieldName,
                isOverrideUser,
                {
                  email: operation.email ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  email: operationDto.email_enabled ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                operation_status.requires_approval,
                isOverrideUser,
                {
                  email: operation.email ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  email: operationDto.email_enabled ? 'Yes' : 'No',
                  tenant_id: this.request.user?.tenant?.id,
                },
                null,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }
      }

      // const existingDriveHours = {
      //   start_time: null,
      //   end_time: null,
      // };
      // const dtoDriveHours = {
      //   start_time: null,
      //   end_time: null,
      // };
      // Approval Details related to shift
      for (const shiftItem of shifts) {
        // Projection
        const existingProjections = operationShifts.filter((item) => {
          return item.id == shiftItem.shift_id;
        })?.[0];
        // if (!existingDriveHours.start_time) {
        //   existingDriveHours.start_time = moment(
        //     existingProjections.start_time
        //   );
        //   existingDriveHours.end_time = moment(existingProjections.end_time);
        // }
        // if (
        //   moment(existingDriveHours.start_time).isAfter(
        //     moment(existingProjections.start_time)
        //   )
        // ) {
        //   existingDriveHours.start_time = moment(
        //     existingProjections.start_time
        //   );
        // }
        // if (
        //   moment(existingDriveHours.end_time).isBefore(
        //     moment(existingProjections.end_time)
        //   )
        // ) {
        //   existingDriveHours.end_time = moment(existingProjections.end_time);
        // }

        // if (!dtoDriveHours.start_time) {
        //   dtoDriveHours.start_time = moment(shiftItem.start_time);
        //   dtoDriveHours.end_time = moment(shiftItem.end_time);
        // }
        // if (
        //   moment(dtoDriveHours.start_time).isAfter(moment(shiftItem.start_time))
        // ) {
        //   dtoDriveHours.start_time = moment(shiftItem.start_time);
        // }
        // if (
        //   moment(dtoDriveHours.end_time).isBefore(moment(shiftItem.end_time))
        // ) {
        //   dtoDriveHours.end_time = moment(shiftItem.end_time);
        // }

        if (bookingRules.third_rail_fields_projection) {
          const dtoItemsIds: number[] = shiftItem?.projections?.map((item) =>
            parseInt(item.procedure_type_id.toString())
          );

          const existingItemIds =
            existingProjections?.projections?.map((item) =>
              parseInt(item.procedure_type_id.toString())
            ) || [];

          const removedItems = [];
          const newItems = [];
          for (const item of existingItemIds) {
            if (!dtoItemsIds?.includes(item)) {
              removedItems.push(item);
            }
          }
          for (const item of dtoItemsIds) {
            if (!existingItemIds?.includes(item)) {
              newItems.push(item);
            }
          }

          if (newItems.length || removedItems.length) {
            const existingProcedureTypes = await this.procedureTypeRepo.find({
              where: {
                id: In(existingItemIds),
              },
            });

            const procedureTypesUpdated = await this.procedureTypeRepo.find({
              where: {
                id: In(newItems),
              },
            });

            const fieldName = FieldEnum.procedure_type;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  tenant_id: this.request.user?.tenant?.id,
                  procedure_type: existingProcedureTypes
                    .map((type) => type.name)
                    .join(', '),
                },
                {
                  shift_number: shiftItem.shift_id,
                  tenant_id: this.request.user?.tenant?.id,
                  procedure_type: procedureTypesUpdated
                    .map((type) => type.name)
                    .join(', '),
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  tenant_id: this.request.user?.tenant?.id,
                  procedure_type: existingProcedureTypes
                    .map((type) => type.name)
                    .join(', '),
                },
                {
                  shift_number: shiftItem.shift_id,
                  tenant_id: this.request.user?.tenant?.id,
                  procedure_type: procedureTypesUpdated
                    .map((type) => type.name)
                    .join(', '),
                },
                shiftItem.shift_id,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }

          const dtoProductYield: number[] = shiftItem?.projections?.map(
            (item) => parseInt(item.product_yield.toString())
          );
          dtoProductYield.sort();

          const existingProductYield =
            existingProjections?.projections?.map((item) =>
              parseInt(item.product_yield.toString())
            ) || [];
          existingProductYield.sort();

          const productYieldChanged =
            existingProductYield.join() !== dtoProductYield.join();

          if (productYieldChanged) {
            const fieldName = FieldEnum.product_yield;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  product_yield: existingProductYield,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  product_yield: dtoProductYield,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  product_yield: existingProductYield,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  product_yield: dtoProductYield,
                  tenant_id: this.request.user?.tenant?.id,
                },
                shiftItem.shift_id,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }

          const dtoProcedureTypeQty: number[] = shiftItem?.projections?.map(
            (item) => parseInt(item.procedure_type_qty.toString())
          );
          dtoProcedureTypeQty.sort();

          const existingProcedureTypeQty =
            existingProjections?.projections?.map((item) =>
              parseInt(item.procedure_type_qty.toString())
            ) || [];
          existingProcedureTypeQty.sort();

          const procedureTypeQtyChanged =
            existingProcedureTypeQty.join() !== dtoProcedureTypeQty.join();

          if (procedureTypeQtyChanged) {
            const fieldName = FieldEnum.procedure_type_qty;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  procedure_type_qty: existingProcedureTypeQty,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  procedure_type_qty: dtoProcedureTypeQty,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  procedure_type_qty: existingProcedureTypeQty,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  procedure_type_qty: dtoProcedureTypeQty,
                  tenant_id: this.request.user?.tenant?.id,
                },
                shiftItem.shift_id,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }

        // Staff setups
        if (bookingRules.third_rail_fields_staffing_setup) {
          let dtoItemsIds = [];
          shiftItem.projections?.map((item) => {
            dtoItemsIds = [...dtoItemsIds, ...item.staff_setups];
          });

          const existingItemIds =
            existingProjections?.projections?.map(
              (item) => item.staff_setup?.id
            ) || [];

          const removedItems = [];
          const newItems = [];
          for (const item of existingItemIds) {
            if (!dtoItemsIds?.includes(item)) {
              removedItems.push(item);
            }
          }
          for (const item of dtoItemsIds) {
            if (!existingItemIds.includes(item)) {
              newItems.push(item);
            }
          }

          if (newItems.length || removedItems.length) {
            const existingItems = await this.staffSetupRepo.find({
              where: {
                id: In(existingItemIds),
              },
            });
            const updatedItems = await this.staffSetupRepo.find({
              where: {
                id: In(newItems),
              },
            });
            const fieldName = FieldEnum.staff_setups;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  staff_setups: existingItems,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  staff_setups: updatedItems,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  staff_setups: existingItems,
                },
                {
                  shift_number: shiftItem.shift_id,
                  staff_setups: updatedItems,
                },
                shiftItem.shift_id,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }

        if (bookingRules.third_rail_fields_hours) {
          if (
            !moment(existingProjections?.start_time).isSame(
              moment(shiftItem?.start_time)
            )
          ) {
            const fieldName = FieldEnum.shift_start_time;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_start_time: existingProjections.start_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_start_time: shiftItem.start_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const operationStatusApproval = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_start_time: existingProjections?.start_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_start_time: shiftItem?.start_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                shiftItem?.shift_id,
                operation
              );
              approvalDetails.push(operationStatusApproval);
            }
          }

          if (
            !moment(existingProjections?.end_time).isSame(
              moment(shiftItem?.end_time)
            )
          ) {
            const fieldName = FieldEnum.shift_end_time;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_end_time: existingProjections?.end_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_end_time: shiftItem?.end_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval?.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const operationStatusApproval = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_end_time: existingProjections?.end_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_end_time: shiftItem?.end_time,
                  tenant_id: this.request.user?.tenant?.id,
                },
                shiftItem?.shift_id,
                operation
              );
              approvalDetails.push(operationStatusApproval);
            }
          }
        }

        for (const addField of bookingRules.booking_rules_add_field) {
          if (
            addField.add_field_id.toString() ==
            AddFieldEnum.DriveSessionNCEStaffBreak
          ) {
            if (
              !existingProjections?.break_start_time &&
              shiftItem?.break_start_time &&
              shiftItem?.break_start_time != ''
            ) {
              const fieldName = FieldEnum.shift_break_start_time;
              isRequestTypeThirdRail = true;
              if (!isApprovalExists) {
                approval = await this.createApproval(
                  operation.id,
                  operationable_type,
                  queryRunner
                );
                isApprovalExists = true;
                const approvalDetail = await this.createApprovalDetail(
                  shiftItem.shift_id,
                  fieldName,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: shiftItem?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  approval.id
                );
                approvalDetails.push(approvalDetail);
              } else {
                const approvalDetail = await this.findAndUpdateApproval(
                  approval,
                  fieldName,
                  true,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: shiftItem?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  shiftItem.shift_id,
                  operation
                );
                approvalDetails.push(approvalDetail);
              }
            }

            if (
              existingProjections?.break_start_time &&
              ((shiftItem?.break_start_time &&
                shiftItem?.break_start_time != '') ||
                shiftItem?.break_start_time === null)
            ) {
              const fieldName = FieldEnum.shift_break_start_time;
              isRequestTypeThirdRail = true;
              if (!isApprovalExists) {
                approval = await this.createApproval(
                  operation.id,
                  operationable_type,
                  queryRunner
                );
                isApprovalExists = true;
                const approvalDetail = await this.createApprovalDetail(
                  shiftItem.shift_id,
                  fieldName,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time:
                      existingProjections?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  approval.id
                );
                approvalDetails.push(approvalDetail);
              } else {
                const approvalDetail = await this.findAndUpdateApproval(
                  approval,
                  fieldName,
                  true,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time:
                      existingProjections?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  shiftItem.shift_id,
                  operation
                );
                approvalDetails.push(approvalDetail);
              }
            }

            if (
              existingProjections?.break_start_time &&
              shiftItem?.break_start_time &&
              shiftItem?.break_start_time !== '' &&
              moment(existingProjections?.break_start_time).isSame(
                moment(shiftItem?.break_start_time)
              )
            ) {
              const fieldName = FieldEnum.shift_break_start_time;
              isRequestTypeThirdRail = true;
              if (!isApprovalExists) {
                approval = await this.createApproval(
                  operation.id,
                  operationable_type,
                  queryRunner
                );
                isApprovalExists = true;
                const approvalDetail = await this.createApprovalDetail(
                  shiftItem.shift_id,
                  fieldName,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time:
                      existingProjections?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: shiftItem?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  approval.id
                );
                approvalDetails.push(approvalDetail);
              } else {
                const approvalDetail = await this.findAndUpdateApproval(
                  approval,
                  fieldName,
                  true,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time:
                      existingProjections?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_start_time: shiftItem?.break_start_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  shiftItem.shift_id,
                  operation
                );
                approvalDetails.push(approvalDetail);
              }
            }

            if (
              !existingProjections?.break_end_time &&
              shiftItem?.break_end_time &&
              shiftItem?.break_end_time != ''
            ) {
              const fieldName = FieldEnum.shift_break_end_time;
              isRequestTypeThirdRail = true;
              if (!isApprovalExists) {
                approval = await this.createApproval(
                  operation.id,
                  operationable_type,
                  queryRunner
                );
                isApprovalExists = true;
                const approvalDetail = await this.createApprovalDetail(
                  shiftItem.shift_id,
                  fieldName,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: shiftItem?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  approval.id
                );
                approvalDetails.push(approvalDetail);
              } else {
                const approvalDetail = await this.findAndUpdateApproval(
                  approval,
                  fieldName,
                  true,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: shiftItem?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  shiftItem.shift_id,
                  operation
                );
                approvalDetails.push(approvalDetail);
              }
            }

            if (
              existingProjections?.break_end_time &&
              ((shiftItem?.break_end_time && shiftItem?.break_end_time == '') ||
                shiftItem?.break_end_time === null)
            ) {
              const fieldName = FieldEnum.shift_break_end_time;
              isRequestTypeThirdRail = true;
              if (!isApprovalExists) {
                approval = await this.createApproval(
                  operation.id,
                  operationable_type,
                  queryRunner
                );
                isApprovalExists = true;
                const approvalDetail = await this.createApprovalDetail(
                  shiftItem.shift_id,
                  fieldName,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: existingProjections?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  approval.id
                );
                approvalDetails.push(approvalDetail);
              } else {
                const approvalDetail = await this.findAndUpdateApproval(
                  approval,
                  fieldName,
                  true,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: existingProjections?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: 'N/A',
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  shiftItem.shift_id,
                  operation
                );
                approvalDetails.push(approvalDetail);
              }
            }

            if (
              existingProjections?.break_end_time &&
              shiftItem?.break_end_time &&
              shiftItem?.break_end_time !== '' &&
              moment(existingProjections?.break_end_time).isSame(
                moment(shiftItem?.break_end_time)
              )
            ) {
              const fieldName = FieldEnum.shift_break_end_time;
              isRequestTypeThirdRail = true;
              if (!isApprovalExists) {
                approval = await this.createApproval(
                  operation.id,
                  operationable_type,
                  queryRunner
                );
                isApprovalExists = true;

                const approvalDetail = await this.createApprovalDetail(
                  shiftItem.shift_id,
                  fieldName,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: existingProjections?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: shiftItem?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  approval.id
                );
                approvalDetails.push(approvalDetail);
              } else {
                const approvalDetail = await this.findAndUpdateApproval(
                  approval,
                  fieldName,
                  true,
                  isOverrideUser,
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: existingProjections?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  {
                    shift_number: shiftItem.shift_id,
                    shift_break_end_time: shiftItem?.break_end_time,
                    tenant_id: this.request.user?.tenant?.id,
                  },
                  shiftItem.shift_id,
                  operation
                );
                approvalDetails.push(approvalDetail);
              }
            }
          }

          if (
            shiftItem?.devices?.length &&
            addField?.add_field_id?.toString() ==
              AddFieldEnum.DriveSessionDevices
          ) {
            const devicesDto = await this.devicesRepo.find({
              where: {
                id: In(shiftItem?.devices),
              },
            });

            const devicesDrive = existingProjections?.devices?.map(
              (item) => item.device
            );
            const fieldName = FieldEnum.devices;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;

              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  devices: devicesDrive,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  devices: devicesDto,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  devices: devicesDrive,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  devices: devicesDto,
                  tenant_id: this.request.user?.tenant?.id,
                },
                shiftItem.shift_id,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }

          if (
            shiftItem?.vehicles &&
            addField?.add_field_id?.toString() ==
              AddFieldEnum.DriveSessionVehicles
          ) {
            const vehiclesDto = await this.VehicleRepo.find({
              where: {
                id: In(shiftItem.vehicles),
              },
            });

            const vehiclesDrive = existingProjections?.vehicles?.map(
              (item) => item.vehicle
            );

            const fieldName = FieldEnum.vehicles;
            isRequestTypeThirdRail = true;
            if (!isApprovalExists) {
              approval = await this.createApproval(
                operation.id,
                operationable_type,
                queryRunner
              );
              isApprovalExists = true;
              const approvalDetail = await this.createApprovalDetail(
                shiftItem.shift_id,
                fieldName,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  vehicles: vehiclesDrive,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  vehicles: vehiclesDto,
                  tenant_id: this.request.user?.tenant?.id,
                },
                approval.id
              );
              approvalDetails.push(approvalDetail);
            } else {
              const approvalDetail = await this.findAndUpdateApproval(
                approval,
                fieldName,
                true,
                isOverrideUser,
                {
                  shift_number: shiftItem.shift_id,
                  vehicles: vehiclesDrive,
                  tenant_id: this.request.user?.tenant?.id,
                },
                {
                  shift_number: shiftItem.shift_id,
                  vehicles: vehiclesDto,
                  tenant_id: this.request.user?.tenant?.id,
                },
                shiftItem.shift_id,
                operation
              );
              approvalDetails.push(approvalDetail);
            }
          }
        }
      }

      // if (bookingRules.third_rail_fields_hours) {
      //   if (
      //     !moment(existingDriveHours.start_time).isSame(
      //       moment(dtoDriveHours.start_time)
      //     )
      //   ) {
      //     const fieldName = FieldEnum.shift_start_time;
      //     isRequestTypeThirdRail = true;
      //     if (!isApprovalExists) {
      //       approval = await this.createApproval(
      //         operation.id,
      //         operationable_type,
      //         queryRunner
      //       );
      // isApprovalExists = true;
      //       const approvalDetail = await this.createApprovalDetail(
      //         null,
      //         fieldName,
      //         isOverrideUser,
      //         {
      //           shift_start_time: existingDriveHours.start_time,
      //         },
      //         { shift_start_time: dtoDriveHours.start_time },
      //         approval.id
      //       );
      //       approvalDetails.push(approvalDetail);
      //     } else {
      //       const operationStatusApproval = await this.findAndUpdateApproval(
      //         approval,
      //         fieldName,
      //         true,
      //         isOverrideUser,
      //         {
      //           shift_start_time: existingDriveHours.start_time,
      //         },
      //         { shift_start_time: dtoDriveHours.start_time },
      //         null,
      //         operation
      //       );
      //       approvalDetails.push(operationStatusApproval);
      //     }
      //   }

      //   if (
      //     !moment(existingDriveHours.end_time).isSame(
      //       moment(dtoDriveHours.end_time)
      //     )
      //   ) {
      //     const fieldName = FieldEnum.shift_end_time;
      //     isRequestTypeThirdRail = true;
      //     if (!isApprovalExists) {
      //       approval = await this.createApproval(
      //         operation.id,
      //         operationable_type,
      //         queryRunner
      //       );
      // isApprovalExists = true;
      //       const approvalDetail = await this.createApprovalDetail(
      //         null,
      //         fieldName,
      //         isOverrideUser,
      //         {
      //           shift_end_time: existingDriveHours.end_time,
      //         },
      //         { shift_end_time: dtoDriveHours.end_time },
      //         approval.id
      //       );
      //       approvalDetails.push(approvalDetail);
      //     } else {
      //       const operationStatusApproval = await this.findAndUpdateApproval(
      //         approval,
      //         fieldName,
      //         true,
      //         isOverrideUser,
      //         {
      //           shift_end_time: existingDriveHours.end_time,
      //         },
      //         { shift_end_time: dtoDriveHours.end_time },
      //         null,
      //         operation
      //       );
      //       approvalDetails.push(operationStatusApproval);
      //     }
      //   }
      // }
      if (isRequestTypeMarketing && isRequestTypeThirdRail)
        approval.request_type = RequestTypeEnum.both;
      else if (isRequestTypeMarketing)
        approval.request_type = RequestTypeEnum.marketing_update;
      else RequestTypeEnum.third_rail_failed;

      await queryRunner.manager.save(existingApproval);
      await queryRunner.manager.save(approvalDetails);
    }
  }

  async createApprovalDetail(
    shiftId,
    field_name: FieldEnum,
    override: boolean,
    original_data,
    requested_data,
    approvalId
  ) {
    const approvalDetail = new OcApprovalsDetail();
    approvalDetail.shift_id = shiftId;
    approvalDetail.field_name = field_name;
    approvalDetail.field_approval_status = FieldApprovalStatusEnum.pending;
    approvalDetail.is_override = override;
    approvalDetail.original_data = original_data;
    approvalDetail.requested_data = requested_data;
    approvalDetail.approval_id = approvalId;
    approvalDetail.created_by = this.request.user;
    approvalDetail.created_at = new Date();
    return approvalDetail;
  }

  async createApproval(
    operationId,
    operationable_type: PolymorphicType,
    queryRunner: QueryRunner
  ) {
    const approvalForDrive = new OcApprovals();
    approvalForDrive.operationable_type = operationable_type;
    approvalForDrive.operationable_id = operationId;
    approvalForDrive.request_type = RequestTypeEnum.third_rail_failed;
    approvalForDrive.is_discussion_required = false;
    approvalForDrive.request_status = RequestStatusEnum.pending;
    approvalForDrive.created_by = this.request.user;
    approvalForDrive.created_at = new Date();
    approvalForDrive.tenant_id = this.request.user.tenant?.id;
    return queryRunner.manager.save(approvalForDrive);
  }

  async findApproval(existingApproval, type: FieldEnum) {
    const existing = existingApproval?.details?.filter(
      (item) =>
        item.field_name == type &&
        item.field_approval_status == FieldApprovalStatusEnum.pending
    );

    return existing?.length > 0 ? existing?.[0] : null;
  }

  async findAndUpdateApproval(
    existingApproval,
    type: FieldEnum,
    requiresApproval: boolean,
    override: boolean,
    original_data,
    requested_data,
    shift_id,
    operation
  ) {
    const existingApprovalDetail = await this.findApproval(
      existingApproval,
      type
    );
    operation.approval_status = DriveStatusEnum.PENDING;
    if (!existingApprovalDetail && requiresApproval) {
      const approvalDetail = await this.createApprovalDetail(
        shift_id,
        type,
        override,
        original_data,
        requested_data,
        existingApproval.id
      );
      approvalDetail.approval_id = existingApproval.id;
      return approvalDetail;
    } else {
      existingApprovalDetail.shift_id = shift_id;
      existingApprovalDetail.created_at = new Date();
      existingApprovalDetail.created_by = this.request.user?.id;
      existingApprovalDetail.field_approval_status =
        FieldApprovalStatusEnum.pending;
      existingApprovalDetail.is_override = override;
      const originalValue = existingApprovalDetail.requested_data;
      existingApprovalDetail.original_data = originalValue;
      existingApprovalDetail.requested_data = requested_data;
      return existingApprovalDetail;
    }
  }
}
