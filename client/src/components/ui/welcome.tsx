import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCourseState } from "@/hooks/use-course-state";
import { getDailyCourses } from "@/lib/daily-cards";
import type { Course } from "@/types";

interface WelcomeProps {
  onStart: () => void;
  onParentMode: () => void;
  onDailyCards?: () => void;
  onResumeCourseSelection: () => void;
}

export const Welcome: FC<WelcomeProps> = ({ onStart, onParentMode, onDailyCards, onResumeCourseSelection }) => {
  const { resetState } = useCourseState();
  const [hasDailyCards, setHasDailyCards] = useState(false);
  
  // Check if we have any daily cards
  useEffect(() => {
    const courses = getDailyCourses();
    setHasDailyCards(courses.length > 0);
  }, []);

  // Reset state when welcome screen is shown using useEffect to avoid React warning
  useEffect(() => {
    resetState();
  }, [resetState]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
          KidLearn
        </h1>
        <p className="text-xl">Let's explore something amazing today!</p>
      </div>

      <Button
        size="lg"
        className="bg-primary text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:bg-primary/90 transition mb-6"
        onClick={onStart}
      >
        Start Learning
      </Button>

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <Button
          variant="link"
          className="text-primary hover:underline"
          onClick={onParentMode}
        >
          I'm a parent
        </Button>
        
        <Button
          variant="link"
          className="text-primary hover:underline flex items-center"
          onClick={onResumeCourseSelection}
        >
          <i className="ri-play-circle-line mr-1"></i> Resume Course
        </Button>
        
        <a href="/saved-courses">
          <Button
            variant="link"
            className="text-primary hover:underline flex items-center"
          >
            <i className="ri-bookmark-line mr-1"></i> My Saved Courses
          </Button>
        </a>
        
        {hasDailyCards && onDailyCards && (
          <Button
            variant="link"
            className="text-primary hover:underline flex items-center"
            onClick={onDailyCards}
          >
            <i className="ri-calendar-line mr-1"></i> Daily Cards
          </Button>
        )}
      </div>
    </div>
  );
};

export default Welcome;
