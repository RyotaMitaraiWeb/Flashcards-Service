/**
 * An object containing validation rules values.
 */
export const validationRules = {
  account: {
    username: {
      maxLength: 15,
      minLength: 5,
    },
    password: {
      minLength: 6,
    }
  }
}