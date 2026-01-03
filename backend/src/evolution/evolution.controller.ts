import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EvolutionService } from './evolution.service';

@Controller('evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Post('create-instance')
  async createInstance(@Body() body: { instanceName: string; customerId: string }) {
    return this.evolutionService.createInstance(body);
  }

  @Get('instance/:name')
  async getInstance(@Param('name') name: string) {
    return this.evolutionService.getInstance(name);
  }

}
