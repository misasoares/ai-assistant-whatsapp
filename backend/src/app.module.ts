import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EvolutionModule } from './evolution/evolution.module';

import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EvolutionModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
