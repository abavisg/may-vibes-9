import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export function useSavedCourses() {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Query to fetch all saved courses
  const coursesQuery = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      return response.json() as Promise<Course[]>;
    },
    enabled: true, // Auto-fetch courses when component mounts
  });

  // Query to fetch a specific course by ID
  const courseDetailQuery = useQuery({
    queryKey: ['/api/course', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      const response = await apiRequest("GET", `/api/course/${selectedCourseId}`);
      return response.json() as Promise<Course>;
    },
    enabled: !!selectedCourseId, // Only run when a course ID is selected
  });

  // Mutation to save a course
  const saveMutation = useMutation({
    mutationFn: async (courseData: SaveCourseRequest) => {
      const response = await apiRequest("POST", "/api/save-course", courseData);
      return response.json() as Promise<Course>;
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

  return {
    courses: coursesQuery.data || [],
    selectedCourse: courseDetailQuery.data,
    isLoading: coursesQuery.isLoading || saveMutation.isPending,
    isError: coursesQuery.isError || saveMutation.isError,
    saveCourse,
    selectCourse,
  };
}