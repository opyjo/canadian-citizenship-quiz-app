/**
 * This script parses the questions from the provided text format
 * and converts them to a format suitable for insertion into Supabase.
 *
 * To run this script:
 * 1. Save your questions in a file named 'questions.txt'
 * 2. Run: npx ts-node parse-questions.ts
 * 3. The script will output a JSON file with the parsed questions
 */

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

function parseQuestions(text: string): Question[] {
  const questions: Question[] = []

  // Split the text into individual question blocks
  const questionBlocks = text.split(/\n\s*\n/)

  for (const block of questionBlocks) {
    if (!block.trim()) continue

    try {
      // Extract question number and text
      const questionMatch = block.match(
        /\*\*(?:Question|question)\s+(?:(\d+)|one|two|three|four|five|six|seven|eight|nine|ten)(?::|\.|\*\*)\s*(.*?)(?:\n|$)/i,
      )

      if (!questionMatch) continue

      let questionNumber = questionMatch[1]
      // Convert word numbers to digits if needed
      if (!questionNumber) {
        const wordToNumber: Record<string, string> = {
          one: "1",
          two: "2",
          three: "3",
          four: "4",
          five: "5",
          six: "6",
          seven: "7",
          eight: "8",
          nine: "9",
          ten: "10",
        }
        const wordMatch = block.match(/\*\*(?:Question|question)\s+(one|two|three|four|five|six|seven|eight|nine|ten)/i)
        if (wordMatch) {
          questionNumber = wordToNumber[wordMatch[1].toLowerCase()]
        }
      }

      if (!questionNumber) continue

      const id = Number.parseInt(questionNumber)
      const questionText = questionMatch[2].trim()

      // Extract options
      const optionAMatch = block.match(/$$a$$(.*?)(?:$$b$$|$)/s)
      const optionBMatch = block.match(/$$b$$(.*?)(?:$$c$$|$)/s)
      const optionCMatch = block.match(/$$c$$(.*?)(?:$$d$$|$)/s)
      const optionDMatch = block.match(/$$d$$(.*?)(?:\*\*Correct Answer:|$)/s)

      if (!optionAMatch || !optionBMatch || !optionCMatch || !optionDMatch) continue

      const optionA = optionAMatch[1].trim()
      const optionB = optionBMatch[1].trim()
      const optionC = optionCMatch[1].trim()
      const optionD = optionDMatch[1].trim()

      // Extract correct answer
      const correctAnswerMatch = block.match(/\*\*Correct Answer:\s*$$([a-d])$$/i)
      if (!correctAnswerMatch) continue

      const correctOption = correctAnswerMatch[1].toLowerCase()

      // Extract explanation if available
      let answerExplanation = ""
      const explanationMatch = block.match(/\*\*Correct Answer:[^\n]*\n(.*?)(?:\n\s*\n|$)/s)
      if (explanationMatch) {
        answerExplanation = explanationMatch[1].trim()
      }

      questions.push({
        id,
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        answer_explanation: answerExplanation || undefined,
      })
    } catch (error) {
      console.error(`Error parsing question block: ${block}`)
      console.error(error)
    }
  }

  return questions
}

// Main execution
try {
  // Read the input file
  const inputPath = path.join(__dirname, "questions.txt")
  const outputPath = path.join(__dirname, "parsed-questions.json")

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found. Please create a file named "questions.txt" with your questions.')
    process.exit(1)
  }

  const text = fs.readFileSync(inputPath, "utf8")
  const questions = parseQuestions(text)

  // Write the parsed questions to a JSON file
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2))

  console.log(`Successfully parsed ${questions.length} questions.`)
  console.log(`Output saved to ${outputPath}`)
} catch (error) {
  console.error("Error:", error)
}
