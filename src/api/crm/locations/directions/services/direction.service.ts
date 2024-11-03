import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, ILike, DeepPartial, Equal, Not } from 'typeorm';
import * as dotenv from 'dotenv';
import { CreateDirectionsDto } from '../dto/create-direction.dto';
import { Directions } from '../entities/direction.entity';
import { BusinessUnits } from '../../../../system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import {
  resError,
  resSuccess,
} from '../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../system-configuration/constants/error.constants';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Tenant } from '../../../../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import {
  GetAllDirectionsInterface,
  GetDirectionCollectionOperationInterface,
} from '../interface/directions.interface';
import { DirectionsHistory } from '../entities/direction-history.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { UpdateDirectionsDto } from '../dto/update-direction.dto';
import { CrmLocations } from '../../entities/crm-locations.entity';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { HistoryService } from 'src/api/common/services/history.service';
import { addressExtractionFilter } from 'src/api/common/services/addressExtraction.service';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Facility } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

dotenv.config();
@Injectable()
export class DirectionsService extends HistoryService<DirectionsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Directions)
    private readonly directionRepository: Repository<Directions>,
    @InjectRepository(DirectionsHistory)
    private readonly directionsHistoryRepository: Repository<DirectionsHistory>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(CrmLocations)
    private readonly locationsRepository: Repository<CrmLocations>,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelRepository: Repository<OrganizationalLevels>
  ) {
    super(directionsHistoryRepository);
  }

  async create(createDirectionsDto: CreateDirectionsDto, req: any) {
    try {
      const {
        direction,
        miles,
        minutes,
        collection_operation_id,
        location_id,
        is_active,
      } = createDirectionsDto;
      const directionData = await this.directionRepository.findOne({
        where: {
          direction: direction,
          is_archived: false,
        },
      });

      if (directionData) {
        return resError(
          `Direction already exists!`,
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

      const location = await this.locationsRepository.findOneBy({
        id: location_id,
      });
      if (!location) {
        return resError(
          `Location not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnit: any = await this.businessUnitsRepository.findOneBy({
        id: collection_operation_id,
      });
      if (!businessUnit) {
        return resError(
          `Collection Operation not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const createDirection = new Directions();

      createDirection.direction = direction;
      createDirection.miles = miles;
      createDirection.minutes = minutes;
      createDirection.collection_operation_id = businessUnit;
      createDirection.location_id = location;
      createDirection.created_by = user;
      createDirection.tenant_id = tenant?.id;
      createDirection.is_active = is_active ?? true;

      const saveDirection = await this.directionRepository.save(
        createDirection
      );

      return {
        status: 'success',
        response: 'Direction Created Successfully',
        status_code: 201,
        data: saveDirection,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findAll(getAllDirectionsInterface: GetAllDirectionsInterface) {
    const fetchAll = getAllDirectionsInterface?.fetchAll === true;
    const sortName = getAllDirectionsInterface?.sortName;
    const sortBy = getAllDirectionsInterface?.sortOrder;
    const location_id = getAllDirectionsInterface?.location_id;
    const collection_operation_id =
      getAllDirectionsInterface.collection_operation_id;

    if ((sortName && !sortBy) || (sortBy && !sortName)) {
      return resError(
        `When selecting sort SortBy & SortName is required.`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }

    const location = await this.locationsRepository.findOneBy({
      id: location_id,
    });
    if (!location) {
      return resError(
        `Location not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    let response = [];
    let count = 0;

    const sorting: { [key: string]: 'ASC' | 'DESC' | object } = {};
    if (sortName && sortBy) {
      if (sortName === 'direction_collection_operation') {
        sorting['collection_operation_id'] = {
          name: sortBy.toUpperCase() as 'ASC' | 'DESC',
        };
      } else {
        sorting[sortName] = sortBy.toUpperCase() as 'ASC' | 'DESC';
      }
    } else {
      sorting['id'] = 'DESC';
    }
    const limit: number = getAllDirectionsInterface?.limit
      ? +getAllDirectionsInterface.limit
      : +process.env.PAGE_SIZE;

    const page = getAllDirectionsInterface?.page
      ? +getAllDirectionsInterface.page
      : 1;

    if (fetchAll) {
      [response, count] = await this.directionRepository.findAndCount({
        where: {
          is_archived: false,
          location_id: {
            id: location_id,
          },
          ...(collection_operation_id && {
            collection_operation_id: {
              id: In(collection_operation_id),
            },
          }),
          ...(getAllDirectionsInterface?.is_active && {
            is_active: getAllDirectionsInterface?.is_active,
          }),
        },
        order: sorting,
        //
        relations: ['created_by', 'collection_operation_id', 'location_id'],
      });
    } else {
      [response, count] = await this.directionRepository.findAndCount({
        where: {
          is_active: getAllDirectionsInterface?.is_active,
          is_archived: false,
          location_id: {
            id: location_id,
          },
          ...(collection_operation_id && {
            collection_operation_id: {
              id: In(collection_operation_id),
            },
          }),
          ...(getAllDirectionsInterface?.keyword && {
            direction: ILike(`%${getAllDirectionsInterface?.keyword}%`),
          }),
        },
        take: limit,
        skip: (page - 1) * limit,
        order: sorting,
        relations: ['created_by', 'collection_operation_id', 'location_id'],
      });
    }

    return {
      status: HttpStatus.OK,
      response: 'Directions Fetched',
      count: count,
      data: response,
    };
  }

  async findOne(id: any, req: any) {
    try {
      const direction: any = await this.directionRepository.findOne({
        where: { id },
        relations: ['created_by', 'collection_operation_id'],
      });

      if (!direction) {
        return resError(
          `Direction not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (direction?.is_archived) {
        return resError(
          `Direction is archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const results = await this.directionRepository.findOne({
        where: { id },
        select: ['created_at', 'created_by', 'id', 'location_id'],
      });

      // const array: any = [];
      // array.push(results?.location_id?.id);

      // const data:any = await addressExtractionFilter(
      //   `${PolymorphicType.CRM_LOCATIONS}`,
      //   array,
      //   results?.location_id,
      //   req?.user?.id,
      //   null,
      //   null,
      //   null,
      //   this.addressRepository
      // );

      // console.log(data[0])
      // results = {
      //   ...results,
      //   location_id:{
      //     ...results.location_id,
      //     ...data[0]
      //   }
      // };

      if (direction) {
        const modifiedData: any = await getModifiedDataDetails(
          this.directionsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        direction.modified_by = direction.created_by;
        direction.modified_at = direction.created_at;
        direction.created_at = modified_at ? modified_at : direction.created_at;
        direction.created_by = modified_by ? modified_by : direction.created_by;
      }

      return resSuccess(
        'Direction fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...direction }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateDirectionDto: UpdateDirectionsDto, req: any) {
    try {
      const {
        direction,
        miles,
        minutes,
        collection_operation_id,
        location_id,
        is_active,
      } = updateDirectionDto;

      const locationDirection = await this.directionRepository.findOne({
        where: { id },
        relations: ['created_by', 'tenant', 'collection_operation_id'],
      });

      const directionBeforeUpdate: any = { ...locationDirection };

      if (!locationDirection) {
        return resError(
          `Direction does not exist!`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (locationDirection.is_archived) {
        return resError(
          `Direction is archived and cannot be updated!`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (collection_operation_id) {
        const collection_operation =
          await this.businessUnitsRepository.findOneBy({
            id: collection_operation_id,
          });

        if (!collection_operation_id) {
          return resError(
            `Collection Operation Does not exist!`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }

        locationDirection.collection_operation_id = collection_operation;
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

      locationDirection.direction = direction ?? locationDirection.direction;
      locationDirection.miles = miles ?? locationDirection.miles;
      locationDirection.minutes = minutes ?? locationDirection.minutes;
      // locationDirection.is_active = is_active ?? note.is_active;
      locationDirection.collection_operation_id =
        collection_operation_id ?? locationDirection.collection_operation_id;

      locationDirection.is_active = is_active ?? locationDirection.is_active;
      locationDirection.created_at = new Date();
      locationDirection.created_by = this.request?.user;

      const updatedDirection = await this.directionRepository.save(
        locationDirection
      );
      delete locationDirection?.created_by?.tenant;
      // const directionHistory: any = new DirectionsHistory();
      // directionHistory.miles = directionBeforeUpdate?.miles;
      // directionHistory.id = directionBeforeUpdate?.id;
      // directionHistory.direction = directionBeforeUpdate?.direction;
      // directionHistory.minutes = directionBeforeUpdate?.minutes;
      // directionHistory.created_by = req?.user?.id;
      // directionHistory.tenant_id = directionBeforeUpdate?.tenant_id?.id;
      // directionHistory.history_reason = 'C';
      // directionHistory.is_archived = directionBeforeUpdate?.is_archived;
      // directionHistory.collection_operation_id =
      //   directionBeforeUpdate?.collection_operation_id?.id;
      // await this.createHistory(directionHistory);
      return resSuccess(
        'Direction Updated Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedDirection
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, req: any) {
    try {
      const direction: any = await this.directionRepository.findOne({
        where: { id },
        relations: ['created_by', 'tenant', 'collection_operation_id'],
      });

      if (!direction) {
        return resError(
          `Direction not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (direction.is_archived) {
        return resError(
          `Direction is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      direction.is_archived = true;
      direction.created_at = new Date();
      direction.created_by = this.request?.user;
      const archivedDirection = await this.directionRepository.save(direction);
      // let directionHistory: any = new DirectionsHistory();
      // directionHistory.miles = direction?.miles;
      // directionHistory.id = direction?.id;
      // directionHistory.direction = direction?.direction;
      // directionHistory.minutes = direction?.minutes;
      // directionHistory.created_by = req?.user?.id;
      // directionHistory.tenant_id = direction?.tenant_id?.id;
      // directionHistory.history_reason = 'C';
      // directionHistory.is_archived = true;
      // directionHistory.collection_operation_id =
      //   direction?.collection_operation_id?.id;

      // await this.createHistory(directionHistory);
      // directionHistory = new DirectionsHistory();
      // directionHistory.miles = direction?.miles;
      // directionHistory.id = direction?.id;
      // directionHistory.direction = direction?.direction;
      // directionHistory.minutes = direction?.minutes;
      // directionHistory.created_by = req?.user?.id;
      // directionHistory.tenant_id = direction?.tenant_id?.id;
      // directionHistory.history_reason = 'D';
      // directionHistory.is_archived = true;
      // directionHistory.collection_operation_id =
      //   direction?.collection_operation_id?.id;
      // await this.createHistory(directionHistory);

      return resSuccess(
        'Direction Archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  // async saveHistory(affiliation: DirectionsHistory) {
  //   try {
  //     const history = new DirectionsHistory();
  //     history.direction = affiliation.direction;
  //     history.created_at = new Date();
  //     history.created_by = affiliation.created_by;
  //     history.miles = affiliation.miles;
  //     history.minutes = affiliation.minutes;
  //     history.id = affiliation.id;
  //     history.history_reason = affiliation.history_reason;
  //     history.is_archived = affiliation.is_archived;
  //     history.history_reason = affiliation.history_reason;

  //     await this.directionsHistoryRepository.save(history);
  //   } catch (error) {
  //     console.log(error);

  //     throw new Error('History storation failed!');
  //   }
  // }

  async collectionOperations(
    user: any,
    getDirectionCollectionOperationInterface: GetDirectionCollectionOperationInterface
  ) {
    console.log({ user }, 'dfngghhg');
    try {
      const directions = await this.directionRepository.find({
        where: {
          is_archived: false,
          tenant: { id: user.tenant.id },
          location_id: {
            id: getDirectionCollectionOperationInterface?.location_id,
          },
        },
        relations: ['collection_operation_id', 'location_id'],
      });

      let collectionOperationIds = directions.map(
        (direction: any) => direction?.collection_operation_id?.id
      );

      const Parent = await this.facilityRepository.find({
        where: {
          tenant: { id: user.tenant.id },
          is_archived: false,
          staging_site: true,
          status: true,
          collection_operation: { is_active: true, is_archived: false },
        },
        relations: ['collection_operation'],
      });

      let array = [];
      for (const per of Parent) {
        array.push(per.collection_operation.id);
      }
      array = [...new Set(array)];
      collectionOperationIds = [...new Set(collectionOperationIds)];
      const filteredArray = array.filter(
        (item) => !collectionOperationIds.includes(item)
      );

      const getCollectionOperation = await this.businessUnitsRepository.find({
        where: {
          id: In(filteredArray),
          organizational_level_id: {
            is_collection_operation: true,
          },
          is_active: true,
          is_archived: false,
          tenant: { id: user.tenant.id },
        },
        relations: ['organizational_level_id', 'tenant'],
      });
      return resSuccess(
        'Collection Operations fetched',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        getCollectionOperation
      );
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
