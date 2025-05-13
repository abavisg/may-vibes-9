import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCourseState } from "@/hooks/use-course-state";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { LearningCard } from "@/components/ui/learning-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { speakCard, stopSpeech, isSpeaking } from "@/lib/text-to-speech";
import { saveToDaily, getDailyCourses } from '@/lib/daily-cards';

interface CardScreenProps {
  onBackToHome: () => void;
}

export const CardScreen: FC<CardScreenProps> = ({ onBackToHome }) => {
  const { state, nextCard, prevCard } = useCourseState();
  const { topic, ageGroup, courseLength, cards, currentCardIndex, isLoading, totalCards } = state;
  const { saveCourse, updateCourseProgress } = useSavedCourses();
  const [courseSaved, setCourseSaved] = useState(false);
  const [dailyMode, setDailyMode] = useState(false);

  useEffect(() => {
    // Scroll to top when navigating between cards
    window.scrollTo(0, 0);
  }, [currentCardIndex]);

  // State to track speaking status
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  
  // Update speaking status
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      setIsSpeakingNow(isSpeaking());
    }, 300);
    
    return () => {
      clearInterval(checkSpeakingInterval);
      stopSpeech(); // Stop any speech when component unmounts
    };
  }, []);
  
  // Function to handle text-to-speech
  const handleReadAloud = () => {
    if (!cards[currentCardIndex]) return;
    
    if (isSpeakingNow) {
      stopSpeech();
      return;
    }
    
    const currentCard = cards[currentCardIndex];
    speakCard(currentCard.title, currentCard.content);
  };

  // Function to handle save course using our database
  const handleSaveCourse = () => {
    if (!topic || !ageGroup || !courseLength || cards.length === 0) {
      return;
    }
    
    // Save the course to the database
    saveCourse(topic, ageGroup, courseLength, cards);
    setCourseSaved(true);
  };

  // Function to handle daily cards option
  const handleDailyCards = () => {
    if (!topic || !ageGroup || !courseLength || cards.length === 0) {
      return;
    }
    
    // Save the course to daily schedule
    saveToDaily(
      Date.now(), // Use timestamp as ID if we don't have a real course ID
      topic,
      ageGroup,
      courseLength,
      cards
    );
    
    setDailyMode(true);
    // Show a confirmation message
    alert("This course has been added to your daily learning schedule. You'll get one card per day. Come back tomorrow for the next card!");
  };

  // Calculate progress percentage
  const progressPercentage = (currentCardIndex + 1) / totalCards * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6">
      <Toaster />
      
      {/* Top bar */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="link"
            className="text-primary flex items-center font-semibold p-0"
            onClick={onBackToHome}
          >
            <i className="ri-home-line mr-1"></i> Home
          </Button>
          
          <a href="/saved-courses">
            <Button 
              variant="link"
              className="text-primary flex items-center font-semibold p-0"
            >
              <i className="ri-bookmark-line mr-1"></i> Saved Courses
            </Button>
          </a>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold text-lg mr-2">{topic}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium">
            Ages {ageGroup}
          </span>
        </div>
        
        <Button
          variant={isSpeakingNow ? "secondary" : "link"}
          className={`flex items-center font-semibold p-0 ${isSpeakingNow ? 'bg-primary/10 px-3 py-1 rounded' : 'text-primary'}`}
          onClick={handleReadAloud}
        >
          <i className={`${isSpeakingNow ? 'ri-stop-circle-line' : 'ri-volume-up-line'} mr-1`}></i> 
          {isSpeakingNow ? 'Stop' : 'Read'}
        </Button>
      </div>

      {/* Card progress */}
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-sm text-neutral-700">
            Card {currentCardIndex + 1} of {totalCards}
          </span>
          {dailyMode && (
            <span className="text-sm text-amber-500">
              <i className="ri-calendar-line mr-1"></i> Daily Mode Activated
            </span>
          )}
          {isLoading && (
            <span className="text-sm text-primary animate-pulse">
              <i className="ri-loader-4-line animate-spin mr-1"></i> Generating cards...
            </span>
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Learning card */}
      {isLoading ? (
        <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-4">
          <div className="w-full">
            <Skeleton className="h-20 w-full bg-primary/20 mb-4" />
            <Skeleton className="h-60 w-full bg-gray-100 mb-4" />
            <Skeleton className="h-20 w-full bg-amber-50" />
          </div>
          <div className="text-primary mt-6 animate-pulse text-center">
            <p className="text-lg font-medium">Our AI is crafting learning cards for you</p>
            <p className="text-sm text-muted-foreground">This might take a moment...</p>
          </div>
        </div>
      ) : cards.length > 0 && currentCardIndex < cards.length ? (
        <LearningCard card={cards[currentCardIndex]} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">No cards available</p>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="w-full max-w-3xl flex justify-between items-center mt-4">
        <Button
          variant="outline"
          className="bg-white text-primary border-2 border-primary rounded-full h-12 w-12 flex items-center justify-center hover:bg-primary/5 transition"
          disabled={currentCardIndex === 0 || isLoading}
          onClick={prevCard}
        >
          <i className="ri-arrow-left-s-line text-xl"></i>
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className={`bg-white border-2 rounded-full flex items-center px-4 py-2 transition h-auto
              ${courseSaved 
                ? 'text-green-700 border-green-700 bg-green-50' 
                : 'text-green-500 border-green-500 hover:bg-green-50'}`}
            onClick={handleSaveCourse}
            disabled={isLoading || cards.length === 0 || courseSaved}
          >
            <i className={courseSaved ? "ri-check-line mr-1" : "ri-save-line mr-1"}></i> 
            {courseSaved ? "Course Saved" : "Save Course"}
          </Button>
          
          <Button
            variant="outline"
            className={`bg-white border-2 rounded-full flex items-center px-4 py-2 transition h-auto
              ${dailyMode 
                ? 'text-amber-700 border-amber-700 bg-amber-50' 
                : 'text-amber-500 border-amber-500 hover:bg-amber-50'}`}
            onClick={handleDailyCards}
            disabled={isLoading || cards.length === 0 || dailyMode}
          >
            <i className="ri-calendar-line mr-1"></i> 
            {dailyMode ? "Daily Mode On" : "Daily Cards"}
          </Button>
        </div>
        
        <Button
          className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center hover:bg-primary/90 transition"
          disabled={currentCardIndex === totalCards - 1 || isLoading || cards.length === 0}
          onClick={() => {
            // Auto-save progress if it's a saved course
            if (state.id) {
              updateCourseProgress(state.id, state.currentCardIndex + 1);
            }
            nextCard(); // Move to the next card
          }}
        >
          <i className="ri-arrow-right-s-line text-xl"></i>
        </Button>
      </div>
    </div>
  );
};

export default CardScreen;
