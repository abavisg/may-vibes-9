import { Ollama } from 'ollama';
import type { LearningCard } from '../shared/schema';
import { z } from 'zod';
import { error } from 'console';

// Prompts adjusted for different age groups
const AGE_GROUP_PROMPTS = {
  "5-7": "The content should be very simple, using short sentences and basic vocabulary. Explain concepts in concrete terms with familiar examples. Include colorful descriptions and fun facts that are easy to grasp. Content should be enthusiastic and encourage curiosity.",
  "8-10": "The content should use moderate vocabulary with occasional new words explained in context. Include more details and a broader range of facts. Make connections between concepts and real-world applications. Content should be engaging and educational.",
  "11-12": "The content can use more advanced vocabulary and introduce more complex concepts. Include historical context, scientific principles, and deeper connections between ideas. Content should be intellectually stimulating while still being accessible."
};

// Card count for different course lengths
const COURSE_LENGTH_CARDS = {
  "quick": 5,
  "standard": 10,
  "deep": 15
};

// Define a Zod schema for the expected AI response structure
const aiCardsSchema = z.array(z.object({
    title: z.string(),
    content: z.string(),
    funFact: z.string().optional()
}));

// Function to generate learning cards using Ollama
export async function generateLearningCards(topic: string, ageGroup: string, courseLength: string): Promise<Omit<LearningCard, 'id' | 'userId' | 'saved' | 'createdAt' | 'lastViewedAt' | 'currentCardIndex' | 'cards'/*add other omitted fields as needed based on actual LearningCard definition*/>[]> {
  const numCards = COURSE_LENGTH_CARDS[courseLength as keyof typeof COURSE_LENGTH_CARDS];
  const agePrompt = AGE_GROUP_PROMPTS[ageGroup as keyof typeof AGE_GROUP_PROMPTS];

  console.log(`Generating ${numCards} cards about "${topic}" for age group ${ageGroup} using Ollama.`);

  const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
  // Adjusting the prompt to explicitly request JSON format
  const prompt = `Generate ${numCards} learning cards about ${topic} for a ${ageGroup} year old. Each card should have a title, 2-3 paragraphs of content tailored to the age group (${agePrompt}), and a fun fact. Provide the output as a JSON array of objects with 'title', 'content', and 'funFact' keys. Ensure the response is ONLY the JSON array, nothing else.`;

  try {
    // Using the default text response
    const response = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      // response_format: { type: 'json' }, // Removed this based on linter error
    });

    // Clean the response content to remove invalid control characters
    const cleanedContent = response.message.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // Attempt to extract JSON content by finding the first '[' and last ']'
    const jsonStartIndex = cleanedContent.indexOf('[');
    const jsonEndIndex = cleanedContent.lastIndexOf(']');

    let jsonContent = cleanedContent;
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      jsonContent = cleanedContent.substring(jsonStartIndex, jsonEndIndex + 1);
    } else {
        // If unable to find array delimiters, try object delimiters as a fallback
        const objStartIndex = cleanedContent.indexOf('{');
        const objEndIndex = cleanedContent.lastIndexOf('}');
        if (objStartIndex !== -1 && objEndIndex !== -1 && objEndIndex > objStartIndex) {
            jsonContent = cleanedContent.substring(objStartIndex, objEndIndex + 1);
        } else {
             // If no valid JSON structure found, log error and throw
            console.error("No JSON structure found in Ollama response:", cleanedContent);
            throw new Error("Invalid response format from AI");
        }
    }

    // Attempt to parse the extracted JSON response and validate with Zod
    const cardsData = JSON.parse(jsonContent);
    const validatedCards = aiCardsSchema.parse(cardsData);

    // Map validated data to the required structure (excluding db-assigned fields)
    const formattedCards = validatedCards.map(card => ({
        title: card.title,
        content: card.content,
        funFact: card.funFact === undefined ? null : card.funFact
    }));

    return formattedCards;
  } catch (error) {
    console.error("Error calling Ollama or parsing response:", error);

    // Log the raw and extracted content for SyntaxErrors
    if (error instanceof SyntaxError) {
        console.error("Syntax Error during JSON parsing.");
        // Accessing cleanedContent and jsonContent here requires them to be in a scope accessible by the catch block.
        // We might need to declare them with `let` outside the try block if they aren't already.
        // For now, assuming they might be accessible or we'll adjust based on linter feedback.
         // console.error("Raw cleaned content:", cleanedContent);
         // console.error("Extracted JSON content:", jsonContent);
         // Note: The above console.error calls are commented out because cleanedContent and jsonContent are not guaranteed to be in scope here.
         // I will rely on the next steps to inspect the state if this doesn't reveal the issue.
    }

    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      console.error("Ollama response did not match schema:", error.errors);
      throw new Error("Invalid card data format");
    }
    throw error;
  }
}