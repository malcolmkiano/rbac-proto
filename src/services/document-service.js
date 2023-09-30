// @ts-check

const documents = [
  {
    id: "doc1",
    text: "Doc 1 text",
  },
  {
    id: "doc2",
    text: "Doc 2 text",
  },
  {
    id: "doc3",
    text: "Doc 3 text",
  },
  {
    id: "doc4",
    text: "Doc 4 text",
  },
  {
    id: "doc5",
    text: "Doc 5 text",
  },
];

class DocumentService {
  fetchDocument(id) {
    const document = documents.find((doc) => doc.id === id) || null;
    return document;
  }
}

module.exports = DocumentService;
