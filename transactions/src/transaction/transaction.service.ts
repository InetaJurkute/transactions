import { Injectable } from '@nestjs/common';
import Big from 'big.js';

import { ExchangeRateClientService } from 'src/exchange-rate-client/exchange-rate-client.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly exchangeRateClientService: ExchangeRateClientService,
  ) {
    global.clientTransactions = [];
  }

  async getCommission(transactionInfo: CreateTransactionDto) {
    global.clientTransactions.push(transactionInfo);

    const exchangeRates =
      await this.exchangeRateClientService.getExchangeRates();

    const commissions = this.getClientsCommissions(
      transactionInfo,
      exchangeRates,
    );

    return commissions;
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }

  getSingleTransactionCommission(
    transactionInfo: CreateTransactionDto,
    exchangeRates: Map<string, number>,
  ) {
    const amountDecimal = new Big(parseFloat(transactionInfo.amount));
    const minimumTransactionAmount = 0.05; // EUR

    const eurAmount = amountDecimal.times(
      exchangeRates[transactionInfo.currency],
    );
    const amountByPercentage = eurAmount.times(0.005);

    const amount = amountByPercentage.gt(new Big(minimumTransactionAmount))
      ? amountByPercentage
      : minimumTransactionAmount;

    return parseFloat(amount.toString()); // big js convert to number
  }

  getClientsCommissions(
    transactionInfo: CreateTransactionDto,
    exchangeRates: Map<string, number>,
  ) {
    const gTrans = global.clientTransactions;

    const transSumByClient: { clientId: number; transactionSum: number }[] = [];

    const commissions = gTrans.map((transaction) => {
      let currentClientData = transSumByClient.find(
        (x) => x.clientId === transaction.client_id,
      );

      if (currentClientData) {
        currentClientData.transactionSum =
          currentClientData.transactionSum + parseFloat(transaction.amount);
      } else {
        const newClientData = {
          clientId: transaction.client_id,
          transactionSum: parseFloat(transaction.amount),
        };

        transSumByClient.push(newClientData);
        currentClientData = newClientData;
      }

      if (currentClientData.transactionSum > 1000) {
        return {
          amount: 0.03,
          currency: 'EUR',
          client_id: transaction.client_id,
        };
      } else {
        if (transaction.client_id === 42) {
          return {
            amount: 0.05,
            currency: 'EUR',
            client_id: transaction.client_id,
          };
        }

        const commission = this.getSingleTransactionCommission(
          transactionInfo,
          exchangeRates,
        );

        return {
          amount: commission,
          currency: 'EUR',
          client_id: transaction.client_id,
        };
      }
    });

    return commissions;
  }
}
