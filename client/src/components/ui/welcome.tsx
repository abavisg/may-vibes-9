import { FC, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCourseState } from "@/hooks/use-course-state";

interface WelcomeProps {
  onStart: () => void;
  onParentMode: () => void;
}

export const Welcome: FC<WelcomeProps> = ({ onStart, onParentMode }) => {
  const { resetState } = useCourseState();

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

      <Button
        variant="link"
        className="text-primary hover:underline"
        onClick={onParentMode}
      >
        I'm a parent
      </Button>
    </div>
  );
};

export default Welcome;
