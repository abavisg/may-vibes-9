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

interface UseSavedCoursesReturn {
  courses: Course[];
  selectedCourse: Course | undefined | null;
  isLoading: boolean;
  isError: boolean;
  saveCourse: (topic: string, ageGroup: string, courseLength: string, cards: LearningCard[]) => void;
  selectCourse: (courseId: number) => void;
  updateCourseProgress: (courseId: number, currentCardIndex: number) => void;
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
    enabled: false, // Changed from true to false
  });

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
    onSuccess: () => {
      toast({
        title: "Course saved successfully",
        description: "You can access it anytime in your saved courses.",
      });
      // Invalidate the courses query to refresh the list
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
    saveMutation.mutate({
      topic,
      ageGroup,
      courseLength,
      cards,
      saved: true,
      createdAt: new Date().toISOString(),
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
  };
}