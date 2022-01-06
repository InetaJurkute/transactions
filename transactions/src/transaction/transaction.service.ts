import { Injectable } from '@nestjs/common';
import Big from 'big.js';

import { ExchangeRateClientService } from 'src/exchange-rate-client/exchange-rate-client.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly exchangeRateClientService: ExchangeRateClientService,
  ) {
    global.allTransactions = [];
    global.transactionFees = [];
  }

  async addTransaction(newTransaction: CreateTransactionDto) {
    const transaction = this.mapToTransaction(newTransaction);

    global.allTransactions.push(transaction);

    const exchangeRates =
      await this.exchangeRateClientService.getExchangeRates();

    const fee = this.calculateClientCommissions(transaction, exchangeRates);

    global.transactionFees.push(fee);
    return global.transactionFees;
  }

  getTransactions(clientId?: number) {
    return clientId
      ? global.allTransactions.filter((x) => x.client_id === clientId)
      : global.allTransactions;
  }

  getSingleTransactionCommission(
    transactionInfo: Transaction,
    exchangeRates: Map<string, number>,
  ) {
    const amountDecimal = new Big(transactionInfo.amount);
    const minimumTransactionAmount = 0.05; // EUR

    const eurAmount = amountDecimal.times(
      exchangeRates[transactionInfo.currency],
    );
    const amountByPercentage = eurAmount.times(0.005);

    const amount = amountByPercentage.gt(new Big(minimumTransactionAmount))
      ? amountByPercentage.toNumber()
      : minimumTransactionAmount;

    return amount;
  }

  calculateClientCommissions(
    transaction: Transaction,
    exchangeRates: Map<string, number>,
  ) {
    const allTransactions: Transaction[] = global.allTransactions;

    console.log('all ', allTransactions);
    console.log('new ', transaction);

    const clientTransactions = allTransactions.filter(
      (x) => x.client_id === transaction.client_id,
    );
    const clientTransactionSum = clientTransactions
      .map((x) => x.amount)
      .reduce((prev, curr) => prev + curr, 0); // DO BY MONTH

    if (clientTransactionSum >= 1000) {
      return {
        ...transaction,
        commission_amount: 0.03,
        commission_currency: 'EUR',
      };
    } else {
      if (transaction.client_id === 42) {
        return {
          ...transaction,
          commission_amount: 0.05,
          commission_currency: 'EUR',
        };
      }

      const commission = this.getSingleTransactionCommission(
        transaction,
        exchangeRates,
      );

      return {
        ...transaction,
        commission_amount: commission,
        commission_currency: 'EUR',
      };
    }
  }

  mapToTransaction(newTransaction: CreateTransactionDto): Transaction {
    return {
      date: newTransaction.date,
      amount: parseFloat(newTransaction.amount),
      currency: newTransaction.currency,
      client_id: newTransaction.client_id,
    };
  }
}
