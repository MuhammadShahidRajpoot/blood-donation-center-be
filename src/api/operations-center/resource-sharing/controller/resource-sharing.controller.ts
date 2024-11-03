import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ResourceSharingService } from '../service/resource-sharing.service';
import {
  AddResourceShareFullfilmentDto,
  CreateResourceSharingDto,
  ResourceFullfilmentDto,
} from '../dto/create-resource-sharing.dto';
import { UpdateResourceSharingDto } from '../dto/update-resource-sharing.dto';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { BusinessUnitsService } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/services/business-units.service';
import { UserRequest } from 'src/common/interface/request';
import { GetAllResourceSharingInterface } from '../interface/resource-sharing.interface';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';

@ApiTags('Resource Sharing')
@Controller('operations-center/resource-sharing')
export class ResourceSharingController {
  constructor(
    private readonly resourceSharingService: ResourceSharingService,
    private readonly businessUnitService: BusinessUnitsService
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_WRITE
  )
  @UsePipes(new ValidationPipe())
  create(@Body() createResourceSharingDto: CreateResourceSharingDto) {
    return this.resourceSharingService.create(createResourceSharingDto);
  }

  @Get()
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_READ
  )
  findAll(
    @Query() getAllResourceSharingInterface: GetAllResourceSharingInterface
  ) {
    return this.resourceSharingService.findAll(getAllResourceSharingInterface);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_WRITE
  )
  update(
    @Param('id') id: string,
    @Body() updateResourceSharingDto: CreateResourceSharingDto
  ) {
    return this.resourceSharingService.update(+id, updateResourceSharingDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_READ
  )
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  findOne(@Param('id') id: any) {
    return this.resourceSharingService.getSingleResourceShare(id);
  }

  @Get('collection_operations/list')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  async getUserCollectionOperations(
    @Request() req: UserRequest,
    @Query('id') id: any,
    @Query('isFilter') isFilter: any
  ) {
    return this.businessUnitService.getUserCollectionOperations(
      req.user,
      id,
      isFilter
    );
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_ARCHIVE
  )
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  archive(@Param('id') id: any, @Request() req: UserRequest) {
    return this.resourceSharingService.archiveResourceShare(id, req.user);
  }

  @Post(':id/fulfill-request')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  addResourceShareFullfilment(
    @Body() fullfilmentDto: AddResourceShareFullfilmentDto,
    @Param('id') id: any
  ) {
    return this.resourceSharingService.addResourceShareFullfilment(
      id,
      fullfilmentDto
    );
  }

  @Patch(':id/fulfill-request')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  archiveResourceFullfilment(
    @Body() resourceFullfilmentDto: ResourceFullfilmentDto,
    @Param('id') id: any
  ) {
    return this.resourceSharingService.archiveResourceFullfilment(
      id,
      resourceFullfilmentDto
    );
  }

  @Get(':id/fulfill-request')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  getResourceShareFullfilment(@Param('id') id: any) {
    return this.resourceSharingService.getResourceShareFullfilment(id);
  }
}
