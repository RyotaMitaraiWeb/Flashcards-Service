import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UniqueUsernameValidator } from './uniqueUsername';
import { Account } from '../modules/accounts/entities/account.entity';

describe('UniqueUsername validator', () => {
  let repository: Repository<Account>;
  let validator: UniqueUsernameValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        UniqueUsernameValidator,
      {
        provide: getRepositoryToken(Account),
        useClass: Repository,
      }],
    }).compile();

    
    repository = module.get<Repository<Account>>(getRepositoryToken(Account));
    validator = module.get<UniqueUsernameValidator>(UniqueUsernameValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  it('Returns true when the user does not exist', async () => {
    jest.spyOn(repository, 'findOneBy').mockImplementation(async () => null);

    const exists = await validator.validate('a');
    expect(exists).toBe(true);
  });

  it('Returns false when the user exists', async () => {
    jest.spyOn(repository, 'findOneBy').mockImplementation(async () => new Account());

    const exists = await validator.validate('a');
    expect(exists).toBe(false);
  });
});
