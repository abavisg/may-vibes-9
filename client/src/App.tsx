import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SavedCourses from "@/pages/saved-courses";
import { CourseProvider } from "@/hooks/use-course-state";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved-courses" component={SavedCourses} />
      {/* Fallback to 404 */}
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
