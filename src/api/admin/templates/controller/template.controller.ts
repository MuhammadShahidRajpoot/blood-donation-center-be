import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetTemplatesInterface } from '../interface/templates.interface';
import { TemplateService } from '../services/template.service';
import { UserRequest } from 'src/common/interface/request';

@Controller('templates')
@ApiTags('Templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  getListOfTemplates(
    @Query() getAllTemplateInterface: GetTemplatesInterface,
    @Request() req?: UserRequest
  ) {
    return this.templateService.listOfTemplates(getAllTemplateInterface, req);
  }
}
