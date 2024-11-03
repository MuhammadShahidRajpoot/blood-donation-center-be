import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RefreshTokenDTO } from '../dto/login.dto';
import { AuthService } from '../services/auth.services';
import { UserRequest } from 'src/common/interface/request';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(AuthGuard('local'))
  @Post('/login')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh-token')
  @UsePipes(new ValidationPipe())
  async refreshToken(
    @Request() userRequest: UserRequest,
    @Body() tokenDto: RefreshTokenDTO
  ) {
    return this.authService.refreshToken(tokenDto, userRequest);
  }
}
