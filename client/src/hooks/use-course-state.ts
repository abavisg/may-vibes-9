import React, { createContext, useContext, useState, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AgeGroup, CourseLength, CourseState, GenerateCardsRequest, LearningCard, GenerateCardsResponse } from "@/types";

const DEFAULT_STATE: CourseState = {
  topic: "",
  ageGroup: null,
  courseLength: null,
  cards: [],
  currentCardIndex: 0,
  isLoading: false,
  totalCards: 0
};

// Map age groups to default course lengths
const DEFAULT_COURSE_LENGTHS: Record<AgeGroup, CourseLength> = {
  "5-7": "quick",
  "8-10": "standard",
  "11-12": "deep"
};

// Map course lengths to card counts
const COURSE_LENGTH_CARDS: Record<CourseLength, number> = {
  "quick": 5,
  "standard": 10,
  "deep": 15
};

interface CourseContextType {
  state: CourseState;
  setTopic: (topic: string) => void;
  setAgeGroup: (ageGroup: AgeGroup) => void;
  setCourseLength: (courseLength: CourseLength) => void;
  nextCard: () => void;
  prevCard: () => void;
  resetState: () => void;
  generateCards: () => void;
  setState: (newState: Partial<CourseState>) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CourseState>(DEFAULT_STATE);
  const { toast } = useToast();

  const generateCardsMutation = useMutation({
    mutationFn: async (data: GenerateCardsRequest) => {
      const response = await apiRequest("POST", "/api/generate-cards", data);
      return response.json() as Promise<GenerateCardsResponse>;
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        cards: data.cards,
        isLoading: false,
        totalCards: data.cards.length,
        currentCardIndex: 0
      }));
    },
    onError: (error) => {
      toast({
        title: "Error generating cards",
        description: error.message,
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  });

  const setTopic = (topic: string) => {
    setState(prev => ({ ...prev, topic }));
  };

  const setAgeGroup = (ageGroup: AgeGroup) => {
    // Set the age group and automatically select the default course length for that age
    setState(prev => ({ 
      ...prev, 
      ageGroup, 
      courseLength: DEFAULT_COURSE_LENGTHS[ageGroup] 
    }));
  };

  const setCourseLength = (courseLength: CourseLength) => {
    setState(prev => ({ ...prev, courseLength }));
  };

  const nextCard = () => {
    if (state.currentCardIndex < state.cards.length - 1) {
      setState(prev => ({ ...prev, currentCardIndex: prev.currentCardIndex + 1 }));
    }
  };

  const prevCard = () => {
    if (state.currentCardIndex > 0) {
      setState(prev => ({ ...prev, currentCardIndex: prev.currentCardIndex - 1 }));
    }
  };

  const resetState = () => {
    setState(DEFAULT_STATE);
  };

  const generateCards = () => {
    if (!state.topic || !state.ageGroup || !state.courseLength) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    generateCardsMutation.mutate({
      topic: state.topic,
      ageGroup: state.ageGroup,
      courseLength: state.courseLength
    });
  };

  // Method to directly update state with partial state
  const setStateDirectly = (newState: Partial<CourseState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const value = {
    state,
    setTopic,
    setAgeGroup,
    setCourseLength,
    nextCard,
    prevCard,
    resetState,
    generateCards,
    setState: setStateDirectly
  };

  return React.createElement(CourseContext.Provider, 
    { value }, 
    children
  );
}

export function useCourseState() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourseState must be used within a CourseProvider");
  }
  return context;
}
