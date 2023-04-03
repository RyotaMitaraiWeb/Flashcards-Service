/**
 * Holds blacklisted tokens. Blacklisted tokens are considered invalid when verified and therefore
 * cannot be used for authorized requests. **Note:** the blacklist is refreshed on every
 * server restart.
 */
export const jwtBlacklist = new Set<string>();