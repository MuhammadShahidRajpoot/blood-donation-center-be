import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Templates } from '../entities/templates.entity';
import { GetTemplatesInterface } from '../interface/templates.interface';
import { customSort } from 'src/api/utils/sorting';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Templates)
    private readonly templateRepository: Repository<Templates>
  ) {}

  async listOfTemplates(
    getAllTemplateInterface: GetTemplatesInterface,
    req?: UserRequest
  ): Promise<any> {
    try {
      const sort = customSort(getAllTemplateInterface);

      const limit: number = getAllTemplateInterface?.limit
        ? +getAllTemplateInterface?.limit
        : +process.env.PAGE_SIZE;
      const page = getAllTemplateInterface?.page
        ? +getAllTemplateInterface?.page
        : 1;
      const where = {};
      if (getAllTemplateInterface?.title) {
        Object.assign(where, {
          title: Like(`%${getAllTemplateInterface?.title}%`),
        });
      }
      const [records, count] = await this.templateRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: sort,
      });

      return {
        status: HttpStatus.OK,
        message: 'Templates Fetched Successfully',
        count: count,
        data: records?.map((el) => ({
          ...el,
          tenant_id: req?.user?.tenant?.id,
        })),
      };
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findTemplate(id: bigint) {
    try {
      return await this.templateRepository.findOne({ where: { id: id } });
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
