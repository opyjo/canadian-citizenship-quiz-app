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

export async function POST(req: Request) {
  try {
    const { question, searchMode } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }
    if (!searchMode || (searchMode !== "context" && searchMode !== "web")) {
      return NextResponse.json(
        { error: "Invalid search mode" },
        { status: 400 }
      );
    }

    // --- RAG Implementation for "context" mode ---
    if (searchMode === "context") {
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
        console.error(
          "[RAG_ERROR] Error during similarity search:",
          searchError
        );
        return NextResponse.json(
          {
            error: "Failed to retrieve context from knowledge base.",
            details: searchError.message,
          },
          { status: 500 }
        );
      }

      // This block is if NO relevantChunks were found by vector search
      if (!contextFound) {
        console.log(
          "[RAG] No vector search results at all. Offering web search."
        );
        return NextResponse.json({
          type: "needs_web_search",
          message:
            "I couldn't find any specific information in the 'Discover Canada' guide for your question. Would you like me to search the web instead?",
        });
      }

      // Special marker for the LLM to output if the answer isn't in the provided context
      const ANSWER_NOT_FOUND_MARKER = "[[ANSWER_NOT_FOUND_IN_CONTEXT]]";

      const messages: CoreMessage[] = [
        {
          role: "system",
          content: `You are an AI assistant helping users study for the Canadian citizenship test.
Your primary goal is to answer questions based *only* on the provided excerpts from the "Discover Canada" study guide.
Do NOT use any external knowledge or search the web in this mode.
If the answer is not clearly found in the provided excerpts, you MUST output ONLY the exact phrase: ${ANSWER_NOT_FOUND_MARKER}
Do not add any other words, explanations, or formatting around this phrase if the answer is not found.`,
        },
        {
          role: "user",
          content: `Based *only* on the following excerpts from the "Discover Canada" guide:
---
${retrievedContext}
---
User's Question: ${question}

Please provide your answer. If the answer is not in the excerpts, remember the specific instruction.`,
        },
      ];

      const { text: rawAnswer } = await generateText({
        model: openai("gpt-4o"),
        messages: messages,
        temperature: 0, // Set temperature to 0 for more deterministic output of the marker
      });

      if (rawAnswer.trim() === ANSWER_NOT_FOUND_MARKER) {
        console.log(
          "[RAG] LLM indicated answer not in context. Offering web search."
        );
        return NextResponse.json({
          type: "needs_web_search",
          message:
            "I found some information in the 'Discover Canada' guide, but it doesn't seem to directly answer your question. Would you like me to search the web instead?",
        });
      }

      // If the marker isn't found, proceed to return the answer
      return NextResponse.json({
        type: "contextual_answer",
        content: rawAnswer,
      });
    }
    // --- Web Search (Fallback or Direct) ---
    else if (searchMode === "web") {
      console.log(`[WEB_SEARCH] Performing web search for: "${question}"`);
      const systemPromptWeb = `You are a helpful AI assistant. The user is asking a question about Canadian citizenship.
Answer the question using your general knowledge as if you have searched the web. Provide a comprehensive and informative answer.`;

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPromptWeb,
        prompt: question,
      });

      const disclaimer =
        "\n\n*Please note: This information is based on the AI's last training data and may not include very recent events or changes.*";
      return NextResponse.json({
        type: "web_answer",
        content: text + disclaimer,
      });
    }
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
