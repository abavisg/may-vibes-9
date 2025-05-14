import React, { useState, useEffect } from "react";
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
import { queryClient } from "@/lib/queryClient";
import type { Course } from "@/types";

interface CourseCardsViewProps {
  params: { id?: string };
}

// Main component with simplified logic
function CourseCardsView({ params }: CourseCardsViewProps) {
  const courseId = params.id ? parseInt(params.id, 10) : null;
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { selectCourse, selectedCourse, updateCourseProgress } = useMyCourses();
  const { state: courseState, loadCourse, setState: setCourseStateDirectly } = useCourseState();
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.search as unknown as string);
  const startIndex = searchParams.get('startIndex') ? parseInt(searchParams.get('startIndex') as string, 10) : 0;
  const skipResumeOptions = searchParams.has('startIndex'); // If startIndex is explicitly set, skip resume

  // Track component state
  const [viewMode, setViewMode] = useState<'loading' | 'resume' | 'cards' | 'error'>('loading');
  const [courseLoaded, setCourseLoaded] = useState(false);

  // Debug rendering
  console.log(`CourseCardsView render: id=${courseId}, mode=${viewMode}, loaded=${courseLoaded}`);

  // Helper function to handle available course data
  const handleCourseDataAvailable = (courseData: Course) => {
    // Prepare to display the right view
    const shouldShowResume = !skipResumeOptions && 
                           startIndex === 0 && 
                           (courseData.currentCardIndex || 0) > 0;
    
    console.log(`Course data available, shouldShowResume=${shouldShowResume}, skipResumeOptions=${skipResumeOptions}`);
    
    // Load the course data into state
    loadCourse(courseData, !shouldShowResume && startIndex === 0);
    
    // Set the view mode
    setViewMode(shouldShowResume ? 'resume' : 'cards');
    setCourseLoaded(true);
  };

  // Step 1: Handle initial data fetching
  useEffect(() => {
    if (!courseId) {
      console.error("No course ID provided");
      navigate("/my-courses");
      return;
    }

    // First check if course data is already in cache
    const cachedCourse = queryClient.getQueryData(['/api/course', courseId]);
    
    // Validate that the cached course is a proper Course object
    const isValidCachedCourse = cachedCourse && 
                               typeof cachedCourse === 'object' && 
                               'id' in cachedCourse && 
                               'topic' in cachedCourse && 
                               'cards' in cachedCourse &&
                               'ageGroup' in cachedCourse &&
                               Array.isArray((cachedCourse as any).cards);
    
    console.log("Cache check:", cachedCourse ? 
      `Found in cache (valid: ${isValidCachedCourse})` : 
      "Not in cache");

    if (!isValidCachedCourse) {
      // Trigger fetch if not in cache or invalid cache
      console.log(`Selecting course ${courseId} to fetch data`);
      selectCourse(courseId);
    }

    // Force a fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (viewMode === 'loading' && !courseLoaded) {
        console.log("Loading timeout reached - no data loaded yet");
        
        // Check again for cache or selected course
        const latestCachedCourse = queryClient.getQueryData(['/api/course', courseId]);
        const isValidLatestCache = latestCachedCourse && 
                                  typeof latestCachedCourse === 'object' && 
                                  'id' in latestCachedCourse && 
                                  'topic' in latestCachedCourse && 
                                  'cards' in latestCachedCourse;
        
        if (selectedCourse) {
          // We at least have some data, so try to continue
          handleCourseDataAvailable(selectedCourse);
        } else if (isValidLatestCache) {
          // Try using latest cache as last resort
          handleCourseDataAvailable(latestCachedCourse as Course);
        } else {
          // No data after timeout, show error
          setViewMode('error');
          toast({
            title: "Error loading course",
            description: "Could not load course data. Please try again.",
            variant: "destructive"
          });
        }
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [courseId, viewMode, courseLoaded, handleCourseDataAvailable, navigate, selectCourse, toast]);

  // Step 2: Handle when course data becomes available (either from cache or fetch)
  useEffect(() => {
    // Only process if we're still in loading mode
    if (viewMode === 'loading') {
      console.log("Checking for course data while in loading mode");
      
      // Try selectedCourse first
      if (selectedCourse) {
        console.log("Found selectedCourse data:", selectedCourse.id);
        handleCourseDataAvailable(selectedCourse);
        return;
      }
      
      // Otherwise check cache
      const cachedCourse = queryClient.getQueryData(['/api/course', courseId]);
      const isValidCache = cachedCourse && 
                          typeof cachedCourse === 'object' && 
                          'id' in cachedCourse && 
                          'topic' in cachedCourse && 
                          'cards' in cachedCourse &&
                          'ageGroup' in cachedCourse &&
                          Array.isArray((cachedCourse as any).cards);
      
      if (isValidCache) {
        console.log("Using validated cache data for course:", (cachedCourse as any).id);
        handleCourseDataAvailable(cachedCourse as Course);
      }
    }
  }, [selectedCourse, viewMode, courseId, skipResumeOptions, loadCourse, startIndex, handleCourseDataAvailable]);

  // Handle navigation functions
  const handleBack = () => {
    stopSpeech();
    navigate("/my-courses");
  };

  const handleReadAloud = () => {
    if (viewMode !== 'cards' || !courseState.cards || !courseState.cards[courseState.currentCardIndex]) return;
    const card = courseState.cards[courseState.currentCardIndex];
    speakCard(card.title, card.content);
  };

  const nextCard = () => {
    if (viewMode !== 'cards' || !courseState.cards || courseState.currentCardIndex >= courseState.cards.length - 1) return;
    setCourseStateDirectly({ currentCardIndex: courseState.currentCardIndex + 1 });
    
    // Update URL without triggering navigation
    window.history.replaceState(
      {}, 
      '', 
      `/course/${courseState.id}/cards?startIndex=${courseState.currentCardIndex + 1}`
    );
  };

  const prevCard = () => {
    if (viewMode !== 'cards' || courseState.currentCardIndex <= 0) return;
    setCourseStateDirectly({ currentCardIndex: courseState.currentCardIndex - 1 });
    
    // Update URL without triggering navigation
    window.history.replaceState(
      {}, 
      '', 
      `/course/${courseState.id}/cards?startIndex=${courseState.currentCardIndex - 1}`
    );
  };

  const handleSaveCourse = () => {
    if (!courseState.id) return;
    console.log(`Saving progress for course ${courseState.id} at index ${courseState.currentCardIndex}`);
    updateCourseProgress(courseState.id, courseState.currentCardIndex);
    toast({
      title: "Progress saved",
      description: `Saved at card ${courseState.currentCardIndex + 1} of ${courseState.totalCards}`,
    });
  };

  const handleResumeCourse = () => {
    if (!selectedCourse) return;
    navigate(
      `/course/${selectedCourse.id}/cards?startIndex=${selectedCourse.currentCardIndex || 0}`, 
      { replace: true }
    );
    setViewMode('cards');
  };

  const handleRestartCourse = () => {
    if (!selectedCourse) return;
    navigate(`/course/${selectedCourse.id}/cards?startIndex=0`, { replace: true });
    setViewMode('cards');
  };

  // RENDER FUNCTIONS FOR EACH VIEW MODE

  if (viewMode === 'loading') {
    return (
      <div className="container mx-auto p-4">
        <Button variant="link" className="mb-4 opacity-50" disabled>
          <i className="ri-arrow-left-line mr-1"></i> Back to My Courses
        </Button>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-48 mt-6" />
        
        <div className="fixed bottom-4 right-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-md shadow-md animate-pulse">
          Loading course data...
        </div>
      </div>
    );
  }

  if (viewMode === 'error') {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-600 mb-4">Failed to load course data</p>
        <Button onClick={() => navigate("/my-courses")}>Return to My Courses</Button>
      </div>
    );
  }

  if (viewMode === 'resume' && selectedCourse) {
    const resumeDisplayTotalCards = Array.isArray(selectedCourse.cards) ? selectedCourse.cards.length : 0;
    const resumeDisplayCurrentIndex = selectedCourse.currentCardIndex || 0;
    const resumeDisplayProgressPercent = calculateProgressPercentage(resumeDisplayCurrentIndex, resumeDisplayTotalCards);

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

  // Default case: viewMode === 'cards'
  if (!courseState.cards || !courseState.cards[courseState.currentCardIndex]) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-muted-foreground">No cards available for this course.</p>
        <Button onClick={handleBack} className="mt-4">Back to My Courses</Button>
      </div>
    );
  }

  const currentCard = courseState.cards[courseState.currentCardIndex];
  const cardProgressPercentage = courseState.totalCards > 0 
    ? ((courseState.currentCardIndex + 1) / courseState.totalCards) * 100 
    : 0;

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
          <span className="font-bold text-lg mr-2">{courseState.topic}</span>
          <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium">
            Ages {courseState.ageGroup}
          </span>
        </div>
        
        <Button
          variant="link"
          className="flex items-center font-semibold p-0 text-primary"
          onClick={handleReadAloud}
        >
          <i className="ri-volume-up-line mr-1"></i> 
          Read
        </Button>
      </div>

      {/* Card progress */}
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-sm text-neutral-700">
            Card {courseState.currentCardIndex + 1} of {courseState.totalCards}
          </span>
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
          disabled={courseState.currentCardIndex === 0}
          variant="secondary"
        >
          Previous
        </Button>
        <Button 
          onClick={nextCard}
          disabled={courseState.currentCardIndex === (courseState.totalCards - 1)}
          variant="secondary"
        >
          Next
        </Button>
      </div>

      {/* Save Progress Button */}
      {(courseState.totalCards > 0) && (
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

// Export a memoized version to prevent unnecessary re-renders
export default React.memo(CourseCardsView); 