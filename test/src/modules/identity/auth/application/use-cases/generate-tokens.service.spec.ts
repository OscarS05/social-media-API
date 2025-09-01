import { Test, TestingModule } from '@nestjs/testing';
import { GenerateTokensService } from '../generate-tokens.service';

describe('GenerateTokensService', () => {
  let service: GenerateTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateTokensService],
    }).compile();

    service = module.get<GenerateTokensService>(GenerateTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
