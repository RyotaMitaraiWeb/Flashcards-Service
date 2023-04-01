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
 * interface IAuthSuccessResponse {
    token: string;
}
 * ```
 * This is used to type the response from a successful register/login/session request during tests.
 */
export interface IAuthSuccessResponse {
  token: string;
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
export interface IAuthErrorResponse {
  message: string[];
  error: string;
  statusCode: string;
}