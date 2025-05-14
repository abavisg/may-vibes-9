import { useEffect } from 'react';
import { useLocation } from "wouter";
import CourseLength from "@/components/ui/course-length";
import { useCourseState } from "@/hooks/use-course-state";
import { useMyCourses } from "@/hooks/use-my-courses";
import type { CourseLength as CourseLengthType } from "@/types";

export default function CourseLengthPage() {
  const [, navigate] = useLocation();
  const { state: courseState, generateCards, setCourseLength, resetState } = useCourseState();
  const { saveCourseMutation } = useMyCourses();

  console.log('CourseLengthPage rendered', { courseState, saveCourseMutation });

  const handleNext = async (courseLength: CourseLengthType) => {
    console.log('handleNext called with length:', courseLength);
    setCourseLength(courseLength);
    await generateCards();
  };

  const handleBack = () => {
    console.log('handleBack called');
    navigate("/create/age");
  };

  useEffect(() => {
    console.log('CourseLengthPage useEffect 2 (save course):', { cardsLength: courseState.cards.length, mutationIsPending: saveCourseMutation.isPending, mutationIsSuccess: saveCourseMutation.isSuccess });
    if (courseState.cards.length > 0 && !saveCourseMutation.isPending && !saveCourseMutation.isSuccess) {
      console.log("Attempting to save new course:", courseState);
      saveCourseMutation.mutate({
        topic: courseState.topic || "New Course",
        ageGroup: courseState.ageGroup || "Any",
        courseLength: courseState.courseLength || "Standard",
        cards: courseState.cards,
        saved: true,
        createdAt: new Date().toISOString(),
      });
    }
  }, [courseState, saveCourseMutation]);

  useEffect(() => {
    console.log('CourseLengthPage useEffect 3 (navigate):', { mutationIsSuccess: saveCourseMutation.isSuccess, mutationData: saveCourseMutation.data });
    if (saveCourseMutation.isSuccess && saveCourseMutation.data) {
      console.log("Course saved successfully, navigating to cards view:", saveCourseMutation.data);
      navigate(`/course/${saveCourseMutation.data.id}/cards`, { replace: true });
      resetState();
    }
  }, [saveCourseMutation.isSuccess, saveCourseMutation.data, navigate, resetState]);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">How long should the course be?</h1>
      <CourseLength onNext={handleNext} onBack={handleBack} />
      {saveCourseMutation.isPending && <p>Saving your course...</p>}
      {courseState.isLoading && <p>Generating cards...</p>}
      {saveCourseMutation.isError && <p>Error saving course: {saveCourseMutation.error?.message}</p>}
      {courseState.isLoading === false && courseState.cards.length === 0 && courseState.courseLength && <p>Card generation failed or returned no cards. Please try again.</p>}
    </div>
  );
} 