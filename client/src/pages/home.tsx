import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Welcome } from "@/components/ui/welcome";
import { useCourseState } from "@/hooks/use-course-state";
import { hasUnviewedCards } from "@/lib/daily-cards";
import type { Course } from "@/types";

export default function Home() {
  const { generateCards, setTopic, setAgeGroup, setCourseLength } = useCourseState();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (hasUnviewedCards()) {
      const shouldView = window.confirm("You have daily learning cards waiting for you! Would you like to view them now?");
      if (shouldView) {
        console.log("Navigate to Daily Cards");
      }
    }
  }, []);

  const handleStartLearning = () => navigate("/topic");
  const handleParentMode = () => navigate("/parent");
  const handleMyCourses = () => navigate("/my-courses");

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Welcome 
        onStart={() => navigate('/create/topic')}
        onParentMode={handleParentMode}
        onDailyCards={() => { console.log("Daily Cards Clicked"); }}
      />
    </div>
  );
}
