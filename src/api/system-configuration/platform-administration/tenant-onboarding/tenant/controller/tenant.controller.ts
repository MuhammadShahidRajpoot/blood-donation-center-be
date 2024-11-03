import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  BadRequestException,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import {
  CreateEmailTemplatesDto,
  CreateTenantConfigDto,
  CreateTenantDto,
} from '../dto/create-tenant.dto';
import {
  UpdateTenantConfigDto,
  UpdateTenantDto,
} from '../dto/update-tenant.dto';
import { ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllTenantInterface } from '../interface/tenant.interface';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { UserRequest } from 'src/common/interface/request';
@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('generate-secret-key')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  generateSecretKeysForAllTenants() {
    // This will generate tenant_secrey_keys for all tenants where tenant_secrety_key is null
    return this.tenantService.generateSecretKeysForAllTenants();
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.TENANT_MANAGEMENT_WRITE)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Post('create/templates')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.TENANT_MANAGEMENT_WRITE)
  createEmailTemplatesForTenant(
    @Body() createTemplatesDto: CreateEmailTemplatesDto
  ) {
    return this.tenantService.createEmailTemplatesForTenant(createTemplatesDto);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.TENANT_MANAGEMENT_READ,
    PermissionsEnum.TENANT_MANAGEMENT_WRITE,
    PermissionsEnum.TENANT_MANAGEMENT_ARCHIVE
  )
  findAll(
    @Query() getAllTenantInterface: GetAllTenantInterface,
    @Request() req: UserRequest
  ) {
    return this.tenantService.findAll(getAllTenantInterface, req);
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  findOne(@Param('id') id: any) {
    return this.tenantService.findOne(id);
  }

  @Put(':id/edit')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.TENANT_ONBOARDING_WRITE,
    PermissionsEnum.TENANT_MANAGEMENT_WRITE
  )
  @ApiParam({ name: 'id', required: true })
  update(@Param('id') id: any, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(+id);
  }

  @Post(':id/configurations')
  @ApiParam({ name: 'id', required: true, description: 'Tenant Id' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.TENANT_MANAGEMENT_ADD_CONFIG)
  createConfiguration(
    @Param('id') id: any,
    @Body() createTenantConfigDto: CreateTenantConfigDto
  ) {
    if (!id) {
      throw new BadRequestException('Tenant Id is required');
    }
    return this.tenantService.addTenantConfig(id, createTenantConfigDto);
  }

  @Put(':id/configurations')
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.TENANT_MANAGEMENT_ADD_CONFIG)
  async updateConfiguration(
    @Param('id') id: any,
    @Body() updateTenantConfigDto: UpdateTenantConfigDto
  ) {
    if (!id) {
      throw new BadRequestException(
        'Tenant Id and Configuration Id is required'
      );
    }

    return this.tenantService.updateTenantConfig(id, updateTenantConfigDto);
  }

  @Get(':id/configurations')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.TENANT_MANAGEMENT_ADD_CONFIG)
  async getClientConfig(
    @Param('id') id: any,
    @Param('configurationId') configId: any
  ) {
    return this.tenantService.getTenantConfig(id);
  }

  @Post('/user/impersonate/:tenantId')
  @ApiParam({ name: 'tenantId', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  impersonateTenantUser(@Param('tenantId') id: any) {
    return this.tenantService.impersonateTenantUser(id);
  }
  @Get(':id/create-ds-campaign')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.TENANT_MANAGEMENT_ADD_CONFIG)
  async createDailyStoryTenantAndCampaignAndAssignToTenant(
    @Param('id') id: any
  ) {
    return this.tenantService.createDailyStoryTenantAndCampaignAndAssignToTenant(
      id
    );
  }

  // @Post('temporary-email-templates')

  // @UsePipes(new ValidationPipe())
  // @HttpCode(HttpStatus.CREATED)
  // @ApiBearerAuth()
  // createTemporaryEmailTemplates(
  // ) {

  //   return this.tenantService.addTemporaryEmailTemplates();
  // }
}
