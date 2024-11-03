import { HttpStatus } from '@nestjs/common';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { resError } from 'src/api/system-configuration/helpers/response';
import { CustomFieldsDataHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data-history';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { HistoryReason } from 'src/common/enums/history_reason.enum';
import { QueryRunner, Repository } from 'typeorm/browser';

export async function updateCustomFields(
  entity: any,
  customFieldDataDto: any,
  customFieldsDataRepository: Repository<any>,
  queryRunner: QueryRunner,
  created_by: any,
  tenant_id: any
) {
  const { fields_data, custom_field_datable_type } = customFieldDataDto;
  const custom_field_datable_id = entity.id;
  if (!custom_field_datable_id) {
    return resError(
      `custom_field_datable_id is required.`,
      ErrorConstants.Error,
      HttpStatus.BAD_REQUEST
    );
  }
  if (!custom_field_datable_type) {
    return resError(
      `custom_field_datable_type is required.`,
      ErrorConstants.Error,
      HttpStatus.BAD_REQUEST
    );
  }

  if (fields_data?.length) {
    for (const item of fields_data) {
      const customField = await customFieldsDataRepository.findOne({
        where: { id: item?.field_id, is_archived: false },
      });
      if (!customField) {
        return resError(
          `Field not found.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      // If 'id' is absent, it's a new option; if 'id' is present, update the existing one
      if (!item.id) {
        const customFieldData = new CustomFieldsData();
        customFieldData.custom_field_datable_id = custom_field_datable_id;
        customFieldData.custom_field_datable_type = custom_field_datable_type;
        customFieldData.field_id = customField;
        customFieldData.tenant_id = tenant_id;
        customFieldData.created_by = created_by;
        customFieldData.created_at = new Date();
        customFieldData.field_data = item?.field_data;
        await queryRunner.manager.save(CustomFieldsData, customFieldData);
      } else {
        const existingcustomFieldData =
          await customFieldsDataRepository.findOne({
            where: { id: item?.id },
            relations: ['field_id', 'tenant'],
          });
        if (!existingcustomFieldData) {
          return resError(
            `Custom field data not found for id ${item?.id}.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        if (customField?.is_required && !item?.field_data) {
          return resError(
            `Field data must be required for id ${customField?.id}.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        existingcustomFieldData.created_by = created_by;
        existingcustomFieldData.created_at = new Date();
        existingcustomFieldData.field_data = item?.field_data;
        await customFieldsDataRepository.save(existingcustomFieldData);
      }
    }
  }

  // Identify deleted options and set them to inactive
  const existingOptions = await customFieldsDataRepository.find({
    where: {
      custom_field_datable_id: custom_field_datable_id,
      custom_field_datable_type: custom_field_datable_type,
    },
    relations: ['field_id', 'tenant'],
  });
  const updatedIds = fields_data
    .filter((item) => item?.id)
    .map((item) => item.id.toString());
  const deletedOptions = existingOptions.filter(
    (data) => !updatedIds.includes(data.id.toString())
  );
  for (const item of deletedOptions) {
    const optionToUpdate = { ...item };
    optionToUpdate.is_archived = true;
    optionToUpdate.created_at = new Date();
    optionToUpdate.created_by = created_by;
    await queryRunner.manager.save(CustomFieldsData, optionToUpdate);
  }
}
