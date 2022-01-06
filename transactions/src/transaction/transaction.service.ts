import { Injectable } from '@nestjs/common';

import { CommissionCalculationService } from '../commission-calculation/commission-calculation.service';
import { ExchangeRateClientService } from '../exchange-rate-client/exchange-rate-client.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly exchangeRateClientService: ExchangeRateClientService,
    private readonly commissionCalculationService: CommissionCalculationService,
  ) {
    global.allTransactions = [];
    global.transactionCommissions = [];
  }

  public async addTransaction(newTransaction: CreateTransactionDto) {
    const transaction = this.mapToTransaction(newTransaction);

    global.allTransactions.push(transaction);

    const exchangeRates =
      await this.exchangeRateClientService.getExchangeRates();

    const transactionCommission =
      this.commissionCalculationService.calculateClientCommissions(
        transaction,
        exchangeRates,
      );

    global.transactionCommissions.push(transactionCommission);
    return global.transactionCommissions;
  }

  public getTransactions(clientId?: number) {
    return clientId
      ? global.transactionCommissions.filter((x) => x.client_id === clientId)
      : global.transactionCommissions;
  }

  private mapToTransaction(newTransaction: CreateTransactionDto): Transaction {
    return {
      date: newTransaction.date,
      amount: parseFloat(newTransaction.amount),
      currency: newTransaction.currency,
      client_id: newTransaction.client_id,
    };
  }
}
