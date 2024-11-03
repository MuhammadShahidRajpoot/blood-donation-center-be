import {
  Controller,
  Get,
  Post,
  Param,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Put,
  Body,
  Query,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateAttachmentCategoryDto } from '../dto/create-attachment-category.dto';
import { UpdateAttachmentCategoryDto } from '../dto/update-attachment-category.dto';
import { AttachmentCategoryService } from '../service/attachment-category.service';
import { GetAllAttachmentCategoryInterface } from '../interfaces/query-attachment-category.interface';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { UserRequest } from 'src/common/interface/request';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';

@ApiTags('Account Attachment Category')
@Controller('accounts/attachment-category')
export class AttachmentCategoryController {
  constructor(
    private readonly noteCategoryService: AttachmentCategoryService
  ) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_WRITE
  )
  create(@Body() createNoteCategoryDto: CreateAttachmentCategoryDto) {
    return this.noteCategoryService.create(createNoteCategoryDto);
  }

  @Get('/')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(PermissionGuard)
  // @Permissions(
  //   PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_WRITE,
  //   PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_READ
  // )
  async getAll(
    @Query() getAllNoteCategoryInterface: GetAllAttachmentCategoryInterface
  ) {
    return this.noteCategoryService.getAll(getAllNoteCategoryInterface);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_WRITE,
    PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_READ
  )
  async get(@Param('id') id: any) {
    return this.noteCategoryService.getSingleAttachmentCategory(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_WRITE
  )
  async update(
    @Param('id') id: number,
    @Body() updateNoteCategoryDto: UpdateAttachmentCategoryDto
  ) {
    return this.noteCategoryService.updateAttachmentCategory(
      id,
      updateNoteCategoryDto
    );
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_ARCHIVE
  )
  async delete(@Param('id') id: number, @Request() req: UserRequest) {
    return this.noteCategoryService.deleteAttachmentCategory(id, req.user);
  }
}
