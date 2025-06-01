import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Load .env.local

import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import fs from "fs"; // For checking file existence

// --- Configuration ---
const PDF_RELATIVE_PATH = "public/discover.pdf"; // IMPORTANT: Place your PDF here or update path
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for ingestion
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  throw new Error(
    "Missing Supabase URL, Service Role Key, or OpenAI API Key in .env"
  );
}
if (!fs.existsSync(PDF_RELATIVE_PATH)) {
  throw new Error(
    `PDF file not found at: ${PDF_RELATIVE_PATH}. Please check the path.`
  );
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "text-embedding-ada-002",
});

// Function to sanitize text, removing null characters
function sanitizeText(text) {
  if (!text) return "";
  return text.replace(/\u0000/g, "").replace(/\x00/g, "");
}

async function runIngestion() {
  console.log("Starting PDF ingestion process...");

  // 1. Load PDF
  console.log(`Loading PDF from: ${PDF_RELATIVE_PATH}`);
  const loader = new PDFLoader(PDF_RELATIVE_PATH);
  const docs = await loader.load();
  console.log(`Loaded ${docs.length} document pages/sections from PDF.`);
  if (docs.length === 0) {
    console.error(
      "No content loaded from PDF. Ensure the PDF is valid and readable."
    );
    return;
  }

  // Sanitize loaded documents before splitting
  const sanitizedDocs = docs.map((doc) => ({
    ...doc,
    pageContent: sanitizeText(doc.pageContent),
  }));

  // 2. Chunk the Text using sanitizedDocs
  console.log("Chunking sanitized documents...");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await textSplitter.splitDocuments(sanitizedDocs);
  console.log(`Created ${chunks.length} text chunks from the PDF.`);
  if (chunks.length === 0) {
    console.error("No chunks created. Check PDF content or splitter settings.");
    return;
  }
  console.log("First chunk metadata example:", chunks[0]?.metadata);
  console.log(
    "First chunk content (first 100 chars):",
    chunks[0]?.pageContent.substring(0, 100) + "..."
  );

  // 3. Store in Supabase
  console.log('Storing chunks and embeddings in Supabase table "documents"...');
  try {
    await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
      client: supabaseAdmin,
      tableName: "documents",
      queryName: "match_documents",
    });
    console.log(
      "Successfully ingested and stored PDF content with embeddings in Supabase."
    );
  } catch (error) {
    console.error("Error during SupabaseVectorStore.fromDocuments:", error);
    if (error.response && error.response.data) {
      console.error("Supabase error details:", error.response.data);
    }
  }
}

runIngestion().catch((e) => {
  console.error("Ingestion script failed:", e);
  process.exit(1);
});
