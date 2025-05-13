import { useState, useEffect } from "react";
import { Welcome } from "@/components/ui/welcome";
import { TopicInput } from "@/components/ui/topic-input";
import { AgeSelector } from "@/components/ui/age-selector";
import { CourseLength } from "@/components/ui/course-length";
import { CardScreen } from "@/components/layout/card-screen";
import { ParentMode } from "@/components/ui/parent-mode";
import { DailyView } from "@/components/ui/daily-view";
import { useCourseState } from "@/hooks/use-course-state";
import { hasUnviewedCards } from "@/lib/daily-cards";
import type { Course } from "@/types";

// Define screens enum for easier navigation
enum Screen {
  Welcome = "welcome",
  Topic = "topic",
  Age = "age",
  Length = "length",
  Cards = "cards",
  Parent = "parent",
  Daily = "daily"
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { generateCards, setTopic, setAgeGroup, setCourseLength, setState } = useCourseState();

  // Check for unviewed daily cards on mount
  useEffect(() => {
    if (hasUnviewedCards()) {
      // Show notification or automatically redirect
      const shouldView = window.confirm("You have daily learning cards waiting for you! Would you like to view them now?");
      if (shouldView) {
        navigateToScreen(Screen.Daily);
      }
    }
  }, []);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };
  
  // Handle resuming a course
  const handleResumeCourse = (course: Course) => {
    // Set the course state from the saved course
    setSelectedCourse(course);
    
    // Update the course state
    setState({
      topic: course.topic,
      ageGroup: course.ageGroup as any, // Type cast as needed
      courseLength: course.courseLength as any, // Type cast as needed
      cards: Array.isArray(course.cards) ? course.cards : [],
      currentCardIndex: course.currentCardIndex || 0,
      isLoading: false,
      totalCards: Array.isArray(course.cards) ? course.cards.length : 0
    });
    
    // Navigate to the cards screen
    navigateToScreen(Screen.Cards);
  };

  const handleParentCreateCourse = () => {
    generateCards();
    navigateToScreen(Screen.Cards);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {currentScreen === Screen.Welcome && (
        <Welcome 
          onStart={() => navigateToScreen(Screen.Topic)} 
          onParentMode={() => navigateToScreen(Screen.Parent)}
          onDailyCards={() => navigateToScreen(Screen.Daily)}
        />
      )}
      
      {currentScreen === Screen.Topic && (
        <TopicInput onNext={() => navigateToScreen(Screen.Age)} />
      )}
      
      {currentScreen === Screen.Age && (
        <AgeSelector 
          onNext={() => navigateToScreen(Screen.Length)} 
          onBack={() => navigateToScreen(Screen.Topic)}
        />
      )}
      
      {currentScreen === Screen.Length && (
        <CourseLength 
          onNext={() => navigateToScreen(Screen.Cards)} 
          onBack={() => navigateToScreen(Screen.Age)}
        />
      )}
      
      {currentScreen === Screen.Cards && (
        <CardScreen onBackToHome={() => navigateToScreen(Screen.Welcome)} />
      )}
      
      {currentScreen === Screen.Parent && (
        <ParentMode 
          onBack={() => navigateToScreen(Screen.Welcome)}
          onCreateCourse={handleParentCreateCourse}
        />
      )}

      {currentScreen === Screen.Daily && (
        <DailyView onBackToHome={() => navigateToScreen(Screen.Welcome)} />
      )}
    </div>
  );
}
