import { Test, TestingModule } from '@nestjs/testing';
import { RentJobService } from './rent-job.service';

describe('RentJobService', () => {
  let service: RentJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentJobService],
    }).compile();

    service = module.get<RentJobService>(RentJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
