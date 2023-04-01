import { MaxLength, IsAlphanumeric, MinLength, IsString, Validate } from "class-validator";
import { validationMessages } from "../../../constants/validationMessages";
import { validationRules } from "../../../constants/validationRules";
import { UniqueUsernameValidator } from '../../../custom-validators/uniqueUsername';
import { ApiProperty } from '@nestjs/swagger';

/**
 * ```typescript
 * class RegisterDto {
 *  username: string;
 *  password: string;
 * }
 * ```
 * This DTO is used for mapping requests to ``/accounts/register`` to an object that is suitable
 * for use when registering the user.
 */
export class RegisterDto {
  @MaxLength(validationRules.account.username.maxLength, {
    message: validationMessages.account.username.isTooLong
  })
  @MinLength(validationRules.account.username.minLength, {
    message: validationMessages.account.username.isTooShort
  })
  @IsAlphanumeric(undefined, {
    message: validationMessages.account.username.isNotAlphanumeric
  })
  @IsString({
    message: validationMessages.account.username.isNotString
  })
  @Validate(UniqueUsernameValidator)
  @ApiProperty({
    description: 'Must be at least five characters long and contain only alphanumeric characters.',
  })
  public username: string;

  @MinLength(validationRules.account.password.minLength, {
    message: validationMessages.account.password.isTooShort,
  })
  @IsString({
    message: validationMessages.account.password.isNotString
  })
  @ApiProperty({
    description: 'Must be 6 characters or longer',
  })
  public password: string;
}
