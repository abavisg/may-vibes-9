import { useEffect } from "react";
import { useLocation } from "wouter";
import { Welcome } from "@/components/ui/welcome";
import { useCourseState } from "@/hooks/use-course-state";
import { hasUnviewedCards } from "@/lib/daily-cards";

export default function Home() {
  const { } = useCourseState();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (hasUnviewedCards()) {
      const shouldView = window.confirm("You have daily learning cards waiting for you! Would you like to view them now?");
      if (shouldView) {
        console.log("Navigate to Daily Cards");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Welcome 
        onStart={() => navigate('/create/topic')}
        onParentMode={() => navigate("/parent")}
        onDailyCards={() => { console.log("Daily Cards Clicked"); }}
      />
    </div>
  );
}
