# Custom validators
```typescript
export class UniqueUsernameValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  async validate(username: string): Promise<boolean> {
    const exists = await this.accountRepository.findOneBy({
      username,
    });
    return !exists;
  }
}
```
This validator checks if the username is already taken by another user.