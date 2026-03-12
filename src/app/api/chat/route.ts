import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { createOrReadVectorStoreIndex } from "@/lib/vector-store";
import { MetadataMode } from "llamaindex";
import { MAX_RESPONSE_TOKENS } from "@/lib/tokens";
import { trimMessages } from "@/lib/tokens";
import { Message } from "ai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { messages } = await request.json();

  const systemMessage = {
    role: "system",
    content:
      "You are a helpful assistant for answering questions about the uploaded PDF file.",
  };
  const lastMessage = messages[messages.length - 1];
  const index = await createOrReadVectorStoreIndex();

  const retriever = index.asRetriever();
  retriever.similarityTopK = 1;

  const [matchingNode] = await retriever.retrieve(lastMessage.content);

  console.log("messages", [systemMessage, ...messages]);
  console.log("Matching node:", matchingNode);

  if (matchingNode?.score != null && matchingNode.score > 0.8) {
    const knowledge = matchingNode.node.getContent(MetadataMode.NONE);
    systemMessage.content = `
       You are a helpful assistant for answering questions about the uploaded PDF file. Use the following extracted information from the PDF to answer the user's question:
        ---
       ${knowledge}
        ---
       When it's possible, explain the reasoning for your responses based on this knowledge.
      `;
  } else {
    systemMessage.content = `However, you couldn't find relevant information from the PDF to answer the user's question. You can try to answer based on your general knowledge, but make sure to indicate that you don't have specific information from the PDF.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    max_tokens: MAX_RESPONSE_TOKENS,
    messages: trimMessages([systemMessage, ...messages]) as Message[],
    stream: true,
  });
  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
