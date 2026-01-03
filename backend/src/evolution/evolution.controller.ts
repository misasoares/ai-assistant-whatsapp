import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EvolutionService } from './evolution.service';

@Controller('evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Post('create-instance')
  async createInstance(@Body('instanceName') instanceName: string) {
    const name = instanceName || `instance-${Date.now()}`;
    return this.evolutionService.createInstance(name);
  }

  @Get('instance/:name')
  async getInstance(@Param('name') name: string) {
    return this.evolutionService.getInstance(name);
  }

  @Get('messages/:instanceName')
  async fetchLastMessages(@Param('instanceName') instanceName: string) {
    return this.evolutionService.fetchLastMessages(instanceName);
  }

  @Get('messages/recent/:instanceName')
  async fetchRecentMessages(@Param('instanceName') instanceName: string) {
    return this.evolutionService.fetchRecentMessages(instanceName);
  }
}
