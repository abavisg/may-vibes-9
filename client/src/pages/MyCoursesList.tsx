import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCourses } from "@/hooks/use-my-courses";
import { calculateProgressPercentage, formatProgress } from "@/lib/utils"; // Import utils from the correct path

// Get age-appropriate styling (can be moved to a utils file later)
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

export default function MyCoursesList() { // Renamed component
  const { courses, isLoading, isError } = useMyCourses();
  const [, navigate] = useLocation();

  // Function to handle course selection and navigation
  const handleSelectCourse = (courseId: number) => {
    console.log(`Card clicked for course ID: ${courseId}`);
    navigate(`/course/${courseId}/cards`);
    console.log(`Navigating to: /course/${courseId}/cards`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1> {/* Updated heading */}
      
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
          <p className="text-lg text-muted-foreground">No courses yet.</p>
          <Link href="/">
            <Button className="mt-4">Create New Course</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const totalCards = Array.isArray(course.cards) ? course.cards.length : 0;
            const progressPercent = calculateProgressPercentage(course.currentCardIndex, totalCards);
            
            return (
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
                      {totalCards} cards
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {totalCards > 0 && (
                    <div className="w-full mt-2">
                      <div className="flex justify-between text-xs text-neutral-600 mb-1">
                        <span>Progress: {formatProgress(course.currentCardIndex, totalCards)}</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 