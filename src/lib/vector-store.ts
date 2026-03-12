import { Document, VectorStoreIndex, Settings, storageContextFromDefaults } from "llamaindex";
import { OpenAIEmbedding } from "@llamaindex/openai";

export async function createOrReadVectorStoreIndex(
  docText?: string,
): Promise<VectorStoreIndex> {
  Settings.embedModel = new OpenAIEmbedding();
  Settings.chunkSize = 512;
  Settings.chunkOverlap = 50;

  const storageContext = await storageContextFromDefaults({
    persistDir: "./storage",
  });

  const index = await VectorStoreIndex.fromDocuments(
    docText ? [new Document({ text: docText })] : [],
    { storageContext },
  );

  return index;
}