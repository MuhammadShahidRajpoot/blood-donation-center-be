import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateDuplicateDto,
  CreateManyDuplicateDto,
} from 'src/api/common/dto/duplicates/create-duplicates.dto';
import { QueryDuplicatesDto } from 'src/api/common/dto/duplicates/query-duplicates.dto';
import { VolunteerDuplicatesService } from '../service/volunteer-duplicates.service';
import { ResolveDuplicateDto } from 'src/api/common/dto/duplicates/resolve-duplicates.dto';
import { IdentifyVolunteerDuplicateDto } from 'src/api/crm/contacts/volunteer/volunteerDuplicates/dto/identify-volunteer-duplicates.dto';

@ApiTags('Volunteer Duplicates')
@Controller('/contact-volunteer')
export class VolunteerDuplicatesController {
  constructor(
    private readonly volunteerDupService: VolunteerDuplicatesService
  ) {}

  @Post('/:id/duplicates/create')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async create(
    @Res() res,
    @Param('id') id: number,
    @Body() createDto: CreateDuplicateDto
  ) {
    const data = await this.volunteerDupService.create(<any>id, createDto);
    return res.status(data.status_code).json(data);
  }

  @Get('/:id/duplicates/list')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async get(
    @Res() res,
    @Param('id') id: number,
    @Query() query: QueryDuplicatesDto
  ) {
    const { page, limit, sortName, sortOrder, ...filters } = query;
    const data = await this.volunteerDupService.get(
      page,
      limit,
      { sortName, sortOrder },
      { ...filters, duplicatable_id: <any>id }
    );
    return res.status(data.status_code).json(data);
  }

  @Patch('/:id/duplicates/resolve')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async resolve(
    @Res() res,
    @Param('id') id: number,
    @Body() resolveDto: ResolveDuplicateDto
  ) {
    const data = await this.volunteerDupService.resolve(<any>id, resolveDto);
    return res.status(data.status_code).json(data);
  }

  @Post('/duplicates/identify')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async identify(
    @Res() res,
    @Body() identifyDto: IdentifyVolunteerDuplicateDto
  ) {
    const data = await this.volunteerDupService.identify(identifyDto);
    return res.status(data.status_code).json(data);
  }

  @Post('/duplicates/create-many')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async createMany(@Res() res, @Body() createManyDto: CreateManyDuplicateDto) {
    const data = await this.volunteerDupService.createMany(createManyDto);
    return res.status(data.status_code).json(data);
  }

  @Patch('/duplicates/:id/archive')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async archive(@Param('id') id: number, @Res() res) {
    const data = await this.volunteerDupService.archive(<any>id);
    return res.status(data.status_code).json(data);
  }
}
