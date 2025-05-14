import { useState, useEffect, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoursesWithProgress } from "@/lib/auto-save";
import type { Course } from "@/types";

interface CoursesWithProgressProps {
  onResumeCourse: (course: Course) => void;
}

export const CoursesWithProgress: FC<CoursesWithProgressProps> = ({ onResumeCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const resumableCourses = await getCoursesWithProgress();
        setCourses(resumableCourses);
      } catch (error) {
        console.error("Failed to load courses with progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
  if (isLoading) {
    return (
      <div className="my-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-medium mb-4 text-primary">Recently Viewed Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (courses.length === 0) {
    return null; // Don't show anything if there are no courses with progress
  }
  
  return (
    <div className="my-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-medium mb-4 text-primary">Continue Learning</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.slice(0, 2).map((course) => {
          const totalCards = Array.isArray(course.cards) ? course.cards.length : 0;
          const currentIndex = course.currentCardIndex || 0;
          const progressPercent = Math.round((currentIndex / totalCards) * 100);
          
          return (
            <Card 
              key={course.id} 
              className="border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{course.topic}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-gray-500">Age group: {course.ageGroup}</p>
                <div className="mt-2 flex items-center">
                  <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-500">{progressPercent}%</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/50 text-primary hover:bg-primary/5"
                  onClick={() => onResumeCourse(course)}
                >
                  Resume Learning
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};