import { validationRules } from "./validationRules";

const { account, deck } = validationRules;

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
  deck: {
    title: {
      isTooLong: `Title must be no more than ${deck.title.maxLength}`,
      isTooShort: `Title must have at least ${deck.title.minLength} characters`,
      isNotString: 'Title must be a string',
    },
    description: {
      isTooLong: `Description must be no more than ${deck.description.maxLength}`,
      isNotString: 'Description must be a string',
    },
    flashcards: {
      notEnoughFlashcards: `The deck must have at least ${validationRules.deck.flashcards.minimumFlashcards} flashcard(s)`,
    },
  },
  flashcard: {
    sideIsTooShort: `A side must be at least ${validationRules.flashcard.sideMinLength} character(s) long`,
    sideIsTooLong: `A side must be no more than ${validationRules.flashcard.sideMaxLength} character(s) long`,
    sideIsNotString: 'A side must be a string',
  }
};