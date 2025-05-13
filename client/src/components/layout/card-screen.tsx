import { FC, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCourseState } from "@/hooks/use-course-state";
import { LearningCard } from "@/components/ui/learning-card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardScreenProps {
  onBackToHome: () => void;
}

export const CardScreen: FC<CardScreenProps> = ({ onBackToHome }) => {
  const { state, nextCard, prevCard } = useCourseState();
  const { topic, ageGroup, cards, currentCardIndex, isLoading, totalCards } = state;

  useEffect(() => {
    // Scroll to top when navigating between cards
    window.scrollTo(0, 0);
  }, [currentCardIndex]);

  // Function to handle text-to-speech
  const handleReadAloud = () => {
    if (!cards[currentCardIndex]) return;
    
    const currentCard = cards[currentCardIndex];
    const textToRead = `${currentCard.title}. ${currentCard.content.replace(/<[^>]*>/g, '')}. Fun Fact! ${currentCard.funFact}`;
    
    // Use the Web Speech API
    const speech = new SpeechSynthesisUtterance();
    speech.text = textToRead;
    speech.rate = 0.9; // Slightly slower for kids
    speech.pitch = 1.1; // Slightly higher pitch
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(speech);
  };

  // Function to handle save course (simplified version)
  const handleSaveCourse = () => {
    // In a real app, this would save to local storage or a database
    alert("Course saved! You can access it in the future.");
  };

  // Function to handle daily cards option
  const handleDailyCards = () => {
    alert("You'll receive one card per day! Come back tomorrow for more.");
  };

  // Calculate progress percentage
  const progressPercentage = (currentCardIndex + 1) / totalCards * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6">
      {/* Top bar */}
      <div className="w-full flex justify-between items-center mb-4">
        <Button 
          variant="link"
          className="text-primary flex items-center font-semibold p-0"
          onClick={onBackToHome}
        >
          <i className="ri-home-line mr-1"></i> Home
        </Button>
        
        <div className="flex items-center">
          <span className="font-bold text-lg mr-2">{topic}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium">
            Ages {ageGroup}
          </span>
        </div>
        
        <Button
          variant="link"
          className="text-primary flex items-center font-semibold p-0"
          onClick={handleReadAloud}
        >
          <i className="ri-volume-up-line mr-1"></i> Read
        </Button>
      </div>

      {/* Card progress */}
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-sm text-neutral-700">
            Card {currentCardIndex + 1} of {totalCards}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Learning card */}
      {isLoading ? (
        <div className="w-full max-w-3xl flex-1 flex items-center justify-center my-4">
          <div className="w-full">
            <Skeleton className="h-20 w-full bg-primary/20 mb-4" />
            <Skeleton className="h-60 w-full bg-gray-100 mb-4" />
            <Skeleton className="h-20 w-full bg-amber-50" />
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
            className="bg-white text-green-500 border-2 border-green-500 rounded-full flex items-center px-4 py-2 hover:bg-green-50 transition h-auto"
            onClick={handleSaveCourse}
            disabled={isLoading || cards.length === 0}
          >
            <i className="ri-save-line mr-1"></i> Save Course
          </Button>
          
          <Button
            variant="outline"
            className="bg-white text-amber-500 border-2 border-amber-500 rounded-full flex items-center px-4 py-2 hover:bg-amber-50 transition h-auto"
            onClick={handleDailyCards}
            disabled={isLoading || cards.length === 0}
          >
            <i className="ri-calendar-line mr-1"></i> Daily Cards
          </Button>
        </div>
        
        <Button
          className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center hover:bg-primary/90 transition"
          disabled={currentCardIndex === totalCards - 1 || isLoading || cards.length === 0}
          onClick={nextCard}
        >
          <i className="ri-arrow-right-s-line text-xl"></i>
        </Button>
      </div>
    </div>
  );
};

export default CardScreen;
