import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  resError,
  resSuccess,
} from '../../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../../system-configuration/constants/error.constants';
import { Category } from '../../../../../system-configuration/tenants-administration/crm-administration/common/entity/category.entity';
import { User } from '../../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Tenant } from '../../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { HistoryService } from '../../../../../common/services/history.service';
import { CrmAttachments } from '../entities/attachment.entity';
import { CrmAttachmentsHistory } from '../entities/attachment-history.entity';
import { CreateAttachmentsDto } from '../dto/create-attachment.dto';
import { AttachmentsFiltersInterface } from '../interface/attachment.interface';
import { UpdateAttachmentsDto } from '../dto/update-attaachment.dto';
import { AttachmentsFiles } from '../entities/attachment-files.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';

dotenv.config();
@Injectable()
export class AttachmentsService extends HistoryService<CrmAttachmentsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CrmAttachments)
    private readonly attachmentsRepository: Repository<CrmAttachments>,
    @InjectRepository(CrmAttachmentsHistory)
    private readonly attachmentHistoryRepository: Repository<CrmAttachmentsHistory>,
    @InjectRepository(AttachmentsFiles)
    private readonly attachmentsFilesRepository: Repository<AttachmentsFiles>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {
    super(attachmentHistoryRepository);
  }

  async create(
    attachmentsQuery: any,
    createAttachmentDto: CreateAttachmentsDto,
    req: any
  ) {
    try {
      const {
        name,
        description,
        attachment_files,
        category_id,
        sub_category_id,
      } = createAttachmentDto;
      const { attachmentable_id, attachmentable_type } = attachmentsQuery;

      const category = await this.categoryRepository.findOneBy({
        id: category_id,
      });

      if (!category) {
        return resError(
          `Category Does not exist!`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      const subCategory = sub_category_id
        ? await this.categoryRepository.findOne({
            where: {
              id: sub_category_id,
            },
            relations: ['parent_id'],
          })
        : null;

      if (
        sub_category_id &&
        (!subCategory || (subCategory && !subCategory.parent_id))
      ) {
        return resError(
          `SubCategory Does not exist!`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      const user = await this.userRepository.findOneBy({
        id: req?.user?.id,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const tenant = await this.tenantRepository.findOneBy({
        id: req?.user?.tenant?.id,
      });
      if (!tenant) {
        return resError(
          `Tenant not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const createAttachment = new CrmAttachments();

      createAttachment.attachmentable_id = attachmentable_id;
      createAttachment.attachmentable_type = attachmentable_type;
      createAttachment.name = name;
      createAttachment.description = description;
      createAttachment.category_id = category;
      createAttachment.sub_category_id = subCategory;
      createAttachment.tenant_id = tenant?.id;
      createAttachment.created_by = user;

      const savedAttachment = await this.attachmentsRepository.save(
        createAttachment
      );

      for (const filePath of attachment_files) {
        const attachmentFile = {
          attachment_id: savedAttachment,
          attachment_path: filePath,
          created_by: user,
        };

        await this.attachmentsFilesRepository.save(attachmentFile);
      }

      return resSuccess(
        'Attachment Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedAttachment
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(attachmentFiltersInterface: AttachmentsFiltersInterface) {
    try {
      const {
        keyword,
        category_id,
        sub_category_id,
        attachmentable_id,
        attachmentable_type,
        tenant_id,
        sortBy,
        sortOrder,
      } = attachmentFiltersInterface;
      let { page, limit } = attachmentFiltersInterface;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;

      const where = { is_archived: false };

      Object.assign(where, {
        tenant: { id: tenant_id },
      });

      if (keyword) {
        Object.assign(where, {
          name: ILike(`%${keyword}%`),
        });
      }

      if (category_id) {
        Object.assign(where, {
          category_id: {
            id: category_id,
          },
        });
      }

      if (sub_category_id) {
        Object.assign(where, {
          sub_category_id: {
            id: sub_category_id,
          },
        });
      }

      if (attachmentable_id) {
        Object.assign(where, {
          attachmentable_id,
        });
      }

      if (attachmentable_type) {
        Object.assign(where, {
          attachmentable_type,
        });
      }

      let order: any = { id: 'DESC' };

      if (sortBy) {
        if (sortBy == 'category_id') {
          const orderDirection = sortOrder || 'DESC';
          order = { category_id: { name: orderDirection } };
        } else if (sortBy == 'sub_category_id') {
          const orderDirection = sortOrder || 'DESC';
          order = { sub_category_id: { name: orderDirection } };
        } else if (sortBy == 'created_by') {
          const orderDirection = sortOrder || 'DESC';
          order = { created_by: { first_name: orderDirection } };
        } else {
          const orderBy = sortBy;
          const orderDirection = sortOrder || 'DESC';
          order = { [orderBy]: orderDirection };
        }
      }

      const [response, count] = await this.attachmentsRepository.findAndCount({
        where,
        relations: [
          'created_by',
          'tenant',
          'category_id',
          'sub_category_id',
          // 'attachment_files',
        ],
        take: limit,
        skip: (page - 1) * limit,
        order,
      });

      return {
        status: HttpStatus.OK,
        message: 'Attachment Fetched Succesfully',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const attachment: any = await this.attachmentsRepository.findOne({
        where: { id },
        relations: [
          'created_by',
          'tenant',
          'category_id',
          'sub_category_id',
          'attachment_files',
        ],
      });

      if (!attachment) {
        return resError(
          `Attachment not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (attachment?.is_archived) {
        return resError(
          `Attachment is archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (attachment) {
        const modifiedData: any = await getModifiedDataDetails(
          this.attachmentHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        attachment.modified_by = attachment.created_by;
        attachment.modified_at = attachment.created_at;
        attachment.created_at = modified_at
          ? modified_at
          : attachment.created_at;
        attachment.created_by = modified_by
          ? modified_by
          : attachment.created_by;
      }

      return resSuccess(
        'Attachment fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...attachment }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateAttachmentsDto: UpdateAttachmentsDto, req: any) {
    try {
      const {
        name,
        description,
        attachment_files,
        category_id,
        sub_category_id,
      } = updateAttachmentsDto;

      const existingAttachment: any = await this.attachmentsRepository.findOne({
        where: { id },
        relations: [
          'created_by',
          'tenant',
          'category_id',
          'sub_category_id',
          'attachment_files',
        ],
      });

      if (!existingAttachment) {
        return resError(
          `Attachment not found!`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const attachmentBeforeUpdate = { ...existingAttachment };

      existingAttachment.name = name ?? existingAttachment.name;
      existingAttachment.description =
        description ?? existingAttachment.description;
      existingAttachment.created_at = new Date();
      existingAttachment.created_by = this.request?.user;

      if (category_id) {
        const category = await this.categoryRepository.findOneBy({
          id: category_id,
        });

        if (!category) {
          return resError(
            `Category does not exist!`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }

        existingAttachment.category_id = category;
      }

      if (sub_category_id) {
        const subCategory = await this.categoryRepository.findOne({
          where: {
            id: sub_category_id,
          },
          relations: ['parent_id'],
        });

        if (!subCategory || (subCategory && !subCategory.parent_id)) {
          return resError(
            `SubCategory does not exist!`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }

        existingAttachment.sub_category_id = subCategory;
      } else {
        existingAttachment.sub_category_id = null;
      }

      const updatedAttachment = await this.attachmentsRepository.save(
        existingAttachment
      );

      if (attachment_files.length) {
        await this.attachmentsFilesRepository.delete({ attachment_id: id });
        for (const filePath of attachment_files) {
          const attachmentFile: any = {
            attachment_id: updatedAttachment,
            attachment_path: filePath,
            created_at: new Date(),
            created_by: this.request?.user,
          };

          await this.attachmentsFilesRepository.save(attachmentFile);
        }
      }

      const attachment = await this.attachmentsRepository.findOne({
        where: { id },
        relations: ['category_id', 'sub_category_id', 'attachment_files'],
      });

      return resSuccess(
        'Attachment Updated successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        attachment
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, req: any) {
    try {
      const attachment: any = await this.attachmentsRepository.findOne({
        where: { id },
        relations: ['created_by', 'tenant', 'category_id', 'sub_category_id'],
      });

      if (!attachment) {
        return resError(
          `Attachment not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (attachment.is_archived) {
        return resError(
          `Attachment is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      attachment.is_archived = true;
      attachment.created_at = new Date();
      attachment.created_by = this.request?.user;
      const archivedAttachment = await this.attachmentsRepository.save(
        attachment
      );

      return resSuccess(
        'Attachment Archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
