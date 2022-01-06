import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { ExchangeRateClientService } from 'src/exchange-rate-client/exchange-rate-client.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, ExchangeRateClientService],
})
export class TransactionModule {}
