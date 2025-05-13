import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCardsRequestSchema, insertCourseSchema } from "@shared/schema";
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

      // Generate cards using the content generator
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

  // API endpoint to save a course
  app.post("/api/save-course", async (req, res) => {
    try {
      // Get the course data from the request body
      const courseData = insertCourseSchema.parse(req.body);
      
      // Save the course to the database
      const savedCourse = await storage.saveCourse(courseData);
      
      // Return the saved course
      return res.json(savedCourse);
    } catch (error) {
      console.error("Error saving course:", error);
      
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Handle other errors
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to save course"
      });
    }
  });
  
  // API endpoint to get all courses for a user
  app.get("/api/courses/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId ? parseInt(req.params.userId) : null;
      const courses = await storage.getUserCourses(userId);
      return res.json(courses);
    } catch (error) {
      console.error("Error getting courses:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to get courses"
      });
    }
  });
  
  // API endpoint to get a specific course
  app.get("/api/course/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      return res.json(course);
    } catch (error) {
      console.error("Error getting course:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to get course"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
