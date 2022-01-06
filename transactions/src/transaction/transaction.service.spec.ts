import { Mock } from 'typemoq';

import { ExchangeRateClientService } from 'src/exchange-rate-client/exchange-rate-client.service';
import { TransactionService } from './transaction.service';
import { CommissionCalculationService } from '../commission-calculation/commission-calculation.service';

describe('TransactionService', () => {
  const exchangeRateClientServiceMock =
    Mock.ofType<ExchangeRateClientService>();

  const getExchangeRatesMock = jest.fn();
  exchangeRateClientServiceMock
    .setup((x) => x.getExchangeRates())
    .returns(getExchangeRatesMock);

  const rates = {
    EUR: 1,
    VES: 1345945.820654,
    USD: 1.217582,
  };

  const prepareService = () => {
    getExchangeRatesMock.mockResolvedValue(rates);

    return new TransactionService(
      exchangeRateClientServiceMock.object,
      new CommissionCalculationService(),
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 0.5% commission for added transaction', async () => {
    const service = prepareService();

    const newTransaction = {
      date: '2021-04-28',
      amount: '800',
      currency: 'EUR',
      client_id: 420,
    };

    const result = await service.addTransaction(newTransaction);

    expect(result).toEqual([
      {
        date: '2021-04-28',
        amount: 800,
        currency: 'EUR',
        client_id: 420,
        commission_amount: 4,
        commission_currency: 'EUR',
      },
    ]);
  });

  test('should return a minimum commission of 0.05EUR', async () => {
    const service = prepareService();

    const newTransaction = {
      date: '2021-04-28',
      amount: '5',
      currency: 'EUR',
      client_id: 420,
    };

    const result = await service.addTransaction(newTransaction);

    expect(result).toEqual([
      {
        date: '2021-04-28',
        amount: 5,
        currency: 'EUR',
        client_id: 420,
        commission_amount: 0.05,
        commission_currency: 'EUR',
      },
    ]);
  });

  test('should return a commission of 0.05EUR for client with id 42', async () => {
    const service = prepareService();

    const newTransaction = {
      date: '2021-04-28',
      amount: '800',
      currency: 'EUR',
      client_id: 42,
    };

    const result = await service.addTransaction(newTransaction);

    expect(result).toEqual([
      {
        date: '2021-04-28',
        amount: 800,
        currency: 'EUR',
        client_id: 42,
        commission_amount: 0.05,
        commission_currency: 'EUR',
      },
    ]);
  });

  test("should use commission of 0.03EUR when a client's turnover for the month reaches 1000eur", async () => {
    const service = prepareService();

    const clientAlpha = 1;
    const clientBravo = 2;

    const transactionAlpha1 = {
      date: '2021-04-27',
      amount: '400',
      currency: 'EUR',
      client_id: clientAlpha,
    };
    const transactionAlpha2 = {
      date: '2021-04-28',
      amount: '600',
      currency: 'EUR',
      client_id: clientAlpha,
    };
    const transactionAlpha3 = {
      date: '2021-05-01',
      amount: '700',
      currency: 'EUR',
      client_id: clientAlpha,
    };

    const transactionBravo1 = {
      date: '2021-05-11',
      amount: '777',
      currency: 'EUR',
      client_id: clientBravo,
    };
    const transactionBravo2 = {
      date: '2021-05-12',
      amount: '888',
      currency: 'EUR',
      client_id: clientBravo,
    };

    await service.addTransaction(transactionAlpha1);
    await service.addTransaction(transactionAlpha2);
    await service.addTransaction(transactionAlpha3);
    await service.addTransaction(transactionBravo1);
    const result = await service.addTransaction(transactionBravo2);

    expect(result).toEqual([
      {
        date: '2021-04-27',
        amount: 400,
        currency: 'EUR',
        client_id: clientAlpha,
        commission_amount: 2, // usual rates apply
        commission_currency: 'EUR',
      },
      {
        date: '2021-04-28',
        amount: 600,
        currency: 'EUR',
        client_id: clientAlpha,
        commission_amount: 0.03, // turnover of 1000 for clientAlpha in April
        commission_currency: 'EUR',
      },
      {
        date: '2021-05-01',
        amount: 700,
        currency: 'EUR',
        client_id: clientAlpha,
        commission_amount: 3.5, // usual rates apply again (new month)
        commission_currency: 'EUR',
      },
      {
        date: '2021-05-11',
        amount: 777,
        currency: 'EUR',
        client_id: clientBravo,
        commission_amount: 3.885, // usual rates apply
        commission_currency: 'EUR',
      },
      {
        date: '2021-05-12',
        amount: 888,
        currency: 'EUR',
        client_id: clientBravo,
        commission_amount: 0.03, // turnover of 1000 for clientBravo in May
        commission_currency: 'EUR',
      },
    ]);
  });

  describe('when transaction currency does not match commission currency (EUR)', () => {
    test('should return 0.5% commission from exchanged amount for added transaction', async () => {
      const service = prepareService();

      const newTransaction = {
        date: '2021-11-27',
        amount: '800',
        currency: 'USD',
        client_id: 420,
      };

      const result = await service.addTransaction(newTransaction);

      expect(result).toEqual([
        {
          date: '2021-11-27',
          amount: 800,
          currency: 'USD',
          client_id: 420,
          commission_amount: 4.870328,
          commission_currency: 'EUR',
        },
      ]);
    });
  });
});
