import { extractTokenFromHeader } from './extractTokenFromHeader';

describe('extractTokenFromHeader', () => {
  it('Retrieves token from a correctly formated bearer token', () => {
    const token = extractTokenFromHeader('Bearer a');
    expect(token).toBe('a');
  });

  it('Returns an empty string if passed null', () => {
    const token = extractTokenFromHeader(null);
    expect(token).toBe('');
  });

  it('Returns an empty string if passed undefined', () => {
    const token = extractTokenFromHeader(undefined);
    expect(token).toBe('');
  });

  it('Returns an empty string if the token does not start with "Bearer " (including the space)', () => {
    const token = extractTokenFromHeader('Bearer');
    expect(token).toBe('');
  });
});