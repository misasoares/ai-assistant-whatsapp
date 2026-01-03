import { Controller, Post, Body, Get, Param, Delete, Patch } from '@nestjs/common';
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

  @Delete('instance/:name')
  async deleteInstance(@Param('name') name: string) {
    return this.evolutionService.deleteInstance(name);
  }

  @Patch('instance/:name')
  async updateInstance(@Param('name') name: string, @Body() body: any) {
    return this.evolutionService.updateInstance(name, body);
  }
}
