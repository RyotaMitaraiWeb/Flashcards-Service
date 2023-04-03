import { MaxLength, IsAlphanumeric, MinLength, IsString, Validate } from "class-validator";
import { validationMessages } from "../../../constants/validationMessages";
import { validationRules } from "../../../constants/validationRules";
import { UniqueUsernameValidator } from '../../../custom-validators/uniqueUsername';
import { ApiProperty } from '@nestjs/swagger';

/**
 * ```typescript
 * class LoginDto {
 *  username: string;
 *  password: string;
 * }
 * ```
 * This DTO is used for mapping requests to ``/accounts/login`` to an object that is suitable
 * for use when logging in the user.
 */
export class LoginDto {
  @ApiProperty()
  public username: string;

  @ApiProperty()
  public password: string;
}
