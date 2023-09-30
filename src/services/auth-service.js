// @ts-check

class AuthService {
  /**
   * @typedef {Map<string, string>} TokenMap - Map where the key is the token, and the value is the userId
   */

  /** @type TokenMap */
  #tokens;

  constructor() {
    this.#tokens = new Map();
  }

  /**
   * Simulates generating a token for a user.
   * @param {string} userId - The ID of the user for whom to generate a token.
   * @returns {string} The generated token.
   */
  authenticate(userId) {
    const token = btoa(`${userId}-token`);
    this.#tokens.set(token, userId);
    return token;
  }

  /**
   * Simulates decoding a token to get a user ID.
   * @param {string} token - The token to decode.
   * @returns {string | null} The user ID if the token is valid, otherwise null.
   */
  identify(token) {
    return this.#tokens.get(token) || null;
  }
}

module.exports = AuthService;
