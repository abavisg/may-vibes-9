import type { FC } from "react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LearningCard } from "@/components/ui/learning-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDailyCourses, getTodayCard, removeFromDaily } from "@/lib/daily-cards";
import type { LearningCard as LearningCardType } from "@/types";
import { useMyCourses } from "@/hooks/use-my-courses";

interface DailyViewProps {
  onBackToHome: () => void;
}

export const DailyView: FC<DailyViewProps> = ({ onBackToHome }) => {
  const [dailyCourses, setDailyCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [todayCard, setTodayCard] = useState<LearningCardType | null>(null);
  const [cardInfo, setCardInfo] = useState({
    currentIndex: 0,
    totalCards: 0,
    isCompleted: false,
    daysLeft: 0
  });
  
  // Load today's card when a course is selected
  useEffect(() => {
    if (selectedCourse !== null) {
      const { card, currentIndex, totalCards, isCompleted, daysLeft } = getTodayCard(selectedCourse, updateCourseProgress);
      setTodayCard(card);
      setCardInfo({
        currentIndex,
        totalCards,
        isCompleted,
        daysLeft
      });
    }
  }, [selectedCourse]);
  
  // Handle course selection
  const handleSelectCourse = (courseId: number) => {
    setSelectedCourse(courseId);
  };
  
  // Handle removing a course from daily schedule
  const handleRemoveCourse = (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering course selection
    
    if (confirm("Are you sure you want to remove this course from your daily schedule?")) {
      removeFromDaily(courseId);
      
      // Update the list
      const updatedCourses = dailyCourses.filter((c: any) => c.courseId !== courseId);
      setDailyCourses(updatedCourses);
      
      // If the removed course was selected, clear selection
      if (selectedCourse === courseId) {
        setSelectedCourse(null);
        setTodayCard(null);
      }
    }
  };
  
  // Use the useMyCourses hook to get the update function
  const { updateCourseProgress } = useMyCourses();
  
  // Load daily courses on mount
  useEffect(() => {
    const courses = getDailyCourses();
    setDailyCourses(courses);
    
    // If there's only one course, automatically select it
    if (courses.length === 1) {
      setSelectedCourse(courses[0].courseId);
    }
  }, []);
  
  return (
    <div className="p-4 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Your Daily Cards</h1>
          <p className="text-gray-500">
            One card per day keeps learning fun and manageable!
          </p>
        </div>
        
        <Button variant="outline" onClick={onBackToHome}>
          <i className="ri-home-line mr-2"></i> Home
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Course list */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="font-semibold mb-3">Your Daily Courses</h2>
          
          {dailyCourses.length === 0 ? (
            <Card className="p-4 text-center bg-gray-50">
              <p className="text-gray-500 mb-4">No daily courses yet</p>
              <Button size="sm" onClick={onBackToHome}>
                Create one now
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {dailyCourses.map(course => (
                <Card 
                  key={course.courseId}
                  className={`p-3 cursor-pointer ${selectedCourse === course.courseId ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleSelectCourse(course.courseId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{course.topic}</h3>
                      <p className="text-xs text-gray-500">Ages {course.ageGroup}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 h-7 w-7 p-0"
                      onClick={(e) => handleRemoveCourse(course.courseId, e)}
                    >
                      <i className="ri-close-line"></i>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Card view */}
        <div className="flex-1 flex flex-col">
          {selectedCourse === null ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center p-6">
                <div className="text-5xl text-gray-300 mb-4">
                  <i className="ri-book-open-line"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a Course</h3>
                <p className="text-gray-500 mb-6">
                  Choose a course from the left to see today's card
                </p>
              </div>
            </div>
          ) : todayCard === null ? (
            <div className="flex-1 flex items-center justify-center">
              <Skeleton className="h-72 w-full max-w-lg" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Card progress */}
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Card {cardInfo.currentIndex + 1} of {cardInfo.totalCards}
                  </span>
                  {cardInfo.isCompleted ? (
                    <span className="text-green-500 flex items-center">
                      <i className="ri-check-line mr-1"></i> Course Completed
                    </span>
                  ) : (
                    <span className="text-primary flex items-center">
                      <i className="ri-calendar-line mr-1"></i> 
                      {cardInfo.daysLeft} more {cardInfo.daysLeft === 1 ? 'day' : 'days'} to complete
                    </span>
                  )}
                </div>
              </div>
              
              {/* Today's card */}
              <div className="flex-1">
                <LearningCard card={todayCard} />
              </div>
              
              {/* Bottom actions */}
              <div className="mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm mb-4">
                    New card will be available tomorrow. Come back then to continue learning!
                  </p>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={onBackToHome}>
                      Back to Home
                    </Button>
                    <Link href="/my-courses">
                      <Button variant="outline">
                        <i className="ri-bookmark-line mr-1"></i> My Courses
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};