import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Repository } from 'typeorm';
import { Account } from '../modules/accounts/entities/account.entity';
import { validationMessages } from '../constants/validationMessages';

/**
 * This validator checks if the provided username is already used by another user
 */
@ValidatorConstraint({ name: 'userAlreadyExists', async: true })
@Injectable()
export class UniqueUsernameValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  async validate(username: string) {
    const exists = await this.accountRepository.findOneBy({
      username,
    });
    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    return validationMessages.account.username.alreadyExists;
  }
}