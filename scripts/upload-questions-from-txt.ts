import dotenv from "dotenv";
import path from "path";

// Attempt to load .env.local from the project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import fs from "fs";
import supabaseClient from "../lib/supabase-client";
import type { Database } from "../types/supabase";

const QUESTIONS_PATH = path.join(__dirname, "../question.txt");

const supabase = supabaseClient;

type QuestionInsert = Database["public"]["Tables"]["questions"]["Insert"];

function parseQuestionsFromTxt(txt: string): QuestionInsert[] {
  const lines = txt.split(/\r?\n/);
  const questions: QuestionInsert[] = [];
  let current: Partial<QuestionInsert> = {};
  let options: Record<string, string> = {};
  let inQuestion = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("**Question")) {
      if (
        current.question_text &&
        Object.keys(options).length === 4 &&
        current.correct_option
      ) {
        questions.push({
          question_text: current.question_text,
          option_a: options["a"] || "",
          option_b: options["b"] || "",
          option_c: options["c"] || "",
          option_d: options["d"] || "",
          correct_option: current.correct_option,
        } as QuestionInsert);
      }
      // Start new question
      current = {};
      options = {};
      inQuestion = true;
      // Extract question text
      const qMatch = line.match(/\*\*Question \d+:\*\* (.+)/i);
      if (qMatch) {
        current.question_text = qMatch[1].trim();
      } else {
        // Sometimes the question number is written differently
        const altQMatch = line.match(/\*\*question \d+:\*\* (.+)/i);
        if (altQMatch) current.question_text = altQMatch[1].trim();
      }
    } else if (inQuestion && line.match(/^\([a-dA-D]\)/)) {
      // Option line
      const optMatch = line.match(/^\(([a-dA-D])\)\s*(.+)$/);
      if (optMatch) {
        options[optMatch[1].toLowerCase()] = optMatch[2].trim();
      }
    } else if (inQuestion && line.startsWith("**Correct Answer:")) {
      // Correct answer line
      const ansMatch = line.match(/\*\*Correct Answer: \(([A-Da-d])\)/);
      if (ansMatch) {
        current.correct_option = ansMatch[1].toUpperCase();
      }
      // End of question
      inQuestion = false;
    }
  }
  // Push the last question if present
  if (
    current.question_text &&
    Object.keys(options).length === 4 &&
    current.correct_option
  ) {
    questions.push({
      question_text: current.question_text,
      option_a: options["a"] || "",
      option_b: options["b"] || "",
      option_c: options["c"] || "",
      option_d: options["d"] || "",
      correct_option: current.correct_option,
    } as QuestionInsert);
  }
  return questions;
}

async function main() {
  const txt = fs.readFileSync(QUESTIONS_PATH, "utf8");
  const questions = parseQuestionsFromTxt(txt);
  console.log(`Parsed ${questions.length} questions. Uploading to Supabase...`);

  // Insert in batches to avoid hitting row limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    const { error, data } = await supabase
      .from("questions")
      .insert(batch)
      .select("id");
    if (error) {
      console.error(`Error uploading batch ${i / BATCH_SIZE + 1}:`, error);
      process.exit(1);
    } else {
      console.log(
        `Uploaded batch ${i / BATCH_SIZE + 1}: ${batch.length} questions.`
      );
    }
  }
  console.log("All questions uploaded successfully!");
}

main().catch((err) => {
  console.error("Error uploading questions:", err);
  process.exit(1);
});
