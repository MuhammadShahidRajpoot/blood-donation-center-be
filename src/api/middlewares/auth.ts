import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserRequest } from 'src/common/interface/request';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { ILike, Repository } from 'typeorm';
import { Permissions } from '../system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { Tenant } from '../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Permissions)
    private permissionsRepository: Repository<Permissions>,
    private jwtService: JwtService
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let tokenData;
    if (token) {
      tokenData = this.jwtService.decode(token);
    }
    if (!tokenData) {
      throw new HttpException('Invalid Token..!', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userRepository.findOne({
      where: { id: tokenData?.id },
      relations: ['tenant', 'role', 'tenant.tenant_time_zones', 'assigned_manager'],
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
    }
    if (user.role) {
      const permissions: any = await this.permissionsRepository.find({
        where: {
          rolePermissions: {
            role: {
              id: user.role.id,
            },
          },
        },
        relations: ['rolePermissions.role'],
      });
      req.permissions = permissions;
    } else {
      req.permissions = [];
    }
    req.user = user; // Attach user data to request object
    next();
  }
}

@Injectable()
export class DSMiddleWare implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      try {
        const url = req.url;
        let sessionKey = url.match(/sessionKey=([^&]*)/);
        if (!sessionKey) sessionKey = url.match(/sessionkey=([^&]*)/);

        if (sessionKey) {
          token = sessionKey[1] as string;
        } else {
          console.log('Session key not found');
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
      }
    }
    if (!token) {
      throw new HttpException('Invalid Token..!', HttpStatus.UNAUTHORIZED);
    }
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .where(`LOWER(tenant_secret_key) = LOWER(:key)`, { key: token })
      .getOne();

    if (!tenant) {
      throw new HttpException('Tenant not found.', HttpStatus.UNAUTHORIZED);
    }
    req.user = { tenant };
    req.tenant = tenant; // Attach user data to request object
    next();
  }
}
