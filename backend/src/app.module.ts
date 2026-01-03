import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EvolutionModule } from './evolution/evolution.module';
import { CustomersModule } from './customers/customers.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EvolutionModule,
    PrismaModule,
    CustomersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
