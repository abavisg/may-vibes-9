import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCourses } from "@/hooks/use-my-courses";
import { Course } from "@/types";
import { calculateProgressPercentage, formatProgress } from "@/lib/utils";

interface CourseDetailViewProps {
  params: { id?: string }; // Define the params prop structure
}

export default function CourseDetailView({ params }: CourseDetailViewProps) {
  const { selectedCourse, isLoading, selectCourse, saveCourseMutation } = useMyCourses();
  const [location, navigate] = useLocation();
  const courseIdParam = params.id; // Keep the original param as string
  const courseId = courseIdParam === 'new' ? null : parseInt(courseIdParam as string, 10); // Parse only if not 'new'

  // Handle saving a new course if ID is 'new'
  useEffect(() => {
    if (courseIdParam === 'new' && !saveCourseMutation.isPending && !saveCourseMutation.isSuccess) {
      // Provide some default data for the new course
      saveCourseMutation.mutate({
        topic: "New Course",
        ageGroup: "Any",
        courseLength: "Short",
        cards: [],
        saved: true,
        createdAt: new Date().toISOString(),
      });
    } else if (courseId && !selectedCourse) {
      // Fetch course details when the ID changes or component mounts, if not 'new'
      selectCourse(courseId);
    } else if (!courseId && courseIdParam !== 'new') {
       console.error("No course ID provided in URL");
       navigate("/my-courses"); // Fallback to my courses list if no ID and not 'new'
    }
  }, [courseIdParam, courseId, selectCourse, navigate, saveCourseMutation]);

  // Navigate to the new course's detail view after successful save
  useEffect(() => {
    if (saveCourseMutation.isSuccess && saveCourseMutation.data) {
      navigate(`/course/${saveCourseMutation.data.id}`, { replace: true }); // Redirect to the new course's ID
    }
  }, [saveCourseMutation.isSuccess, saveCourseMutation.data, navigate]);

  // Show loading skeleton while fetching course details or saving a new course
  if (isLoading || saveCourseMutation.isPending || (courseIdParam !== 'new' && !selectedCourse)) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-48 mt-6" />
      </div>
    );
  }

  // Ensure selectedCourse exists before accessing its properties
  if (!selectedCourse) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-600">Course not found.</p>
        <Button onClick={() => navigate("/my-courses")} className="mt-4">Back to My Courses</Button>
      </div>
    );
  }

  const totalCards = Array.isArray(selectedCourse.cards) ? selectedCourse.cards.length : 0;
  const currentIndex = selectedCourse.currentCardIndex ?? 0;
  const isCompleted = totalCards > 0 && currentIndex >= totalCards;
  const progressPercent = calculateProgressPercentage(currentIndex, totalCards);

  // Function to handle resuming a course - navigates to the cards view
  const handleResumeCourse = () => {
    // Navigate to the cards view for this course
    navigate(`/course/${selectedCourse.id}/cards`);
  };

  // Function to handle restarting a course - navigates to the cards view from index 0
  const handleRestartCourse = () => {
    // Navigate to the cards view for this course, starting from index 0
    navigate(`/course/${selectedCourse.id}/cards?startIndex=0`); // Pass startIndex via query param
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="link" className="mb-4" onClick={() => navigate("/my-courses")}>
        <i className="ri-arrow-left-line mr-1"></i> Back to My Courses
      </Button>
      <h2 className="text-3xl font-bold mb-4">{selectedCourse.topic}</h2>

      <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
        <span>Ages: {selectedCourse.ageGroup}</span>
        <span>Length: {totalCards} cards</span>
        <span>Created: {new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
      </div>

      {totalCards > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-neutral-700 mb-1">
            <span>Progress: {formatProgress(currentIndex, totalCards)} cards</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      <div className="flex flex-col space-y-4 mt-4">
        <Button
          size="lg"
          onClick={() => (isCompleted ? handleRestartCourse() : handleResumeCourse())}
        >
          <i className={isCompleted ? "ri-refresh-line mr-2" : "ri-play-line mr-2"}></i>
          {isCompleted ? "Start from Beginning" : "Resume Course"}
        </Button>

        {!isCompleted && currentIndex > 0 && (
          <Button variant="outline" size="lg" onClick={handleRestartCourse}>
            <i className="ri-restart-line mr-2"></i> Start from Beginning
          </Button>
        )}
      </div>
    </div>
  );
} 