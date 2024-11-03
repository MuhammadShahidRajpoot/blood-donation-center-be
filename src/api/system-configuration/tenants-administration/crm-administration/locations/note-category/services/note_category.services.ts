import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, IsNull } from 'typeorm';
import { Category } from '../../../common/entity/category.entity';
import { CreateNoteCategoryDto } from '../dto/create-note-category.dto';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import {
  resError,
  resSuccess,
} from '../../../../../../system-configuration/helpers/response';
import { CategoryHistory } from '../../../common/entity/categoryhistory.entity';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { GetAllNotecategoryInterface } from '../interface/note-category.interface';
import { typeEnum } from '../../../common/enums/type.enum';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';

@Injectable()
export class NoteCategoryService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Category)
    private readonly noteCategoryRepository: Repository<Category>,
    @InjectRepository(CategoryHistory)
    private readonly noteCategoryHistoryRepository: Repository<CategoryHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly entityManager: EntityManager
  ) {}

  categoryEnum = typeEnum?.CRM_LOCATION_NOTES;

  async create(createNoteCategoryDto: CreateNoteCategoryDto) {
    try {
      // Create the Note Category
      const note_category = new Category();
      // Set Note Category properties
      note_category.name = createNoteCategoryDto?.name;
      note_category.description = createNoteCategoryDto?.description;
      note_category.type = this.categoryEnum;
      note_category.is_active = createNoteCategoryDto?.is_active;
      note_category.created_by = this.request.user;
      note_category.tenant_id = this.request.user?.tenant?.id;

      // Save the Note Category entity
      const savedNoteCategory = await this.noteCategoryRepository.save(
        note_category
      );
      delete savedNoteCategory.tenant;
      delete savedNoteCategory.created_by;
      return resSuccess(
        'Note Category Created Successfully',
        'success',
        HttpStatus.CREATED,
        {
          ...savedNoteCategory,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAll(params: GetAllNotecategoryInterface, user: any) {
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
        tenant: { id: user?.tenant?.id },
      });

      const queryBuilder = this.noteCategoryRepository
        .createQueryBuilder('note_category')
        .where({
          ...where,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        });
      if (sortName) {
        queryBuilder.orderBy(`note_category.${sortName}`, sortBy);
      } else {
        queryBuilder.orderBy({ 'note_category.id': 'DESC' });
      }

      if (!params?.fetchAll) {
        queryBuilder.take(limit).skip((page - 1) * limit);
      }

      const [data, count] = await queryBuilder.getManyAndCount();

      return resSuccess(
        'Note Category Fetched Successfully',
        'success',
        HttpStatus.OK,
        data,
        count
      );
    } catch (e) {
      return resError('Internal Server Error', ErrorConstants.Error, e.status);
    }
  }

  async getSingleNoteCategory(id: any) {
    try {
      const note_category: any = await this.noteCategoryRepository.findOne({
        where: {
          id,
          is_archived: false,
          type: this.categoryEnum,
          parent_id: IsNull(),
        },
        relations: ['created_by', 'tenant'],
      });
      if (!note_category) {
        return resError('Note Category not found', ErrorConstants.Error, 404);
      }
      if (note_category) {
        const modifiedData: any = await getModifiedDataDetails(
          this.noteCategoryHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        note_category.modified_by = note_category.created_by;
        note_category.modified_at = note_category.created_at;
        note_category.created_at = modified_at
          ? modified_at
          : note_category.created_at;
        note_category.created_by = modified_by
          ? modified_by
          : note_category.created_by;
      }
      return resSuccess(
        'Note Category Fetched Successfully',
        'success',
        HttpStatus.OK,
        note_category
      );
    } catch (error) {
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    }
  }

  async updateNoteCategory(id: any, updatedData: any) {
    const note_category = await this.noteCategoryRepository.findOne({
      where: {
        id,
        is_archived: false,
        type: this.categoryEnum,
        parent_id: IsNull(),
      },
    });

    if (!note_category) {
      return resError('Note Category not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create an updatedNoteCategory object with the changes
      const updatedNoteCategory = {
        name: updatedData?.name,
        description: updatedData?.description,
        is_active: updatedData?.is_active,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      // Update the note category using the updatedNoteCategory object
      await this.noteCategoryRepository.update({ id }, updatedNoteCategory);

      await queryRunner.commitTransaction();

      return resSuccess(
        'Note Category Updated Successfully',
        'success',
        HttpStatus.OK,
        { ...updatedNoteCategory, tenant_id: note_category.tenant_id }
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

  async deleteNoteCategory(id: any, user: any) {
    const note_category: any = await this.noteCategoryRepository.findOne({
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
    const note_subcategory = await this.noteCategoryRepository.findOne({
      where: {
        is_archived: false,
        type: this.categoryEnum,
        parent_id: { id: id },
      },
      relations: ['parent_id'],
    });

    if (!note_category) {
      return resError('Note Category not found', ErrorConstants.Error, 404);
    }
    if (note_subcategory) {
      return resError(
        'Note categories depend on note subcategories.',
        ErrorConstants.Error,
        404
      );
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create an updatedNoteCategory object with the changes
      note_category.is_archived = true;
      note_category.created_at = new Date();
      note_category.created_by = this.request?.user;
      const archivedNoteCategory = await this.noteCategoryRepository.save(
        note_category
      );

      await queryRunner.commitTransaction();

      delete archivedNoteCategory?.created_by;
      return resSuccess(
        'Note Category Deleted Successfully',
        'success',
        204,
        archivedNoteCategory
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError('Internel Server Error', ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
