// @ts-check

const AuthService = require("./auth-service");

describe("AuthService", () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test("should generate and authenticate a token for a user", () => {
    const userId = "testUser";
    const token = authService.authenticate(userId);

    // Verify that the token is a string
    expect(typeof token).toBe("string");

    // Verify that the token is not empty
    expect(token.length).toBeGreaterThan(0);

    // Verify that the identified user from the token matches the original user ID
    expect(authService.identify(token)).toBe(userId);
  });

  test("should return null for an invalid token", () => {
    const invalidToken = "invalidToken";
    const identifiedUserId = authService.identify(invalidToken);

    // Verify that an invalid token returns null
    expect(identifiedUserId).toBeNull();
  });
});
