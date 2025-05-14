import { FC } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCourseState } from "@/hooks/use-course-state";

interface TopicInputProps {
  onTopicSubmit: (topic: string) => void;
}

const SUGGESTED_TOPICS = [
  "Dinosaurs",
  "Space",
  "Animals",
  "Oceans",
  "Science",
  "History"
];

export const TopicInput: FC<TopicInputProps> = ({ onTopicSubmit }) => {
  const { state, setTopic } = useCourseState();

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  const handleNextClick = () => {
    const topicToSubmit = state.topic || "Dinosaurs";
    onTopicSubmit(topicToSubmit);
  };

  const handleTopicSelection = (topic: string) => {
    setTopic(topic);
    onTopicSubmit(topic);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-2">What do you want to learn about?</h2>
        <p className="text-lg text-muted-foreground">Type a topic or pick one of our suggestions</p>
      </div>

      <div className="w-full max-w-md mb-8">
        <Input
          className="w-full px-4 py-3 text-xl rounded-xl border-2 border-primary/30 focus:border-primary focus:outline-none h-auto"
          placeholder="Dinosaurs, space, oceans..."
          value={state.topic}
          onChange={handleTopicChange}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {SUGGESTED_TOPICS.map((topic) => (
          <Button
            key={topic}
            variant="outline"
            className="bg-white border-2 border-primary/20 rounded-lg py-3 px-4 text-primary font-semibold hover:bg-primary/5 transition h-auto"
            onClick={() => handleTopicSelection(topic)}
          >
            {topic}
          </Button>
        ))}
      </div>

      <Button
        size="lg"
        className="bg-primary text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg hover:bg-primary/90 transition"
        onClick={handleNextClick}
      >
        Next <i className="ri-arrow-right-line align-middle ml-1"></i>
      </Button>
    </div>
  );
};

export default TopicInput;
