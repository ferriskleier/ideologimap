import { NextRequest } from "next/server";
import { createOllama } from "ollama-ai-provider";
import { generateText } from "ai";
import { personExists, addPerson } from "@/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api"
});

// Read and parse the political compass questions
const csvPath = join(process.cwd(), "political-compass/political_compass_question-weights.csv");
const csvContent = readFileSync(csvPath, "utf-8");
const questions = csvContent
  .split("\n")
  .slice(1) // Skip header
  .filter(line => line.trim())
  .map(line => {
    const match = line.match(/"(\d+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
    if (match) {
      return {
        id: parseInt(match[1]),
        question: match[2],
        axis: match[3] as "x" | "y",
        units: parseFloat(match[4]),
        agree: match[5] as "+" | "-"
      };
    }
    return null;
  })
  .filter(Boolean) as Array<{
    id: number;
    question: string;
    axis: "x" | "y";
    units: number;
    agree: "+" | "-";
  }>;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { name } = await request.json();

        if (!name || typeof name !== "string") {
          controller.enqueue(encoder.encode(`data: {"error": "Name is required"}\n\n`));
          controller.close();
          return;
        }

        const trimmedName = name.trim();
        if (trimmedName.length > 50) {
          controller.enqueue(encoder.encode(`data: {"error": "Name must be 50 characters or less"}\n\n`));
          controller.close();
          return;
        }

        // Send initial progress
        controller.enqueue(encoder.encode(`data: {"progress": {"current": 0, "total": 64, "message": "Checking if person exists..."}}\n\n`));

        // Check if person already exists
        if (personExists(trimmedName)) {
          controller.enqueue(encoder.encode(`data: {"error": "This person already exists in the database"}\n\n`));
          controller.close();
          return;
        }

        // Send progress update
        controller.enqueue(encoder.encode(`data: {"progress": {"current": 1, "total": 64, "message": "Verifying notability..."}}\n\n`));

        // Check if person is notable enough
        const notabilityResult = await generateText({
          model: ollama("gemma3:27b"),
          messages: [
            {
              role: "system",
              content: "You are evaluating if a person is well-known enough to be placed on a political compass. A person is notable if they are well-documented in Wikipedia and other sources. This includes philosophers, writers, artists, scientists, business leaders, celebrities, historical figures, etc. - not just politicians. Answer ONLY with 'YES' or 'NO'."
            },
            {
              role: "user",
              content: `Is "${trimmedName}" a well-known person (from any field) who is documented enough in Wikipedia and other sources to infer their philosophical and political views? Answer ONLY 'YES' or 'NO'.`
            }
          ],
          temperature: 0.1,
          maxTokens: 10
        });

        const isNotable = notabilityResult.text.trim().toUpperCase() === "YES";

        if (!isNotable) {
          controller.enqueue(encoder.encode(`data: {"error": "This person is not well-known enough to be added to the political compass. Only notable people with sufficient documentation can be added."}\n\n`));
          controller.close();
          return;
        }

        // Calculate coordinates by iterating through each question
        console.log(`Generating political compass answers for: ${trimmedName}`);
        console.log(`Number of questions: ${questions.length}`);
        
        let x = 0;
        let y = 0;
        
        // Process each question individually
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          
          // Send progress update
          controller.enqueue(encoder.encode(`data: {"progress": {"current": ${i + 2}, "total": 64, "message": "Processing question ${i + 1} of ${questions.length}"}}\n\n`));
          
          try {
            const answerResult = await generateText({
              model: ollama("gemma3:27b"),
              messages: [
                {
                  role: "system",
                  content: `You are answering a political compass question on behalf of ${trimmedName} based on their documented political views and positions.

Choose the most accurate answer:
++ (strongly agree) - Use only when ${trimmedName} would have an extreme, uncompromising position on this issue
+ (agree) - Use when ${trimmedName} would generally agree but might have some nuance or exceptions
- (disagree) - Use when ${trimmedName} would generally disagree but might see some merit in the opposing view
-- (strongly disagree) - Use only when ${trimmedName} would fundamentally oppose this with no room for compromise

Most answers should be + or - unless the person had extreme views on that specific issue.
Respond with ONLY the symbol, nothing else.`
                },
                {
                  role: "user",
                  content: `How would ${trimmedName} answer this question:\n"${question.question}"\n\nAnswer with only ++, +, -, or --`
                }
              ],
              temperature: 0.5,
              maxTokens: 10
            });

            const answerSymbol = answerResult.text.trim();
            console.log(`Q${question.id}: "${question.question}" -> ${answerSymbol}`);
            
            let answerValue: number;
            // Convert symbols to numeric values (matching the Python code)
            switch (answerSymbol) {
              case "++": answerValue = 1; break; // Strongly Agree
              case "+": answerValue = 2; break;  // Agree
              case "-": answerValue = 3; break;  // Disagree
              case "--": answerValue = 4; break; // Strongly Disagree
              default: 
                console.error(`Invalid answer symbol: ${answerSymbol} for question ${i + 1}`);
                answerValue = 3; // Default to disagree
            }

            // Calculate strike value (matching Python logic)
            let strike = question.units;
            
            // For answers 2 and 3 (Agree and Disagree), halve the strike
            if (answerValue === 2 || answerValue === 3) {
              strike /= 2.0;
            }

            // Apply agreement direction
            if (answerValue < 3) { // Agree or Strongly Agree
              if (question.agree === "-") {
                strike *= -1;
              }
            } else { // Disagree or Strongly Disagree
              if (question.agree === "+") {
                strike *= -1;
              }
            }

            // Update coordinates
            if (question.axis === "x") {
              x += strike;
            } else {
              y += strike;
            }
            
            console.log(`Current coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})`);
            
          } catch (error) {
            console.error(`Error processing question ${i + 1}:`, error);
            // Continue with next question on error
          }
        }

        // Send progress for Wikipedia URL
        controller.enqueue(encoder.encode(`data: {"progress": {"current": 63, "total": 64, "message": "Fetching Wikipedia URL..."}}\n\n`));

        // Ensure coordinates are within bounds (-10 to 10)
        x = Math.max(-10, Math.min(10, x));
        y = Math.max(-10, Math.min(10, y));

        // Round to 2 decimal places
        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;

        // Get Wikipedia URL
        const wikipediaResult = await generateText({
          model: ollama("gemma3:27b"),
          messages: [
            {
              role: "system",
              content: "You provide Wikipedia URLs for notable people. Return ONLY the full English Wikipedia URL, nothing else."
            },
            {
              role: "user",
              content: `What is the English Wikipedia URL for "${trimmedName}"? Return ONLY the URL.`
            }
          ],
          temperature: 0.1,
          maxTokens: 100
        });

        const wikipediaUrl = wikipediaResult.text.trim();
        const isValidUrl = wikipediaUrl.startsWith("https://en.wikipedia.org/wiki/");

        // Send progress for saving
        controller.enqueue(encoder.encode(`data: {"progress": {"current": 64, "total": 64, "message": "Saving to database..."}}\n\n`));

        // Add person to database
        const newPerson = addPerson(
          trimmedName,
          x,
          y,
          isValidUrl ? wikipediaUrl : undefined
        );

        // Send success result
        controller.enqueue(encoder.encode(`data: {"success": true, "person": {"name": "${newPerson.name}", "x": ${newPerson.x}, "y": ${newPerson.y}, "wikipedia_url": ${newPerson.wikipedia_url ? `"${newPerson.wikipedia_url}"` : "null"}}}\n\n`));
        
      } catch (error) {
        console.error("Error in AI add person stream:", error);
        controller.enqueue(encoder.encode(`data: {"error": "An error occurred while processing your request"}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}