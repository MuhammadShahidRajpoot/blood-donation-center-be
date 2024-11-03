import { AssertionService } from '../services/donor-assertion.service';
import {
  Controller,
  Post,
  UsePipes,
  HttpCode,
  ValidationPipe,
  HttpStatus,
  Body,
  UseGuards,
  Put,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiParam } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { AssertionDto } from '../dto/donor-assertion.dto';
import { UpdateAssertionDto } from '../dto/update-donor-assertion.dto';
import { GetAllAssertionsDto } from '../dto/assertion.dto';

@ApiTags('Donor Assertion')
@Controller('/call-center')
export class AssertionController {
  constructor(private readonly assertionService: AssertionService) {}

  @Post('/assertions')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE
  )
  create(@Body() assertionDto: AssertionDto) {
    console.log('assertionDto', assertionDto);
    return this.assertionService.create(assertionDto);
  }

  @Put('/assertions/:id')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE
  )
  async updateAssertions(
    @Param('id') id: bigint,
    @Body() updateAssertionDto: UpdateAssertionDto
  ) {
    const result = await this.assertionService.updateAssertions(
      id,
      updateAssertionDto
    );
    return result;
  }

  @Get('/assertions/:id')
  @ApiParam({ name: 'id', required: true })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_READ
  )
  async findOne(@Param('id') id: any) {
    return await this.assertionService.findOne(id);
  }

  @Get('/assertions')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @Permissions(
    PermissionsEnum.SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_READ
  )
  async findAll(@Query() getAllAssertions: GetAllAssertionsDto) {
    return this.assertionService.findAll(getAllAssertions);
  }
}
