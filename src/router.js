// @ts-check

const AuthService = require("./services/auth-service");
const DocumentService = require("./services/document-service");
const RoleService = require("./services/role-service");

const fetchDocument = (token, documentId) => {
  const authService = new AuthService();
  const documentService = new DocumentService();
  const roleService = new RoleService([], []);

  const userId = authService.identify(token);

  // Here, a check for a valid token would typically also occur,
  // returning a 401 if the token is invalid or expired.
  if (!userId)
    return `401 Unauthorized: User ID is required to access Document '${documentId}'`;

  // Using the userID derived from the token to check access.
  const userHasAccess = roleService.checkAccess(userId, documentId);
  if (!userHasAccess)
    return `401 Unauthorized: User '${userId}' does not have access to Document '${documentId}'`;

  // Fetching document, which is likely protected resource.
  const document = documentService.fetchDocument(documentId);
  if (!document)
    return `404 Document Not Found: Document '${documentId}' does not exist`;

  return `User '${userId}' (document '${documentId}'): '${document.text}'`;
};

module.exports = { fetchDocument };
