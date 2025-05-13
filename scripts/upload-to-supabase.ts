/**
 * This script uploads the parsed questions to Supabase.
 *
 * To run this script:
 * 1. Make sure you have parsed the questions using parse-questions.ts
 * 2. Set your Supabase URL and key as environment variables
 * 3. Run: SUPABASE_URL=your-url SUPABASE_KEY=your-key npx ts-node upload-to-supabase.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  answer_explanation?: string
}

async function uploadQuestions() {
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL and key must be provided as environment variables.")
    console.error("Example: SUPABASE_URL=your-url SUPABASE_KEY=your-key npx ts-node upload-to-supabase.ts")
    process.exit(1)
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Read the parsed questions
  const inputPath = path.join(__dirname, "parsed-questions.json")

  if (!fs.existsSync(inputPath)) {
    console.error("Parsed questions file not found. Please run parse-questions.ts first.")
    process.exit(1)
  }

  const questions: Question[] = JSON.parse(fs.readFileSync(inputPath, "utf8"))

  console.log(`Uploading ${questions.length} questions to Supabase...`)

  // Upload questions in batches to avoid rate limits
  const batchSize = 50
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize)

    const { data, error } = await supabase.from("questions").upsert(batch, { onConflict: "id" })

    if (error) {
      console.error(`Error uploading batch ${i / batchSize + 1}:`, error)
    } else {
      console.log(`Successfully uploaded batch ${i / batchSize + 1} (${batch.length} questions)`)
    }

    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log("Upload complete!")
}

uploadQuestions().catch(console.error)
