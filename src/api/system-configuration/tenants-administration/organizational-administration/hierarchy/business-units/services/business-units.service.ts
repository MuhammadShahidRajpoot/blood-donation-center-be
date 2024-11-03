import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, Equal, In, IsNull } from 'typeorm';
import { User } from '../../../../../tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from '../../../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import { SuccessConstants } from '../../../../../../system-configuration/constants/success.constants';
import {
  BusinessUnitDto,
  GetAllBusinessUnitDto,
} from '../dto/business-units.dto';
import { BusinessUnits } from '../entities/business-units.entity';
import { OrganizationalLevels } from '../../organizational-levels/entities/organizational-level.entity';
import { Tenant } from '../../../../../platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { HistoryService } from '../../../../../../common/services/history.service';
import { BusinessUnitsHistory } from '../entities/business-units-history.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { QueryBusinessUnitDto } from '../dto/query-business-units.dto';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';

@Injectable()
export class BusinessUnitsService extends HistoryService<BusinessUnitsHistory> {
  constructor(
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(UserBusinessUnits)
    private readonly userBusinessUnitsRepository: Repository<UserBusinessUnits>,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelRepository: Repository<OrganizationalLevels>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(BusinessUnitsHistory)
    private readonly businessUnitsHistoryRepository: Repository<BusinessUnitsHistory>
  ) {
    super(businessUnitsHistoryRepository);
  }

  async create(businessUnitsDto: BusinessUnitDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: businessUnitsDto?.created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const tenant = await this.tenantRepository.findOne({
        where: { id: businessUnitsDto?.tenant_id },
      });

      if (!tenant) {
        resError(
          `Tenant not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnitsWithSameName =
        await this.businessUnitsRepository.findOne({
          where: {
            name: ILike(businessUnitsDto.name),
            tenant: { id: tenant.id },
            is_archived: false,
          },
        });

      if (businessUnitsWithSameName) {
        resError(
          `Business already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      let parentLevel = null;
      if (businessUnitsDto?.parent_level_id) {
        parentLevel = await this.businessUnitsRepository.findOne({
          where: { id: businessUnitsDto?.parent_level_id },
        });

        if (!parentLevel) {
          resError(
            `Parent Business Unit not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }
      }

      const organizationalLevel =
        await this.organizationalLevelRepository.findOne({
          where: { id: businessUnitsDto?.organizational_level_id },
        });

      if (!organizationalLevel) {
        resError(
          `Organizational Level not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnits: any = new BusinessUnits();

      businessUnits.name = businessUnitsDto.name;
      businessUnits.is_active = businessUnitsDto.is_active;
      businessUnits.created_by = businessUnitsDto.created_by;
      businessUnits.parent_level = parentLevel;
      businessUnits.organizational_level_id = organizationalLevel;
      businessUnits.tenant_id = tenant;
      businessUnits.is_archived = false;

      const savedBusinessUnits = await this.businessUnitsRepository.save(
        businessUnits
      );

      return resSuccess(
        'Business Unit Created Successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...savedBusinessUnits, tenant_id: tenant?.id }
      );
    } catch (error) {
      // return error
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Business units create >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async listAll(user: User, query: QueryBusinessUnitDto) {
    const userBusinessUnits = await this.userBusinessUnitsRepository.find({
      where: {
        user_id: <any>{ id: user.id },
        tenant_id: <any>user.tenant?.id,
        is_archived: false,
      },
      relations: ['user_id', 'business_unit_id'],
    });
    const buQuery = this.businessUnitsRepository
      .createQueryBuilder('bu')
      .leftJoinAndSelect(
        'bu.organizational_level_id',
        'ol',
        'ol.is_archived = false'
      )
      .leftJoinAndSelect(
        'bu.parent_level',
        'parent',
        'parent.is_archived = false'
      )
      .addSelect('bu.tenant', 'tenant_id')
      .addSelect(
        `CASE
          WHEN bu.id IN (${userBusinessUnits
            .map((bu) => bu.business_unit_id['id'])
            .join(',')}) THEN TRUE
          ELSE FALSE
        END`,
        'checked'
      )
      .where({ is_archived: false, tenant: { id: user.tenant?.id } })
      .groupBy('bu.id, parent.id, ol.id')
      .orderBy('parent.id', 'DESC');

    if (query?.status) {
      buQuery.andWhere({
        is_active: query.status === 'true',
      });
    }
    if (query?.organizational_level_id) {
      buQuery.andWhere('ol.id = :ol_id', {
        ol_id: query.organizational_level_id,
      });
    }
    if (query?.parent_level_id === 'null') {
      buQuery.andWhere('parent IS NULL');
    } else if (query?.parent_level_id) {
      buQuery.andWhere('parent.id = :parent_id', {
        parent_id: query.parent_level_id,
      });
    }
    if (query?.donor_centers && query?.donor_centers === 'true') {
      buQuery
        .leftJoin(
          'facility',
          'facility',
          'bu.id = facility.collection_operation AND facility.is_archived = false AND facility.status = true AND facility.donor_center = true'
        )
        .addSelect(
          `COALESCE(JSON_AGG(json_build_object('id', facility.id, 'name', facility.name)) FILTER (WHERE facility.id IS NOT NULL), '[]'::json)`,
          'donor_centers'
        );
    }
    if (query?.recruiters && query?.recruiters === 'true') {
      const userQuery = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect(
          'user.role',
          'role',
          'role.is_archived = false AND role.is_recruiter = true'
        )
        .leftJoin(
          'user_business_units',
          'user_bu',
          'user.id = user_bu.user_id AND user_bu.is_archived = false'
        )
        .addSelect('user.tenant_id', 'tenant_id')
        .addSelect(
          `COALESCE(
            ARRAY_AGG("user_bu"."business_unit_id") FILTER (WHERE "user_bu"."business_unit_id" IS NOT NULL),
            ARRAY[]::bigint[]
          )`,
          'bu_ids'
        )
        .where(
          'user.is_archived = false AND user.is_active = true AND role.id IS NOT NULL'
        )
        .groupBy('user.id, role.id');
      buQuery.addSelect(
        `COALESCE(
          (
            SELECT JSON_AGG(users) 
            FILTER (WHERE "bu"."id" = ANY(users.bu_ids) AND users.user_id IS NOT NULL)
            FROM (${userQuery.getQuery()}) AS users
          ), 
          '[]' :: json
        )`,
        'recruiters'
      );
    }

    const [result, count] = await Promise.all([
      buQuery.getRawMany(),
      buQuery.getCount(),
    ]);

    return resSuccess(
      'Business Unit fetched Successfully',
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      result,
      count
    );
  }

  async getAlltBusinessUnits(getAllFacilitiesInterface: GetAllBusinessUnitDto) {
    try {
      const { keyword, sortOrder } = getAllFacilitiesInterface;
      const limit = Number(getAllFacilitiesInterface?.limit);
      let page = Number(getAllFacilitiesInterface?.page);

      const parent_level_id = Number(
        getAllFacilitiesInterface?.parent_level_id
      );
      const organizational_level_id = Number(
        getAllFacilitiesInterface?.organizational_level_id
      );
      const getTotalPage = (totalData: number, limit: number) => {
        return Math.ceil(totalData / limit);
      };
      if (page <= 0) {
        resError(
          `page must of positive integer`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const where: any = {
        is_archived: false,
        tenant: { id: getAllFacilitiesInterface.tenant_id },
      };
      if (
        getAllFacilitiesInterface.status != undefined &&
        getAllFacilitiesInterface.status != ''
      ) {
        const status =
          getAllFacilitiesInterface?.status?.toLocaleLowerCase() != 'false';
        where.is_active = status;
      }

      if (
        getAllFacilitiesInterface.is_collection_operation != undefined &&
        getAllFacilitiesInterface.is_collection_operation != ''
      ) {
        const is_collection_operation =
          getAllFacilitiesInterface?.is_collection_operation?.toLocaleLowerCase() !=
          'false';
        where.organizational_level_id = {
          is_collection_operation: is_collection_operation,
        };
      }

      if (parent_level_id !== undefined && !Number.isNaN(parent_level_id)) {
        where.parent_level = Equal(parent_level_id);
      }

      if (
        organizational_level_id !== undefined &&
        !Number.isNaN(organizational_level_id)
      ) {
        where.organizational_level_id = Equal(organizational_level_id);
      }

      if (keyword != undefined) {
        page = 1;
        where.name = ILike(`%${keyword}%`);
      }

      let order: any = { name: 'ASC' }; // Default order

      if (getAllFacilitiesInterface?.sortBy) {
        // Allow sorting by different columns

        if (getAllFacilitiesInterface?.sortBy == 'parent_level_id') {
          const orderBy = getAllFacilitiesInterface.sortBy;
          const orderDirection = getAllFacilitiesInterface.sortOrder || 'DESC';
          order = { parent_level: { name: orderDirection } };
        } else if (
          getAllFacilitiesInterface?.sortBy == 'organizational_level_id'
        ) {
          const orderBy = getAllFacilitiesInterface.sortBy;
          const orderDirection = getAllFacilitiesInterface.sortOrder || 'DESC';
          order = { organizational_level_id: { name: orderDirection } };
        } else if (getAllFacilitiesInterface?.sortBy == 'is_active') {
          const orderBy = getAllFacilitiesInterface.sortBy;
          const orderDirection = getAllFacilitiesInterface.sortOrder || 'DESC';
          order = { [orderBy]: orderDirection };
        } else {
          const orderBy = getAllFacilitiesInterface.sortBy;
          const orderDirection = getAllFacilitiesInterface.sortOrder || 'DESC';
          order = { [orderBy]: orderDirection };
        }
      }
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = page && limit ? limit : undefined;

      const queryBuilder = await this.businessUnitsRepository
        .createQueryBuilder('business_units')
        .leftJoinAndSelect(
          'business_units.organizational_level_id',
          'organizational_level_id'
        )
        .addSelect(`LOWER(business_units.name)`, 'lower_sort_field')
        .leftJoinAndSelect('business_units.parent_level', 'parent_level')
        .where(where)
        .orderBy('lower_sort_field', sortOrder === 'ASC' ? 'ASC' : 'DESC')
        .skip(skip)
        .take(take);

      const [records, count] = await queryBuilder.getManyAndCount();

      return {
        total_records: count,
        page_number: page,
        totalPage: getTotalPage(count, limit),
        data: records,
      };
    } catch (error) {
      return [];
    }
  }

  async getUserCollectionOperations(user: any, id = null, isFilter = null) {
    try {
      // check if only collection operations of a specific recruiter are required
      const recruiterId = id && id !== 'undefined' ? id : user?.id;
      // fetch user data to get assgined business units
      const userData: any = await this.userRepository.findOne({
        where: {
          id: recruiterId,
          tenant: { id: user?.tenant?.id },
        },
        relations: [
          'role',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
          'tenant',
        ],
      });

      const where: any = { is_archived: false };

      // if collection operations are being fetched for filter dropdown, send in-active ones as well
      if (!isFilter) {
        where['is_active'] = true;
      }

      // define array to hold collection operation business units in the hierarchy
      let businessUnits: any = [];
      const userBusinessUnitIds = userData?.business_units?.map(
        (bu) => bu.business_unit_id.id
      );

      // check if user has any business units assigned or has auto created role
      if (userBusinessUnitIds.length || userData?.role?.is_auto_created) {
        let parentBusinessUnits = userBusinessUnitIds;

        // if user has auto created role assigned,
        if (userData?.role?.is_auto_created) {
          // fetch all regions in the tenant to show all collection operations in the hierarchy
          const businessUnitData = await this.businessUnitsRepository.find({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              parent_level: null,
            },
          });
          // and use their ids as parent business units to go down the hierarchy from
          parentBusinessUnits = businessUnitData.map(
            (businessUnit) => businessUnit.id
          );
        }

        // start an infinite loop to cater hierarchy of any levels
        while (true) {
          // let parentLevelCondition;
          // console.log(
          //   'parentBusinessUnits?.length',
          //   parentBusinessUnits?.length
          // );
          // if (parentBusinessUnits?.length) {
          //   parentLevelCondition = In(parentBusinessUnits);
          // } else {
          //   parentLevelCondition = null;
          // }
          // fetch child business units of parent business units defined above
          const businessUnitData = await this.businessUnitsRepository.find({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              parent_level: In(parentBusinessUnits),
            },
            relations: ['parent_level', 'tenant', 'organizational_level_id'],
          });
          // eslint-disable-next-line
          var nulldata = await this.businessUnitsRepository.find({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              parent_level: IsNull(),
            },
            relations: ['parent_level', 'tenant', 'organizational_level_id'],
          });

          console.log('nulldata.length', nulldata.length);

          // if there are child business units
          if (businessUnitData?.length) {
            // extract collection operations from those child business units
            const collectionOperations = businessUnitData.map(
              (businessUnit) =>
                businessUnit.organizational_level_id.is_collection_operation
            );
            // if collection operations are indeed among the child business units
            if (collectionOperations.includes(true)) {
              // check if all of them are collection operations
              if (collectionOperations.every(Boolean)) {
                // assign all collection operation
                businessUnits = businessUnitData;
                // and break the loop as all collection operations are fetched
                break;
                // if some business units are collection operation and not all
              } else {
                // separate out collection operation business units
                const collectionOperationBusinessUnits =
                  businessUnitData.filter(
                    (businessUnit) =>
                      businessUnit.organizational_level_id
                        .is_collection_operation
                  );
                const collectionOperationMappedIds =
                  collectionOperationBusinessUnits.map(
                    (businessUnit) => businessUnit.id
                  );
                const businessUnitMappedIds = businessUnits.map(
                  (businessUnit) => businessUnit.id
                );
                // check if separated out collection operations are already assigned
                if (
                  !collectionOperationMappedIds.some((bu) =>
                    businessUnitMappedIds.includes(bu)
                  )
                ) {
                  // assgin them if not already
                  businessUnits = businessUnits.concat(
                    collectionOperationBusinessUnits
                  );
                }

                // separate out non collection operation business units
                const nonCollectionOperationBusinessUnits =
                  businessUnitData.filter(
                    (businessUnit) =>
                      !businessUnit.organizational_level_id
                        .is_collection_operation
                  );
                // and assign them as parent business units for next iteration of recursion
                // to go down next level of hierarchy
                parentBusinessUnits = nonCollectionOperationBusinessUnits.map(
                  (businessUnit) => businessUnit.id
                );
              }
              // if no collection operations are among the child business units
            } else {
              const businessUnitMappedIds = businessUnitData.map(
                (businessUnit) => businessUnit.id
              );
              // check if those business units are already part of parent business units
              if (
                !businessUnitMappedIds.some((bu) =>
                  parentBusinessUnits.includes(bu)
                )
              ) {
                // if not, assign them as parent business units for next iteration of recursion
                // to go down next level of hierarchy
                parentBusinessUnits = businessUnitData.map(
                  (businessUnit) => businessUnit.id
                );
                // check if those business units are already part of parent business units
                // then it is self assigned case i.e. business unit is assign to itself as parent
                // break the loop
              } else {
                break;
              }
            }
            // if are no child business units then user is assigned collection operations as business units
          } else {
            // fetch business units assigned to user directly
            const businessUnitData: any =
              await this.businessUnitsRepository.find({
                where: {
                  ...where,
                  tenant: { id: userData?.tenant?.id },
                  id: In(userBusinessUnitIds),
                },
                relations: [
                  'parent_level',
                  'tenant',
                  'organizational_level_id',
                ],
              });
            const collectionOperations = businessUnitData.map(
              (businessUnit) =>
                businessUnit.organizational_level_id.is_collection_operation
            );
            // check and assign if all of them are collection operations
            if (collectionOperations.every(Boolean)) {
              businessUnits = businessUnitData;
            }
            // break the loop as either at this point collection operations are fetched
            // or hierarchy has no collection operations
            break;
          }
        }
      }
      const uniqueNulldata = nulldata.filter(
        (item) => !businessUnits.some((unit) => unit.id === item.id)
      );
      businessUnits.push(...uniqueNulldata);
      businessUnits.sort((a, b) => a.name.localeCompare(b.name));
      return resSuccess(
        SuccessConstants.SUCCESS,
        'Collection Operations fetched',
        HttpStatus.OK,
        businessUnits
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Business units getBusinessUnits >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getBusinessUnit(id: any) {
    try {
      if (!Number(id)) {
        resError(`Invalid Id`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const businessUnits: any = await this.businessUnitsRepository.findOne({
        where: {
          id: id as any,
        },
        relations: [
          'parent_level',
          'organizational_level_id',
          'created_by',
          'tenant',
        ],
      });

      if (businessUnits) {
        const modifiedData: any = await getModifiedDataDetails(
          this.businessUnitsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        businessUnits.modified_by = businessUnits.created_by;
        businessUnits.modified_at = businessUnits.created_at;
        businessUnits.created_at = modified_at
          ? modified_at
          : businessUnits.created_at;
        businessUnits.created_by = modified_by
          ? modified_by
          : businessUnits.created_by;
      }

      return { ...businessUnits };
    } catch (error) {
      return { error };
    }
  }

  async updateBusinessUnit(id: any, businessUnitsDto: BusinessUnitDto) {
    try {
      id = Number(id);
      // if (!id) {
      //   throw new HttpException(`User not found.`, HttpStatus.NOT_FOUND);
      // }

      const businessUnitData = await this.businessUnitsRepository.findOne({
        relations: [
          'created_by',
          'organizational_level_id',
          'parent_level',
          'tenant',
        ],
        where: { id: id },
      });

      let parent_level = null;
      if (businessUnitsDto?.parent_level_id) {
        parent_level = await this.businessUnitsRepository.findOne({
          where: { id: businessUnitsDto?.parent_level_id },
        });
      }
      if (!businessUnitData) {
        resError(
          `Business Unit not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnitsWithSameName =
        await this.businessUnitsRepository.findOne({
          where: {
            name: ILike(businessUnitsDto.name),
            tenant: { id: businessUnitsDto.tenant_id },
            is_archived: false,
          },
        });

      if (
        businessUnitsWithSameName &&
        businessUnitsWithSameName.id !== businessUnitData.id
      ) {
        resError(
          `Business already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const dataToUpdate = {
        name: businessUnitsDto?.name,
        organizational_level_id: businessUnitsDto?.organizational_level_id,
        tenant_id: businessUnitsDto?.tenant_id,
        parent_level: parent_level,
        is_active: businessUnitsDto?.is_active,
        created_by: businessUnitsDto?.created_by,
        created_at: new Date(),
      };

      await this.businessUnitsRepository.update(
        {
          id: id as any,
        },
        dataToUpdate as any
      );

      return resSuccess(
        '', // message
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Business units update >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archiveBusinessUnit(id: any, user: any) {
    try {
      const businessUnitToUpdate: any =
        await this.businessUnitsRepository.findOne({
          relations: [
            'created_by',
            'organizational_level_id',
            'parent_level',
            'tenant',
          ],
          where: {
            id: id,
            tenant: {
              id: user?.tenant?.id,
            },
          },
        });
      if (!businessUnitToUpdate) {
        resError(
          `Business Unit not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (
        businessUnitToUpdate?.organizational_level_id?.name ===
        'Collection Operation'
      ) {
        const collectionOperationRes = await this.businessUnitsRepository
          .createQueryBuilder('businessUnit')
          .innerJoinAndSelect(
            'equipments_collection_operations',
            'equipment',
            'businessUnit.id = equipment.collection_operation_id'
          )
          .where('businessUnit.id = :business_unit_id', {
            business_unit_id: businessUnitToUpdate?.id,
          })
          .andWhere('businessUnit.is_archived = :is_archived', {
            is_archived: false,
          })
          .getOne();

        if (collectionOperationRes != null) {
          resError(
            `You cant archive this since some records depend on it.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }

      if (businessUnitToUpdate.is_archived) {
        resError(
          `Business Unit is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      businessUnitToUpdate.is_archived = true;
      businessUnitToUpdate.created_at = new Date();
      businessUnitToUpdate.created_by = user?.id;
      businessUnitToUpdate.tenant_id = user?.tenanat_id;

      const archivedBusiness = await this.businessUnitsRepository.save(
        businessUnitToUpdate
      );

      return resSuccess(
        'Business Unit Archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Business units archive >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
