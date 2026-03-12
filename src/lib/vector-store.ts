import {
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
  storageContextFromDefaults,
} from "llamaindex";

export async function createOrReadVectorStoreIndex(
  docText?: string,
): Promise<VectorStoreIndex> {
  const document = new Document({ text: docText });

  const storageContext = await storageContextFromDefaults({
    persistDir: "./storage",
  });

  const serviceContext = serviceContextFromDefaults({
    chunkSize: 512,
    chunkOverlap: 50,
  });

  const index = await VectorStoreIndex.fromDocuments(
    docText ? [document] : [],
    { storageContext, serviceContext },
  );

  return index;
}
