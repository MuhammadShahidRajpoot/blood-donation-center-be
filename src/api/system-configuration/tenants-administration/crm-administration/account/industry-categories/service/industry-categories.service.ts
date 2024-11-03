import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, Not, IsNull, In } from 'typeorm';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { resError } from '../../../../../helpers/response';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { IndustryCategories } from '../entities/industry-categories.entity';
import {
  CreateIndustryCategoriesDto,
  UpdateIndustryCategoriesDto,
} from '../dto/industry-categories.dto';
import { GetAllIndustryCategoriesInterface } from '../interface/industry-categories.interface';
import { IndustryCategoriesHistory } from '../entities/industry-categories-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class IndustryCategoriesService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(IndustryCategories)
    private readonly industryCategoriesRepository: Repository<IndustryCategories>,
    @InjectRepository(IndustryCategoriesHistory)
    private readonly industryCategoriesHistoryRepository: Repository<IndustryCategoriesHistory>,
    private readonly entityManager: EntityManager
  ) {}

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
    const take: any = limit < 10 ? 10 : limit;
    const skip: any = (page - 1) * limit;

    return { skip, take };
  }

  /**
   * insert data in history table
   * when entity update , archive  and deleted
   * @param industryCategories
   * @param action
   */

  /**
   * create new Industry Category
   * @param createIndustryCategoriesDto
   * @returns
   */
  async create(createIndustryCategoriesDto: CreateIndustryCategoriesDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.entityExist(
        this.userRepository,
        { where: { id: createIndustryCategoriesDto?.created_by } },
        'User'
      );

      const createIndustryCategories = new IndustryCategories();
      const keys = Object.keys(createIndustryCategoriesDto);

      for (const key of keys) {
        createIndustryCategories[key] = createIndustryCategoriesDto?.[key];
      }
      createIndustryCategories.tenant_id = this.request.user?.tenant?.id;

      // Save the Industry Categories entity
      const savedIndustryCategories = await queryRunner.manager.save(
        createIndustryCategories
      );
      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Industry Category Created Successfully',
        status_code: 201,
        data: savedIndustryCategories,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * get all Industry Categories records
   * @param getAllIndustryCategoriesInterface
   * @returns {industryCategories}
   */
  async findAll(
    getAllIndustryCategoriesInterface: GetAllIndustryCategoriesInterface
  ) {
    try {
      const fetchAll = getAllIndustryCategoriesInterface?.fetchAll === 'true';
      const sortName = getAllIndustryCategoriesInterface?.sortName;
      const sortBy = getAllIndustryCategoriesInterface?.sortBy;
      const parent_id = getAllIndustryCategoriesInterface?.parent_id;
      const includeSubcategories =
        getAllIndustryCategoriesInterface?.subCategories === 'true';
      const includeCategories =
        getAllIndustryCategoriesInterface?.categories === 'true';

      if ((sortName && !sortBy) || (sortBy && !sortName)) {
        return resError(
          `When selecting sort SortBy & SortName is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (includeSubcategories && includeCategories) {
        return resError(
          `Only one of subcategories or category can be true at a time.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      let response;
      let count;

      const sorting: { [key: string]: 'ASC' | 'DESC' } = {};
      if (sortName && sortBy) {
        sortName == 'parent_id'
          ? Object.assign(sorting, {
              parent_id: {
                name: sortBy,
              },
            })
          : (sorting[sortName] = sortBy.toUpperCase() as 'ASC' | 'DESC');
      } else {
        sorting['id'] = 'DESC';
      }

      const whereClause = this.buildWhereClause(
        getAllIndustryCategoriesInterface
      );

      if (fetchAll) {
        [response, count] =
          await this.industryCategoriesRepository.findAndCount({
            where:
              includeSubcategories && parent_id === undefined
                ? { ...whereClause, parent_id: Not(IsNull()) }
                : includeCategories
                ? { ...whereClause, parent_id: IsNull() }
                : whereClause, // Add this line
            order: sorting,
            relations: ['created_by', 'parent_id'],
          });
      } else {
        const limit: number = getAllIndustryCategoriesInterface?.limit
          ? +getAllIndustryCategoriesInterface.limit
          : +process.env.PAGE_SIZE;

        const page = getAllIndustryCategoriesInterface?.page
          ? +getAllIndustryCategoriesInterface.page
          : 1;

        [response, count] =
          await this.industryCategoriesRepository.findAndCount({
            where: includeSubcategories
              ? { ...whereClause, parent_id: Not(IsNull()) }
              : includeCategories
              ? { ...whereClause, parent_id: IsNull() }
              : whereClause, // Add this line
            take: limit,
            skip: (page - 1) * limit,
            order: sorting,
            relations: ['created_by', 'parent_id'],
          });
      }

      return {
        status: HttpStatus.OK,
        response: 'Industry category fetched successfully.',
        count: count,
        data: response,
      };
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getSubIndustryCategory(id: any) {
    const message = 'Sub Industry Categories';
    try {
      const subIndustryCategories =
        await this.industryCategoriesRepository.find({
          where: {
            parent_id: In([id]),
            is_active: true,
            is_archive: false,
          },
          order: { ['name']: 'ASC' },
        });
      return {
        status: HttpStatus.OK,
        message: `${message} Fetched Successfully`,
        data: subIndustryCategories,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   *
   * @param id
   * @returns {IndustryCategory}
   */
  async findOne(id: any) {
    const message = 'Industry Categories';
    const query = {
      where: {
        id,
        is_archive: false,
      },
      relations: ['created_by', 'parent_id'],
    };
    const industryCategories: any = await this.entityExist(
      this.industryCategoriesRepository,
      query,
      message
    );

    if (industryCategories) {
      const modifiedData: any = await getModifiedDataDetails(
        this.industryCategoriesHistoryRepository,
        id,
        this.userRepository
      );
      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      industryCategories.modified_by = industryCategories.created_by;
      industryCategories.modified_at = industryCategories.created_at;
      industryCategories.created_at = modified_at
        ? modified_at
        : industryCategories.created_at;
      industryCategories.created_by = modified_by
        ? modified_by
        : industryCategories.created_by;
    }

    return {
      status: HttpStatus.OK,
      message: `${message} Fetched Successfully`,
      data: industryCategories,
    };
  }

  /**
   * update record
   * insert data in history table
   * @param id
   * @param updateIndustryCategoriesDto
   * @returns
   */
  async update(
    id: any,
    updateIndustryCategoriesDto: UpdateIndustryCategoriesDto,
    req: any
  ) {
    try {
      const query = {
        where: {
          id,
          is_archive: false,
        },
        relations: {
          created_by: true,
        },
      };
      const industryCategories: any = await this.entityExist(
        this.industryCategoriesRepository,
        query,
        'Industry Category'
      );
      await this.entityExist(
        this.userRepository,
        { where: { id: updateIndustryCategoriesDto?.created_by } },
        'User'
      );
      Object.assign(industryCategories, updateIndustryCategoriesDto);
      industryCategories.created_by = this.request?.user;
      industryCategories.created_at = new Date();
      const savedIndustryCategories =
        await this.industryCategoriesRepository.save(industryCategories);

      delete savedIndustryCategories?.created_by;
      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Industry Category Updated Successfully',
        data: savedIndustryCategories,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async archive(id: any, req: any) {
    try {
      const query = {
        where: {
          id,
          is_archive: false,
        },
        relations: {
          created_by: true,
        },
      };
      const exists: any = await this.entityExist(
        this.industryCategoriesRepository,
        query,
        'Industry Categories'
      );
      const { created_at, created_by, is_archive, ...industryCategories } =
        exists;
      industryCategories['is_archive'] = !is_archive;
      industryCategories['created_by'] = this.request?.user;
      industryCategories['created_at'] = new Date();
      const updatedIndustryCategories =
        await this.industryCategoriesRepository.save(industryCategories);

      delete updatedIndustryCategories?.created_by;
      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Industry Category Archive Successfully',
        data: null,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  // Helper method to build the 'where' object based on the interface properties
  private buildWhereClause(
    getAllIndustryCategoriesInterface: GetAllIndustryCategoriesInterface
  ) {
    const where = {
      tenant_id: this.request.user?.tenant?.id,
    };
    const parent_id = getAllIndustryCategoriesInterface?.parent_id;

    if (getAllIndustryCategoriesInterface?.name) {
      Object.assign(where, {
        name: ILike(`%${getAllIndustryCategoriesInterface.name}%`),
      });
    }

    if (getAllIndustryCategoriesInterface?.status) {
      Object.assign(where, {
        is_active: getAllIndustryCategoriesInterface.status,
      });
    }

    Object.assign(where, {
      is_archive: false,
    });

    Object.assign(where, {
      tenant: { id: this.request.user?.tenant?.id },
    });

    if (
      parent_id !== undefined &&
      getAllIndustryCategoriesInterface?.subCategories
    ) {
      Object.assign(where, {
        parent_id: { id: parent_id },
      });
    }

    return where;
  }
}
