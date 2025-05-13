import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const learningCards = pgTable("learning_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  funFact: text("fun_fact"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  ageGroup: text("age_group").notNull(),
  courseLength: text("course_length").notNull(),
  cards: jsonb("cards").notNull(),
  userId: integer("user_id").references(() => users.id),
  saved: boolean("saved").default(false),
  createdAt: text("created_at").notNull(),
  lastViewedAt: text("last_viewed_at"),
  currentCardIndex: integer("current_card_index").default(0),
});

export const insertLearningCardSchema = createInsertSchema(learningCards);
export const insertCourseSchema = createInsertSchema(courses);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLearningCard = z.infer<typeof insertLearningCardSchema>;
export type LearningCard = typeof learningCards.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Custom schemas for API requests
export const generateCardsRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  ageGroup: z.enum(["5-7", "8-10", "11-12"]),
  courseLength: z.enum(["quick", "standard", "deep"]),
});

export type GenerateCardsRequest = z.infer<typeof generateCardsRequestSchema>;
