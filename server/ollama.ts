import { Ollama } from 'ollama';
import type { LearningCard } from "@shared/schema";
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

    //console.log("Raw response from Ollama:", response.message.content);

    // Clean the response content to remove invalid control characters
    const cleanedContent = response.message.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    // Try to find JSON using a more robust regular expression approach
    // This will find the first valid JSON array or object in the text
    let extractedJson;
    try {
      // First, try to extract a JSON array using regex
      const arrayMatch = cleanedContent.match(/\[(?:[^[\]]*|\[(?:[^[\]]*|\[[^[\]]*\])*\])*\]/);
      if (arrayMatch && arrayMatch[0]) {
        extractedJson = arrayMatch[0];
      } else {
        // If no array found, try to extract a JSON object
        const objectMatch = cleanedContent.match(/\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}/);
        if (objectMatch && objectMatch[0]) {
          extractedJson = objectMatch[0];
        } else {
          throw new Error("No valid JSON structure found in response");
        }
      }

      //console.log("Extracted JSON:", extractedJson);
      
      // Parse the extracted JSON
      const cardsData = JSON.parse(extractedJson);
      const validatedCards = aiCardsSchema.parse(cardsData);

      // Map validated data to the required structure (excluding db-assigned fields)
      const formattedCards = validatedCards.map(card => ({
          title: card.title,
          content: card.content,
          funFact: card.funFact === undefined ? null : card.funFact
      }));

      return formattedCards;
      
    } catch (jsonError) {
      console.error("Error extracting or parsing JSON:", jsonError);
      
      // Fallback: try a brute force approach by attempting to fix common issues
      const withQuotedProps = cleanedContent
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3') // Add quotes to property names
        .replace(/(['"])([\w\s]+)(['"])(\s*:\s*)([^",{\[\]}\s][^,{\[\]}]*[^",{\[\]}\s])([,}])/g, '$1$2$3$4"$5"$6'); // Add quotes to string values
      
      // Try to find the JSON array in the fixed content
      const fixedArrayMatch = withQuotedProps.match(/\[(?:[^[\]]*|\[(?:[^[\]]*|\[[^[\]]*\])*\])*\]/);
      if (fixedArrayMatch && fixedArrayMatch[0]) {
        console.log("Fixed JSON array found after property quoting");
        try {
          const cardsData = JSON.parse(fixedArrayMatch[0]);
          const validatedCards = aiCardsSchema.parse(cardsData);
          
          // Map validated data to the required structure
          const formattedCards = validatedCards.map(card => ({
              title: card.title,
              content: card.content,
              funFact: card.funFact === undefined ? null : card.funFact
          }));

          return formattedCards;
        } catch (error) {
          console.error("Failed to parse even after fixing properties:", error);
          throw new Error("Could not parse JSON response from AI");
        }
      } else {
        throw new Error("Could not extract valid JSON structure");
      }
    }
    
  } catch (error) {
    console.error("Error calling Ollama or processing response:", error);

    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      console.error("Ollama response did not match schema:", error.errors);
      throw new Error("Invalid card data format");
    }
    throw error;
  }
}