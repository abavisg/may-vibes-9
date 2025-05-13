import { useState } from "react";
import { useMutation, useQuery, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course, LearningCard } from "@/types";

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

// Type for updating course progress
interface UpdateCourseProgressRequest {
  currentCardIndex: number;
}

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
      console.log(`Fetching course details for ID: ${selectedCourseId}`);
      try {
        const timestamp = new Date().getTime();
        // Check if already in courses cache before fetching
        const courses = queryClient.getQueryData<Course[]>(['/api/courses']);
        const cachedCourse = courses?.find(course => course.id === selectedCourseId);
        if (cachedCourse) {
          console.log(`Using cached course data for ID ${selectedCourseId}`);
          return cachedCourse;
        }
        
        // Not in cache, fetch from API
        const result = await apiRequest<Course>("GET", `/api/course/${selectedCourseId}?_t=${timestamp}`);
        if (!result) {
          console.error(`API returned empty result for course ID ${selectedCourseId}`);
          throw new Error(`Course with ID ${selectedCourseId} not found`);
        }
        return result;
      } catch (error: any) {
        console.error(`Error fetching course ${selectedCourseId}:`, error);
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
    onSuccess: () => {
      // Invalidate the courses query to show the new course in the list
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
    console.log(`selectCourse called with ID: ${courseId}`);
    // Reset current selectedCourse data when selecting a new course
    // This prevents showing stale data while loading
    if (selectedCourseId !== courseId) {
      // Only update if it's a different course to avoid loops
      setSelectedCourseId(null); // Clear first to ensure a clean state
      setTimeout(() => setSelectedCourseId(courseId), 0); // Set in next tick to force a clean re-fetch
    } else {
      setSelectedCourseId(courseId); // Same course, just refresh
    }
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