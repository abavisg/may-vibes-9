import { useState, useEffect } from "react";
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

interface UseSavedCoursesReturn {
  courses: Course[];
  selectedCourse: Course | undefined | null;
  isLoading: boolean;
  isError: boolean;
  saveCourse: (topic: string, ageGroup: string, courseLength: string, cards: LearningCard[]) => void;
  selectCourse: (courseId: number) => void;
  updateCourseProgress: (courseId: number, currentCardIndex: number) => void;
  fetchCourses: () => void;
}

export function useSavedCourses(): UseSavedCoursesReturn {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Query to fetch all saved courses
  const coursesQuery = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      return apiRequest<Course[]>("GET", "/api/courses");
    },
    enabled: true, // Changed back to true to automatically fetch courses
  });

  // Fetch courses when the component mounts
  useEffect(() => {
    if (!coursesQuery.data && !coursesQuery.isLoading) {
      coursesQuery.refetch();
    }
  }, []);

  // Query to fetch a specific course by ID
  const courseDetailQuery = useQuery({
    queryKey: ['/api/course', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      return apiRequest<Course>("GET", `/api/course/${selectedCourseId}`);
    },
    enabled: !!selectedCourseId, // Only run when a course ID is selected
  });

  // Mutation to save a course
  const saveMutation = useMutation({
    mutationFn: async (courseData: SaveCourseRequest) => {
      return apiRequest<Course>("POST", "/api/save-course", courseData);
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
      // Optionally invalidate relevant queries if needed, e.g., the specific course detail if it's being viewed
      // queryClient.invalidateQueries({ queryKey: ['/api/course', data.id] });
    },
    onError: (error) => {
      console.error("Error updating course progress:", error);
      // Consider showing a less intrusive notification for progress updates
    },
  });

  // Function to save the current course
  const saveCourse = (
    topic: string,
    ageGroup: string,
    courseLength: string,
    cards: LearningCard[]
  ) => {
    // Check if a course with the same topic already exists
    const existingCourse = coursesQuery.data?.find(course => course.topic === topic);
    
    // Prepare the request with the existing course ID if available
    const request: SaveCourseRequest & { id?: number } = {
      topic,
      ageGroup,
      courseLength,
      cards,
      saved: true,
      createdAt: new Date().toISOString(),
    };
    
    // If updating an existing course, include its ID
    if (existingCourse?.id) {
      request.id = existingCourse.id;
    }
    
    saveMutation.mutate(request,
    {
      onSuccess: (data) => {
        toast({
          title: existingCourse ? "Course updated successfully" : "Course saved successfully",
          description: existingCourse 
            ? "Your existing course has been updated with the latest content." 
            : "You can access it anytime in your saved courses.",
        });
        // Invalidate the courses query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
        
        // If this was the selected course, update its details too
        if (selectedCourseId && selectedCourseId === data.id) {
          queryClient.invalidateQueries({ queryKey: ['/api/course', selectedCourseId] });
        }
      }
    });
  };

  // Function to select a course for viewing
  const selectCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
  };

  // Function to update course progress
  const updateCourseProgress = (courseId: number, currentCardIndex: number) => {
    updateCourseProgressMutation.mutate({ courseId, currentCardIndex });
  };

  return {
    courses: coursesQuery.data || [],
    selectedCourse: courseDetailQuery.data,
    isLoading: coursesQuery.isLoading || saveMutation.isPending || updateCourseProgressMutation.isPending,
    isError: (coursesQuery.isError || saveMutation.isError || updateCourseProgressMutation.isError) ?? false,
    saveCourse,
    selectCourse,
    updateCourseProgress,
    fetchCourses: () => coursesQuery.refetch(), // Add function to manually refetch courses
  };
}