import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCourses } from "@/hooks/use-my-courses";
import { useCourseState } from "@/hooks/use-course-state";
import { LearningCard } from "@/components/ui/learning-card";
import { speakCard, stopSpeech } from "@/lib/text-to-speech";
import { useToast } from "@/hooks/use-toast";
import { calculateProgressPercentage, formatProgress } from "@/lib/utils";
import React from "react";
import { queryClient } from "@/lib/queryClient";
import type { Course } from "@/types";

interface CourseCardsViewProps {
  params: { id?: string }; // Define the params prop structure
}

const MemoizedCourseCardsView = React.memo(function CourseCardsView({ params }: CourseCardsViewProps) {
  // Track render count for debugging
  const renderCount = React.useRef(0);
  renderCount.current++;
  
  console.log(`CourseCardsView rendered with params: ${JSON.stringify(params)} (Render #${renderCount.current})`);
  
  const { selectedCourse, isLoading, updateCourseProgress, selectCourse } = useMyCourses();
  const { state: courseState, loadCourse, setState: setCourseStateDirectly } = useCourseState();
  const [location, navigate] = useLocation();
  const courseId = params.id ? parseInt(params.id, 10) : null; // Get ID from params prop
  const { toast } = useToast();
  
  // Add a ref to track if we've already loaded the course
  const hasLoadedCourseRef = React.useRef<Record<string, boolean>>({});
  // Add local state to prevent redundant operations
  const [hasTriggeredFetch, setHasTriggeredFetch] = useState(false);
  const [hasLoadedCourse, setHasLoadedCourse] = useState(false);

  // Card viewing state (derived from courseState)
  const currentCardIndex = courseState.currentCardIndex;
  const totalCards = courseState.totalCards;
  
  // State to control resume options display (still needed locally based on initial load)
  const [showResumeOptions, setShowResumeOptions] = useState(false);

  // Get startIndex from query parameter
  const searchParams = new URLSearchParams(location.search as unknown as string);
  const startIndex = searchParams.get('startIndex') ? parseInt(searchParams.get('startIndex') as string, 10) : 0;

  // Add retryCount state to keep track of retry attempts
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 200; // ms

  // Effect to initiate fetching the course data when the ID changes
  useEffect(() => {
    if (courseId && !hasTriggeredFetch) {
      console.log('CourseCardsView useEffect: Triggering fetch for courseId=', courseId);
      
      // Check if the course is already in the cache before triggering a fetch
      const cachedCourse = queryClient.getQueryData(['/api/course', courseId]);
      console.log('CourseCardsView: Checking for cached course data:', cachedCourse);
      
      if (cachedCourse) {
        console.log('CourseCardsView: Using cached course data instead of fetching');
        // If we already have the course data, we can skip the fetch
        setHasTriggeredFetch(true);
      } else {
        // Trigger the fetch only if not already in cache
        // Trigger the fetch in useMyCourses by setting the selected ID
        selectCourse(courseId);
        setHasTriggeredFetch(true);
      }
    } else if (!courseId) {
      console.error("No course ID provided in URL");
      navigate("/my-courses"); // Fallback to my courses list if no ID
    }
  }, [courseId, selectCourse, navigate, hasTriggeredFetch]);

  // Effect to implement retry mechanism for loading course data
  useEffect(() => {
    // Only retry if we haven't loaded the course yet but have triggered a fetch
    if (hasTriggeredFetch && !hasLoadedCourse && retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        console.log(`CourseCardsView: Retry attempt ${retryCount + 1} to load course data`);
        // Increment retry count and force a re-check of the cache
        setRetryCount(prev => prev + 1);
      }, RETRY_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [hasTriggeredFetch, hasLoadedCourse, retryCount]);

  // Effect to load the fetched course into useCourseState and determine initial view
  useEffect(() => {
    // Generate a unique key for this course ID to track loading
    const courseKey = `course-${courseId}`;
    
    // Force card display when startIndex is explicitly specified in the URL (non-zero or explicitly set to 0)
    const hasExplicitStartIndex = searchParams.has('startIndex');
    console.log(`CourseCardsView: URL has explicit startIndex: ${hasExplicitStartIndex}, value: ${startIndex}`);
    
    // First check if we have course data in cache directly
    const cachedCourse = queryClient.getQueryData(['/api/course', courseId]);
    console.log(`CourseCardsView: Cache check for course ${courseId}:`, 
      cachedCourse ? 
      `Found (type: ${typeof cachedCourse}, has required props: ${
        typeof cachedCourse === 'object' && 
        'id' in cachedCourse && 
        'topic' in cachedCourse && 
        'cards' in cachedCourse &&
        'ageGroup' in cachedCourse
      })` : 
      'Not found'
    );
    
    // Only proceed if we haven't loaded this course yet and we have some data
    if (!hasLoadedCourse && !hasLoadedCourseRef.current[courseKey]) {
      if (cachedCourse && 
          typeof cachedCourse === 'object' && 
          'id' in cachedCourse && 
          'topic' in cachedCourse && 
          'cards' in cachedCourse &&
          'ageGroup' in cachedCourse) {
        // Use cached data directly
        console.log("Using cached course data in CourseCardsView useEffect:", cachedCourse);
        
        // Mark that we've loaded this course
        hasLoadedCourseRef.current[courseKey] = true;
        setHasLoadedCourse(true);
        
        // Load the cached course into the CourseState with proper type casting
        const typedCourse = cachedCourse as unknown as Course;
        
        // If startIndex is explicitly set in URL, don't show resume options
        const startFromBeginning = hasExplicitStartIndex 
          ? false 
          : startIndex === 0 && (typedCourse.currentCardIndex || 0) > 0;
        
        loadCourse(typedCourse, startFromBeginning);
        
        // Show resume options if appropriate (and not forcing card display)
        setShowResumeOptions(startFromBeginning && !hasExplicitStartIndex);
      } else if (!isLoading && selectedCourse) {
        // Fallback to using data from query if not in cache directly
        console.log("Selected course data loaded in CourseCardsView useEffect:", selectedCourse);
        
        // Mark that we've loaded this course
        hasLoadedCourseRef.current[courseKey] = true;
        setHasLoadedCourse(true);
        
        // Load the fetched course into the CourseState
        const startFromBeginning = hasExplicitStartIndex 
          ? false 
          : startIndex === 0 && (selectedCourse.currentCardIndex || 0) > 0;
          
        loadCourse(selectedCourse, startFromBeginning);
        
        // Show resume options if appropriate
        setShowResumeOptions(startFromBeginning && !hasExplicitStartIndex);
      } else if (!isLoading && !selectedCourse && courseId && !hasLoadedCourseRef.current[courseKey]) {
        // Only show the error once
        hasLoadedCourseRef.current[courseKey] = true;
        console.error(`Course with ID ${courseId} not found after fetch attempt.`);
        toast({
          title: "Course not found",
          description: "The requested course could not be loaded.",
          variant: "destructive",
        });
        navigate("/my-courses"); // Fallback
      }
    }
  }, [selectedCourse, isLoading, courseId, navigate, toast, startIndex, loadCourse, hasLoadedCourse]);

  // Effect to update the URL based on currentCardIndex - completely rewritten to avoid loops
  useEffect(() => {
    // Only update URL when cards are being viewed (not resume options)
    // and when the user manually changes cards (not during initial load)
    if (
      !showResumeOptions && 
      courseState.id && 
      courseState.currentCardIndex !== (selectedCourse?.currentCardIndex || 0) &&
      hasLoadedCourse // Only update URL after initial course load
    ) {
      // Use a different URL update strategy that won't trigger re-renders
      window.history.replaceState(
        {}, 
        '', 
        `/course/${courseState.id}/cards?startIndex=${courseState.currentCardIndex}`
      );
      
      console.log(
        `CourseCardsView: Updated URL to startIndex ${courseState.currentCardIndex} without navigation`
      );
    }
  }, [courseState.currentCardIndex, courseState.id, showResumeOptions, selectedCourse?.currentCardIndex, hasLoadedCourse]);

  // Function to handle saving the current course progress (uses useMyCourses mutation)
  const handleSaveCourse = useCallback(() => {
    if (!courseState.id) return;
    console.log(`CourseCardsView: Saving progress for course ${courseState.id} at index ${courseState.currentCardIndex}`);
    updateCourseProgress(courseState.id, courseState.currentCardIndex);
    toast({
      title: "Progress saved",
      description: `Saved your progress on "${courseState.topic}" at card ${courseState.currentCardIndex + 1}`,
    });
  }, [courseState.id, courseState.currentCardIndex, updateCourseProgress, toast]);

  // Automatically save progress when currentCardIndex increases and represents new progress (only when resume options are not shown)
  // This logic assumes progress is new if currentCardIndex is greater than the initially loaded saved progress.
  // Removing automatic save for now to simplify.
  // useEffect(() => {
  //   if (!selectedCourse) return; // Need selectedCourse to know the previous max index
  //   const initialLoadedIndex = selectedCourse.currentCardIndex || 0;
  //   const isNewlyViewedCard = courseState.currentCardIndex > initialLoadedIndex;

  //   if (!showResumeOptions && isNewlyViewedCard && courseState.id) {
  //     console.log(`CourseCardsView useEffect: Automatically saving progress at card index ${courseState.currentCardIndex}`);
  //     handleSaveCourse();
  //   }
  // }, [courseState.currentCardIndex, courseState.id, showResumeOptions, handleSaveCourse, selectedCourse]);

  // Function to handle going back (always goes to My Courses)
  const handleBack = () => {
    stopSpeech();
    navigate("/my-courses");
  };

  // Function to handle reading aloud (only when resume options are not shown)
  const handleReadAloud = () => {
    if (showResumeOptions || !courseState.cards || !courseState.cards[courseState.currentCardIndex]) return;
    // isSpeakingNow state and logic would need to be managed in useCourseState or a separate hook if needed.
    // For now, just speak.
    const card = courseState.cards[courseState.currentCardIndex];
    speakCard(card.title, card.content);
  };

  // Functions to navigate between cards (only when resume options are not shown)
  const nextCard = () => {
    if (showResumeOptions || !courseState.cards || courseState.currentCardIndex >= courseState.cards.length - 1) return;
    // Update the currentCardIndex in useCourseState
    setCourseStateDirectly({ currentCardIndex: courseState.currentCardIndex + 1 });
  };

  const prevCard = () => {
    if (showResumeOptions || courseState.currentCardIndex <= 0) return;
     // Update the currentCardIndex in useCourseState
    setCourseStateDirectly({ currentCardIndex: courseState.currentCardIndex - 1 });
  };

  // Function to handle resuming a course
  const handleResumeCourse = () => {
    if (!selectedCourse) return;
    // Load the course with saved progress and navigate to the cards view URL with the correct startIndex
    loadCourse(selectedCourse);
    navigate(`/course/${selectedCourse.id}/cards?startIndex=${selectedCourse.currentCardIndex || 0}`, { replace: true });
  };

  // Function to handle restarting a course
  const handleRestartCourse = () => {
    if (!selectedCourse) return;
    // Load the course from the beginning and navigate to the cards view URL with startIndex 0
    loadCourse(selectedCourse, true);
    navigate(`/course/${selectedCourse.id}/cards?startIndex=0`, { replace: true });
  };

  // Add a timeout to ensure the component eventually renders something
  useEffect(() => {
    // If we're still in a loading state after a reasonable time, force rendering
    const forceRenderTimeout = setTimeout(() => {
      if (isLoading && hasTriggeredFetch && !hasLoadedCourse) {
        console.log('CourseCardsView: Force rendering after timeout - loading took too long');
        
        // Get URL params for consistent behavior
        const searchParams = new URLSearchParams(location.search as unknown as string);
        const hasExplicitStartIndex = searchParams.has('startIndex');
        
        // Force the component to render something
        if (selectedCourse) {
          // If we have a selected course but haven't loaded it, force load it
          hasLoadedCourseRef.current[`course-${courseId}`] = true;
          setHasLoadedCourse(true);
          
          // Try to load the selected course data
          const startFromBeginning = hasExplicitStartIndex 
            ? false 
            : startIndex === 0 && (selectedCourse.currentCardIndex || 0) > 0;
          loadCourse(selectedCourse, startFromBeginning);
          setShowResumeOptions(startFromBeginning && !hasExplicitStartIndex);
        } else {
          // If we don't have course data, redirect to safety
          console.error('CourseCardsView: Timeout with no course data, redirecting to safety');
          toast({
            title: "Loading timeout",
            description: "Could not load the course. Please try again.",
            variant: "destructive",
          });
          navigate("/my-courses");
        }
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(forceRenderTimeout);
  }, [isLoading, hasTriggeredFetch, hasLoadedCourse, selectedCourse, courseId, loadCourse, startIndex, navigate, toast]);

  // Show loading skeleton while fetching course details via useMyCourses
  if (isLoading || !selectedCourse) {
    console.log("CourseCardsView: Rendering loading skeleton", { isLoading, hasSelectedCourse: !!selectedCourse });
    return (
      <div className="container mx-auto p-4">
        <Button variant="link" className="mb-4 opacity-50" disabled>
          <i className="ri-arrow-left-line mr-1"></i> Back to My Courses
        </Button>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-48 mt-6" />
        
        {hasTriggeredFetch && (
          <div className="fixed bottom-4 right-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-md shadow-md animate-pulse">
            Loading course data...
          </div>
        )}
      </div>
    );
  }

  // Use selectedCourse for resume options display as it contains the original saved progress
   const resumeDisplayTotalCards = Array.isArray(selectedCourse.cards) ? selectedCourse.cards.length : 0;
  const resumeDisplayCurrentIndex = selectedCourse.currentCardIndex || 0;
  const resumeDisplayProgressPercent = calculateProgressPercentage(resumeDisplayCurrentIndex, resumeDisplayTotalCards);

  // Render resume/restart options if applicable
  if (showResumeOptions) {
    console.log("CourseCardsView: Rendering resume options view", {
      selectedCourse,
      resumeDisplayTotalCards,
      resumeDisplayCurrentIndex,
      resumeDisplayProgressPercent
    });
    
    return (
      <div className="container mx-auto p-4">
         <Button variant="link" className="mb-4" onClick={handleBack}>
            <i className="ri-arrow-left-line mr-1"></i> Back to My Courses
         </Button>
        <h2 className="text-3xl font-bold mb-4">{selectedCourse.topic}</h2>

        <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
          <span>Ages: {selectedCourse.ageGroup}</span>
          <span>Length: {resumeDisplayTotalCards} cards</span>
          <span>Created: {new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
        </div>

        {resumeDisplayTotalCards > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-neutral-700 mb-1">
              <span>Progress: {formatProgress(resumeDisplayCurrentIndex, resumeDisplayTotalCards)} cards</span>
              <span>{resumeDisplayProgressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={resumeDisplayProgressPercent} className="h-2" />
          </div>
        )}

        <div className="flex flex-col space-y-4 mt-4">
          <Button
            size="lg"
            onClick={handleResumeCourse}
          >
            <i className="ri-play-line mr-2"></i>
            Resume Course
          </Button>

          { resumeDisplayCurrentIndex > 0 && (
            <Button variant="outline" size="lg" onClick={handleRestartCourse}>
              <i className="ri-restart-line mr-2"></i> Start from Beginning
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render cards view using courseState
   const currentCard = courseState.cards[courseState.currentCardIndex];

  if (!currentCard) {
     return (
       <div className="container mx-auto p-4 text-center">
         <p className="text-lg text-muted-foreground">No cards available for this course.</p>
         <Button onClick={handleBack} className="mt-4">Back to My Courses</Button>
       </div>
     );
  }

  // Use courseState for current card index and total cards in the display
  const cardProgressPercentage = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0;

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
          <span className="font-bold text-lg mr-2">{courseState.topic || selectedCourse.topic}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium">
            Ages {courseState.ageGroup || selectedCourse.ageGroup}
          </span>
        </div>
        
        <Button
          // Removed isSpeakingNow logic for now
          variant="link"
          className={`flex items-center font-semibold p-0 text-primary`}
          onClick={handleReadAloud}
        >
          <i className={`ri-volume-up-line mr-1`}></i> 
          Read {/* Simplified text */}
        </Button>
      </div>

      {/* Card progress */}
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-sm text-neutral-700">
            Card {currentCardIndex + 1} of {totalCards}
          </span>
          {/* Removed isNewProgress logic for now */}
          {/* {isNewProgress && (totalCards > 0 && currentCardIndex < totalCards) && (
            <span className="text-sm text-amber-500">
              <i className="ri-alert-line mr-1"></i> New progress - don't forget to save!
            </span>
          )} */}
        </div>
        <Progress value={cardProgressPercentage} className="h-2" />
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
      {/* Always show save button for now, removed isNewProgress and courseSaved check */}
      {(totalCards > 0 && currentCardIndex < totalCards) && (
        <Button
          onClick={handleSaveCourse}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          <i className="ri-save-line mr-2"></i> Save Progress
        </Button>
      )}
    </div>
  );
});

export default MemoizedCourseCardsView; 