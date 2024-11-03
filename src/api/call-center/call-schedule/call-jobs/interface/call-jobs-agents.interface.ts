import { IsNotEmpty } from 'class-validator';

export class GetAssignedAgentsInterface {
  @IsNotEmpty()
  callJobId: bigint;
}
