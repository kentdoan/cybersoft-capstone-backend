import { Test, TestingModule } from '@nestjs/testing';
import { RentJobController } from './rent-job.controller';
import { RentJobService } from './rent-job.service';

describe('RentJobController', () => {
  let controller: RentJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentJobController],
      providers: [RentJobService],
    }).compile();

    controller = module.get<RentJobController>(RentJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
