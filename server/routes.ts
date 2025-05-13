import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCardsRequestSchema } from "@shared/schema";
import { generateLearningCards } from "./openai";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate learning cards
  app.post("/api/generate-cards", async (req, res) => {
    try {
      // Validate request body
      const validatedData = generateCardsRequestSchema.parse(req.body);
      const { topic, ageGroup, courseLength } = validatedData;

      // Generate cards using OpenAI
      const cards = await generateLearningCards(topic, ageGroup, courseLength);

      // Return the generated cards
      return res.json({ cards });
    } catch (error) {
      console.error("Error generating cards:", error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }

      // Handle other errors
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate cards" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
