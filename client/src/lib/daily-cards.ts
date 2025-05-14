/**
 * Utility functions for managing the daily card learning schedule
 */
import type { LearningCard } from "@/types";

// Storage keys
const DAILY_COURSES_KEY = 'kidlearn_daily_courses';
const LAST_VIEWED_DATE_KEY = 'kidlearn_last_viewed_date';

interface DailyCourseInfo {
  courseId: number;
  topic: string;
  ageGroup: string;
  courseLength: string;
  cards: LearningCard[];
  currentCardIndex: number;
  startDate: string;
  lastViewedDate: string | null;
}

// Function to save a course to the daily schedule
export const saveToDaily = (
  courseId: number,
  topic: string,
  ageGroup: string,
  courseLength: string,
  cards: LearningCard[]
): void => {
  try {
    // Get current daily courses
    const dailyCourses = getDailyCourses();
    
    // Check if this course is already in the daily schedule
    const existingCourseIndex = dailyCourses.findIndex(c => c.courseId === courseId);
    
    if (existingCourseIndex !== -1) {
      // If it exists, just update the date
      dailyCourses[existingCourseIndex].lastViewedDate = new Date().toISOString();
    } else {
      // Otherwise, add it as a new daily course
      const dailyCourse: DailyCourseInfo = {
        courseId,
        topic,
        ageGroup,
        courseLength,
        cards,
        currentCardIndex: 0,
        startDate: new Date().toISOString(),
        lastViewedDate: new Date().toISOString()
      };
      
      dailyCourses.push(dailyCourse);
    }
    
    // Save back to localStorage
    localStorage.setItem(DAILY_COURSES_KEY, JSON.stringify(dailyCourses));
    localStorage.setItem(LAST_VIEWED_DATE_KEY, new Date().toISOString().split('T')[0]);
  } catch (error) {
    console.error('Error saving to daily schedule:', error);
  }
};

// Function to get all daily courses
export const getDailyCourses = (): DailyCourseInfo[] => {
  try {
    const coursesJson = localStorage.getItem(DAILY_COURSES_KEY);
    return coursesJson ? JSON.parse(coursesJson) : [];
  } catch (error) {
    console.error('Error retrieving daily courses:', error);
    return [];
  }
};

// Function to get today's card for a specific course
export const getTodayCard = (courseId: number, onProgressUpdate?: (courseId: number, currentCardIndex: number) => void): { 
  card: LearningCard | null, 
  currentIndex: number, 
  totalCards: number,
  isCompleted: boolean,
  daysLeft: number
} => {
  try {
    const dailyCourses = getDailyCourses();
    const courseInfo = dailyCourses.find(c => c.courseId === courseId);
    
    if (!courseInfo) {
      return { 
        card: null, 
        currentIndex: 0, 
        totalCards: 0,
        isCompleted: false,
        daysLeft: 0
      };
    }
    
    // Check if today is a new day
    const today = new Date().toISOString().split('T')[0];
    const lastViewed = courseInfo.lastViewedDate ? 
      new Date(courseInfo.lastViewedDate).toISOString().split('T')[0] : null;
    
    // Only advance to the next card if it's a new day
    if (lastViewed !== today && lastViewed !== null) {
      // It's a new day, advance to the next card
      courseInfo.currentCardIndex = Math.min(
        courseInfo.currentCardIndex + 1, 
        courseInfo.cards.length - 1
      );
      courseInfo.lastViewedDate = new Date().toISOString();
      
      // Save changes
      saveDailyCourse(courseInfo);
      
      // Call the progress update function if provided
      if (onProgressUpdate) {
        onProgressUpdate(courseId, courseInfo.currentCardIndex);
      }
    }
    
    const isCompleted = courseInfo.currentCardIndex >= courseInfo.cards.length - 1;
    const daysLeft = courseInfo.cards.length - courseInfo.currentCardIndex - 1;
    
    return {
      card: courseInfo.cards[courseInfo.currentCardIndex] || null,
      currentIndex: courseInfo.currentCardIndex,
      totalCards: courseInfo.cards.length,
      isCompleted,
      daysLeft
    };
  } catch (error) {
    console.error('Error getting today\'s card:', error);
    return { 
      card: null, 
      currentIndex: 0, 
      totalCards: 0,
      isCompleted: false,
      daysLeft: 0
    };
  }
};

// Function to save changes to a daily course
const saveDailyCourse = (courseInfo: DailyCourseInfo): void => {
  try {
    const dailyCourses = getDailyCourses();
    const index = dailyCourses.findIndex(c => c.courseId === courseInfo.courseId);
    
    if (index !== -1) {
      dailyCourses[index] = courseInfo;
      localStorage.setItem(DAILY_COURSES_KEY, JSON.stringify(dailyCourses));
    }
  } catch (error) {
    console.error('Error saving daily course:', error);
  }
};

// Function to check if we have unviewed cards today
export const hasUnviewedCards = (): boolean => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastViewed = localStorage.getItem(LAST_VIEWED_DATE_KEY);
    
    return lastViewed !== today && getDailyCourses().length > 0;
  } catch (error) {
    console.error('Error checking for unviewed cards:', error);
    return false;
  }
};

// Function to remove a course from daily schedule
export const removeFromDaily = (courseId: number): void => {
  try {
    const dailyCourses = getDailyCourses();
    const updatedCourses = dailyCourses.filter(c => c.courseId !== courseId);
    localStorage.setItem(DAILY_COURSES_KEY, JSON.stringify(updatedCourses));
  } catch (error) {
    console.error('Error removing from daily schedule:', error);
  }
};