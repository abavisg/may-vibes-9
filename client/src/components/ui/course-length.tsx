import { FC } from "react";
import { Button } from "@/components/ui/button";
import { useCourseState } from "@/hooks/use-course-state";
import type { CourseLength as CourseLengthType } from "@/types";
import { Loader2 } from "lucide-react";

interface CourseLengthProps {
  onNext: () => void;
  onBack: () => void;
}

interface LengthOption {
  value: CourseLengthType;
  label: string;
  cards: string;
  description: string;
  icon: string;
  color: string;
}

const LENGTH_OPTIONS: LengthOption[] = [
  {
    value: "quick",
    label: "Quick",
    cards: "5-7 cards",
    description: "Perfect for shorter attention spans",
    icon: "ri-flashlight-line",
    color: "bg-amber-500"
  },
  {
    value: "standard",
    label: "Standard",
    cards: "8-12 cards",
    description: "A complete learning journey",
    icon: "ri-book-open-line",
    color: "bg-primary"
  },
  {
    value: "deep",
    label: "Deep Dive",
    cards: "12-15 cards",
    description: "For curious minds who want more",
    icon: "ri-rocket-line", 
    color: "bg-green-500"
  }
];

const CourseLength: FC<CourseLengthProps> = ({ onNext, onBack }) => {
  const { state, setCourseLength, generateCards } = useCourseState();

  const handleLengthSelection = (courseLength: CourseLengthType) => {
    setCourseLength(courseLength);
  };

  const autoLength = state.courseLength || "standard";
  const autoLabelMap = { quick: "Quick", standard: "Standard", deep: "Deep Dive" };

  const handleStart = () => {
    generateCards();
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">
          We picked a <span className="text-primary">{autoLabelMap[autoLength]}</span> course for you!
        </h2>
        <p className="text-lg text-muted-foreground">How many learning cards would you like?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mb-10">
        {LENGTH_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`length-option bg-white rounded-xl shadow-md overflow-hidden 
              border-2 ${state.courseLength === option.value ? 'border-primary' : 'border-transparent'} 
              hover:border-primary/30 cursor-pointer p-5 text-center`}
            onClick={() => handleLengthSelection(option.value)}
          >
            <div className="flex justify-center mb-3">
              <span className={`${option.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl`}>
                <i className={option.icon}></i>
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{option.label}</h3>
            <p className="text-neutral-700 mb-2">{option.cards}</p>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          className="bg-white text-primary border-2 border-primary text-lg font-bold py-2 px-6 rounded-full hover:bg-primary/5 transition"
          onClick={onBack}
          disabled={state.isLoading}
        >
          <i className="ri-arrow-left-line align-middle mr-1"></i> Back
        </Button>
        <Button
          className="bg-primary text-white text-lg font-bold py-2 px-6 rounded-full shadow-lg hover:bg-primary/90 transition"
          onClick={handleStart}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              Start Learning <i className="ri-arrow-right-line align-middle ml-1"></i>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CourseLength;
