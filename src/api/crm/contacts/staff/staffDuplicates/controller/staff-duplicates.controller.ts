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
import { StaffDuplicatesService } from '../service/staff-duplicates.service';
import { ResolveDuplicateDto } from 'src/api/common/dto/duplicates/resolve-duplicates.dto';
import { IdentifyDuplicateDto } from 'src/api/crm/contacts/staff/staffDuplicates/dto/identify-duplicates.dto';

@ApiTags('Staff Duplicates')
@Controller('/contact-staff')
export class StaffDuplicatesController {
  constructor(private readonly staffDupService: StaffDuplicatesService) {}

  @Post('/:id/duplicates/create')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async create(
    @Res() res,
    @Param('id') id: bigint,
    @Body() createDto: CreateDuplicateDto
  ) {
    const data = await this.staffDupService.create(id, createDto);
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
    const data = await this.staffDupService.get(
      page,
      limit,
      { sortName, sortOrder },
      { ...filters, duplicatable_id: id }
    );
    return res.status(data.status_code).json(data);
  }

  @Patch('/:id/duplicates/resolve')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async resolve(
    @Res() res,
    @Param('id') id: bigint,
    @Body() resolveDto: ResolveDuplicateDto
  ) {
    const data = await this.staffDupService.resolve(id, resolveDto);
    return res.status(data.status_code).json(data);
  }

  @Post('/duplicates/identify')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async identify(@Res() res, @Body() identifyDto: IdentifyDuplicateDto) {
    const data = await this.staffDupService.identify(identifyDto);
    return res.status(data.status_code).json(data);
  }

  @Post('/duplicates/create-many')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async createMany(@Res() res, @Body() createManyDto: CreateManyDuplicateDto) {
    const data = await this.staffDupService.createMany(createManyDto);
    return res.status(data.status_code).json(data);
  }

  @Patch('/duplicates/:id/archive')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async archive(@Param('id') id: number, @Res() res) {
    const data = await this.staffDupService.archive(<any>id);
    return res.status(data.status_code).json(data);
  }
}
