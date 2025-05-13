import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCourseAsPdf, printCourse } from "@/lib/pdf-export";

export default function SavedCourses() {
  const { courses, selectedCourse, isLoading, selectCourse } = useSavedCourses();
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // Reset view mode when navigating away
  useEffect(() => {
    return () => {
      setViewMode("list");
    };
  }, []);

  // Function to format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to handle course selection
  const handleSelectCourse = (courseId: number) => {
    selectCourse(courseId);
    setViewMode("detail");
  };

  // Function to go back to list view
  const handleBackToList = () => {
    setViewMode("list");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {viewMode === "list" ? "My Saved Courses" : "Course Details"}
        </h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <i className="ri-home-line"></i>
            Back to Home
          </Button>
        </Link>
      </div>

      {viewMode === "list" ? (
        // List View
        <>
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden h-64">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            // Empty state
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4 text-gray-300">
                <i className="ri-inbox-line"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Saved Courses</h3>
              <p className="text-gray-500 mb-6">You haven't saved any courses yet.</p>
              <Link href="/">
                <Button>Start Learning Now</Button>
              </Link>
            </div>
          ) : (
            // Courses grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Card 
                  key={course.id} 
                  className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectCourse(course.id)}
                >
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-xl">{course.topic}</CardTitle>
                    <CardDescription>
                      Created {formatDate(course.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        {Array.isArray(course.cards) ? course.cards.length : '?'} learning cards
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(course.ageGroup)}`}>
                        Ages {course.ageGroup}
                      </span>
                      <span className="text-sm font-medium capitalize text-gray-600">
                        {course.courseLength} course
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        // Detail View
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!selectedCourse ? (
            <div className="p-8 text-center">
              <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
              <Skeleton className="h-4 w-1/3 mx-auto mb-8" />
              <Skeleton className="h-40 w-full max-w-2xl mx-auto" />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mb-4"
                  onClick={handleBackToList}
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back to courses
                </Button>
                <h2 className="text-2xl font-bold mb-2">{selectedCourse.topic}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(selectedCourse.ageGroup)}`}>
                    Ages {selectedCourse.ageGroup}
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {selectedCourse.courseLength} course
                  </span>
                  <span className="text-sm text-gray-600">
                    Created {formatDate(selectedCourse.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Course Cards</h3>
                <div className="space-y-4">
                  {Array.isArray(selectedCourse.cards) ? (
                    selectedCourse.cards.map((card: any, index: number) => (
                      <Card key={card.id || index} className="overflow-hidden">
                        <CardHeader className="bg-amber-50 pb-2">
                          <CardTitle className="text-lg">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: card.content }} />
                          <div className="mt-4 bg-green-50 p-3 rounded-md border-l-4 border-green-300">
                            <p className="font-semibold text-green-700">Fun Fact!</p>
                            <p className="text-green-800">{card.funFact}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No cards available</p>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <Link href="/">
                    <Button className="md:w-auto">
                      Create New Course
                    </Button>
                  </Link>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => selectedCourse && printCourse(selectedCourse)}
                    >
                      <i className="ri-printer-line"></i>
                      Print
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => selectedCourse && downloadCourseAsPdf(selectedCourse)}
                    >
                      <i className="ri-download-line"></i>
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}