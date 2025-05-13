import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SavedCourses from "@/pages/saved-courses";
import { CourseProvider } from "@/hooks/use-course-state";
import { CardScreen } from "@/components/layout/card-screen";

// Wrapper component for CardScreen to handle navigation
function CardScreenPage() {
  const [, setLocation] = useLocation();

  // Improved navigation handler with fallback to previous page
  const handleBackToHome = () => {
    // Navigate back to previous page, or home if direct access
    window.history.length > 1 ? window.history.back() : setLocation("/");
  };
  
  return <CardScreen onBackToHome={handleBackToHome} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved-courses" component={SavedCourses} />
      <Route path="/cards" component={CardScreenPage} />
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
