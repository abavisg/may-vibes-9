import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LearningCard as LearningCardType } from "@/types";

interface LearningCardProps {
  card: LearningCardType;
}

export const LearningCard: FC<LearningCardProps> = ({ card }) => {
  return (
    <div className="card-container w-full max-w-3xl flex-1 flex items-center justify-center my-4">
      <Card className="card bg-white rounded-2xl shadow-lg w-full max-w-3xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-5">
          <CardTitle className="text-2xl md:text-3xl font-bold">{card.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: card.content }} />
          
          <div className="fun-fact bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <h3 className="text-amber-500 font-bold mb-1">Fun Fact!</h3>
            <p className="text-neutral-800">{card.funFact}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningCard;
