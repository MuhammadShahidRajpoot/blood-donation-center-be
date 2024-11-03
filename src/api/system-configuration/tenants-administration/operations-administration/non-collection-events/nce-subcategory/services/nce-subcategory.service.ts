import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, Not, IsNull } from 'typeorm';
import { Category } from '../../../../crm-administration/common/entity/category.entity';
import { CreateNoteSubCategoryDto } from '../dto/create-nce-subcategory.dto';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from '../../../../../../system-configuration/helpers/response';
import { CategoryHistory } from '../../../../crm-administration/common/entity/categoryhistory.entity';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { GetAllNoteSubCategoryInterface } from '../interface/nce-subcategory.interface';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { typeEnum } from '../../../../crm-administration/common/enums/type.enum';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';

@Injectable()
export class NceSubCategoryService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Category)
    private readonly noteSubCategoryRepository: Repository<Category>,
    @InjectRepository(CategoryHistory)
    private readonly noteSubCategoryHistoryRepository: Repository<CategoryHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly entityManager: EntityManager
  ) {}

  categoryEnum = typeEnum?.OPERATION_NEC_NEC;

  async create(createNoteSubCategoryDto: CreateNoteSubCategoryDto) {
    try {
      const note = await this.noteSubCategoryRepository.findOne({
        where: {
          id: createNoteSubCategoryDto?.parent_id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        },
      });
      if (!note) {
        return resError(
          'parent Note Category not found',
          ErrorConstants.Error,
          404
        );
      }
      // Create the Note Sub Category
      const note_subcategory = new Category();
      // Set Note Sub Category properties
      note_subcategory.name = createNoteSubCategoryDto?.name;
      note_subcategory.description = createNoteSubCategoryDto?.description;
      note_subcategory.type = this.categoryEnum;
      note_subcategory.parent_id = note;
      note_subcategory.is_active = createNoteSubCategoryDto?.is_active;
      note_subcategory.created_by = this.request.user;
      note_subcategory.tenant_id = this.request.user?.tenant?.id;

      // Save the Note Sub Category entity
      const savednotecategory = await this.noteSubCategoryRepository.save(
        note_subcategory
      );

      delete savednotecategory?.created_by;
      return resSuccess(
        'Note Sub Category Created Successfully',
        'success',
        HttpStatus.CREATED,
        {
          ...savednotecategory,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAll(params: GetAllNoteSubCategoryInterface) {
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

      const queryBuilder = this.noteSubCategoryRepository
        .createQueryBuilder('note_subcategory')
        .where({
          ...where,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: Not(IsNull()),
        })
        .innerJoinAndSelect('note_subcategory.parent_id', 'parent_id');

      if (sortName && sortName !== 'parent_id') {
        queryBuilder.orderBy(`note_subcategory.${sortName}`, sortBy);
      } else if (sortName === 'parent_id') {
        // Sort by parent name
        queryBuilder.innerJoinAndSelect(
          'note_subcategory.parent_id',
          'category'
        );
        queryBuilder.orderBy({ 'category.name': sortBy });
      } else {
        queryBuilder.orderBy({ 'note_subcategory.id': 'DESC' });
      }

      if (!params?.fetchAll) {
        queryBuilder.take(limit).skip((page - 1) * limit);
      }
      const [data, count] = await queryBuilder.getManyAndCount();

      return resSuccess(
        'Note Subcategories Fetched Successfully',
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

  async getSingleNoteCategory(id: any) {
    try {
      const note_subcategory: any =
        await this.noteSubCategoryRepository.findOne({
          where: {
            id,
            is_archived: false,
            type: this.categoryEnum,
            parent_id: Not(IsNull()),
          },
          relations: ['created_by', 'parent_id'],
        });

      if (!note_subcategory) {
        return resError(
          'Note Sub Category not found',
          ErrorConstants.Error,
          404
        );
      }
      if (note_subcategory) {
        const modifiedData: any = await getModifiedDataDetails(
          this.noteSubCategoryHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        note_subcategory.modified_by = note_subcategory.created_by;
        note_subcategory.modified_at = note_subcategory.created_at;
        note_subcategory.created_at = modified_at
          ? modified_at
          : note_subcategory.created_at;
        note_subcategory.created_by = modified_by
          ? modified_by
          : note_subcategory.created_by;
      }

      return resSuccess(
        'Note Sub Category Fetched Successfully',
        'success',
        HttpStatus.OK,
        note_subcategory
      );
    } catch (error) {
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async updateNoteCategory(id: any, updatedData: any) {
    const note_category = await this.noteSubCategoryRepository.findOne({
      where: {
        id: updatedData?.parent_id,
        is_archived: false,
        type: this.categoryEnum,
        parent_id: IsNull(),
        tenant_id: this.request.user?.tenant?.id,
      },
    });
    if (!note_category) {
      return resError(
        'Parent Note Category not found',
        ErrorConstants.Error,
        404
      );
    }
    const note_subcategory = await this.noteSubCategoryRepository.findOne({
      where: {
        id,
        is_archived: false,
        type: this.categoryEnum,
        parent_id: Not(IsNull()),
        tenant_id: this.request.user?.tenant?.id,
      },
      relations: ['parent_id'],
    });

    if (!note_subcategory) {
      return resError('Note Sub Category not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create an updatedNoteCategory object with the changes
      const updatedNoteCategory: any = {
        name: updatedData?.name,
        description: updatedData?.description,
        is_active: updatedData?.is_active,
        parent_id: note_category,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      // Update the Note Sub Category using the updatedNoteCategory object
      await this.noteSubCategoryRepository.update({ id }, updatedNoteCategory);

      await queryRunner.commitTransaction();

      delete updatedNoteCategory?.created_by;
      return resSuccess(
        'Note Sub Category Updated Successfully',
        'success',
        HttpStatus.OK,
        { ...updatedNoteCategory, tenant_id: this.request.user?.tenant?.id }
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError(
        'Failed to update Note Sub Category data.',
        ErrorConstants.Error,
        500
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteNoteCategory(id: any, user: any) {
    const note_subcategory: any = await this.noteSubCategoryRepository.findOne({
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

    if (!note_subcategory) {
      resError('Note Sub Category not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      note_subcategory.is_archived = true;
      note_subcategory.created_at = new Date();
      note_subcategory.created_by = this.request?.user;
      const archivedNoteSubCategory = await this.noteSubCategoryRepository.save(
        note_subcategory
      );

      await queryRunner.commitTransaction();

      delete archivedNoteSubCategory?.created_by;
      return resSuccess(
        'Note Sub Category Deleted Successfully',
        'success',
        204,
        archivedNoteSubCategory
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        'Failed to delete Note Sub Category data.',
        ErrorConstants.Error,
        500
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAllNceSubCategory(id: any, user: any, is_active?: boolean) {
    try {
      let parent_id = {};

      if (!id) {
        parent_id = {
          id: Not(IsNull()),
        };
      } else {
        parent_id = {
          id: id,
        };
      }

      const whereConditions: any = {
        is_archived: false,
        type: this.categoryEnum,
        tenant_id: user.tenant.id,
        parent_id: { ...parent_id },
      };

      if (is_active !== undefined) {
        whereConditions.is_active = is_active;
      }

      const data = await this.noteSubCategoryRepository.find({
        where: whereConditions,
        relations: ['parent_id'],
      });

      return resSuccess(
        'Note Subcategories Fetched Successfully',
        'success',
        HttpStatus.OK,
        data
      );
    } catch (error) {
      return resError(
        'Internal Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }
}
