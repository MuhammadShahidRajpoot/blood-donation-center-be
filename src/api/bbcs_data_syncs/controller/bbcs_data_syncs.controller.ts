import {
  Controller,
  UsePipes,
  ValidationPipe,
  Patch,
  Res,
  Query,
  Req,
} from '@nestjs/common';

import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { BBCSDataSyncsService } from '../services/bbcs_data_syncs.service';
import { BBCSDataSyncInterface } from '../interface/bbcs_data_syncs.interface';
import { UserRequest } from 'src/common/interface/request';
import { ExecutionStatusEnum } from 'src/api/scheduler/enum/execution_status.enum';
import { DataSyncOperationTypeEnum } from 'src/api/scheduler/enum/data_sync_operation_type.enum';

@ApiTags('BBCS Donors')
@Controller('/bbcs/')
export class BBCSDataSyncsController {
  constructor(private readonly BBCSDataSyncsService: BBCSDataSyncsService) {}

  @Patch('/donors/sync')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async syncDonors(
    @Res() response,
    @Query() bbcsDataSyncInterface: BBCSDataSyncInterface,
    @Req() userRequest: UserRequest
  ) {
    const cronType = DataSyncOperationTypeEnum.Donor;
    const lastRun = await this.BBCSDataSyncsService.getLastRunDonorSync(
      cronType,
      userRequest?.user?.tenant?.id
    );
    if (lastRun?.execution_status == ExecutionStatusEnum.Running) {
      response.status(200).json({ message: 'Cron is already running.' });
    } else {
      response
        .status(200)
        .json({ message: 'Cron Started, Request received successfully' });
      await this.BBCSDataSyncsService.syncDonors(bbcsDataSyncInterface);
    }
    // return this.BBCSDataSyncsService.syncDonors();
  }

  @Patch('/donors/sync/stop')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async stopSyncDonors(@Res() response, @Req() userRequest: UserRequest) {
    const cronType = DataSyncOperationTypeEnum.Donor;
    const lastRun = await this.BBCSDataSyncsService.getLastRunDonorSync(
      cronType,
      userRequest?.user?.tenant?.id
    );
    console.log(lastRun);
    if (lastRun?.execution_status == ExecutionStatusEnum.Running) {
      await this.BBCSDataSyncsService.stopSyncDonors(
        cronType,
        userRequest?.user?.tenant?.id
      );
      response.status(200).json({ message: 'Cron Stopped' });
    } else {
      response.status(200).json({ message: 'Cron is not running' });
    }
  }

  @Patch('/accounts/sync')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  async syncAccounts() {
    return await this.BBCSDataSyncsService.syncAccounts();
  }
}
