import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateDuplicateDto } from 'src/api/common/dto/duplicates/create-duplicates.dto';
import { QueryDuplicatesDto } from 'src/api/common/dto/duplicates/query-duplicates.dto';
import { CrmLocationsDuplicatesService } from '../service/location-duplicates.service';
import { LocationsDto } from '../../dto/locations.dto';
import { UserRequest } from 'src/common/interface/request';

@ApiTags('CrmLocations Duplicates')
@Controller('/crm/locations')
export class CrmLocationsDuplicatesController {
  constructor(
    private readonly crmLocationsDupService: CrmLocationsDuplicatesService
  ) {}

  @Post('/:id/duplicates/create')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async create(
    @Res() res,
    @Param('id') id: any,
    @Body() createDto: CreateDuplicateDto
  ) {
    const data = await this.crmLocationsDupService.create(id, createDto);
    return res.status(data.status_code).json(data);
  }

  @Get('/:id/duplicates/list')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async get(
    @Res() res,
    @Param('id') id: bigint,
    @Query() query: QueryDuplicatesDto
  ) {
    const { page, limit, sortName, sortOrder, ...filters } = query;
    const data = await this.crmLocationsDupService.get(
      page,
      limit,
      { sortName, sortOrder },
      { ...filters, duplicatable_id: id }
    );
    return res.status(data.status_code).json(data);
  }

  // @Patch('/:id/duplicates/resolve')
  // @ApiBearerAuth()
  // @UsePipes(new ValidationPipe())
  // async resolve(
  //   @Res() res,
  //   @Param('id') id: bigint,
  //   @Body() resolveDto: ResolveDuplicateDto
  // ) {
  //   const data = await this.crmLocationsDupService.resolve(id, resolveDto);
  //   return res.status(data.status_code).json(data);
  // }

  @Post('/duplicates/identify')
  @UsePipes(new ValidationPipe())
  async createContacts(
    @Query('locationId') id: any,
    @Body() createLocationDto: LocationsDto,
    @Request() userRequest: UserRequest
  ) {
    return this.crmLocationsDupService.identifyDuplicates(
      id,
      createLocationDto,
      userRequest
    );
  }
}
