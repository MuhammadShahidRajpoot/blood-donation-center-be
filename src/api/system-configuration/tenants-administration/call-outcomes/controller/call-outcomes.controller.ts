import {
  Controller,
  Post,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Body,
  Get,
  Param,
  UseGuards,
  Put,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateCallOutcomeDto,
  GetAllCallOutcomesDto,
} from '../dto/call-outcomes.dto';
import { CallOutcomesService } from '../services/call-outcomes.service';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { GetAllCallOutcomesInterface } from '../interface/call-outcomes.interface';

@ApiTags('Call Outcomes')
@Controller('call-center/call-outcomes')
export class CallOutcomesController {
  constructor(private readonly callOutcomesService: CallOutcomesService) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_WRITE
  )
  async create(@Body() createCallOutcomesDto: CreateCallOutcomeDto) {
    return this.callOutcomesService.create(createCallOutcomesDto);
  }

  @Get('')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_READ
  )
  async findAll(@Query() getAllCallOutcomes: GetAllCallOutcomesDto) {
    return this.callOutcomesService.findAll(getAllCallOutcomes);
  }

  @Get('/:id')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_READ,
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_WRITE
  )
  async findOne(@Param('id') id: any) {
    return this.callOutcomesService.findOne(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: false })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_WRITE
  )
  @UsePipes(new ValidationPipe())
  update(
    @Body() updateCallOutcomesDto: CreateCallOutcomeDto,
    @Param('id') id: any
  ) {
    return this.callOutcomesService.update(updateCallOutcomesDto, id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_ARCHIVE
  )
  archive(
    @Param('id') id: any,
    @Body() callOutcomePatchDto: CreateCallOutcomeDto
  ) {
    return this.callOutcomesService.archive(id, callOutcomePatchDto);
  }
}
