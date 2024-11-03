import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { CreateNotesDto } from '../dto/create-note.dto';
import {
  resError,
  resSuccess,
} from '../../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../../system-configuration/constants/error.constants';
import { Category } from '../../../../../system-configuration/tenants-administration/crm-administration/common/entity/category.entity';
import { User } from '../../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Tenant } from '../../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Notes } from '../entities/note.entity';
import { UpdateNotesDto } from '../dto/update-note.dto';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { NotesFiltersInterface } from '../interface/note.interface';
import { HistoryService } from '../../../../../common/services/history.service';
import { NotesHistory } from '../entities/note-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';

dotenv.config();
@Injectable()
export class NotesService extends HistoryService<NotesHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Notes)
    private readonly notesRepository: Repository<Notes>,
    @InjectRepository(NotesHistory)
    private readonly notesHistoryRepository: Repository<NotesHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {
    super(notesHistoryRepository);
  }

  async create(createNoteDto: CreateNotesDto, req: any) {
    try {
      const {
        noteable_id,
        noteable_type,
        note_name,
        details,
        category_id,
        sub_category_id,
        is_active,
      } = createNoteDto;

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
        id: req?.user.tenant?.id,
      });
      if (!tenant) {
        return resError(
          `Tenant not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const createNote = new Notes();

      createNote.noteable_id = noteable_id;
      createNote.noteable_type = noteable_type;
      createNote.note_name = note_name;
      createNote.details = details;
      createNote.is_active = is_active;
      createNote.category_id = category;
      createNote.sub_category_id = subCategory;
      createNote.tenant_id = tenant?.id;
      createNote.created_by = user;

      const savedNote = await this.notesRepository.save(createNote);

      return resSuccess(
        'Note Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedNote
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(notesFiltersInterface: NotesFiltersInterface) {
    try {
      const {
        keyword,
        category_id,
        sub_category_id,
        is_active,
        noteable_id,
        noteable_type,
        tenant_id,
      } = notesFiltersInterface;
      let { page, limit } = notesFiltersInterface;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;

      const where = { is_archived: false };

      Object.assign(where, {
        tenant: { id: tenant_id },
      });

      if (keyword) {
        Object.assign(where, {
          note_name: ILike(`%${keyword}%`),
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

      if (noteable_id) {
        Object.assign(where, {
          noteable_id,
        });
      }

      if (noteable_type) {
        Object.assign(where, {
          noteable_type,
        });
      }

      if (is_active) {
        Object.assign(where, {
          is_active,
        });
      }

      let order: any = { note_name: 'ASC' };

      if (notesFiltersInterface?.sortBy) {
        if (notesFiltersInterface?.sortBy == 'category_id') {
          const orderDirection = notesFiltersInterface.sortOrder || 'DESC';
          order = { category_id: { name: orderDirection } };
        } else if (notesFiltersInterface?.sortBy == 'sub_category_id') {
          const orderDirection = notesFiltersInterface.sortOrder || 'DESC';
          order = { sub_category_id: { name: orderDirection } };
        } else if (notesFiltersInterface?.sortBy == 'created_by') {
          const orderDirection = notesFiltersInterface.sortOrder || 'DESC';
          order = { created_by: { first_name: orderDirection } };
        } else {
          const orderBy = notesFiltersInterface.sortBy;
          const orderDirection = notesFiltersInterface.sortOrder || 'DESC';
          order = { [orderBy]: orderDirection };
        }
      }

      const [response, count] = await this.notesRepository.findAndCount({
        where,
        relations: ['created_by', 'tenant', 'category_id', 'sub_category_id'],
        take: limit,
        skip: (page - 1) * limit,
        order,
      });

      return {
        status: HttpStatus.OK,
        message: 'Note Fetched Succesfuly',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const note: any = await this.notesRepository.findOne({
        where: { id },
        relations: ['created_by', 'tenant', 'category_id', 'sub_category_id'],
      });

      if (!note) {
        return resError(
          `Note not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (note?.is_archived) {
        return resError(
          `Note is archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (note) {
        const modifiedData: any = await getModifiedDataDetails(
          this.notesHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        note.modified_by = note.created_by;
        note.modified_at = note.created_at;
        note.created_at = modified_at ? modified_at : note.created_at;
        note.created_by = modified_by ? modified_by : note.created_by;
      }

      return resSuccess(
        'Note fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...note }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAllNoteOperationCategories(req: any) {
    try {
      const where = { is_archived: false, is_active: true };

      if (req?.user?.tenant?.id) {
        Object.assign(where, {
          tenant_id: req?.user?.tenant?.id,
        });
      }

      const [response, count] = await this.categoryRepository.findAndCount({
        where: where,
      });

      return resSuccess(
        'Note categories fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        count
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAllNoteOperationSubCategories(category_id: number, req: any) {
    try {
      const where = {
        is_archived: false,
        parent_id: category_id,
        is_active: true,
      };

      if (req?.user?.tenant?.id) {
        Object.assign(where, {
          tenant_id: req?.user?.tenant?.id,
        });
      }

      const response = await this.categoryRepository
        .createQueryBuilder('category')
        .select(['id', 'name', 'tenant_id'])
        .where(where)
        .getRawMany();

      return resSuccess(
        'Note subcategories fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateNoteDto: UpdateNotesDto, req: any) {
    try {
      const {
        noteable_id,
        noteable_type,
        note_name,
        details,
        is_active,
        category_id,
        sub_category_id,
      } = updateNoteDto;

      const note: any = await this.notesRepository.findOne({
        where: { id },
        relations: ['created_by', 'tenant', 'category_id', 'sub_category_id'],
      });

      const noteBeforeUpdate = { ...note };

      if (!note) {
        return resError(
          `Note does not exist!`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (note.is_archived) {
        return resError(
          `Note is archived and cannot be updated!`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (category_id) {
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

        note.category_id = category;
      }

      if (sub_category_id) {
        const subCategory = await this.categoryRepository.findOne({
          where: {
            id: sub_category_id,
          },
          relations: ['parent_id'],
        });

        if (!subCategory || (subCategory && !subCategory?.parent_id)) {
          return resError(
            `SubCategory Does not exist!`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }

        note.sub_category_id = subCategory;
      } else {
        note.sub_category_id = null;
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

      note.noteable_id = noteable_id ?? note.noteable_id;
      note.noteable_type = noteable_type ?? note.noteable_type;
      note.note_name = note_name ?? note.note_name;
      note.is_active = is_active ?? note.is_active;
      note.details = details ?? note.details;
      note.created_at = new Date();
      note.created_by = this.request?.user;

      const updatedNote = await this.notesRepository.save(note);

      return resSuccess(
        'Note Updated Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, req: any) {
    try {
      const note: any = await this.notesRepository.findOne({
        where: { id },
        relations: ['created_by', 'tenant', 'category_id', 'sub_category_id'],
      });

      if (!note) {
        return resError(
          `Note not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (note.is_archived) {
        return resError(
          `Note is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      note.is_archived = true;
      note.created_at = new Date();
      note.created_by = this.request?.user;
      const archivedNote = await this.notesRepository.save(note);

      return resSuccess(
        'Note Archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
