import { FC } from 'react';
import { useSavedCourses } from '@/hooks/use-saved-courses';
import { Course } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface ResumableCoursesProps {
  onResumeCourse: (course: Course) => void;
}

export const ResumableCourses: FC<ResumableCoursesProps> = ({ onResumeCourse }) => {
  const { courses, isLoading } = useSavedCourses();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">No resumable courses found.</p>
        {/* Optionally add a button to go back to create a new course */}
        {/* <Button onClick={() => {}}>Create New Course</Button> */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select a Course to Resume</h2>
      {courses.map((course) => (
        <Card 
          key={course.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onResumeCourse(course)}
        >
          <CardHeader>
            <CardTitle>{course.topic}</CardTitle>
            {/* Add more course details here if needed */}
            <p className="text-sm text-muted-foreground">Ages: {course.ageGroup}, Length: {course.courseLength}</p>
          </CardHeader>
          {/* <CardContent> */}
            {/* You could show progress or other info here */}
          {/* </CardContent> */}
        </Card>
      ))}
    </div>
  );
}; 