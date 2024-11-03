import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { HistoryService } from 'src/api/common/services/history.service';
import { AddressHistory } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/addressHistory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonFunction } from './common-functions';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class AddressService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(AddressHistory)
    private readonly entityHistoryRepository: Repository<AddressHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonFunction: CommonFunction,
    private readonly entityManager: EntityManager
  ) {}

  /**
   * Address new entity
   * @param addressDto
   * @returns
   */
  async createAddress(addressDto: any) {
    try {
      const create = new Address();
      const keys = Object.keys(addressDto);
      //set values in create obj
      for (const key of keys) {
        create[key] = addressDto?.[key];
      }
      // Save entity
      const saveObj = await this.addressRepository.save(create);
      return saveObj;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   * Address update entity
   * @param updateDto
   * @returns
   */
  async updateAddress(updateDto: any) {
    try {
      const { id, ...rest } = updateDto;
      const validId = id; // Convert id to BigInt
      const entity: any = await this.commonFunction.entityExist(
        this.addressRepository,
        { where: { id: validId } },
        'address'
      );

      // update entity
      Object.assign(entity, updateDto);
      entity.created_at = new Date();
      entity.created_by = this.request?.user;
      const updateData = await this.addressRepository.update(
        { id: validId },
        entity
      );
      return updateData;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
