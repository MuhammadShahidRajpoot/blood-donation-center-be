import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, IsNull } from 'typeorm';
import { Category } from '../../../common/entity/category.entity';
import { CreateAttachmentCategoryDto } from '../dto/create-attachment-category.dto';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from '../../../../../../system-configuration/helpers/response';
import { CategoryHistory } from '../../../common/entity/categoryhistory.entity';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { GetAllAttachmentCategoryInterface } from '../interfaces/query-attachment-category.interface';
import { typeEnum } from '../../../common/enums/type.enum';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';

@Injectable()
export class AttachmentCategoryService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Category)
    private readonly attachmentCategoryRepository: Repository<Category>,
    @InjectRepository(CategoryHistory)
    private readonly attachmentCategoryHistoryRepository: Repository<CategoryHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly entityManager: EntityManager
  ) {}

  categoryEnum = typeEnum?.CRM_ACCOUNTS_ATTACHMENTS;

  async create(createAttachmentCategoryDto: CreateAttachmentCategoryDto) {
    try {
      // Create the Note Category
      const attachment_category = new Category();
      // Set Note Category properties
      attachment_category.name = createAttachmentCategoryDto?.name;
      attachment_category.description =
        createAttachmentCategoryDto?.description;
      attachment_category.type = this.categoryEnum;
      attachment_category.is_active = createAttachmentCategoryDto?.is_active;
      attachment_category.created_by = this.request.user;
      attachment_category.tenant_id = this.request.user?.tenant?.id;

      // Save the Note Category entity
      const savedAttachmentCategory =
        await this.attachmentCategoryRepository.save(attachment_category);
      delete savedAttachmentCategory.tenant;
      delete savedAttachmentCategory.created_by;
      return resSuccess(
        'Attachment Category Created Successfully',
        'success',
        HttpStatus.CREATED,
        {
          ...savedAttachmentCategory,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAll(params: GetAllAttachmentCategoryInterface) {
    try {
      const sortName = params?.sortName === '' ? undefined : params?.sortName; // Column name for sorting
      const sortBy = params?.sortOrder === 'DESC' ? 'DESC' : 'ASC'; // Sort order, defaulting to ASC
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;
      let page = params?.page ? +params?.page : 1;
      if (page < 1) {
        page = 1;
      }

      const where = {};
      if (params?.name) {
        Object.assign(where, {
          name: ILike(`%${params?.name}%`),
        });
      }

      if (params?.is_active) {
        Object.assign(where, {
          is_active: params?.is_active,
        });
      }
      Object.assign(where, {
        tenant: this.request.user?.tenant,
      });

      const queryBuilder = this.attachmentCategoryRepository
        .createQueryBuilder('attachment_category')
        .where({
          ...where,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        });
      if (sortName) {
        queryBuilder.orderBy(`attachment_category.${sortName}`, sortBy);
      } else {
        queryBuilder.orderBy({ 'attachment_category.id': 'DESC' });
      }

      if (!params?.fetchAll) {
        queryBuilder.take(limit).skip((page - 1) * limit);
      }

      const [data, count] = await queryBuilder.getManyAndCount();

      return resSuccess(
        'Attachment Category Fetched Successfully',
        'success',
        HttpStatus.OK,
        data,
        count
      );
    } catch (e) {
      return resError('Internal Server Error', ErrorConstants.Error, e.status);
    }
  }

  async getSingleAttachmentCategory(id: any) {
    try {
      const attachment_category: any =
        await this.attachmentCategoryRepository.findOne({
          where: {
            id,
            is_archived: false,
            type: this.categoryEnum,
            parent_id: IsNull(),
          },
          relations: ['created_by'],
        });
      if (!attachment_category) {
        return resError(
          'Attachment Category not found',
          ErrorConstants.Error,
          404
        );
      }
      if (attachment_category) {
        const modifiedData: any = await getModifiedDataDetails(
          this.attachmentCategoryHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        attachment_category.modified_by = attachment_category.created_by;
        attachment_category.modified_at = attachment_category.created_at;
        attachment_category.created_at = modified_at
          ? modified_at
          : attachment_category.created_at;
        attachment_category.created_by = modified_by
          ? modified_by
          : attachment_category.created_by;
      }
      return resSuccess(
        'Attachment Category Fetched Successfully',
        'success',
        HttpStatus.OK,
        attachment_category
      );
    } catch (error) {
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async updateAttachmentCategory(id: any, updatedData: any) {
    const attachment_category = await this.attachmentCategoryRepository.findOne(
      {
        where: {
          id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        },
      }
    );

    if (!attachment_category) {
      return resError(
        'Attachment Category not found',
        ErrorConstants.Error,
        404
      );
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create an updatedNoteCategory object with the changes
      const updatedAttachmentCategory = {
        name: updatedData?.name,
        description: updatedData?.description,
        is_active: updatedData?.is_active,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      // Update the note category using the updatedNoteCategory object
      await this.attachmentCategoryRepository.update(
        { id },
        updatedAttachmentCategory
      );

      await queryRunner.commitTransaction();

      return resSuccess(
        'Attachment Category Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAttachmentCategory(id: any, user: any) {
    const attachment_category: any =
      await this.attachmentCategoryRepository.findOne({
        where: {
          id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
          tenant: {
            id: user.tenant.id,
          },
        },
        relations: ['tenant'],
      });
    const attachment_subcategory =
      await this.attachmentCategoryRepository.findOne({
        where: {
          is_archived: false,
          type: this.categoryEnum,
          parent_id: { id: id },
        },
        relations: ['parent_id'],
      });

    if (!attachment_category) {
      return resError(
        'Attachment Category not found',
        ErrorConstants.Error,
        404
      );
    }
    if (attachment_subcategory) {
      return resError(
        'Attachment categories depend on note subcategories.',
        ErrorConstants.Error,
        404
      );
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      attachment_category.is_archived = true;
      attachment_category.created_at = new Date();
      attachment_category.created_by = this.request?.user;
      const archivedAttachmentCategory =
        await this.attachmentCategoryRepository.save(attachment_category);

      await queryRunner.commitTransaction();

      return resSuccess(
        'Attachment Category Deleted Successfully',
        'success',
        204,
        archivedAttachmentCategory
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError('Internel Server Error', ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
