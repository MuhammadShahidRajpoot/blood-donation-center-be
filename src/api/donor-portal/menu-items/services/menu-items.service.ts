import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from '../helpers/api-response/api-response';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateMenuItemsDto, UpdateMenuItemsDto } from '../dto/menu-items.dto';
import { MenuItems } from '../entities/menu-items.entity';
import {
  GetMenuItemsInterface,
  GetSingleMenuItemInterface,
} from '../interface/menu-items.interface';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class MenuItemsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(MenuItems)
    private readonly menuItemsRepository: Repository<MenuItems>
  ) {}

  async addMenuItems(createMenuItemsDto: CreateMenuItemsDto) {
    try {
      const data = await this.menuItemsRepository.save(createMenuItemsDto);
      if (data) {
        return ApiResponse.success(
          'Menu Item Created Successfully',
          HttpStatus.CREATED,
          data
        );
      } else {
        return resError(
          `Internal Server Error`,
          ErrorConstants.Error,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (e) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllMenuItems(getMenuItemsInterface: GetMenuItemsInterface) {
    try {
      const limit: number = getMenuItemsInterface?.limit
        ? +getMenuItemsInterface?.limit
        : +process.env.PAGE_SIZE;

      const page = getMenuItemsInterface?.page
        ? +getMenuItemsInterface?.page
        : 1;

      const where = {};
      if (getMenuItemsInterface?.title) {
        Object.assign(where, {
          title: Like(`%${getMenuItemsInterface?.title}%`),
        });
      }

      const [response, count] = await this.menuItemsRepository.findAndCount({
        where,
        take: limit,
        skip: (page - 1) * limit,
        order: { id: 'DESC' },
      });

      if (count > 0) {
        return ApiResponse.success(
          'Menu Item Fetched Successfully',
          HttpStatus.CREATED,
          response,
          count
        );
      }

      return ApiResponse.success(
        'No Menu Items Found',
        HttpStatus.CREATED,
        response,
        count
      );
    } catch (e) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(
    singleMenuItemInterface: GetSingleMenuItemInterface
  ): Promise<any> {
    try {
      const response = await this.menuItemsRepository.findOne({
        where: { id: singleMenuItemInterface.id },
      });
      if (!response) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please enter a valid menu item id',
          data: response,
        };
      }

      return ApiResponse.success(
        'Menu Item Fetched Succesfully',
        HttpStatus.OK,
        response
      );
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: bigint,
    updateMenuItemDto: UpdateMenuItemsDto
  ): Promise<any> {
    if (id > 0) {
      const menuItem = await this.menuItemsRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!menuItem) {
        return resError(
          `Please enter a valid menu item id`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const updatedData = {
        ...menuItem,
        ...updateMenuItemDto,
      };

      const updatedMenuItem = await this.menuItemsRepository.update(
        {
          id: id,
        },
        {
          title: updatedData?.title,
          url: updatedData?.url,
          is_protected: updatedData?.is_protected,
          parent_id: updatedData?.parent_id,
          navigation_type: updatedData?.navigation_type,
          is_active: updatedData?.is_active,
          client_id: updatedData?.client_id,
          created_at: new Date(),
        }
      );

      if (updatedMenuItem.affected) {
        return ApiResponse.success(
          'Menu Item Updated Succesfully',
          HttpStatus.OK
        );
      }

      throw new NotFoundException('Menu Item with provided id did not update');
    } else {
      return resError(
        `Menu item id is required`,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
