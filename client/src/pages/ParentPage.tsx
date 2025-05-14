import { useLocation } from "wouter";
import { ParentMode } from "@/components/ui/parent-mode";

export default function ParentPage() {
  const [, navigate] = useLocation();

  const handleBack = () => {
    navigate("/");
  };

  const handleCreateCourse = () => {
    navigate("/create/topic");
  };

  return (
    <ParentMode onBack={handleBack} onCreateCourse={handleCreateCourse} />
  );
} 