import { useLocation } from "wouter";
import { AgeSelector } from "@/components/ui/age-selector";
import { useCourseState } from "@/hooks/use-course-state";
import type { AgeGroup } from "@/types";

export default function AgeSelectorPage() {
  const [, navigate] = useLocation();
  const { setAgeGroup } = useCourseState();

  const handleNext = (ageGroup: AgeGroup) => {
    setAgeGroup(ageGroup);
    navigate("/create/length");
  };

  const handleBack = () => {
    navigate("/create/topic");
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Select an age group:</h1>
      <AgeSelector onNext={handleNext} onBack={handleBack} />
    </div>
  );
} 