import { MaxLength, IsAlphanumeric, MinLength, Validate } from "class-validator";
import { validationMessages } from "../../../constants/validationMessages";
import { validationRules } from "../../../constants/validationRules";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UniqueUsernameValidator } from '../../../custom-validators/uniqueUsername';

/**
 * ```typescript
 * class Account {
 *  id: number;
 *  username: string;
 *  password: string;
 * }
 * ```
 */
@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  public id: number;

  @MaxLength(validationRules.account.username.maxLength, {
    message: validationMessages.account.username.isTooLong
  })
  @MinLength(validationRules.account.username.minLength, {
    message: validationMessages.account.username.isTooShort
  })
  @IsAlphanumeric(undefined, {
    message: validationMessages.account.username.isNotAlphanumeric
  })
  @Column({
    type: 'varchar',
    length: validationRules.account.username.maxLength,
  })
  public username: string;
  
  @Column()
  public password: string;
}
