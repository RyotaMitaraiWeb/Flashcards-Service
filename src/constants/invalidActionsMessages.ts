/**
 * An object that contains messages for 401, 403, and 404 errors.
 */
export const invalidActionsMessages = {
  failedLogin: 'Wrong username or password',
  isNotLoggedOut: 'You must be logged out to perform this action',
  isNotLoggedIn: 'You must be logged in to perform this action',
  isNotCreator: 'You must be the creator of the deck to perform this action',
  isCreator: 'You cannot perform this action because you are the creator of the deck',
  deckDoesNotExist: 'The deck you are looking for does not exist',
  hasAlreadyBookmarked: 'You have already bookmarked this deck',
  hasNotBookmarked: 'You have not bookmarked this deck'
}