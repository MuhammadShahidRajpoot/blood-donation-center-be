import { GetAllRoomSizesInterface } from './../interface/roomSizes.interface';
import {
  Injectable,
  HttpStatus,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike } from 'typeorm';
import * as dotenv from 'dotenv';
import { CreateRoomSizeDto } from '../dto/create-room-sizes.dto';
import { RoomSize } from '../entity/roomsizes.entity';
import { RoomSizesHistory } from '../entity/roomSizesHistory.entity';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { HistoryService } from '../../../../../../common/services/history.service';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

dotenv.config();
@Injectable()
export class RoomSizesService extends HistoryService<RoomSizesHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(RoomSize)
    private readonly roomRepository: Repository<RoomSize>,
    @InjectRepository(RoomSizesHistory)
    private readonly roomRepositoryHistory: Repository<RoomSizesHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {
    super(roomRepositoryHistory);
  }

  /* create room */
  async create(createRoomSizeDto: CreateRoomSizeDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const user = await this.userRepository.findOneBy({
        id: createRoomSizeDto?.created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const roomSize: any = new RoomSize();
      roomSize.name = createRoomSizeDto?.name;
      roomSize.description = createRoomSizeDto?.description;
      roomSize.is_active = createRoomSizeDto?.is_active ?? true;
      roomSize.created_by = createRoomSizeDto?.created_by;
      roomSize.is_archived = false;
      roomSize.tenant_id = this.request.user?.tenant?.id;
      roomSize.tenant_id = this.request.user?.tenant?.id;
      const room = await this.roomRepository.save(roomSize);
      return resSuccess(
        'Room Created Successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        room
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
  /* get all rooms */
  async getAllRoomSizes(
    getAllRoomSizesInterface: GetAllRoomSizesInterface,
    user: any
  ) {
    try {
      const limit = Number(getAllRoomSizesInterface?.limit);
      const page = Number(getAllRoomSizesInterface?.page);
      const is_active = getAllRoomSizesInterface?.status?.toLocaleLowerCase();
      const search = getAllRoomSizesInterface?.search;
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
      const where: any = {};
      where.is_archived = false;
      if (is_active !== undefined) {
        where.is_active = is_active === 'true';
      }

      Object.assign(where, {
        tenant: { id: user?.tenant?.id },
      });

      if (search != undefined) {
        where.name = ILike(`%${search}%`);
      }
      const sorting: { [key: string]: 'ASC' | 'DESC' } = {};
      if (
        getAllRoomSizesInterface?.sortName &&
        getAllRoomSizesInterface?.sortOrder
      ) {
        sorting[getAllRoomSizesInterface?.sortName] =
          getAllRoomSizesInterface?.sortOrder.toUpperCase() as 'ASC' | 'DESC';
      }
      const [records, count] = await this.roomRepository.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        order: sorting,
      });
      return {
        total_records: count,
        page_number: page,
        totalPage: getTotalPage(count, limit),
        data: records,
      };
    } catch (error) {
      return resError(
        error,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  /* get by :id */
  async getRoom(id: any) {
    try {
      const RoomSize: any = await this.roomRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by'],
      });

      if (!RoomSize) {
        throw new NotFoundException('RoomSize not found');
      }

      if (RoomSize) {
        const modifiedData: any = await getModifiedDataDetails(
          this.roomRepositoryHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        RoomSize.modified_by = RoomSize.created_by;
        RoomSize.modified_at = RoomSize.created_at;
        RoomSize.created_at = modified_at ? modified_at : RoomSize.created_at;
        RoomSize.created_by = modified_by ? modified_by : RoomSize.created_by;
      }

      return RoomSize;
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Room size getRoom >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /* archive room :id */
  async archiveRoom(id: any, user: any) {
    const room: any = await this.roomRepository.findOne({
      where: {
        id,
        is_archived: false,
        tenant: {
          id: user.tenant.id,
        },
      },
      relations: ['created_by', 'tenant'],
    });

    if (!room) {
      throw new NotFoundException('RoomSize not found');
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      //console.log({ room });
      room.is_archived = true;
      room.created_at = new Date();
      room.created_by = this.request?.user;
      const archivedRoomSize = await this.roomRepository.save(room);

      Object.assign(archivedRoomSize, {
        tenant_id: archivedRoomSize?.tenant?.id,
      });

      delete archivedRoomSize?.created_by;
      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Room Archived.',
        status_code: 204,
        data: null,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Room size getRoom >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
  /* update room info */
  async updateRoomInfo(id: any, createRoomSizeDto: CreateRoomSizeDto) {
    const user = await this.userRepository.findOneBy({
      id: createRoomSizeDto?.created_by,
    });
    if (!user) {
      resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
    }
    const roomSize = await this.roomRepository.findOne({
      where: { id, is_archived: false },
      relations: ['created_by', 'tenant'],
    });
    if (!roomSize) {
      resError(
        `Room Size not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const dataToUpdate = {
        name: createRoomSizeDto?.name,
        description: createRoomSizeDto?.description,
        is_active: createRoomSizeDto?.is_active ?? true,
        is_archived: false,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      /* const resp = */ await this.roomRepository.update({ id: id }, {
        ...dataToUpdate,
      } as any);

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Changes Saved.',
        status_code: 204,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
