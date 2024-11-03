import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    minLength: 8,
    maxLength: 255,
  })
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDTO {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  username: string;
}