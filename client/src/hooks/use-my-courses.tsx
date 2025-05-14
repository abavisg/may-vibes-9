import { useState } from "react";
import { useMutation, useQuery, type UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";
import type { Course } from "../types";

// Type for the course to be saved
export interface SaveCourseRequest {
  topic: string;
  ageGroup: string;
  courseLength: string;
  cards: any; // Using any here as the cards come from the API as JSON
  userId?: number;
  saved: boolean;
  createdAt: string;
}

// Removed unused interface UpdateCourseProgressRequest
// interface UpdateCourseProgressRequest {
//   courseId: number;
//   currentCardIndex: number;
// }

interface UseMyCoursesReturn {
  courses: Course[];
  selectedCourse: Course | undefined | null;
  isLoading: boolean;
  isError: boolean;
  selectCourse: (courseId: number) => void;
  updateCourseProgress: (courseId: number, currentCardIndex: number) => void;
  fetchCourses: () => void;
  saveCourseMutation: UseMutationResult<Course, Error, SaveCourseRequest>; // Expose the mutation result
}

export function useMyCourses(): UseMyCoursesReturn {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Query to fetch all courses
  const coursesQuery = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      console.log('Fetching all courses');
      const timestamp = new Date().getTime();
      return apiRequest<Course[]>("GET", `/api/courses?_t=${timestamp}`);
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Query to fetch a specific course by ID
  const courseDetailQuery = useQuery({
    queryKey: ['/api/course', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      console.log(`useMyCourses: Attempting to fetch course details for ID: ${selectedCourseId}`);
      try {
        const timestamp = new Date().getTime();
        // Check if already in courses cache before fetching
        const courses = queryClient.getQueryData<Course[]>(['/api/courses']);
        const cachedCourse = courses?.find(course => course.id === selectedCourseId);
        
        // Check if we already have this specific course in the individual course cache
        const cachedDetailCourse = queryClient.getQueryData<Course>(['/api/course', selectedCourseId]);
        
        if (cachedDetailCourse) {
          console.log(`Using cached detail course data for ID ${selectedCourseId}`);
          return cachedDetailCourse;
        } else if (cachedCourse) {
          console.log(`Using cached course data from list for ID ${selectedCourseId}`);
          // Add to individual course cache for future use
          queryClient.setQueryData(['/api/course', selectedCourseId], cachedCourse);
          return cachedCourse;
        }
        
        console.log(`Course ID ${selectedCourseId} not in cache, fetching from API`);
        const response = await fetch(`/api/course/${selectedCourseId}?_t=${timestamp}`);

        if (!response.ok) {
          console.error(`API responded with status ${response.status} for course ID ${selectedCourseId}`);
           // Attempt to read response body for more details if not OK
          try {
            const errorBody = await response.json();
             console.error(`API error response body for ID ${selectedCourseId}:`, errorBody);
             throw new Error(`Failed to fetch course ${selectedCourseId}: ${response.status} ${response.statusText} - ${errorBody.message || JSON.stringify(errorBody)}`);
          } catch (parseError) {
             console.error(`Failed to parse error response body for ID ${selectedCourseId}`, parseError);
             throw new Error(`Failed to fetch course ${selectedCourseId}: ${response.status} ${response.statusText}`);
          }
        }
        
        const result = await response.json();
        
        if (!result) {
          console.error(`API returned empty result for course ID ${selectedCourseId}`);
          throw new Error(`Course with ID ${selectedCourseId} not found`);
        }
        console.log(`Successfully fetched course details for ID ${selectedCourseId}:`, result);
        return result;
      } catch (error: any) {
        console.error(`Error in courseDetailQuery for ID ${selectedCourseId}:`, error);
        toast({
          title: "Error loading course",
          description: `Could not load course details: ${error.message}`,
          variant: "destructive"
        });
        // Re-throw to let React Query handle it
        throw error;
      }
    },
    enabled: !!selectedCourseId, // Only run when a course ID is selected
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once on failure
  });

  // Mutation to save a course
  const saveMutation = useMutation({
    mutationFn: async (courseData: SaveCourseRequest) => {
      return apiRequest<Course>("POST", "/api/save-course", courseData);
    },
    onSuccess: (savedCourse) => {
      // Add the new course to the cache directly to ensure it's immediately available
      const courses = queryClient.getQueryData<Course[]>(['/api/courses']) || [];
      
      // Check if course already exists in cache and update or add it
      const courseIndex = courses.findIndex(c => c.id === savedCourse.id);
      if (courseIndex >= 0) {
        // Update existing course
        courses[courseIndex] = savedCourse;
      } else {
        // Add new course
        courses.push(savedCourse);
      }
      
      // Update courses cache
      queryClient.setQueryData(['/api/courses'], courses);
      
      // Also add the course to the individual course cache
      queryClient.setQueryData(['/api/course', savedCourse.id], savedCourse);
      
      // Then invalidate for a background refresh
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update course progress
  const updateCourseProgressMutation = useMutation({
    mutationFn: async ({ courseId, currentCardIndex }: { courseId: number; currentCardIndex: number }) => {
      return apiRequest<Course>("POST", `/api/course/${courseId}/progress`, { currentCardIndex });
    },
    onSuccess: (data) => {
      console.log("Course progress updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/course', data.id] });
    },
    onError: (error) => {
      console.error("Error updating course progress:", error);
    },
  });

  // Function to select a course for viewing
  const selectCourse = (courseId: number) => {
    console.log(`useMyCourses: selectCourse called with ID: ${courseId}`);
    setSelectedCourseId(courseId);
    console.log(`useMyCourses: selectedCourseId set to ${courseId}`);
  };

  // Function to update course progress
  const updateCourseProgress = (courseId: number, currentCardIndex: number) => {
    updateCourseProgressMutation.mutate({ courseId, currentCardIndex });
  };

  return {
    courses: coursesQuery.data || [],
    selectedCourse: courseDetailQuery.data,
    isLoading: coursesQuery.isLoading || courseDetailQuery.isLoading,
    isError: coursesQuery.isError || courseDetailQuery.isError,
    selectCourse,
    updateCourseProgress,
    fetchCourses: () => coursesQuery.refetch(),
    saveCourseMutation: saveMutation, // Expose the mutation
  };
} 