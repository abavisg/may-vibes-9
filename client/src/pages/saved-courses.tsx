import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { useCourseState } from "@/hooks/use-course-state";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCourseAsPdf, printCourse } from "@/lib/pdf-export";
import { CardScreen } from "@/components/layout/card-screen";
import { Progress } from "@/components/ui/progress";
import { LearningCard } from "@/components/ui/learning-card";
import { speakCard, stopSpeech, isSpeaking } from "@/lib/text-to-speech";
import type { CourseState, Course } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function SavedCourses() {
  const { courses, selectedCourse, isLoading, selectCourse, fetchCourses, isError, updateCourseProgress } = useSavedCourses();
  const { loadCourse, state: courseState } = useCourseState();
  const [viewMode, setViewMode] = useState<"list" | "detail" | "cards">("list");
  const [, navigate] = useLocation();
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false);
  const { toast } = useToast();
  
  // State for embedded card display
  const [activeCourse, setActiveCourse] = useState<CourseState | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [isNewProgress, setIsNewProgress] = useState(false);
  const [courseSaved, setCourseSaved] = useState(false);

  // Reset view mode when navigating away and fetch courses when component mounts
  useEffect(() => {
    fetchCourses(); // Explicitly fetch courses when component mounts
    
    return () => {
      setViewMode("list"); // Reset view mode on unmount
      setActiveCourse(null); // Clear active course on unmount
    };
  }, [fetchCourses]);

  // Function to format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to handle course selection - transition to detail view
  const handleSelectCourse = (courseId: number) => {
    setIsLoadingCourseDetail(true);
    selectCourse(courseId);
    setViewMode("detail"); // Move to detail view immediately
  };

  // Watch for selectedCourse changes and set activeCourse
  useEffect(() => {
    if (selectedCourse) {
      console.log("Selected course loaded:", selectedCourse);
      setIsLoadingCourseDetail(false);
      
      // Convert the Course to CourseState format and set activeCourse
      setActiveCourse({
        id: selectedCourse.id,
        topic: selectedCourse.topic,
        ageGroup: selectedCourse.ageGroup as any,
        courseLength: selectedCourse.courseLength as any,
        cards: selectedCourse.cards || [],
        currentCardIndex: selectedCourse.currentCardIndex || 0, // Keep the saved index initially
        isLoading: false,
        totalCards: Array.isArray(selectedCourse.cards) ? selectedCourse.cards.length : 0
      });
      
      // Do NOT set viewMode to "cards" here. It will be set by handleCourseStart or handleRestartCourse
      setCurrentCardIndex(selectedCourse.currentCardIndex || 0); // Set initial card index from saved progress
      setIsSpeakingNow(false);
      setIsNewProgress(false);
      setCourseSaved(false);
    }
  }, [selectedCourse]);

  // Check if this is new progress (beyond what was previously saved)
  useEffect(() => {
    if (activeCourse && selectedCourse) {
      const previousMaxIndex = selectedCourse.currentCardIndex || 0;
      const isNewlyViewedCard = currentCardIndex > previousMaxIndex;
      setIsNewProgress(isNewlyViewedCard);
      
      // Reset saved status when moving to a new card beyond previous progress
      if (isNewlyViewedCard) {
        setCourseSaved(false);
      }
    }
  }, [currentCardIndex, activeCourse, selectedCourse]);

  // Function to go back to list view
  const handleBackToList = () => {
    setViewMode("list");
    setActiveCourse(null); // Clear active course state
    // No need to reset selectedCourse here, useSavedCourses hook manages it
  };

  // Function to handle starting or resuming a course
  const handleCourseStart = () => {
    if (activeCourse && selectedCourse && !isLoadingCourseDetail) {
      console.log("Opening course:", activeCourse.topic);
      // activeCourse is already set with the saved index in the useEffect above
      console.log("Starting from card:", selectedCourse.currentCardIndex ?? 0);
      
      // Switch to cards view
      setViewMode("cards");
      // currentCardIndex is already set correctly in the useEffect watching selectedCourse
    } else {
      console.log("Cannot start - course data isn't fully loaded yet");
    }
  };

  // Function to handle restarting a completed course from the beginning
  const handleRestartCourse = () => {
    if (activeCourse && selectedCourse && !isLoadingCourseDetail) {
      console.log("Restarting course:", activeCourse.topic);
      console.log("Starting from card: 0");
      
      // Set currentCardIndex to 0 for restart
      setCurrentCardIndex(0);
      
      // Switch to cards view
      setViewMode("cards");
    } else {
      console.log("Cannot restart - course data isn't fully loaded yet");
    }
  };

  // Get age-appropriate styling
  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case "5-7":
        return "bg-blue-100 text-blue-800";
      case "8-10":
        return "bg-green-100 text-green-800";
      case "11-12":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to handle reading aloud
  const handleReadAloud = () => {
    if (!activeCourse || !activeCourse.cards || !activeCourse.cards[currentCardIndex]) return;

    if (isSpeakingNow) {
      stopSpeech();
      setIsSpeakingNow(false);
    } else {
      const card = activeCourse.cards[currentCardIndex];
      speakCard(card.title, card.content);
      setIsSpeakingNow(true);
    }
  };

  // Function to handle saving the current course with updated progress
  const handleSaveCourse = () => {
    if (!activeCourse || !selectedCourse || typeof activeCourse.id !== 'number') return;
    
    // Save the course with updated progress
    updateCourseProgress(activeCourse.id, currentCardIndex);
    setCourseSaved(true);
    
    // Show success message
    toast({
      title: "Progress saved",
      description: `Saved your progress on "${activeCourse.topic}" at card ${currentCardIndex + 1}`,
    });
  };

  // Function to handle going back from cards view to detail view
  const handleBackFromCards = () => {
    setViewMode("detail");
  };

  // Function to handle going to the next card
  const nextCard = () => {
    if (activeCourse && currentCardIndex < activeCourse.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  // Function to handle going to the previous card
  const prevCard = () => {
    if (activeCourse && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Calculate progress for the detail view
  const detailViewProgress = selectedCourse ? ((selectedCourse.currentCardIndex ?? 0) / (Array.isArray(selectedCourse.cards) ? selectedCourse.cards.length : 1)) * 100 : 0;
  const isCompleted = selectedCourse && selectedCourse.cards && (selectedCourse.currentCardIndex ?? 0) >= selectedCourse.cards.length;

  // Render cards view directly within this component
  if (viewMode === "cards" && activeCourse) {
    const progressPercentage = ((currentCardIndex + 1) / activeCourse.cards.length) * 100;
    const currentCard = activeCourse.cards[currentCardIndex];
  
    return (
      <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6">
        {/* Top bar */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="link"
              className="text-primary flex items-center font-semibold p-0"
              onClick={handleBackFromCards}
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
            <span className="font-bold text-lg mr-2">{activeCourse.topic}</span>
            <span className="bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium">
              Ages {activeCourse.ageGroup}
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
              Card {currentCardIndex + 1} of {activeCourse.cards.length}
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
            disabled={currentCardIndex === (activeCourse.cards.length - 1)}
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

        {/* Restart Button (Optional in cards view, perhaps add later if needed) */}
        {/* <Button onClick={handleRestartCourse}>Restart Course</Button> */}
      </div>
    );
  }

  // Render detail view
  if (viewMode === "detail" && selectedCourse) {
    return (
      <div className="flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-2xl">
          <Button 
            variant="link"
            className="text-primary flex items-center font-semibold p-0 mb-4"
            onClick={handleBackToList}
          >
            <i className="ri-arrow-left-line mr-1"></i> Back to Saved Courses
          </Button>

          <h2 className="text-3xl font-bold mb-4">{selectedCourse.topic}</h2>
          
          <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
            <span>Ages: {selectedCourse.ageGroup}</span>
            <span>Length: {selectedCourse.courseLength} cards</span>
            <span>Created: {formatDate(selectedCourse.createdAt)}</span>
          </div>
          
          {/* Progress Bar in Detail View */}
          {selectedCourse.cards && selectedCourse.cards.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-neutral-700 mb-1">
                <span>Progress: {selectedCourse.currentCardIndex ?? 0} / {selectedCourse.cards.length} cards</span>
                <span>{detailViewProgress.toFixed(0)}%</span>
              </div>
              <Progress value={detailViewProgress} className="h-2" />
            </div>
          )}

          {/* Start/Resume/Restart Buttons */}
          {isLoadingCourseDetail ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="flex space-x-4 mt-6">
              {isCompleted ? (
                <Button onClick={handleRestartCourse} size="lg">
                  <i className="ri-refresh-line mr-2"></i> Start from Beginning
                </Button>
              ) : (
                <Button onClick={handleCourseStart} size="lg">
                   <i className="ri-play-line mr-2"></i> {selectedCourse.currentCardIndex && selectedCourse.currentCardIndex > 0 ? "Resume Course" : "Start Course"}
                </Button>
              )}
              {/* Add other actions like export here later if needed */}
              <Button variant="outline" onClick={() => downloadCourseAsPdf(selectedCourse)}>
                 <i className="ri-download-line mr-2"></i> Download PDF
              </Button>
               <Button variant="outline" onClick={() => printCourse(selectedCourse)}>
                 <i className="ri-printer-line mr-2"></i> Print Course
              </Button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Render list view (default)
  return (
    <div className="flex-1 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">My Saved Courses</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
           <div className="text-center py-8 text-red-600">
            <p className="text-lg">Error loading courses. Please try again later.</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">No saved courses yet.</p>
            <Link href="/">
              <Button className="mt-4">Create New Course</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card 
                key={course.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectCourse(course.id)}
              >
                <CardHeader>
                  <CardTitle>{course.topic}</CardTitle>
                  <CardDescription>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mr-2 ${getAgeGroupColor(course.ageGroup)}`}>
                      Ages {course.ageGroup}
                    </span>
                     <span className="text-sm text-muted-foreground">
                      {course.courseLength} cards
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   {/* Display progress in the list view */}
                   {course.cards && course.cards.length > 0 && (
                     <div className="w-full mt-2">
                       <div className="flex justify-between text-xs text-neutral-600 mb-1">
                         <span>Progress: {course.currentCardIndex ?? 0} / {course.cards.length}</span>
                         <span>{(((course.currentCardIndex ?? 0) / course.cards.length) * 100).toFixed(0)}%</span>
                       </div>
                       <Progress value={((course.currentCardIndex ?? 0) / course.cards.length) * 100} className="h-1" />
                     </div>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}