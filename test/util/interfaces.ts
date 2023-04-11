import { ICreatedSession } from '../../src/interfaces';

interface IHttpError {
  message: string[];
  error: string;
  statusCode: number;
}

/**
 * ```typescript
 * interface IAuthBody {
    username: string;
    password: string;
}
 * ```
 * This is used for sending a register or login request during tests
 */
export interface IAuthBody {
  username: string;
  password: string;
}

/**
 * ```typescript
 * interface IAuthErrorResponse {
    message: string[];
    error: string;
    statusCode: string;
}
 * ```
 * This is used to type a failed register/login request during tests.
 */
export interface IAuthErrorResponse extends IHttpError {

}

/**
 * ```typescript
 * interface IFlashcardSubmission {
    front: string;
    back: string;
}
 * ```
 */
export interface IFlashcardSubmission {
  front: string;
  back: string;
}

/**
 * ```typescript
 * interface IDeckSubmission {
    title: string;
    description: string;
    flashcards: IFlashcardSubmission[];
  }
 * ```
 * Represents the body of POST requests sent to ``/decks``
 */
export interface IDeckSubmission {
  title: string;
  description: string;
  flashcards: IFlashcardSubmission[];
}

/**
 * ```typescript
 * interface IDeckSubmissionSuccess {
    id: number;
  }
 * ```
 * Represents the response body of a successful POST request to ``/decks``
 */
export interface IDeckSubmissionSuccess {
  id: number;
}

/**
 * ```typescript
 * interface IDeckSubmissionFailure {
    message: string[];
    error: string;
    statusCode: string;
  }
 * ```
 * Represents the body of a failed POST request to ``/decks``.
 */
export interface IDeckSubmissionFailure extends IHttpError {
  
}