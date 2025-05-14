import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MyCoursesList from "@/pages/MyCoursesList";
import CourseCardsView from "@/pages/CourseCardsView";
import ParentPage from "@/pages/ParentPage";
import TopicInputPage from "@/pages/TopicInputPage";
import AgeSelectorPage from "@/pages/AgeSelectorPage";
import CourseLengthPage from "@/pages/CourseLengthPage";
import { CourseProvider } from "@/hooks/use-course-state";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/parent" component={ParentPage} />
      <Route path="/my-courses" component={MyCoursesList} />
      <Route path="/course/:id/cards" component={CourseCardsView} />
      <Route path="/create/topic" component={TopicInputPage} />
      <Route path="/create/age" component={AgeSelectorPage} />
      <Route path="/create/length" component={CourseLengthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CourseProvider>
          <Toaster />
          <Router />
        </CourseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
