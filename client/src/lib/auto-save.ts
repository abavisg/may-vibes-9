/**
 * Utility for automatically saving course progress
 */
import type { Course } from '@/types';

// Function to update course progress
export async function updateCourseProgress(courseId: number, currentCardIndex: number): Promise<Course | null> {
  try {
    const response = await fetch(`/api/course/${courseId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentCardIndex }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update progress: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update course progress:', error);
    return null;
  }
}

// Debounced auto-save function with timeout
let autoSaveTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_TIME = 500; // ms

export function autoSaveProgress(
  courseId: number | null,
  currentCardIndex: number,
  callback?: (success: boolean) => void
): void {
  // Clear any existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  // Skip if no courseId
  if (!courseId) {
    if (callback) callback(false);
    return;
  }
  
  // Set a new timeout
  autoSaveTimeout = setTimeout(async () => {
    try {
      const result = await updateCourseProgress(courseId, currentCardIndex);
      if (callback) callback(!!result);
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (callback) callback(false);
    }
  }, DEBOUNCE_TIME);
}

// Function to get all resumable courses
export async function getResumableCourses(): Promise<Course[]> {
  try {
    const response = await fetch('/api/courses');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }
    
    const courses: Course[] = await response.json();
    
    // Filter for courses with progress
    return courses.filter(course => {
      const cardCount = Array.isArray(course.cards) ? course.cards.length : 0;
      const hasProgress = typeof course.currentCardIndex === 'number' && course.currentCardIndex > 0;
      const isIncomplete = typeof course.currentCardIndex === 'number' && course.currentCardIndex < cardCount - 1;
      
      return cardCount > 0 && hasProgress && isIncomplete;
    });
  } catch (error) {
    console.error('Failed to fetch resumable courses:', error);
    return [];
  }
}

// Function to get the most recently viewed course
export async function getMostRecentCourse(): Promise<Course | null> {
  try {
    const courses = await getResumableCourses();
    
    if (courses.length === 0) return null;
    
    // Sort by lastViewedAt, descending
    courses.sort((a, b) => {
      const dateA = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0;
      const dateB = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return courses[0];
  } catch (error) {
    console.error('Failed to get most recent course:', error);
    return null;
  }
}