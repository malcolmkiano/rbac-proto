// @ts-check

const AuthService = require("./services/auth-service");
const DocumentService = require("./services/document-service");
const RoleService = require("./services/role-service");

/**
 * Fetches a document based on the provided token and documentId.
 * @param {string} token - The token used to authenticate the user.
 * @param {string} documentId - The ID of the document to fetch.
 * @returns {string} A string containing the document text if successful, or an error message if unsuccessful.
 */
const fetchDocument = (token, documentId) => {
  const authService = new AuthService();
  const documentService = new DocumentService();
  const roleService = new RoleService([], []);

  /**
   * Identify the user using the provided token.
   * Typically, there would also be a check for a valid token,
   * returning a 401 if the token is invalid or expired.
   */
  const userId = authService.identify(token);
  if (!userId)
    return `401 Unauthorized: User ID is required to access Document '${documentId}'`;

  /**
   * Using the userID derived from the token to check access.
   * If the user does not have access, a 401 Unauthorized error is returned.
   */
  const userHasAccess = roleService.checkAccess(userId, documentId);
  if (!userHasAccess)
    return `401 Unauthorized: User '${userId}' does not have access to Document '${documentId}'`;

  /**
   * Fetching the document, which is likely a protected resource.
   * If the document does not exist, a 404 Document Not Found error is returned.
   */
  const document = documentService.fetchDocument(documentId);
  if (!document)
    return `404 Document Not Found: Document '${documentId}' does not exist`;

  /**
   * If all checks pass, return the text of the fetched document.
   */
  return `User '${userId}' (document '${documentId}'): '${document.text}'`;
};

module.exports = { fetchDocument };
