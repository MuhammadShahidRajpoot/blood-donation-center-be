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
  Req,
  UseInterceptors,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { ManageScriptsService } from '../services/manage-scripts.services';
import { ManageScriptsDto } from '../dto/manage-scripts.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAllCallScriptsInterface } from '../interface/manage-scripts.interface';

@ApiTags('Manage Scripts')
@Controller('call-center/scripts')
export class ManageScriptsController {
  constructor(private readonly manageScriptsService: ManageScriptsService) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_WRITE)
  @UseInterceptors(FileInterceptor('attachment_file'))
  async create(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() manageScriptsDto: ManageScriptsDto
  ) {
    return this.manageScriptsService.create(file, manageScriptsDto, req.user);
  }

  @Get('/')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_WRITE,
    PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_READ
  )
  async getAll(
    @Req() req,
    @Query() getAllCallScriptsInterface: GetAllCallScriptsInterface
  ) {
    return this.manageScriptsService.getAll(
      getAllCallScriptsInterface,
      req.user
    );
  }

  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_WRITE,
    PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_READ
  )
  async get(@Param('id') id: any) {
    return this.manageScriptsService.getSingleScript(id);
  }

  @Get('/call-job-id/:callJobId')
  @ApiParam({ name: 'callJobId', required: true })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_WRITE,
    PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_READ
  )
  async getCallJobCallScriptByCallJobId(@Param('callJobId') id: any) {
    return this.manageScriptsService.getCallJobCallScriptByCallJobId(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_WRITE)
  @UseInterceptors(FileInterceptor('attachment_file'))
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateNoteCategoryDto: ManageScriptsDto
  ) {
    return this.manageScriptsService.updateCallScript(
      file,
      id,
      updateNoteCategoryDto
    );
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(PermissionsEnum.CALL_CENTER_MANAGE_SCRIPTS_ARCHIVE)
  async delete(@Param('id') id: number) {
    return this.manageScriptsService.archiveCallScript(id);
  }
}
