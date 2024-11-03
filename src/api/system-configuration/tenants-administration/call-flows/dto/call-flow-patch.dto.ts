import { ApiProperty } from '@nestjs/swagger';
export class CallFlowPatchDto {
  @ApiProperty({ default: false })
  is_archived: boolean;

  @ApiProperty({ default: false })
  is_default: boolean;
}
