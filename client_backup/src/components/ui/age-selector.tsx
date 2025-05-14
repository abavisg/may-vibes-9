import { FC } from "react";
import { Button } from "@/components/ui/button";
import { useCourseState } from "@/hooks/use-course-state";
import type { AgeGroup } from "@/types";

interface AgeSelectorProps {
  onNext: (ageGroup: AgeGroup) => void;
  onBack: () => void;
}

interface AgeOption {
  value: AgeGroup;
  label: string;
  description: string;
  imageUrl: string;
}

const AGE_OPTIONS: AgeOption[] = [
  {
    value: "5-7",
    label: "Ages 5-7",
    description: "Simple, fun learning",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
  },
  {
    value: "8-10",
    label: "Ages 8-10",
    description: "Engaging, interesting facts",
    imageUrl: "https://images.unsplash.com/photo-1636207543865-acf3ad382295?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
  },
  {
    value: "11-12",
    label: "Ages 11-12",
    description: "Deeper learning & concepts",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200"
  }
];

export const AgeSelector: FC<AgeSelectorProps> = ({ onNext, onBack }) => {
  const { state, setAgeGroup } = useCourseState();

  const handleAgeSelection = (ageGroup: AgeGroup) => {
    setAgeGroup(ageGroup);
    onNext(ageGroup);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">How old are you?</h2>
        <p className="text-lg text-muted-foreground">This helps us make content just right for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mb-10">
        {AGE_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`bg-white rounded-xl shadow-md overflow-hidden border-2 
              ${state.ageGroup === option.value ? 'border-primary' : 'border-transparent'} 
              hover:border-primary/30 cursor-pointer transform hover:scale-105 transition`}
            onClick={() => handleAgeSelection(option.value)}
          >
            <img
              src={option.imageUrl}
              alt={option.label}
              className="w-full h-36 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold">{option.label}</h3>
              <p className="text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          className="bg-white text-primary border-2 border-primary text-lg font-bold py-2 px-6 rounded-full hover:bg-primary/5 transition"
          onClick={onBack}
        >
          <i className="ri-arrow-left-line align-middle mr-1"></i> Back
        </Button>
      </div>
    </div>
  );
};

export default AgeSelector;
