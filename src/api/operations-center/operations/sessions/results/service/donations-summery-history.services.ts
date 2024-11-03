import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationsSummeryHistory } from '../entities/sessions-donations-summery-history.entity';
import { DonationsSummeryHistoryDTO } from '../dto/donations-summery-history.dto';

@Injectable()
export class DonationsSummeryHistoryService {
  constructor(
    @InjectRepository(DonationsSummeryHistory)
    private readonly DonationsSummeryHistoryRepository: Repository<DonationsSummeryHistory>
  ) {}
}
