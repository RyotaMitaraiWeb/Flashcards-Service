import { validationRules } from "./validationRules";

const { account } = validationRules;

/**
 * An object that contains validation error messages.
 */
export const validationMessages = {
  account: {
    username: {
      isTooShort: `The username must be at least ${account.username.minLength} characters long`,
      isTooLong: `The username must be no longer than ${account.username.maxLength} characters`,
      isNotAlphanumeric: 'The username can only consist of English letters and numbers',
      alreadyExists: 'This user already exists',
      isNotString: 'Username must be a string'
    },
    password: {
      isTooShort: `The password must be at least ${account.password.minLength} characters long`,
      isNotString: 'Password must be a string'
    },
  },
  
};