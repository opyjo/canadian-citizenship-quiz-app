import { openai } from "@ai-sdk/openai";
import { generateText, CoreMessage } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

// --- Configuration ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "text-embedding-ada-002",
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "documents",
  queryName: "match_documents",
});

const ANSWER_NOT_FOUND_MARKER = "[[ANSWER_NOT_FOUND_IN_CONTEXT]]";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // --- RAG Implementation with Automatic Web Search Fallback ---
    let retrievedContext = "";
    let contextFound = false;

    try {
      console.log(`[RAG] Searching for context related to: "${question}"`);
      const K_RESULTS = 4;
      const relevantChunks = await vectorStore.similaritySearch(
        question,
        K_RESULTS
      );

      if (relevantChunks && relevantChunks.length > 0) {
        retrievedContext = relevantChunks
          .map((chunk) => chunk.pageContent)
          .join("\n---\n");
        contextFound = true;
        console.log(`[RAG] Found ${relevantChunks.length} relevant chunks.`);
      } else {
        console.log(
          "[RAG] No relevant context chunks found in Supabase for the question."
        );
        // contextFound remains false
      }
    } catch (searchError: any) {
      console.error("[RAG_ERROR] Error during similarity search:", searchError);
      return NextResponse.json(
        {
          error: "Failed to retrieve context from knowledge base.",
          details: searchError.message,
        },
        { status: 500 }
      );
    }

    // If no context found, automatically fall back to web search
    if (!contextFound) {
      console.log(
        "[RAG] No vector search results at all. Automatically falling back to web search."
      );

      const systemPromptWeb = `You are a helpful AI assistant. The user is asking a question about Canadian citizenship.
Answer the question using your general knowledge. Provide a comprehensive and informative answer.`;

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPromptWeb,
        prompt: question,
      });

      const disclaimer =
        "\n\n*Note: This information comes from general knowledge as it wasn't found in the 'Discover Canada' guide. For official citizenship test preparation, please verify with current government resources.*";

      return NextResponse.json({
        type: "web_answer",
        content: text + disclaimer,
      });
    }

    // Try to answer using the retrieved context
    const systemPrompt = `You are a helpful assistant answering questions about Canadian citizenship based on the "Discover Canada" study guide.

IMPORTANT: Only use the provided context to answer questions. If the context contains relevant information that can help answer the question, provide a helpful response using that information.

You have TWO options:
1. If the context contains relevant information: Provide a helpful answer using that information. You may mention if the context doesn't provide complete details, but still give what information is available.
2. If the context contains absolutely no relevant information: Output ONLY this exact phrase: "${ANSWER_NOT_FOUND_MARKER}"

NEVER mix a substantive answer with the special marker phrase. Choose one or the other.

Context from the Discover Canada guide:
${retrievedContext}`;

    const messages: CoreMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `User's Question: ${question}

Please provide your answer. If the answer is not in the excerpts, remember the specific instruction.`,
      },
    ];

    const { text: rawAnswer } = await generateText({
      model: openai("gpt-4o"),
      messages: messages,
      temperature: 0,
    });

    // If LLM says the answer isn't in context, automatically fall back to web search
    if (rawAnswer.trim() === ANSWER_NOT_FOUND_MARKER) {
      console.log(
        "[RAG] LLM indicated answer not in context. Automatically falling back to web search."
      );

      const systemPromptWeb = `You are a helpful AI assistant. The user is asking a question about Canadian citizenship.
Answer the question using your general knowledge. Provide a comprehensive and informative answer.`;

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPromptWeb,
        prompt: question,
      });

      const disclaimer =
        "\n\n*Note: This information comes from general knowledge as it wasn't found in the 'Discover Canada' guide. For official citizenship test preparation, please verify with current government resources.*";

      return NextResponse.json({
        type: "web_answer",
        content: text + disclaimer,
      });
    }

    // Return the answer from the guide context
    return NextResponse.json({
      type: "contextual_answer",
      content: rawAnswer,
    });
  } catch (error: any) {
    console.error("[API_ERROR] /api/ask-discover-canada:", error);
    let clientErrorMessage =
      "An error occurred while processing your question.";
    let errorDetails = "Internal server error.";
    if (error.message) {
      errorDetails = error.message;
    }
    return NextResponse.json(
      { error: clientErrorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
