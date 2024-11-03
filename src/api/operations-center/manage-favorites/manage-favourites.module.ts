import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ManageFavoritesController } from './controller/manage-favorites.controller';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { ManageFavoritesService } from './services/manage-favorites.service';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { Favorites } from './entities/favorites.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Products } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { FavoritesHistory } from './entities/favorites-history.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { FavoritesOrganizationalLevels } from './entities/favorites-org-levels.entity';
import { FavoritesRecruiters } from './entities/favorites-recruiters';
import { FavoritesOrganizationalLevelsHistory } from './entities/favorites-org-levels-history.entity';
import { FavoritesRecruitersHistory } from './entities/favorites-recruiters-history';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Favorites,
      User,
      Tenant,
      OrganizationalLevels,
      ProcedureTypes,
      Products,
      OperationsStatus,
      Permissions,
      FavoritesHistory,
      BusinessUnits,
      FavoritesOrganizationalLevels,
      FavoritesRecruiters,
      FavoritesOrganizationalLevelsHistory,
      FavoritesRecruitersHistory,
    ]),
  ],
  providers: [ManageFavoritesService, JwtService],
  controllers: [ManageFavoritesController],
  exports: [ManageFavoritesService],
})
export class ManageFavoritesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/operations-center/manage-favorites',
        method: RequestMethod.POST,
      },
      {
        path: '/operations-center/manage-favorites',
        method: RequestMethod.GET,
      },
      {
        path: '/operations-center/manage-favorites/products/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/operations-center/manage-favorites/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/operations-center/manage-favorites/get-default',
        method: RequestMethod.GET,
      },
      {
        path: '/operations-center/manage-favorites/:id',
        method: RequestMethod.PUT,
      },
      {
        path: '/operations-center/manage-favorites/archive/:id',
        method: RequestMethod.PUT,
      },
      {
        path: '/operations-center/manage-favorites/set-default/:id',
        method: RequestMethod.PATCH,
      }
    );
  }
}
