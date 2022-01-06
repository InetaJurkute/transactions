import { Injectable } from '@nestjs/common';
import { Big } from 'big.js';
import { DateTime } from 'luxon';

import { Transaction } from 'src/transaction/dto/transaction.dto';

@Injectable()
export class CommissionCalculationService {
  public calculateClientCommissions(
    transaction: Transaction,
    exchangeRates: Map<string, number>,
  ) {
    const allTransactions: Transaction[] = global.allTransactions;

    const { from, to } = this.getCurrentMonthRange(transaction.date);

    const clientTransactions = allTransactions.filter(
      (x) =>
        x.client_id === transaction.client_id && x.date >= from && x.date <= to,
    );
    const clientTransactionSum = clientTransactions
      .map((x) => x.amount)
      .reduce((prev, curr) => prev + curr, 0);

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

  private getSingleTransactionCommission(
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

  private getCurrentMonthRange(date: string) {
    const year = DateTime.fromISO(date).get('year');
    const month = DateTime.fromISO(date).get('month');

    const monthDate = DateTime.fromFormat(`${year}-${month}`, 'yyyy-M');

    const isoFormat = 'yyyy-MM-dd';

    return {
      from: monthDate.startOf('month').toFormat(isoFormat),
      to: monthDate.endOf('month').toFormat(isoFormat),
    };
  }
}
