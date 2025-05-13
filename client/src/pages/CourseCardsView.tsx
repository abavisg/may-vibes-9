import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCourses } from "@/hooks/use-my-courses";
import { LearningCard } from "@/components/ui/learning-card";
import { speakCard, stopSpeech } from "@/lib/text-to-speech";
import { useToast } from "@/hooks/use-toast";
import { calculateProgressPercentage, formatProgress } from "@/lib/utils";
import type { Course } from "@/types";

interface CourseCardsViewProps {
  params: { id?: string }; // Define the params prop structure
}

// Define view modes
type ViewMode = "detail" | "cards";

export default function CourseCardsView({ params }: CourseCardsViewProps) {
  console.log('CourseCardsView rendered with params:', params);
  const { selectedCourse, isLoading, updateCourseProgress, selectCourse } = useMyCourses();
  const [location, navigate] = useLocation();
  const courseId = params.id ? parseInt(params.id, 10) : null; // Get ID from params prop
  const { toast } = useToast();

  // View state for toggling between detail (resume/restart) and cards view
  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  // Force loading state while waiting for data
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  // Card viewing state (only relevant in 'cards' viewMode)
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [isNewProgress, setIsNewProgress] = useState(false);
  const [courseSaved, setCourseSaved] = useState(false);

  // Get startIndex from query parameter (only relevant if directly linked to a card)
  const searchParams = new URLSearchParams(location.search as unknown as string);
  const startIndex = searchParams.get('startIndex') ? parseInt(searchParams.get('startIndex') as string, 10) : 0;

  // Fetch course details when the ID changes or component mounts
  useEffect(() => {
    console.log('CourseCardsView useEffect 1: courseId=', courseId, 'selectedCourse=', selectedCourse, 'isLoading=', isLoading);
    
    // Set local loading state when starting to fetch a new course
    if (courseId) {
      setIsLocalLoading(true);
      // Only select course if we have an ID and
      selectCourse(courseId);
    } else {
      console.error("No course ID provided in URL");
      navigate("/my-courses"); // Fallback to my courses list if no ID
    }
  }, [courseId]); // Only depend on courseId change to prevent re-selecting

  // Watch for selected course data loading and determine initial view mode and card index
  useEffect(() => {
    console.log('CourseCardsView useEffect 2: selectedCourse=', selectedCourse, 'isLoading=', isLoading, 'courseId=', courseId);
    
    // Once loading state changes to false and we either have a course or not, update local loading state
    if (!isLoading) {
      setIsLocalLoading(false);
      
      // Handle course not found after loading
      if (!selectedCourse && courseId) {
        console.error(`Course with ID ${courseId} not found.`);
        toast({
          title: "Course not found",
          description: "The requested course could not be loaded.",
          variant: "destructive",
        });
        navigate("/my-courses"); // Fallback
        return;
      }
      
      // Configure view mode and card index if we have course data
      if (selectedCourse) {
        console.log("Selected course data loaded in CourseCardsView:", selectedCourse);
        
        // Determine initial view mode: if startIndex is provided, go directly to cards; otherwise, show detail view if there's progress
        if (startIndex > 0) {
          setViewMode("cards");
          setCurrentCardIndex(startIndex); // Start from the index in the URL
        } else if ((selectedCourse.currentCardIndex || 0) > 0) {
          // Show detail view with resume/restart options if there is saved progress
          setViewMode("detail");
          setCurrentCardIndex(selectedCourse.currentCardIndex || 0); // Set index to saved progress
        } else {
          // If no startIndex and no saved progress, go directly to cards view at index 0
           setViewMode("cards");
           setCurrentCardIndex(0);
        }

        setIsNewProgress(false);
        setCourseSaved(false);
      }
    }
  }, [selectedCourse, isLoading, courseId, navigate, toast, startIndex]); // Removed viewMode update from dependencies

  // Update URL with currentCardIndex whenever it changes (only in 'cards' viewMode)
  useEffect(() => {
    if (viewMode === "cards" && selectedCourse && currentCardIndex !== (selectedCourse.currentCardIndex || 0)) {
      const newUrl = `/course/${selectedCourse.id}/cards?startIndex=${currentCardIndex}`;
      // Use replace: true to avoid cluttering history with every card change
      navigate(newUrl, { replace: true });
    }
  }, [currentCardIndex, selectedCourse, navigate, viewMode]); // Added viewMode to dependencies

  // Function to handle saving the current course progress
  // Wrap in useCallback because it's used in a useEffect dependency array
  const handleSaveCourse = useCallback(() => {
    if (!selectedCourse) return;
    updateCourseProgress(selectedCourse.id, currentCardIndex);
    setCourseSaved(true);
    toast({
      title: "Progress saved",
      description: `Saved your progress on "${selectedCourse.topic}" at card ${currentCardIndex + 1}`,
    });
  }, [currentCardIndex, selectedCourse, updateCourseProgress, toast]);

  // Automatically save progress when currentCardIndex increases and represents new progress (only in 'cards' viewMode)
  useEffect(() => {
    if (viewMode === "cards" && isNewProgress && !courseSaved && selectedCourse) {
      console.log(`Automatically saving progress at card index ${currentCardIndex}`);
      handleSaveCourse(); // Call the save function automatically
    }
  }, [currentCardIndex, isNewProgress, courseSaved, selectedCourse, handleSaveCourse, viewMode]); // Added viewMode to dependencies

  // Check if this is new progress (only relevant in 'cards' viewMode)
  useEffect(() => {
    // Only check if we have a selected course and are in cards view
    if (viewMode === "cards" && selectedCourse) {
      const previousMaxIndex = selectedCourse.currentCardIndex || 0;
      const isNewlyViewedCard = currentCardIndex > previousMaxIndex;
      setIsNewProgress(isNewlyViewedCard);
      
      if (isNewlyViewedCard) {
        setCourseSaved(false);
      }
    }
  }, [currentCardIndex, selectedCourse, viewMode]); // Added viewMode to dependencies

  // Function to handle going back from cards view (modified to handle both views)
  const handleBack = () => {
    stopSpeech();
    setIsSpeakingNow(false);
    // If in cards view, go back to detail view; otherwise, go back to saved courses list
    if (viewMode === "cards") {
      setViewMode("detail"); // Go back to detail view
       // Update URL to remove startIndex query param if going back from cards to detail
       if (selectedCourse) {
          navigate(`/course/${selectedCourse.id}`, { replace: true });
       }
    } else if (selectedCourse) {
      navigate("/my-courses"); // Go back to my courses list
    } else {
       navigate("/my-courses"); // Fallback if somehow no selected course
    }
  };

  // Function to handle reading aloud (only in 'cards' viewMode)
  const handleReadAloud = () => {
     if (viewMode !== "cards") return; // Only allow in cards view
    if (!selectedCourse || !selectedCourse.cards || !selectedCourse.cards[currentCardIndex]) return;
    if (isSpeakingNow) {
      stopSpeech();
      setIsSpeakingNow(false);
    } else {
      const card = selectedCourse.cards[currentCardIndex];
      speakCard(card.title, card.content);
      setIsSpeakingNow(true);
    }
  };

  // Functions to navigate between cards (only in 'cards' viewMode)
  const nextCard = () => {
     if (viewMode !== "cards") return; // Only allow in cards view
    if (selectedCourse && selectedCourse.cards && currentCardIndex < selectedCourse.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const prevCard = () => {
     if (viewMode !== "cards") return; // Only allow in cards view
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

   // Function to handle resuming a course from the detail view
  const handleResumeCourse = () => {
    if (!selectedCourse) return;
    // Set view mode to cards and navigate to the appropriate card index
    setViewMode("cards");
    setCurrentCardIndex(selectedCourse.currentCardIndex || 0);
     // Update URL to reflect starting from saved progress
    navigate(`/course/${selectedCourse.id}/cards?startIndex=${selectedCourse.currentCardIndex || 0}`, { replace: true });
  };

  // Function to handle restarting a course from the detail view
  const handleRestartCourse = () => {
    if (!selectedCourse) return;
    // Set view mode to cards and navigate to the first card
    setViewMode("cards");
    setCurrentCardIndex(0);
     // Update URL to reflect starting from the beginning
    navigate(`/course/${selectedCourse.id}/cards?startIndex=0`, { replace: true });
  };


  // Show loading skeleton while fetching course details - use both global and local loading states
  if (isLoading || isLocalLoading || !selectedCourse) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-48 mt-6" />
      </div>
    );
  }

  const totalCards = Array.isArray(selectedCourse.cards) ? selectedCourse.cards.length : 0;

  // Render detail view (resume/restart options)
  if (viewMode === "detail") {
    const currentIndex = selectedCourse.currentCardIndex || 0;
    const isCompleted = totalCards > 0 && currentIndex >= totalCards;
    const progressPercent = calculateProgressPercentage(currentIndex, totalCards);

    return (
      <div className="container mx-auto p-4">
         <Button variant="link" className="mb-4" onClick={handleBack}>
            <i className="ri-arrow-left-line mr-1"></i> Back to My Courses
         </Button>
        <h2 className="text-3xl font-bold mb-4">{selectedCourse.topic}</h2>

        <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
          <span>Ages: {selectedCourse.ageGroup}</span>
          <span>Length: {totalCards} cards</span>
          <span>Created: {new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
        </div>

        {totalCards > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-neutral-700 mb-1">
              <span>Progress: {formatProgress(currentIndex, totalCards)} cards</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        <div className="flex flex-col space-y-4 mt-4">
          <Button
            size="lg"
            onClick={() => (isCompleted ? handleRestartCourse() : handleResumeCourse())}
          >
            <i className={isCompleted ? "ri-refresh-line mr-2" : "ri-play-line mr-2"}></i>
            {isCompleted ? "Start from Beginning" : "Resume Course"}
          </Button>

          {!isCompleted && currentIndex > 0 && (
            <Button variant="outline" size="lg" onClick={handleRestartCourse}>
              <i className="ri-restart-line mr-2"></i> Start from Beginning
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render cards view
   const currentCard = selectedCourse.cards[currentCardIndex];

  if (!currentCard) {
     return (
       <div className="container mx-auto p-4 text-center">
         <p className="text-lg text-muted-foreground">No cards available for this course.</p>
         <Button onClick={handleBack} className="mt-4">Back to Details</Button>
       </div>
     );
  }

  const progressPercentage = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6">
      {/* Top bar */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="link"
            className="text-primary flex items-center font-semibold p-0"
            onClick={handleBack}
          >
            <i className="ri-arrow-left-line mr-1"></i> Back
          </Button>
          
          <Link href="/">
            <Button 
              variant="link"
              className="text-primary flex items-center font-semibold p-0"
            >
              <i className="ri-home-line mr-1"></i> Home
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center">
          <span className="font-bold text-lg mr-2">{selectedCourse.topic}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium">
            Ages {selectedCourse.ageGroup}
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
          {isNewProgress && (
            <span className="text-sm text-amber-500">
              <i className="ri-alert-line mr-1"></i> New progress - don't forget to save!
            </span>
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Learning Card */}
      <div className="flex-grow flex items-center justify-center w-full max-w-3xl py-4">
        <LearningCard card={currentCard} />
      </div>

      {/* Navigation buttons */}
      <div className="w-full flex justify-between max-w-3xl">
        <Button 
          onClick={prevCard} 
          disabled={currentCardIndex === 0}
          variant="secondary"
        >
          Previous
        </Button>
        <Button 
          onClick={nextCard}
          disabled={currentCardIndex === (totalCards - 1)}
          variant="secondary"
        >
          Next
        </Button>
      </div>

      {/* Save Progress Button */}
      {isNewProgress && !courseSaved && (
        <Button
          onClick={handleSaveCourse}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          <i className="ri-save-line mr-2"></i> Save Progress
        </Button>
      )}
    </div>
  );
} 