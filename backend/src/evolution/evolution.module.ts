import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EvolutionService } from './evolution.service';
import { EvolutionController } from './evolution.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [EvolutionController],
  providers: [EvolutionService],
  exports: [EvolutionService],
})
export class EvolutionModule {}
