import {
  Controller,
  Request,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Query,
  Get,
  HttpStatus,
  Post,
  Body,
  Put,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRequest } from 'src/common/interface/request';

import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateProspectDto,
  GetAllProspects,
  ListProspectsDto,
  UpdateProspectDto,
} from '../dto/prospects.dto';
import { ProspectsService } from '../services/prospects.service';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';

@ApiTags('Prospects')
@Controller('/operations-center/prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}
  @Get('/build-segments')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async listProspects(
    @Query() listProspectsDto: ListProspectsDto,
    @Request() req: UserRequest
  ) {
    return this.prospectsService.listProspects(
      listProspectsDto,
      req?.user?.tenant?.id
    );
  }

  @Get('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_READ)
  async getAll(@Query() getAllProspectInterface: GetAllProspects) {
    return this.prospectsService.getAll(getAllProspectInterface);
  }

  @Post('/')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_WRITE)
  async create(@Body() createProspectDto: CreateProspectDto) {
    return await this.prospectsService.create(createProspectDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_WRITE)
  async update(@Param('id') id: number, @Body() updateData: UpdateProspectDto) {
    return this.prospectsService.updateProspect(id, updateData);
  }

  @Put(':id/communication')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_WRITE)
  async updateCommunication(
    @Param('id') id: number,
    @Body() updateData: CreateProspectDto
  ) {
    return this.prospectsService.updateProspectCommunication(id, updateData);
  }

  

  @Get('prospects-filters/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_READ)
  @HttpCode(HttpStatus.OK)
  async getSingleProspectFilters(@Param('id') id: any) {
    return this.prospectsService.getSingleProspectFilters(id);
  }

  @Get(':id/communication')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_READ)
  @HttpCode(HttpStatus.OK)
  async getSingleProspectCommunication(@Param('id') id: any) {
    return this.prospectsService.getSingleProspectCommunication(id);
  }

  @Get(':id/blueprints')
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getProspectBluePrints(@Param('id') id: any, @Query() keyword: string) {
    return this.prospectsService.getProspectBluePrints(id, keyword);
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_READ)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: any) {
    return this.prospectsService.getSingleProspect(id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @ApiBearerAuth()
  @Permissions(PermissionsEnum.OPERATIONS_CENTER_OPERATIONS_PROSPECTS_ARCHIVE)
  async delete(@Param('id') id: number, @Request() req: UserRequest) {
    return this.prospectsService.deleteProspect(id, req.user);
  }
}
