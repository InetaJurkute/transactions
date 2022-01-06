import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './transaction/transaction.module';
import { CommissionCalculationService } from './commission-calculation/commission-calculation.service';

@Module({
  imports: [TransactionModule],
  controllers: [AppController],
  providers: [AppService, CommissionCalculationService],
})
export class AppModule {}
