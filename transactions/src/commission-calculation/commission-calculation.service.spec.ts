import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCalculationService } from './commission-calculation.service';

describe('CommissionCalculationService', () => {
  let service: CommissionCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionCalculationService],
    }).compile();

    service = module.get<CommissionCalculationService>(CommissionCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
