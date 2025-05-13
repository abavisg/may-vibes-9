import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourseState } from "@/hooks/use-course-state";
import type { AgeGroup, CourseLength } from "@/types";

interface ParentModeProps {
  onBack: () => void;
  onCreateCourse: () => void;
}

export const ParentMode: FC<ParentModeProps> = ({ onBack, onCreateCourse }) => {
  const { state, setTopic, setAgeGroup, setCourseLength } = useCourseState();
  const [parentTopic, setParentTopic] = useState("");

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParentTopic(e.target.value);
  };

  const handleAgeChange = (value: string) => {
    setAgeGroup(value as AgeGroup);
  };

  const handleLengthChange = (value: string) => {
    setCourseLength(value as CourseLength);
  };

  const handleCreateCourse = () => {
    if (parentTopic) {
      setTopic(parentTopic);
    } else {
      setTopic("Dinosaurs"); // Default topic
    }
    onCreateCourse();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="link"
            className="text-primary flex items-center font-semibold p-0"
            onClick={onBack}
          >
            <i className="ri-arrow-left-line mr-1"></i> Back to Kids Mode
          </Button>
          <h2 className="text-2xl font-bold">Parent Controls</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Create a Learning Course</h3>
          
          <div className="mb-4">
            <label htmlFor="parent-topic" className="block text-muted-foreground font-medium mb-1">
              Topic of Interest
            </label>
            <Input
              id="parent-topic"
              className="w-full px-3 py-2 rounded-lg border focus:border-primary focus:outline-none"
              placeholder="Enter a topic (e.g. Solar System, Ancient Egypt)"
              value={parentTopic}
              onChange={handleTopicChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="parent-age" className="block text-muted-foreground font-medium mb-1">
                Child's Age Group
              </label>
              <Select 
                value={state.ageGroup || "8-10"} 
                onValueChange={handleAgeChange}
              >
                <SelectTrigger id="parent-age" className="w-full">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-7">Ages 5-7</SelectItem>
                  <SelectItem value="8-10">Ages 8-10</SelectItem>
                  <SelectItem value="11-12">Ages 11-12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="parent-length" className="block text-muted-foreground font-medium mb-1">
                Course Length
              </label>
              <Select 
                value={state.courseLength || "standard"} 
                onValueChange={handleLengthChange}
              >
                <SelectTrigger id="parent-length" className="w-full">
                  <SelectValue placeholder="Select course length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (5-7 cards)</SelectItem>
                  <SelectItem value="standard">Standard (8-12 cards)</SelectItem>
                  <SelectItem value="deep">Deep Dive (12-15 cards)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            className="w-full bg-primary text-white text-lg font-bold py-3 px-6 rounded-lg shadow hover:bg-primary/90 transition"
            onClick={handleCreateCourse}
          >
            Create Course
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Additional Options</h3>
          
          <div className="space-y-3">
            <a href="/saved-courses" className="block w-full">
              <Button
                variant="outline"
                className="w-full bg-white border border-gray-300 text-neutral-800 text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition flex justify-between items-center h-auto"
              >
                <span className="font-medium">View Saved Courses</span>
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </a>
            
            <a href="/saved-courses" className="block w-full">
              <Button
                variant="outline"
                className="w-full bg-white border border-gray-300 text-neutral-800 text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition flex justify-between items-center h-auto"
              >
                <span className="font-medium">Print/Download Cards</span>
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </a>
            
            <Button
              variant="outline"
              className="w-full bg-white border border-gray-300 text-neutral-800 text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition flex justify-between items-center h-auto"
            >
              <span className="font-medium">Manage Daily Schedule</span>
              <i className="ri-arrow-right-s-line"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentMode;
