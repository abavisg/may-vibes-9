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

// Fallback generator function for when Ollama fails
function generateFallbackCards(topic: string, ageGroup: string, courseLength: string): Omit<LearningCard, 'id' | 'userId' | 'saved' | 'createdAt' | 'lastViewedAt' | 'currentCardIndex' | 'cards'>[] {
  const numCards = COURSE_LENGTH_CARDS[courseLength as keyof typeof COURSE_LENGTH_CARDS] || 5;
  const cards = [];
  
  for (let i = 1; i <= numCards; i++) {
    cards.push({
      title: `${topic} - Part ${i}`,
      content: `This is a placeholder card for "${topic}" created when Ollama was unavailable. Please try again later to get AI-generated content.`,
      funFact: null
    });
  }
  
  return cards;
}

// Function to generate learning cards using Ollama
export async function generateLearningCards(topic: string, ageGroup: string, courseLength: string): Promise<Omit<LearningCard, 'id' | 'userId' | 'saved' | 'createdAt' | 'lastViewedAt' | 'currentCardIndex' | 'cards'/*add other omitted fields as needed based on actual LearningCard definition*/>[]> {
  const numCards = COURSE_LENGTH_CARDS[courseLength as keyof typeof COURSE_LENGTH_CARDS];
  const agePrompt = AGE_GROUP_PROMPTS[ageGroup as keyof typeof AGE_GROUP_PROMPTS];

  console.log(`Generating ${numCards} cards about "${topic}" for age group ${ageGroup} using Ollama.`);
  
  // Check if Ollama is configured
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'tinyllama';
  console.log(`Using Ollama host: ${ollamaHost}`);
  console.log(`Using Ollama model: ${ollamaModel}`);

  // Add a retry mechanism
  let retries = 0;
  const maxRetries = 2;

  while (retries <= maxRetries) {
    if (retries > 0) {
      console.log(`Retry attempt ${retries}/${maxRetries}...`);
    }
    
    try {
      const ollama = new Ollama({ 
        host: ollamaHost,
      });
      
      // Adjusting the prompt to explicitly request JSON format
      const prompt = `Generate ${numCards} learning cards about ${topic} for a ${ageGroup} year old.

IMPORTANT: Your response MUST be valid JSON that I can parse directly with JSON.parse(). 
Do not include ANY text before or after the JSON. 
Do not include code blocks, markdown, or explanations.

I need exactly this format (an array of objects):
[
  {
    "title": "Card Title",
    "content": "Card content paragraph(s)",
    "funFact": "A fun fact about the topic"
  },
  ...more cards
]

Each card should have:
1. A "title" field: A concise, engaging title.
2. A "content" field: 2-3 paragraphs tailored to the age group (${agePrompt}).
3. A "funFact" field: An interesting fact related to the card's topic.

Return ONLY the JSON array, nothing else.`;

      // Create a promise that rejects after a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Ollama request timed out after 60 seconds')), 60000);
      });

      console.log("Sending request to Ollama...");

      // Race the Ollama request against the timeout
      const response = await Promise.race([
        ollama.chat({
          model: ollamaModel,
          messages: [{ role: 'user', content: prompt }],
        }),
        timeoutPromise
      ]) as { message: { content: string } };

      console.log("Received response from Ollama");

      // Log the length of the response to help debug
      console.log(`Response length: ${response.message.content.length} characters`);
      
      // If response is extremely long, log a sample
      if (response.message.content.length > 1000) {
        console.log("Sample of response:", response.message.content.substring(0, 200) + "...");
      }

      // Clean the response content to remove invalid control characters
      const cleanedContent = response.message.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      console.log("Cleaned response content");

      // Simplified extraction approach: find the first [ and last ]
      try {
        console.log("Attempting to extract JSON");
        let jsonContent = cleanedContent;
        
        // Find JSON array markers
        const startIdx = cleanedContent.indexOf('[');
        const endIdx = cleanedContent.lastIndexOf(']');
        
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          console.log(`Found array markers: [ at ${startIdx}, ] at ${endIdx}`);
          jsonContent = cleanedContent.substring(startIdx, endIdx + 1);
          console.log("Extracted potential JSON array");
        } else {
          console.log("No JSON array markers found, trying object markers");
          
          // Try looking for object markers as fallback
          const objStartIdx = cleanedContent.indexOf('{');
          const objEndIdx = cleanedContent.lastIndexOf('}');
          
          if (objStartIdx !== -1 && objEndIdx !== -1 && objEndIdx > objStartIdx) {
            console.log(`Found object markers: { at ${objStartIdx}, } at ${objEndIdx}`);
            jsonContent = cleanedContent.substring(objStartIdx, objEndIdx + 1);
            console.log("Extracted potential JSON object");
          } else {
            console.log("No JSON structure markers found");
            throw new Error("No valid JSON structure found in response");
          }
        }
        
        console.log("Attempting to parse JSON...");
        const cardsData = JSON.parse(jsonContent);
        console.log("JSON parsed successfully");
        
        console.log("Validating data with Zod schema...");
        const validatedCards = aiCardsSchema.parse(cardsData);
        console.log("Validation successful");

        // Map validated data to the required structure (excluding db-assigned fields)
        const formattedCards = validatedCards.map(card => ({
            title: card.title,
            content: card.content,
            funFact: card.funFact === undefined ? null : card.funFact
        }));

        // Success! Return the cards and exit the function
        console.log(`Successfully generated ${formattedCards.length} cards`);
        return formattedCards;
        
      } catch (jsonError) {
        console.error("Error extracting or parsing JSON:", jsonError);
        
        // Simpler fallback: Extract anything that looks remotely like a JSON array
        console.log("Trying simpler extraction approach");
        try {
          // Last-ditch effort: Try to make it valid JSON by wrapping content in an array
          // and adding quotes to property names as needed
          const fixedContent = cleanedContent
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix property names
            .replace(/:\s*'([^']*)'/g, ':"$1"'); // Replace single quotes with double quotes
          
          // Log a sample of the fixed content
          console.log("Sample of fixed content:", fixedContent.substring(0, 100) + "...");
          
          // Try simple pre-processing: find anything between brackets and try to parse it
          // Using multiline flag instead of 's' flag for compatibility
          const bracketMatch = fixedContent.match(/\[\s*\{[\s\S]+\}\s*\]/);
          if (bracketMatch) {
            console.log("Found potential array with bracket match");
            try {
              const extractedData = JSON.parse(bracketMatch[0]);
              console.log("Successfully parsed bracket match data");
              
              const validatedCards = aiCardsSchema.parse(extractedData);
              console.log("Validation successful for bracket match");
              
              // Map validated data to the required structure
              const formattedCards = validatedCards.map(card => ({
                  title: card.title,
                  content: card.content,
                  funFact: card.funFact === undefined ? null : card.funFact
              }));
              
              console.log(`Successfully generated ${formattedCards.length} cards after simple fixing`);
              return formattedCards;
            } catch (bracketError) {
              console.error("Failed to parse bracket match:", bracketError);
            }
          }
          
          // If we're still here, generate fallback cards instead of trying more complex parsing
          console.log("All JSON parsing attempts failed, using fallback cards");
          throw new Error("JSON parsing failed");
        } catch (fallbackError) {
          console.error("Fallback extraction failed:", fallbackError);
          throw new Error("Could not extract valid JSON structure");
        }
      }
      
    } catch (error) {
      console.error(`Attempt ${retries + 1}/${maxRetries + 1} failed:`, error);
      
      // If this was our last retry, return fallback cards
      if (retries >= maxRetries) {
        console.error("All retry attempts failed, generating fallback cards");
        return generateFallbackCards(topic, ageGroup, courseLength);
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, retries) * 1000;
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      retries++;
    }
  }
  
  // This code should never be reached but is required by TypeScript
  console.log("Reached fallback return - this should never happen");
  return generateFallbackCards(topic, ageGroup, courseLength);
}