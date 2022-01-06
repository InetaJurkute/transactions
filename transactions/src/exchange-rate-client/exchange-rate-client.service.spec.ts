import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateClientService } from './exchange-rate-client.service';

describe('ExchangeRateClientService', () => {
  let service: ExchangeRateClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeRateClientService],
    }).compile();

    service = module.get<ExchangeRateClientService>(ExchangeRateClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
