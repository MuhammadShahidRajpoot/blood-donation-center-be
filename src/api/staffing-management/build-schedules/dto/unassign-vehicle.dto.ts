import { ApiProperty } from '@nestjs/swagger';

export class UnAssignVehicleParamDto {
  @ApiProperty({ required: false })
  vehicle_assignment_id: number;

  @ApiProperty({ required: false })
  vehicle_assignment_draft_id: number;
}
