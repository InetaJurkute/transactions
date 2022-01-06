import { Injectable } from '@nestjs/common';

import { ExchangeRateClientService } from 'src/exchange-rate-client/exchange-rate-client.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly exchangeRateClientService: ExchangeRateClientService,
  ) {}

  async getCommission(createTransactionDto: CreateTransactionDto) {
    console.log('posted data', createTransactionDto);
    const res = await this.exchangeRateClientService.getExchangeRates();

    return res;
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
}
