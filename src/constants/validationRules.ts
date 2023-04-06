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
    }
  },
  flashcard: {
    sideMaxLength: 150,
    sideMinLength: 1,
  },
}