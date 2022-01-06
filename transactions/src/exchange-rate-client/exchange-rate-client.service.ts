import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExchangeRateClientService {
  async getExchangeRates() {
    const result = await axios.get('https://api.exchangerate.host/2021-01-01');

    return result.data.rates;
  }
}
