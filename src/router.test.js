const AuthService = require("./services/auth-service");
const DocumentService = require("./services/document-service");
const RoleService = require("./services/role-service");

// Mock the methods of AuthService, DocumentService, and RoleService
jest.mock("./services/auth-service");
jest.mock("./services/document-service");
jest.mock("./services/role-service");

const router = require("./router");

describe("Router - fetchDocument", () => {
  beforeEach(() => {
    AuthService.mockClear();
    DocumentService.mockClear();
    RoleService.mockClear();
  });

  test("should return 401 if userId is not provided", () => {
    AuthService.prototype.identify.mockReturnValue(null);
    const result = router.fetchDocument("invalid-token", "documentId");
    expect(result).toBe(
      "401 Unauthorized: User ID is required to access Document 'documentId'"
    );
  });

  test("should return 401 if user does not have access", () => {
    AuthService.prototype.identify.mockReturnValue("userId");
    RoleService.prototype.checkAccess.mockReturnValue(false);
    const result = router.fetchDocument("token", "documentId");
    expect(result).toBe(
      "401 Unauthorized: User 'userId' does not have access to Document 'documentId'"
    );
  });

  test("should return 404 if document does not exist", () => {
    AuthService.prototype.identify.mockReturnValue("userId");
    RoleService.prototype.checkAccess.mockReturnValue(true);
    DocumentService.prototype.fetchDocument.mockReturnValue(null);
    const result = router.fetchDocument("token", "documentId");
    expect(result).toBe(
      "404 Document Not Found: Document 'documentId' does not exist"
    );
  });

  test("should return document text if user has access and document exists", () => {
    AuthService.prototype.identify.mockReturnValue("userId");
    RoleService.prototype.checkAccess.mockReturnValue(true);
    DocumentService.prototype.fetchDocument.mockReturnValue({
      text: "Document Text",
    });
    const result = router.fetchDocument("token", "documentId");
    expect(result).toBe(
      "User 'userId' (document 'documentId'): 'Document Text'"
    );
  });
});
