import { users, learningCards, courses, type User, type InsertUser, type LearningCard, type InsertLearningCard, type Course, type InsertCourse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course related methods
  saveCourse(course: InsertCourse): Promise<Course>;
  getUserCourses(userId: number | null): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  updateCourseProgress(id: number, currentCardIndex: number): Promise<Course | undefined>;
  
  // Learning card related methods
  saveLearningCards(cards: InsertLearningCard[]): Promise<LearningCard[]>;
  getCourseLearningCards(courseId: number): Promise<LearningCard[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private learningCards: Map<number, LearningCard>;
  private userId: number;
  private courseId: number;
  private cardId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.learningCards = new Map();
    this.userId = 1;
    this.courseId = 1;
    this.cardId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveCourse(course: InsertCourse): Promise<Course> {
    // Check if a course with the same topic already exists
    let existingCourse: Course | undefined;
    
    Array.from(this.courses.values()).forEach(c => {
      if (c.topic === course.topic) {
        existingCourse = c;
      }
    });
    
    if (existingCourse) {
      // Update existing course
      const updatedCourse: Course = { 
        ...existingCourse,
        ageGroup: course.ageGroup,
        courseLength: course.courseLength, 
        cards: course.cards,
        saved: course.saved ?? null,
        lastViewedAt: new Date().toISOString()
      };
      
      this.courses.set(existingCourse.id, updatedCourse);
      return updatedCourse;
    } else {
      // Create new course
      const id = this.courseId++;
      // Ensure all required properties are set with proper types
      const newCourse: Course = { 
        ...course, 
        id,
        userId: course.userId ?? null,
        saved: course.saved ?? null,
        lastViewedAt: course.lastViewedAt ?? new Date().toISOString(),
        currentCardIndex: course.currentCardIndex ?? 0
      };
      this.courses.set(id, newCourse);
      return newCourse;
    }
  }

  async getUserCourses(userId: number | null): Promise<Course[]> {
    const result: Course[] = [];
    // Use Array.from to avoid issues with the MapIterator
    Array.from(this.courses.values()).forEach(course => {
      if (userId === null || course.userId === userId) {
        result.push(course);
      }
    });
    return result;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async updateCourseProgress(id: number, currentCardIndex: number): Promise<Course | undefined> {
    const course = this.courses.get(id);
    
    if (!course) {
      return undefined;
    }
    
    // Update the course with new progress
    const updatedCourse: Course = {
      ...course,
      currentCardIndex,
      lastViewedAt: new Date().toISOString()
    };
    
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async saveLearningCards(cards: InsertLearningCard[]): Promise<LearningCard[]> {
    const result: LearningCard[] = [];
    for (const card of cards) {
      const id = this.cardId++;
      const newCard: LearningCard = { 
        ...card, 
        id,
        funFact: card.funFact ?? null 
      };
      this.learningCards.set(id, newCard);
      result.push(newCard);
    }
    return result;
  }

  async getCourseLearningCards(courseId: number): Promise<LearningCard[]> {
    // For in-memory storage, we would need additional mapping between courses and cards
    // Simplified implementation just returns all cards
    return Array.from(this.learningCards.values());
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;
    
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) {
      throw new Error("Database not available");
    }
    
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveCourse(course: InsertCourse): Promise<Course> {
    if (!db) {
      throw new Error("Database not available");
    }
    
    try {
      // Check if a course with the same topic already exists
      console.log(`Checking if course with topic "${course.topic}" already exists`);
      const existingCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.topic, course.topic));
      
      if (existingCourses.length > 0) {
        // Course exists, update it
        const existingCourse = existingCourses[0];
        console.log(`Found existing course with ID ${existingCourse.id}, updating it`);
        
        const [updatedCourse] = await db
          .update(courses)
          .set({
            ageGroup: course.ageGroup,
            courseLength: course.courseLength,
            cards: course.cards,
            saved: course.saved,
            lastViewedAt: new Date().toISOString()
          })
          .where(eq(courses.id, existingCourse.id))
          .returning();
          
        return updatedCourse;
      } else {
        // No existing course found, create a new one
        console.log(`No existing course found, creating new course with topic "${course.topic}"`);
        const [newCourse] = await db
          .insert(courses)
          .values(course)
          .returning();
        return newCourse;
      }
    } catch (error) {
      console.error("Error saving course:", error);
      throw error;
    }
  }

  async getUserCourses(userId: number | null): Promise<Course[]> {
    if (!db) {
      console.log("Database not available, using in-memory storage");
      return [];
    }
    
    try {
      let result;
      if (userId) {
        console.log(`Fetching courses for user ID: ${userId}`);
        result = await db.select().from(courses).where(eq(courses.userId, userId));
      } else {
        console.log("Fetching all courses");
        result = await db.select().from(courses);
      }
      console.log(`Found ${result.length} courses in database`);
      return result;
    } catch (error) {
      console.error("Error fetching courses from database:", error);
      return [];
    }
  }

  async getCourse(id: number): Promise<Course | undefined> {
    if (!db) return undefined;
    
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async updateCourseProgress(id: number, currentCardIndex: number): Promise<Course | undefined> {
    if (!db) return undefined;
    
    const [course] = await db
      .update(courses)
      .set({
        currentCardIndex,
        lastViewedAt: new Date().toISOString()
      })
      .where(eq(courses.id, id))
      .returning();
      
    return course;
  }

  async saveLearningCards(cards: InsertLearningCard[]): Promise<LearningCard[]> {
    if (!db) {
      throw new Error("Database not available");
    }
    
    if (cards.length === 0) return [];
    
    const result = await db
      .insert(learningCards)
      .values(cards)
      .returning();
    return result;
  }

  async getCourseLearningCards(courseId: number): Promise<LearningCard[]> {
    if (!db) return [];
    
    // This would require a relationship between courses and cards
    // For simplicity, we're returning all cards here
    return await db.select().from(learningCards);
  }
}

// Decide which storage to use based on database availability
const storageImpl = db ? new DatabaseStorage() : new MemStorage();
console.log(`Using ${db ? 'database' : 'in-memory'} storage`);

export const storage = storageImpl;
