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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DonorDonationService } from '../services/donor-donation.service';
import { QueryDonorDonationsDto } from '../dto/donor-donations.dto';
import { FilterDonorDonationsDto } from '../dto/filter-donor-donations.dto';
import { GetAllHospitalsInterface } from '../interfaces/hospital.interface';

@ApiTags('Donor Donations')
@Controller('/donors/donations/history')
export class DonorDonationController {
  constructor(private readonly donorDonationService: DonorDonationService) {}

  @Post('/')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async get(
    @Res() res,
    @Query() query: QueryDonorDonationsDto,
    @Body() filter: FilterDonorDonationsDto
  ) {
    const { page, limit, sortName, sortOrder } = query;
    const data = await this.donorDonationService.get(
      page,
      limit,
      {
        sortName,
        sortOrder,
      },
      filter
    );
    return res.status(data.status_code).json(data);
  }

  @Get('/hospitals')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  getHospitals(@Query() getAllHospitalsInterface: GetAllHospitalsInterface) {
    return this.donorDonationService.findAllHospitals(getAllHospitalsInterface);
  }
}
