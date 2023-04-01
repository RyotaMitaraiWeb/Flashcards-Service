/**
 * This function extracts the token from a ``Bearer [token]`` input or returns an empty string if
 * if the input is ``null``, ``undefined``, or a string that does not start with ``Bearer ``
 * (this is case sensitive and the space after "Bearer" is required)
 * 
 * **Examples:**
 * ```typescript
 * 'Bearer 123456'; // '123456'
 * undefined; // empty string
 * null; // empty string
 * 'completely unrelated string'; // empty string (does not start with "Bearer")
 * 'Bearer'; // empty string (note that the space after "Bearer" is missing)
 * 'bearer 123456'; // empty string (note that it looks for "Bearer", not "bearer")
 * ```
 * 
 * @param bearerToken - the token in format ``Bearer [token]``
 * @returns the extracted token or an empty string if ``bearerToken`` is ``null``, ``undefined``,
 * or does not start with ``Bearer `` &nbsp;(including the space, case sensitive)
 */
export function extractTokenFromHeader(bearerToken: string | null | undefined) {
  if (!bearerToken) {
    return '';
  }

  if (!bearerToken.startsWith('Bearer ')) {
    return '';
  }

  const token = bearerToken.split(' ')[1] || '';
  return token;
}