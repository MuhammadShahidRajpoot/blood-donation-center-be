import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, Not, IsNull } from 'typeorm';
import { Category } from '../../../common/entity/category.entity';
import { CreateAttachmentSubCategoryDto } from '../dto/create-attachment-subcategory.dto';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from '../../../../../../system-configuration/helpers/response';
import { CategoryHistory } from '../../../common/entity/categoryhistory.entity';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { GetAllAttachmentSubCategoryInterface } from '../interfaces/query-attachment-subcategory.interface';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { typeEnum } from '../../../common/enums/type.enum';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';

@Injectable()
export class AttachmentSubCategoryService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Category)
    private readonly attachmentSubCategoryRepository: Repository<Category>,
    @InjectRepository(CategoryHistory)
    private readonly attachmentSubCategoryHistoryRepository: Repository<CategoryHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly entityManager: EntityManager
  ) {}

  categoryEnum = typeEnum?.CRM_ACCOUNTS_ATTACHMENTS;

  async create(createAttachmentSubCategoryDto: CreateAttachmentSubCategoryDto) {
    try {
      const attachment = await this.attachmentSubCategoryRepository.findOne({
        where: {
          id: createAttachmentSubCategoryDto?.parent_id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        },
      });
      if (!attachment) {
        return resError(
          'parent Attachment Category not found',
          ErrorConstants.Error,
          404
        );
      }
      // Create the Attachment Sub Category
      const attachment_subcategory = new Category();
      // Set Attachment Sub Category properties
      attachment_subcategory.name = createAttachmentSubCategoryDto?.name;
      attachment_subcategory.description =
        createAttachmentSubCategoryDto?.description;
      attachment_subcategory.type = this.categoryEnum;
      attachment_subcategory.parent_id = attachment;
      attachment_subcategory.is_active =
        createAttachmentSubCategoryDto?.is_active;
      attachment_subcategory.created_by = this.request.user;
      attachment_subcategory.tenant_id = this.request.user?.tenant?.id;

      // Save the Attachment Sub Category entity
      const savedattachmentcategory =
        await this.attachmentSubCategoryRepository.save(attachment_subcategory);

      delete savedattachmentcategory.tenant;
      delete savedattachmentcategory.created_by;

      return resSuccess(
        'Attachment Sub Category Created Successfully',
        'success',
        HttpStatus.CREATED,
        {
          ...savedattachmentcategory,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAll(params: GetAllAttachmentSubCategoryInterface) {
    try {
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

      const sortName = params?.sortName === '' ? undefined : params?.sortName; // Column name for sorting
      const sortBy = params?.sortOrder === 'DESC' ? 'DESC' : 'ASC'; // Sort order, defaulting to ASC

      const queryBuilder = this.attachmentSubCategoryRepository
        .createQueryBuilder('attachment_subcategory')
        .where({
          ...where,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: Not(IsNull()),
        })
        .innerJoinAndSelect('attachment_subcategory.parent_id', 'parent_id');

      if (sortName && sortName !== 'parent_id') {
        queryBuilder.orderBy(`attachment_subcategory.${sortName}`, sortBy);
      } else if (sortName === 'parent_id') {
        // Sort by parent name
        queryBuilder.innerJoinAndSelect(
          'attachment_subcategory.parent_id',
          'category'
        );
        queryBuilder.orderBy({ 'category.name': sortBy });
      } else {
        queryBuilder.orderBy({ 'attachment_subcategory.id': 'DESC' });
      }

      if (!params?.fetchAll) {
        queryBuilder.take(limit).skip((page - 1) * limit);
      }
      const [data, count] = await queryBuilder.getManyAndCount();

      return resSuccess(
        'Attachment Subcategories Fetched Successfully',
        'success',
        HttpStatus.OK,
        data,
        count
      );
    } catch (error) {
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async getSingleAttachmentCategory(id: any) {
    try {
      const attachment_subcategory: any =
        await this.attachmentSubCategoryRepository.findOne({
          where: {
            id,
            is_archived: false,
            type: this.categoryEnum,
            parent_id: Not(IsNull()),
          },
          relations: ['created_by', 'parent_id'],
        });

      if (!attachment_subcategory) {
        return resError(
          'Attachment Sub Category not found',
          ErrorConstants.Error,
          404
        );
      }
      if (attachment_subcategory) {
        const modifiedData: any = await getModifiedDataDetails(
          this.attachmentSubCategoryHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        attachment_subcategory.modified_by = attachment_subcategory.created_by;
        attachment_subcategory.modified_at = attachment_subcategory.created_at;
        attachment_subcategory.created_at = modified_at
          ? modified_at
          : attachment_subcategory.created_at;
        attachment_subcategory.created_by = modified_by
          ? modified_by
          : attachment_subcategory.created_by;
      }

      return resSuccess(
        'Attachment Sub Category Fetched Successfully',
        'success',
        HttpStatus.OK,
        attachment_subcategory
      );
    } catch (error) {
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async updateAttachmentCategory(id: any, updatedData: any) {
    const attachment_category: any =
      await this.attachmentSubCategoryRepository.findOne({
        where: {
          id: updatedData?.parent_id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        },
      });
    if (!attachment_category) {
      return resError(
        'Parent Attachment Category not found',
        ErrorConstants.Error,
        404
      );
    }
    const attachment_subcategory =
      await this.attachmentSubCategoryRepository.findOne({
        where: {
          id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: Not(IsNull()),
        },
        relations: ['parent_id'],
      });

    if (!attachment_subcategory) {
      return resError(
        'Attachment Sub Category not found',
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
        parent_id: attachment_category,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      // Update the Attachment Sub Category using the updatedNoteCategory object
      await this.attachmentSubCategoryRepository.update(
        { id },
        updatedAttachmentCategory
      );

      await queryRunner.commitTransaction();

      return resSuccess(
        'Attachment Sub Category Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError(
        'Failed to update Attachment Sub Category data.',
        ErrorConstants.Error,
        500
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAttachmentCategory(id: any, user: any) {
    const attachment_subcategory: any =
      await this.attachmentSubCategoryRepository.findOne({
        where: {
          id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: Not(IsNull()),
          tenant: {
            id: user.tenant.id,
          },
        },
        relations: ['parent_id', 'tenant'],
      });

    if (!attachment_subcategory) {
      resError('Attachment Sub Category not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      attachment_subcategory.is_archived = true;
      attachment_subcategory.created_at = new Date();
      attachment_subcategory.created_by = this.request?.user;
      const archivedAttachmentSubCategory =
        await this.attachmentSubCategoryRepository.save(attachment_subcategory);

      await queryRunner.commitTransaction();

      const { created_by, ...rest } = archivedAttachmentSubCategory;
      return resSuccess(
        'Attachment Sub Category Deleted Successfully',
        'success',
        204,
        rest
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        'Failed to delete Attachment Sub Category data.',
        ErrorConstants.Error,
        500
      );
    } finally {
      await queryRunner.release();
    }
  }
}
