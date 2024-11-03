import { HttpStatus } from '@nestjs/common';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { resError } from 'src/api/system-configuration/helpers/response';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { QueryRunner } from 'typeorm/browser';

export async function saveCustomFields(
  customFieldsRepository: any,
  queryRunner: QueryRunner,
  data: any,
  created_by: any,
  tenant: any,
  createCustomFieldDrivesDataDto: any,
  response: any[]
) {
  if (createCustomFieldDrivesDataDto.custom_fields) {
    const { fields_data, custom_field_datable_type } =
      createCustomFieldDrivesDataDto.custom_fields;

    if (!custom_field_datable_type) {
      return resError(
        `custom_field_datable_type is required.`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
    // Add tenant_id to custom_fields object
    createCustomFieldDrivesDataDto.custom_fields.tenant_id = tenant?.id;
    // const responseData = [];

    if (fields_data?.length) {
      for (const item of fields_data) {
        const customField = await customFieldsRepository.findOne({
          where: { id: item?.field_id, is_archived: false },
        });

        if (!customField) {
          return resError(
            `Field not found for ID ${item?.field_id}.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        item.tenant_id = tenant?.id;
        if (customField?.is_required && !item?.field_data) {
          return resError(
            `Field data must be required for field id ${customField?.id}.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        // Check if CustomFieldsData already exists for this custom field and data.
        // Find existing CustomFieldsData for update.
        const customFieldData = await queryRunner.manager.findOne(
          CustomFieldsData,
          {
            where: {
              custom_field_datable_id: data.id,
              custom_field_datable_type: custom_field_datable_type,
              field_id: { id: item?.field_id },
              tenant: { id: tenant?.id },
            },
          }
        );

        if (customFieldData) {
          // If the data already exists, update the field_data.
          customFieldData.field_data = item?.field_data;
          customFieldData.created_by = created_by;
          customFieldData.created_at = new Date();
          customFieldData.tenant_id = tenant?.id;
          await queryRunner.manager.save(customFieldData);
        } else {
          const customFieldData = new CustomFieldsData();
          customFieldData.custom_field_datable_id = data.id;
          customFieldData.custom_field_datable_type = custom_field_datable_type;
          customFieldData.field_id = customField;
          customFieldData.tenant_id = tenant?.id;
          customFieldData.created_by = created_by;
          customFieldData.created_at = new Date();
          // customFieldData.tenant_id = created_by?.user?.tenant;
          customFieldData.field_data = item?.field_data;

          response.push(await queryRunner.manager.save(customFieldData));
        }
      }
    }
  }
}
