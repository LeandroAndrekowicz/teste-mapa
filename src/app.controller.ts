import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RoutesWithTrucksInterface } from './shared/interfaces/truck.interface';

@Controller('routes')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/teste')
  async getRoutes(): Promise<{ message: string; routes: RoutesWithTrucksInterface[]; }> {
    return await this.appService.getRoute();
  }
}
