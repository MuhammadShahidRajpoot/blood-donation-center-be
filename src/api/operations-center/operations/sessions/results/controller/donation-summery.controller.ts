import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Request,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/api/common/permission-based-access/permission.guard';
import { DonationsSummeryService } from '../service/donations-summery.services';
import { DonationsSummeryDTO } from '../dto/donations-summery.dto';
import { Permissions } from 'src/api/common/permission-based-access/permissions.decorator';
import { PermissionsEnum } from 'src/api/common/permission-based-access/permissions.enum';
import { GetAllDrivesFilterInterface } from '../../../drives/interface/get-drives-filter.interface';
import { UserRequest } from 'src/common/interface/request';
import { GetAllDonationsSummerInterface } from '../interfaces/donations.summery.interface';
import { EditDonationsSummeryDTO } from '../dto/edit-donations-summeries.dto';

@ApiTags('DonationsSummery')
@Controller('operations/sessions')
export class DonationsSummeryController {
  constructor(
    private readonly donationsSummeryService: DonationsSummeryService
  ) {}
  @Get('/:id/results')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'id', required: true })
  getAll(
    @Request() req: UserRequest,
    @Param('id') session_id,
    @Query() queryParams: GetAllDonationsSummerInterface,
  ) {
    return this.donationsSummeryService.getAll(session_id, queryParams);
  }

  @Post('/:id/results/:shift_id/projections/:procedure_type_id')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Request() req: UserRequest,
    @Res() res,
    @Body() createDto: DonationsSummeryDTO,
    @Param('id') session_id: bigint,
    @Param('shift_id') shift_id: bigint,
    @Param('procedure_type_id') procedure_type_id: bigint
  ) {
    const data = await this.donationsSummeryService.create(
      createDto,
      session_id,
      shift_id,
      procedure_type_id,
      req.user
    );
    return res.status(data.status_code).json(data);
  }

  @Put('/:id/results/:shift_id/projections/:procedure_type_id')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiQuery({ name: 'operationable_type', required: true })
  async update(
    @Request() req: UserRequest,
    @Res() res,
    @Body() editDto: EditDonationsSummeryDTO,
    @Param('shift_id') shift_id: bigint,
    @Param('procedure_type_id') procedure_type_id: bigint,
    @Param('id') session_id: bigint,
    @Query('operationable_type') operationable_type: string
  ) {
    const data = await this.donationsSummeryService.update(
      editDto,
      session_id,
      shift_id,
      procedure_type_id,
      req.user,
      operationable_type
    );
    return res.status(data.status_code).json(data);
  }
}
