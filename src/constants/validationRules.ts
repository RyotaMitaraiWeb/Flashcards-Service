import { order, sortCategory } from '../interfaces';

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
  },
  deck: {
    title: {
      maxLength: 200,
      minLength: 5,
    },
    description: {
      maxLength: 500,
    },
    flashcards: {
      minimumFlashcards: 1,
    },
    search: {
      order: ['asc', 'desc'] as order[],
      sortBy: ['title', 'createdAt', 'updatedAt'] as sortCategory[],
      limit: 6,
    }
  },
  flashcard: {
    sideMaxLength: 150,
    sideMinLength: 1,
  },
}