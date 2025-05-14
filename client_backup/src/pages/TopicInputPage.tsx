import React from 'react';
import { useLocation } from "wouter";
import { TopicInput } from "@/components/ui/topic-input";
import { useCourseState } from "@/hooks/use-course-state";

export default function TopicInputPage() {
  const [, navigate] = useLocation();
  const { setTopic } = useCourseState();

  const handleTopicSubmit = (topic: string) => {
    setTopic(topic);
    navigate("/create/age");
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">What topic would you like to learn about?</h1>
      <TopicInput onTopicSubmit={handleTopicSubmit} />
    </div>
  );
} 