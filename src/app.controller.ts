import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('routes')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/teste')
  async getRoutes() {
    return await this.appService.getRoute();
  }
}
