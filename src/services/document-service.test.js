// @ts-check

const DocumentService = require("./document-service");

const documentService = new DocumentService();

describe("DocumentService", () => {
  test("fetchDocument - should return the document with the specified ID", () => {
    const documentId = "doc1";
    const expectedDocument = {
      id: "doc1",
      text: "Doc 1 text",
    };

    const result = documentService.fetchDocument(documentId);
    expect(result).toEqual(expectedDocument);
  });

  test("fetchDocument - should return null for a non-existent document", () => {
    const documentId = "nonExistentDoc";
    const result = documentService.fetchDocument(documentId);
    expect(result).toBeNull();
  });
});
