import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [PrismaModule, EvolutionModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
