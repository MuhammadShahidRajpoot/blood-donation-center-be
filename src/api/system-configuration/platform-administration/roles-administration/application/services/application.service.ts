import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Applications } from '../entities/application.entity';
import { IsNull, Repository } from 'typeorm';
import { SuccessConstants } from '../../../../constants/success.constants';
import { Modules } from '../../role-permissions/entities/module.entity';
import { Tenant } from '../../../tenant-onboarding/tenant/entities/tenant.entity';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Applications)
    private readonly appRepository: Repository<Applications>,
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {}
  create(createApplicationDto: CreateApplicationDto) {
    return 'This action adds a new application';
  }

  async findAll(req: UserRequest) {
    try {
      const apps = await this.appRepository.find();

      const appData = apps?.length
        ? apps?.map((app) => {
            return {
              ...app,
              tenant_id: req?.user?.tenant?.id,
            };
          })
        : [];

      return {
        status: SuccessConstants.SUCCESS,
        message: 'Applications found Successfully',
        status_code: HttpStatus.OK,
        data: appData,
      };
    } catch (error) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchChildrenRecursively(module: Modules, tenant_id?: number) {
    module.child_modules = await this.moduleRepository.find({
      where: {
        parent_id: module.id,
        is_super_admin_module: false,
      },
      relations: ['permissions', 'child_modules'],
      order: {
        permissions: { id: 'ASC' },
      },
    });

    for (const childModule of module.child_modules) {
      await this.fetchChildrenRecursively(childModule, tenant_id);
    }

    return [{ ...module, tenant_id }];
  }

  async findAllTenantPermissions(tenant_id) {
    try {
      const applications = [];
      const tenant: any = await this.tenantRepository.findOne({
        where: {
          id: tenant_id,
        },
        relations: ['applications'],
      });
      for (const app of tenant.applications) {
        const moduleItems = [];
        const modules = await this.moduleRepository.find({
          where: {
            application: { id: app.id },
            parent_id: IsNull(),
            is_super_admin_module: false,
          },
          relations: ['permissions'],
          order: {
            permissions: { id: 'ASC' },
          },
        });
        for (const module of modules) {
          await this.fetchChildrenRecursively(module, tenant_id);
          moduleItems.push({
            ...module,
            tenant_id,
          });
        }
        applications.push({
          ...app,
          tenant_id,
          modules: moduleItems,
        });
      }

      return {
        status: SuccessConstants.SUCCESS,
        message: 'Applications found Successfully',
        status_code: HttpStatus.OK,
        data: applications,
      };
    } catch (error) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} application`;
  }

  update(id: number, updateApplicationDto: UpdateApplicationDto) {
    return `This action updates a #${id} application`;
  }

  remove(id: number) {
    return `This action removes a #${id} application`;
  }
}
