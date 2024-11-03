import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, ILike, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateStaffLeaveDto } from '../dto/create-staff-leave.dto';
import {
  resError,
  resSuccess,
} from '../../../../../system-configuration/helpers/response';
import { SuccessConstants } from '../../../../../system-configuration/constants/success.constants';
import { ErrorConstants } from '../../../../../system-configuration/constants/error.constants';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from '../../../../../../common/interface/request';
import { pagination } from '../../../../../../common/utils/pagination';

import { StaffLeave } from '../entity/staff-leave.entity';
import { StaffLeaveHistory } from '../entity/staff-leave-history.entity';
import { Sort } from '../../../../../../common/interface/sort';
import { HistoryService } from '../../../../../common/services/history.service';
import { FilterStaffLeave } from '../interface/staff-leave.interface';
import { User } from '../../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { HistoryReason } from '../../../../../../common/enums/history_reason.enum';
import { UpdateStaffLeaveDto } from '../dto/update-staff-leave.dto';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { LeavesTypes } from 'src/api/system-configuration/staffing-administration/leave-type/entities/leave-types.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
@Injectable({ scope: Scope.REQUEST })
export class StaffLeaveService extends HistoryService<StaffLeaveHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(StaffLeave)
    private readonly staffLeaveRepository: Repository<StaffLeave>,
    @InjectRepository(StaffLeaveHistory)
    private readonly staffLeaveHistoryRepository: Repository<StaffLeaveHistory>,
    @InjectRepository(LeavesTypes)
    private readonly leavesTypesRepository: Repository<LeavesTypes>
  ) {
    super(staffLeaveHistoryRepository);
  }

  async create(createDto: CreateStaffLeaveDto) {
    try {
      const staff = await this.staffRepository.findOneBy({
        id: createDto.staff_id,
      });
      const type = await this.leavesTypesRepository.findOneBy({
        id: createDto.type_id,
      });
      if (!staff) {
        return resError(
          'Staff does not exist',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }
      const instance = await this.staffLeaveRepository.save(
        this.staffLeaveRepository.create({
          begin_date: createDto.begin_date,
          end_date: createDto.end_date,
          hours: createDto.hours,
          note: createDto.note,
          type: type,
          staff: staff,
          created_by: this.request.user,
          tenant: this.request.user?.tenant,
        })
      );
      return resSuccess(
        'Staff Leave is created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        instance
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async get(
    page: number,
    limit: number,
    keyword?: string,
    sortBy?: Sort,
    filters?: FilterStaffLeave
  ) {
    try {
      const { skip, take } =
        page && limit
          ? pagination(page, limit)
          : { skip: undefined, take: undefined };
      let where: any = {
        note: ILike(`%${keyword}%`),
        type_id: filters.type_id,
        staff_id: filters.staff_id,
        tenant_id: this.request.user?.tenant?.id,
        is_archived: false,
      };

      if (filters?.period === 'today') {
        const whereList = [];
        if (filters?.begin_date)
          whereList.push({ ...where, begin_date: Equal(filters.begin_date) });
        if (filters?.end_date)
          whereList.push({ ...where, end_date: Equal(filters.end_date) });
        where = whereList;
      } else {
        if (filters?.begin_date)
          where['begin_date'] = MoreThanOrEqual(filters.begin_date);
        if (filters?.end_date) where['end_date'] = LessThan(filters.end_date);
      }

      const query = {
        relations: ['staff', 'created_by', 'tenant', 'type'],
        where,
      };

      if (sortBy.sortName && sortBy.sortOrder) {
        query['order'] = {
          [sortBy.sortName]: sortBy.sortOrder,
        };
      }

      const [records, count] = await Promise.all([
        this.staffLeaveRepository.find({ ...query, skip, take }),
        this.staffLeaveRepository.count(query),
      ]);
      return resSuccess(
        'Staff Leave Records',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { count, records }
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getById(id: any) {
    try {
      const instance: any = await this.staffLeaveRepository.findOne({
        where: { id, is_archived: false },
        relations: ['staff', 'created_by', 'type'],
      });

      if (!instance) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      // const modifiedData = await this.getModifiedData(
      //   instance,
      //   this.userRepository
      // );
      if (instance) {
        const modifiedData: any = await getModifiedDataDetails(
          this.staffLeaveHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        instance.modified_by = instance.created_by;
        instance.modified_at = instance.created_at;
        instance.created_at = modified_at ? modified_at : instance.created_at;
        instance.created_by = modified_by ? modified_by : instance.created_by;
      }
      return resSuccess(
        'Staff Leave Record',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { ...instance }
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: bigint, user: any) {
    try {
      const instance = await this.staffLeaveRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user.tenant.id,
          },
        },
        relations: ['tenant'],
      });

      if (!instance) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      // const history = this.staffLeaveHistoryRepository.create({
      //   ...instance,
      //   history_reason: HistoryReason.D,
      //   created_at: new Date(),
      //   created_by: this.request.user?.id,
      // });

      instance.is_archived = true;
      instance.created_at = new Date();
      instance.created_by = this.request?.user;
      const archiveStaffLeave = await this.staffLeaveRepository.save(instance);

      Object.assign(archiveStaffLeave, {
        tenant_id: archiveStaffLeave.tenant.id,
      });
      // await this.createHistory(history);

      return resSuccess(
        'Staff Leave is archived',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async edit(id: bigint, updateDto: UpdateStaffLeaveDto) {
    try {
      const instance = await this.staffLeaveRepository.findOne({
        where: { id, is_archived: false },
      });

      if (!instance) {
        return resError(
          'Not Found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      // const history = this.staffLeaveHistoryRepository.create({
      //   ...instance,
      //   history_reason: HistoryReason.C,
      //   created_at: new Date(),
      //   created_by: this.request.user?.id,
      // });

      // update certification
      instance.begin_date = updateDto.begin_date;
      instance.end_date = updateDto.end_date;
      instance.hours = updateDto.hours;
      instance.note = updateDto.note;
      instance.type_id = updateDto.type_id;
      instance.created_at = new Date();
      instance.created_by = this.request?.user;

      this.staffLeaveRepository.save(instance);

      // create certification history
      // await this.createHistory(history);

      return resSuccess(
        'Changes Saved.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        instance
      );
    } catch (error) {
      console.error(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
